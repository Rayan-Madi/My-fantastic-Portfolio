document.addEventListener('DOMContentLoaded', function () {

    // ─── Menu hamburger ───────────────────────────────────────────
    const hamburger = document.getElementById('hamburger-icon');
    const navLinks  = document.querySelector('.nav-links');

    hamburger.addEventListener('click', function () {
        navLinks.classList.toggle('active');
        const icon = hamburger.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });

    // ─── Tilt 3D sur les cartes ───────────────────────────────────
    // Suit la souris et applique une rotation perspective réaliste
    const isMobile = () => window.innerWidth <= 768;

    document.querySelectorAll('.tilt-card').forEach(card => {
        const glare = card.querySelector('.card-glare');

        card.addEventListener('mousemove', (e) => {
            if (isMobile()) return;

            const rect    = card.getBoundingClientRect();
            const x       = e.clientX - rect.left;
            const y       = e.clientY - rect.top;
            const cx      = rect.width  / 2;
            const cy      = rect.height / 2;
            const rotX    = ((y - cy) / cy) * -13;
            const rotY    = ((x - cx) / cx) *  13;

            card.style.transition = 'transform 0.08s linear, box-shadow 0.08s linear';
            card.style.transform  = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.025, 1.025, 1.025)`;
            card.style.boxShadow  = `${-rotY * 2.5}px ${rotX * 2.5}px 50px rgba(185,128,183,0.28)`;

            // Déplace le glare dans la direction de la souris
            if (glare) {
                const px = (x / rect.width)  * 100;
                const py = (y / rect.height) * 100;
                glare.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.14) 0%, transparent 65%)`;
                glare.style.opacity = '1';
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.55s ease, box-shadow 0.55s ease';
            card.style.transform  = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            card.style.boxShadow  = '';
            if (glare) glare.style.opacity = '0';
        });
    });

    // ─── Typing effect ───────────────────────────────────────────
    const typingEl = document.getElementById('typing-text');
    if (typingEl) {
        const phrases = [
            'Développeur Fullstack',
            'Développeur Web',
            'Créateur d\'interfaces',
            'Problem Solver',
        ];
        let phraseIdx  = 0;
        let charIdx    = 0;
        let isDeleting = false;

        function type() {
            const current = phrases[phraseIdx];
            if (isDeleting) {
                typingEl.textContent = current.slice(0, --charIdx);
            } else {
                typingEl.textContent = current.slice(0, ++charIdx);
            }

            let delay = isDeleting ? 55 : 90;

            if (!isDeleting && charIdx === current.length) {
                // Pause avant d'effacer
                delay = 1800;
                isDeleting = true;
            } else if (isDeleting && charIdx === 0) {
                isDeleting = false;
                phraseIdx  = (phraseIdx + 1) % phrases.length;
                delay = 300;
            }

            setTimeout(type, delay);
        }

        setTimeout(type, 800);
    }

    // ─── Skills 3D flottants ──────────────────────────────────────
    // Chaque badge reçoit une durée et un délai random pour un effet organique
    document.querySelectorAll('.skills li').forEach((skill, i) => {
        const dur   = (2.4 + Math.random() * 1.8).toFixed(2);
        const delay = (i * 0.12).toFixed(2);
        skill.style.setProperty('--float-dur',   `${dur}s`);
        skill.style.setProperty('--float-delay', `${delay}s`);
        // Apparition en cascade
        skill.style.opacity   = '0';
        skill.style.transform = 'translateY(22px)';
        setTimeout(() => {
            skill.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
            skill.style.opacity    = '1';
            skill.style.transform  = 'translateY(0)';
        }, 700 + i * 90);
    });

    // ─── Fade-in des cartes ───────────────────────────────────────
    document.querySelectorAll('.card').forEach((card, i) => {
        card.style.opacity   = '0';
        setTimeout(() => {
            card.style.transition = 'opacity 0.7s ease, transform 0.55s ease, box-shadow 0.08s linear';
            card.style.opacity    = '1';
        }, 150 + i * 250);
    });

    // ─── Fade-in icônes sociales ──────────────────────────────────
    document.querySelectorAll('.social-icon').forEach((icon, i) => {
        icon.style.opacity   = '0';
        icon.style.transform = 'translateY(15px)';
        setTimeout(() => {
            icon.style.transition = 'all 0.4s ease';
            icon.style.opacity    = '1';
            icon.style.transform  = 'translateY(0)';
        }, 1100 + i * 130);
    });

    // ─── Fade-in project items ────────────────────────────────────
    document.querySelectorAll('.project-item').forEach((item, i) => {
        item.style.opacity   = '0';
        item.style.transform = 'scale(0.88)';
        setTimeout(() => {
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            item.style.opacity    = '1';
            item.style.transform  = 'scale(1)';
        }, 900 + i * 180);
    });
});
