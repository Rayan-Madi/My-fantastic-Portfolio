/* ═══════════════════════════════════════════════════════
   Envoi du formulaire vers Formspree, sans quitter la page.
   En cas d'échec, on renvoie vers l'adresse directe plutôt
   que d'afficher une alerte qui ne mène nulle part.
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const status = document.getElementById('form-status');
    const btn = form.querySelector('.submit-btn');
    const label = btn.querySelector('span');
    const initial = label.textContent;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        btn.disabled = true;
        label.textContent = 'Envoi…';
        status.textContent = '';
        status.className = 'form-status';

        try {
            const res = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' }
            });
            if (!res.ok) throw new Error(res.status);

            form.reset();
            status.textContent = 'Message envoyé. Je réponds sous 24 h.';
            status.className = 'form-status ok';
        } catch (err) {
            status.innerHTML =
                'L\'envoi a échoué. Écris-moi directement à ' +
                '<a href="mailto:madirayan75015@gmail.com">madirayan75015@gmail.com</a>.';
            status.className = 'form-status err';
        } finally {
            btn.disabled = false;
            label.textContent = initial;
        }
    });
});
