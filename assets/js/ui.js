/* ═══════════════════════════════════════════════════════
   Interface commune aux trois pages : menu, apparition au
   scroll, liseré de la barre de navigation.
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ─── Menu mobile ──────────────────────────────────────
    const burger = document.getElementById('hamburger-icon');
    const links = document.querySelector('.nav-links');

    if (burger && links) {
        const setOpen = (open) => {
            links.classList.toggle('open', open);
            burger.setAttribute('aria-expanded', String(open));
            burger.querySelector('use')
                .setAttribute('href', `assets/img/icons.svg#${open ? 'i-close' : 'i-menu'}`);
        };

        burger.addEventListener('click', (e) => {
            e.stopPropagation();
            setOpen(!links.classList.contains('open'));
        });

        links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));

        document.addEventListener('click', (e) => {
            if (links.classList.contains('open') && !e.target.closest('header')) setOpen(false);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && links.classList.contains('open')) setOpen(false);
        });
    }

    // ─── Apparition au scroll ─────────────────────────────
    // Une fois par élément, avec un léger décalage entre
    // voisins. Rien ne dépend d'un setTimeout au chargement.
    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const sibs = [...e.target.parentElement.children]
                .filter(n => n.classList.contains('reveal'));
            e.target.style.transitionDelay = `${Math.min(sibs.indexOf(e.target), 4) * 55}ms`;
            e.target.classList.add('in');
            obs.unobserve(e.target);
        });
    }, { threshold: .15, rootMargin: '0px 0px -40px' });

    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    // ─── Liseré sous la barre au décollement ──────────────
    const header = document.querySelector('header');
    if (header) {
        const onScroll = () => header.classList.toggle('stuck', scrollY > 8);
        addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }
});
