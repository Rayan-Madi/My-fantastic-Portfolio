document.addEventListener('DOMContentLoaded', function() {
    // Gestion du menu hamburger
    const hamburger = document.getElementById('hamburger-icon');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        // Change l'icône du hamburger quand il est cliqué
        const icon = hamburger.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Animation des éléments de la page
    const animateElements = () => {
        // Ajoute une classe pour animer les cartes
        document.querySelectorAll('.card').forEach((card, index) => {
            setTimeout(() => {
                card.style.animation = `fadeIn 0.8s ease forwards, float 6s ease-in-out infinite ${index * 0.2}s`;
            }, index * 200);
        });

        // Anime les compétences
        document.querySelectorAll('.skills li').forEach((skill, index) => {
            skill.style.opacity = '0';
            skill.style.transform = 'translateY(20px)';
            setTimeout(() => {
                skill.style.transition = 'all 0.4s ease';
                skill.style.opacity = '1';
                skill.style.transform = 'translateY(0)';
            }, 800 + (index * 100));
        });
        
        // Anime les icônes sociales
        document.querySelectorAll('.social-icon').forEach((icon, index) => {
            icon.style.opacity = '0';
            icon.style.transform = 'translateY(15px)';
            setTimeout(() => {
                icon.style.transition = 'all 0.3s ease';
                icon.style.opacity = '1';
                icon.style.transform = 'translateY(0)';
            }, 1200 + (index * 150));
        });
        
        // Anime les éléments du projet
        document.querySelectorAll('.project-item').forEach((project, index) => {
            project.style.opacity = '0';
            project.style.transform = 'scale(0.9)';
            setTimeout(() => {
                project.style.transition = 'all 0.5s ease';
                project.style.opacity = '1';
                project.style.transform = 'scale(1)';
            }, 1000 + (index * 200));
        });
    };

    // Lance les animations après un court délai
    setTimeout(animateElements, 300);
});


