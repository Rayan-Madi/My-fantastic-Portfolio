const hamburger = document.getElementById('hamburger-icon');
const navLinks = document.querySelector('.nav-links');
const contactForm = document.getElementById('contact-form');
const toast = document.getElementById('toast-notification');

// Fonction pour basculer le menu
function toggleMenu(event) {
    event.stopPropagation(); // Empêche la propagation de l'événement
    navLinks.classList.toggle('active');
    
    // Change l'icône hamburger en X quand le menu est ouvert
    const icon = hamburger.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
}

// Ouvre/ferme le menu au clic sur l'icône
hamburger.addEventListener('click', toggleMenu);

// Ferme le menu quand on clique sur un lien
const navItems = document.querySelectorAll('.nav-links a');
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        
        // Remet l'icône hamburger
        const icon = hamburger.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    });
});

// Ferme le menu quand on clique en dehors
document.addEventListener('click', (event) => {
    if (navLinks.classList.contains('active') && !event.target.closest('.navbar')) {
        navLinks.classList.remove('active');
        
        // Remet l'icône hamburger
        const icon = hamburger.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Empêche la fermeture du menu lorsqu'on clique à l'intérieur
navLinks.addEventListener('click', (event) => {
    event.stopPropagation();
});

// Fonction pour afficher la notification toast
function showToast() {
    toast.classList.add('show');
    
    // Cache automatiquement le toast après 5 secondes
    setTimeout(() => {
        hideToast();
    }, 5000);
}

// Fonction pour cacher la notification toast
function hideToast() {
    toast.classList.remove('show');
}

// Fonction pour fermer le toast manuellement
function closeToast() {
    hideToast();
}

// Fonction pour réinitialiser le formulaire
function resetForm() {
    contactForm.reset();
    
    // Remet le bouton dans son état normal
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.classList.remove('sending');
    const icon = submitBtn.querySelector('i');
    const span = submitBtn.querySelector('span');
    
    icon.classList.remove('fa-spinner', 'fa-spin');
    icon.classList.add('fa-arrow-right');
    span.textContent = 'Envoyer';
}

// Animation lors de la soumission du formulaire
contactForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Empêche la soumission normale du formulaire
    
    const submitBtn = document.querySelector('.submit-btn');
    const icon = submitBtn.querySelector('i');
    const span = submitBtn.querySelector('span');
    
    // Change l'apparence du bouton pour indiquer l'envoi
    submitBtn.classList.add('sending');
    icon.classList.remove('fa-arrow-right');
    icon.classList.add('fa-spinner', 'fa-spin');
    span.textContent = 'Envoi en cours...';
    
    // Simule l'envoi du formulaire (remplace par votre logique d'envoi réelle)
    const formData = new FormData(contactForm);
    
    // Envoi via fetch vers Formspree
    fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            // Succès : affiche la notification et réinitialise le formulaire
            setTimeout(() => {
                resetForm();
                showToast();
            }, 1000); // Délai pour que l'utilisateur voie l'animation d'envoi
        } else {
            throw new Error('Erreur lors de l\'envoi');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        // En cas d'erreur, remet le bouton normal et affiche un message d'erreur
        setTimeout(() => {
            resetForm();
            // Vous pouvez ajouter ici une notification d'erreur si nécessaire
            alert('Une erreur est survenue lors de l\'envoi. Veuillez réessayer.');
        }, 1000);
    });
});

// Animation au scroll pour les éléments du formulaire
document.addEventListener('DOMContentLoaded', function() {
    const formGroups = document.querySelectorAll('.form-group');
    
    // Ajoute une classe avec un délai pour créer une animation d'entrée
    formGroups.forEach((group, index) => {
        setTimeout(() => {
            group.classList.add('animated');
        }, 100 * index);
    });
});

// Ferme le toast si on clique en dehors
document.addEventListener('click', function(event) {
    if (toast.classList.contains('show') && !toast.contains(event.target)) {
        // On peut choisir de ne pas fermer automatiquement au clic extérieur
        // hideToast();
    }
});
