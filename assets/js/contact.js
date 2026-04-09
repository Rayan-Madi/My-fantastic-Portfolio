const hamburger   = document.getElementById('hamburger-icon');
const navLinks    = document.querySelector('.nav-links');
const contactForm = document.getElementById('contact-form');
const toast       = document.getElementById('toast-notification');

// ─── Menu hamburger ───────────────────────────────────────────
function toggleMenu(e) {
    e.stopPropagation();
    navLinks.classList.toggle('active');
    const icon = hamburger.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
}

hamburger.addEventListener('click', toggleMenu);

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

// ─── Tilt 3D sur la carte contact ────────────────────────────
const isMobile = () => window.innerWidth <= 768;

document.querySelectorAll('.tilt-card').forEach(card => {
    const glare = card.querySelector('.card-glare');

    card.addEventListener('mousemove', (e) => {
        if (isMobile()) return;
        const rect = card.getBoundingClientRect();
        const x    = e.clientX - rect.left;
        const y    = e.clientY - rect.top;
        const cx   = rect.width  / 2;
        const cy   = rect.height / 2;
        const rotX = ((y - cy) / cy) * -12;
        const rotY = ((x - cx) / cx) *  12;

        card.style.transition = 'transform 0.08s linear, box-shadow 0.08s linear';
        card.style.transform  = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.boxShadow  = `${-rotY * 2.5}px ${rotX * 2.5}px 50px rgba(185,128,183,0.28)`;

        if (glare) {
            const px = (x / rect.width)  * 100;
            const py = (y / rect.height) * 100;
            glare.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.14) 0%, transparent 65%)`;
            glare.style.opacity = '1';
        }
    });

    card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.55s ease, box-shadow 0.55s ease';
        card.style.transform  = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
        card.style.boxShadow  = '';
        if (glare) glare.style.opacity = '0';
    });
});

// ─── Fade-in des form-groups ──────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.form-group').forEach((group, i) => {
        setTimeout(() => group.classList.add('animated'), 120 * i);
    });
});

// ─── Toast ────────────────────────────────────────────────────
function showToast() {
    toast.classList.add('show');
    setTimeout(hideToast, 5000);
}

function hideToast() {
    toast.classList.remove('show');
}

function closeToast() {
    hideToast();
}

function resetForm() {
    contactForm.reset();
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.classList.remove('sending');
    const icon = submitBtn.querySelector('i');
    const span = submitBtn.querySelector('span');
    icon.classList.remove('fa-spinner', 'fa-spin');
    icon.classList.add('fa-arrow-right');
    span.textContent = 'Envoyer';
}

// ─── Soumission formulaire ────────────────────────────────────
contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const submitBtn = document.querySelector('.submit-btn');
    const icon      = submitBtn.querySelector('i');
    const span      = submitBtn.querySelector('span');

    submitBtn.classList.add('sending');
    icon.classList.remove('fa-arrow-right');
    icon.classList.add('fa-spinner', 'fa-spin');
    span.textContent = 'Envoi en cours...';

    fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
    })
    .then(response => {
        if (response.ok) {
            setTimeout(() => { resetForm(); showToast(); }, 1000);
        } else {
            throw new Error('Erreur envoi');
        }
    })
    .catch(() => {
        setTimeout(() => {
            resetForm();
            alert('Une erreur est survenue. Veuillez réessayer.');
        }, 1000);
    });
});
