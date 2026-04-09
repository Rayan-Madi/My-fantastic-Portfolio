document.addEventListener('DOMContentLoaded', function () {

    // ─── Menu hamburger ───────────────────────────────────────────
    const hamburger = document.getElementById('hamburger-icon');
    const navLinks  = document.querySelector('.nav-links');

    hamburger.addEventListener('click', function (e) {
        e.stopPropagation();
        navLinks.classList.toggle('active');
        const icon = hamburger.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });

    document.querySelectorAll('.nav-links a').forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = hamburger.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });

    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('active') && !e.target.closest('.navbar')) {
            navLinks.classList.remove('active');
            const icon = hamburger.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    navLinks.addEventListener('click', e => e.stopPropagation());

    // ─── Fade-in des sections projet ──────────────────────────────
    document.querySelectorAll('.project-section').forEach((section, i) => {
        section.style.opacity   = '0';
        section.style.transform = 'translateY(35px)';
        setTimeout(() => {
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            section.style.opacity    = '1';
            section.style.transform  = 'translateY(0)';
        }, 200 + i * 200);
    });
});
