document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.querySelector('.menu-button');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const closeButton = document.querySelector('.close-menu');
    
    menuButton.addEventListener('click', () => {
        hamburgerMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    closeButton.addEventListener('click', () => {
        hamburgerMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
    
    document.addEventListener('click', (e) => {
        if (!hamburgerMenu.contains(e.target) && !menuButton.contains(e.target)) {
            hamburgerMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
});