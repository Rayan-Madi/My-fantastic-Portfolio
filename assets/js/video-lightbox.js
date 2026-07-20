// Lightbox vidéo : ouvre un clip de démo au clic sur un bouton .play-demo
(function () {
    const lightbox = document.getElementById('video-lightbox');
    if (!lightbox) return;

    const player = document.getElementById('video-lightbox-player');
    const titleEl = document.getElementById('video-lightbox-title');
    let lastTrigger = null;

    function open(src, title, trigger, poster) {
        lastTrigger = trigger || null;
        titleEl.textContent = title || '';
        if (poster) { player.poster = poster; } else { player.removeAttribute('poster'); }
        player.src = src;
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        // Lecture différée (le src vient d'être posé)
        player.play().catch(function () { /* autoplay bloqué : l'utilisateur cliquera play */ });
    }

    function close() {
        player.pause();
        player.removeAttribute('src');
        player.load(); // libère le buffer
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastTrigger) lastTrigger.focus();
    }

    document.querySelectorAll('.play-demo').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            open(btn.dataset.video, btn.dataset.title, btn, btn.dataset.poster);
        });
    });

    lightbox.querySelectorAll('[data-close]').forEach(function (el) {
        el.addEventListener('click', close);
    });

    document.addEventListener('keydown', function (e) {
        // Escape est indépendant de la disposition clavier (AZERTY/QWERTY)
        if (e.code === 'Escape' && lightbox.classList.contains('open')) close();
    });
})();
