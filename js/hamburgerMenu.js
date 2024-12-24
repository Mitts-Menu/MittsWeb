document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.querySelector('.menu-button');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const closeButton = document.querySelector('.close-menu');
    const overlayMenu = document.querySelector('.overlay-menu');
    
    menuButton.addEventListener('click', () => {
        hamburgerMenu.classList.add('active');
        overlayMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    closeButton.addEventListener('click', () => {
        hamburgerMenu.classList.remove('active');
        overlayMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
    
    overlayMenu.addEventListener('click', () => {
        hamburgerMenu.classList.remove('active');
        overlayMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    });

    overlayMenu.addEventListener('touchmove', (e) => {
        e.preventDefault();
      }, { passive: false });
      
  });
  