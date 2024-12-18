document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.querySelector('.menu-button');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const closeButton = document.querySelector('.close-menu');
    
    // Menüyü aç
    menuButton.addEventListener('click', () => {
        hamburgerMenu.classList.add('active');
        document.body.style.overflow = 'hidden'; // Sayfa kaydırmayı engelle
    });
    
    // Menüyü kapat
    closeButton.addEventListener('click', () => {
        hamburgerMenu.classList.remove('active');
        document.body.style.overflow = 'auto'; // Sayfa kaydırmayı etkinleştir
    });
    
    // Menü dışına tıklandığında kapat
    document.addEventListener('click', (e) => {
        if (!hamburgerMenu.contains(e.target) && !menuButton.contains(e.target)) {
            hamburgerMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
});