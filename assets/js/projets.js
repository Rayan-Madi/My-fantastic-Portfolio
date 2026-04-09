// Navigation pour mobile
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger-icon');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        
        // Change l'icône du hamburger
        const hamburgerIcon = hamburger.querySelector('i');
        if (navLinks.classList.contains('active')) {
            hamburgerIcon.classList.remove('fa-bars');
            hamburgerIcon.classList.add('fa-times');
        } else {
            hamburgerIcon.classList.remove('fa-times');
            hamburgerIcon.classList.add('fa-bars');
        }
    });
    
    // Ferme le menu quand on clique sur un lien
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                
                // Remet l'icône du hamburger
                const hamburgerIcon = hamburger.querySelector('i');
                hamburgerIcon.classList.remove('fa-times');
                hamburgerIcon.classList.add('fa-bars');
            }
        });
    });
});