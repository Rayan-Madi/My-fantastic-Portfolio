// Sélection des éléments
const hamburger = document.getElementById('hamburger-icon');
const navLinks = document.querySelector('.nav-links');

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

// Nous avons supprimé la fonction adjustAnimation() car nous utilisons désormais CSS
// pour gérer l'animation sur mobile