function showBottomSheet(item) {
    const bottomSheet = document.getElementById('bottomSheet');
    const overlay = document.getElementById('overlay');
    const itemName = document.getElementById('itemName');
    const itemPrice = document.getElementById('itemPrice');
    const itemDescription = document.getElementById('itemDescription');
    const itemImage = document.getElementById('itemImage');
    
    // Animasyonları optimize et
    requestAnimationFrame(() => {
        // İçeriği doldur
        itemName.textContent = item.name;
        itemPrice.textContent = `${item.price} ₺`;
        itemDescription.textContent = item.description;
        itemImage.src = item.image_url;
        
        // Hardware acceleration için transform kullan
        bottomSheet.style.transform = 'translate3d(0, 0, 0)';
        bottomSheet.style.height = '60%';
        itemImage.style.transform = 'translate3d(0, 0, 0) scale(1)';
        
        // BottomSheet ve overlay'i görünür yap
        bottomSheet.classList.add('active');
        overlay.classList.add('active');
        
        document.body.style.overflow = 'hidden';
    });
}

function hideBottomSheet() {
    const bottomSheet = document.getElementById('bottomSheet');
    const overlay = document.getElementById('overlay');
    
    requestAnimationFrame(() => {
        bottomSheet.style.transform = 'translate3d(0, 100%, 0)';
        setTimeout(() => {
            bottomSheet.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }, 300);
    });
}

// Touch olayları için değişkenler
let startY;
let currentY;
let isDragging = false;
let lastTime = 0;
const THROTTLE_DELAY = 16; // 60fps için ~16ms

function dragStart(e) {
    isDragging = true;
    startY = e.clientY || e.touches[0].clientY;
    bottomSheet.style.transition = 'none';
    itemImage.style.transition = 'none';
}

function dragging(e) {
    if (!isDragging) return;
    
    // Throttle uygula
    const now = Date.now();
    if (now - lastTime < THROTTLE_DELAY) return;
    lastTime = now;
    
    currentY = e.clientY || e.touches[0].clientY;
    const moveY = startY - currentY;
    
    requestAnimationFrame(() => {
        if (moveY > 0) {
            const limitedMoveY = Math.min(moveY, 400);
            bottomSheet.style.transform = `translate3d(0, ${limitedMoveY}px, 0)`;
            bottomSheet.style.height = `${60 + limitedMoveY / 5}%`;
            
            const zoomFactor = 1 + (limitedMoveY / 400) * 0.7;
            itemImage.style.transform = `translate3d(0, 0, 0) scale(${zoomFactor})`;
        } else {
            bottomSheet.style.transform = `translate3d(0, ${-moveY}px, 0)`;
        }
    });
}

function dragStop() {
    if (!isDragging) return;
    isDragging = false;
    
    requestAnimationFrame(() => {
        bottomSheet.style.transition = 'transform 0.3s ease, height 0.3s ease';
        itemImage.style.transition = 'transform 0.3s ease';
        
        const moveY = startY - currentY;
        const threshold = window.innerHeight * 0.3;
        
        if (moveY < -150) {
            hideBottomSheet();
        } else if (moveY > threshold) {
            bottomSheet.style.transform = 'translate3d(0, 0, 0)';
            bottomSheet.style.height = '100%';
            itemImage.style.transform = 'translate3d(0, 0, 0) scale(1.5)';
        } else {
            bottomSheet.style.transform = 'translate3d(0, 0, 0)';
            bottomSheet.style.height = '60%';
            itemImage.style.transform = 'translate3d(0, 0, 0) scale(1)';
        }
    });
}

// Passive event listener'lar kullan
bottomSheet.addEventListener('pointerdown', dragStart, { passive: true });
window.addEventListener('pointermove', dragging, { passive: true });
window.addEventListener('pointerup', dragStop);

bottomSheet.addEventListener('touchstart', dragStart, { passive: true });
window.addEventListener('touchmove', dragging, { passive: true });
window.addEventListener('touchend', dragStop);

overlay.addEventListener('click', hideBottomSheet);
  