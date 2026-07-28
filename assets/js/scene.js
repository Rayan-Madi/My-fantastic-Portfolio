/* ═══════════════════════════════════════════════════════
   Scène WebGL partagée par les trois pages.

   Un seul renderer, une seule géométrie de sol. La
   déformation est calculée dans le vertex shader : le GPU
   déplace les sommets, le CPU ne recalcule rien par image.
   C'est ce qui rend la scène tenable sur téléphone.
   ═══════════════════════════════════════════════════════ */

import * as THREE from '../vendor/three.module.js';

const MAX_NODES = 8;
const WHITE = new THREE.Color('#ffffff');

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * @param {object} o
 * @param {HTMLCanvasElement} o.canvas
 * @param {HTMLElement}       o.host      élément qui donne ses dimensions au rendu
 * @param {Array}             o.nodes     projets : { name, url, color, x, z, h, m }
 * @param {boolean}           o.labels    étiquettes HTML cliquables sur les nœuds
 * @param {HTMLElement}       o.labelBox  conteneur des étiquettes
 * @param {boolean}           o.dive      la caméra plonge à mesure qu'on scrolle
 * @param {object}            o.hud       { left, right } éléments du relevé technique
 * @param {number}            o.camY      hauteur de caméra
 * @param {number}            o.radius    distance de caméra
 */
export function initScene(o) {
    const isSmall = matchMedia('(max-width: 820px)').matches;

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            canvas: o.canvas,
            antialias: !isSmall,
            alpha: true,
            powerPreference: 'low-power'
        });
    } catch (e) {
        // Pas de WebGL : la page reste entière, la scène disparaît simplement.
        o.canvas.style.display = 'none';
        return null;
    }
    renderer.setClearAlpha(0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 1, 2000);
    const nodes = o.nodes || [];

    // ─── Sol déformé ──────────────────────────────────────
    const uniforms = {
        uNodes: { value: Array.from({ length: MAX_NODES }, () => new THREE.Vector4()) },
        uCount: { value: Math.min(nodes.length, MAX_NODES) },
        uColor: { value: new THREE.Color('#35d6e8') },
        uFade:  { value: 420 }
    };
    nodes.slice(0, MAX_NODES).forEach((d, i) => {
        uniforms.uNodes.value[i].set(d.x, d.z, d.m * 0.85, d.m * d.m * 3.2);
    });

    const gridMat = new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        vertexShader: `
            uniform vec4 uNodes[${MAX_NODES}];
            uniform int uCount;
            uniform float uFade;
            varying float vAlpha;
            void main() {
                vec3 p = position;
                float dipY = 0.0;
                for (int i = 0; i < ${MAX_NODES}; i++) {
                    if (i >= uCount) break;
                    vec2 d = p.xz - uNodes[i].xy;
                    dipY -= uNodes[i].z * exp(-dot(d, d) / uNodes[i].w);
                }
                p.y += dipY;
                vAlpha = 1.0 - smoothstep(uFade * 0.45, uFade, length(p.xz));
                gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
            }`,
        fragmentShader: `
            uniform vec3 uColor;
            varying float vAlpha;
            void main() { gl_FragColor = vec4(uColor, vAlpha * 0.34); }`
    });

    const HALF = 440;
    const step = isSmall ? 50 : 30;   // écart entre deux lignes
    const seg  = isSmall ? 15 : 9;    // finesse le long d'une ligne
    const pts = [];
    for (let a = -HALF; a <= HALF; a += step) {
        for (let b = -HALF; b < HALF; b += seg) {
            const e = Math.min(b + seg, HALF);
            pts.push(a, 0, b, a, 0, e);   // lignes suivant Z
            pts.push(b, 0, a, e, 0, a);   // lignes suivant X
        }
    }
    const gridGeo = new THREE.BufferGeometry();
    gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    scene.add(new THREE.LineSegments(gridGeo, gridMat));

    // ─── Nœuds ────────────────────────────────────────────
    const halo = (() => {
        const c = document.createElement('canvas');
        c.width = c.height = 128;
        const ctx = c.getContext('2d');
        const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(.25, 'rgba(255,255,255,.42)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 128, 128);
        return new THREE.CanvasTexture(c);
    })();

    const sphereGeo = new THREE.SphereGeometry(1, 16, 12);

    const objs = nodes.filter(d => !d.hidden).map(d => {
        const base = new THREE.Color(d.color);
        const lit = base.clone().lerp(WHITE, .55);
        const R = 1.6 + d.m * .075;

        const mesh = new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ color: base }));
        mesh.scale.setScalar(R);
        mesh.position.set(d.x, d.h, d.z);
        scene.add(mesh);

        const glow = new THREE.Sprite(new THREE.SpriteMaterial({
            map: halo, color: base, transparent: true, opacity: .3,
            depthWrite: false, blending: THREE.AdditiveBlending
        }));
        glow.scale.setScalar(R * 11);
        glow.position.copy(mesh.position);
        scene.add(glow);

        const stemGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(d.x, d.h, d.z),
            new THREE.Vector3(d.x, -d.m * .9, d.z)
        ]);
        const stem = new THREE.LineSegments(stemGeo, new THREE.LineDashedMaterial({
            color: base, transparent: true, opacity: .28, dashSize: 5, gapSize: 5
        }));
        stem.computeLineDistances();
        scene.add(stem);

        const item = { d, mesh, glow, base, lit, R, hot: false, link: null };

        // Étiquette : un vrai lien HTML positionné par projection.
        // Accessible au clavier et aux lecteurs d'écran, contrairement
        // à du texte peint dans le canvas.
        if (o.labels && o.labelBox) {
            const a = document.createElement('a');
            a.className = 'node-link';
            a.href = d.url;
            a.textContent = d.name;
            a.setAttribute('aria-label', `${d.name} — ${d.stack}`);
            if (/^https?:/.test(d.url)) { a.target = '_blank'; a.rel = 'noopener'; }
            ['mouseenter', 'focus'].forEach(ev => a.addEventListener(ev, () => item.hot = true));
            ['mouseleave', 'blur'].forEach(ev => a.addEventListener(ev, () => item.hot = false));
            o.labelBox.appendChild(a);
            item.link = a;
        }
        return item;
    });

    // ─── Caméra ───────────────────────────────────────────
    const camY = o.camY ?? 108;
    const radius = o.radius ?? 470;
    let angle = 0, drag = 0, dragging = false, lastX = 0, dive = 0;

    o.host.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; });
    addEventListener('pointerup', () => dragging = false);
    addEventListener('pointermove', e => {
        if (!dragging) return;
        drag += (e.clientX - lastX) * .006;
        lastX = e.clientX;
    });

    function resize() {
        const box = o.canvas.getBoundingClientRect();
        const w = box.width || o.host.getBoundingClientRect().width;
        const h = box.height || 300;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(devicePixelRatio, isSmall ? 1.5 : 2));
        renderer.setSize(w, h, false);
    }

    // ─── Boucle : coupée hors écran et onglet en fond ─────
    let visible = true, running = false;
    let t = 0, last = 0, fps = 60, acc = 0, frames = 0;

    new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); },
        { threshold: 0.01 }).observe(o.host);
    document.addEventListener('visibilitychange', kick);

    function frame(now) {
        if (!visible || document.hidden) { running = false; return; }
        requestAnimationFrame(frame);

        const dt = now - last;
        if (isSmall && dt < 33) return;   // 30 fps plafonnés sur petit écran
        last = now;
        frames++; acc += dt;
        if (acc > 400) { fps = Math.round(1000 / (acc / frames)); acc = 0; frames = 0; }

        if (o.dive) {
            const r = o.host.getBoundingClientRect();
            const p = Math.min(Math.max(-r.top / Math.max(r.height, 1), 0), 1);
            dive += (p - dive) * .08;
        }

        if (!reduceMotion) t += .0016;
        // Oscillation bornée plutôt qu'un tour complet : la composition
        // reste maîtrisée (les étiquettes ne passent pas sur le texte).
        // Le glissement de l'utilisateur, lui, n'est pas limité.
        angle = (o.baseAngle ?? 0) + Math.sin(t) * (o.sweep ?? 0.12) + drag;
        camera.position.set(Math.sin(angle) * radius, camY + dive * 130, Math.cos(angle) * radius);
        camera.lookAt(0, -4 - dive * 40, 0);

        const box = o.canvas.getBoundingClientRect();
        const v = new THREE.Vector3();

        objs.forEach(it => {
            it.mesh.material.color.lerp(it.hot ? it.lit : it.base, .16);
            it.glow.material.color.lerp(it.hot ? it.lit : it.base, .16);
            it.glow.material.opacity += ((it.hot ? .58 : .3) - it.glow.material.opacity) * .16;
            it.mesh.scale.setScalar(it.R * (it.hot ? 1.28 : 1));

            if (it.link) {
                v.copy(it.mesh.position).project(camera);
                it.link.style.left = `${(v.x * .5 + .5) * box.width}px`;
                it.link.style.top = `${(-v.y * .5 + .5) * box.height - 12}px`;
                it.link.style.opacity = v.z > 1 ? 0 : 1;
            }
        });

        renderer.render(scene, camera);

        if (o.hud && !isSmall) {
            const info = renderer.info.render;
            const p = camera.position;
            o.hud.left.innerHTML =
                `PERSP  FOV 48<br>CAM <b>${p.x.toFixed(0)} ${p.y.toFixed(0)} ${p.z.toFixed(0)}</b>`;
            o.hud.right.innerHTML =
                `TRIS <b>${info.triangles}</b>  CALLS <b>${info.calls}</b><br><b>${fps} FPS</b>`;
        }
    }

    function kick() {
        if (running || !visible || document.hidden) return;
        running = true;
        last = performance.now();
        requestAnimationFrame(frame);
    }

    resize();
    addEventListener('resize', () => { resize(); kick(); });
    kick();

    return { objs, kick };
}
