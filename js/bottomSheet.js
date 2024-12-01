function showBottomSheet(item) {
    const bottomSheet = document.getElementById('bottomSheet');
    const overlay = document.getElementById('overlay');
    const itemName = document.getElementById('itemName');
    const itemPrice = document.getElementById('itemPrice');
    const itemDescription = document.getElementById('itemDescription');
    const itemImage = document.getElementById('itemImage');
    
    // İçeriği doldur
    itemName.textContent = item.name;
    itemPrice.textContent = `${item.price} ₺`;
    itemDescription.textContent = item.description;
    itemImage.src = item.image_url;
    
    // BottomSheet ve overlay'i görünür yap
    bottomSheet.classList.add('active');
    overlay.classList.add('active');
    
    // Başlangıçta bottomSheet'i yarıya kadar aç
    bottomSheet.style.transform = 'translateY(0)';
    bottomSheet.style.height = '60%';
    itemImage.style.transform = 'scale(1)';
    
    document.body.style.overflow = 'hidden';
  }
  
  function hideBottomSheet() {
    const bottomSheet = document.getElementById('bottomSheet');
    const overlay = document.getElementById('overlay');
    
    // Aşağı kaydırmak için CSS'yi değiştir
    bottomSheet.style.transform = 'translateY(100%)';
    setTimeout(() => {
      bottomSheet.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = 'auto';
    }, 300);
  }
  
  // Kaydırma ve kapatma işlemleri
  const bottomSheet = document.getElementById('bottomSheet');
  const overlay = document.getElementById('overlay');
  const itemImage = document.getElementById('itemImage'); 
  let startY;
  let currentY;
  let isDragging = false;
  
  // Drag başlatma fonksiyonu
  function dragStart(e) {
    isDragging = true;
    startY = e.clientY || e.touches[0].clientY;
    bottomSheet.style.transition = 'none';
    itemImage.style.transition = 'none';
  }
  
  // Drag işlemi fonksiyonu
  function dragging(e) {
    if (!isDragging) return;
    currentY = e.clientY || e.touches[0].clientY;
    const moveY = startY - currentY;
    
    if (moveY > 0) {  // Yukarı kaydırma kontrolü
      const limitedMoveY = Math.min(moveY, 400);
      bottomSheet.style.transform = `translateY(${limitedMoveY}px)`;
      bottomSheet.style.height = `${60 + limitedMoveY / 5}%`;
      
      // Resim zoom efekti (1x ile 1.5x arasında zoom)
      const zoomFactor = 1 + (limitedMoveY / 400) * 0.7;
      itemImage.style.transform = `scale(${zoomFactor})`;
    } else {  // Aşağı kaydırma kontrolü
      bottomSheet.style.transform = `translateY(${-moveY}px)`;
    }
  }
  
  // Drag bitirme fonksiyonu
  function dragStop() {
    if (!isDragging) return;
    isDragging = false;
    bottomSheet.style.transition = 'transform 0.5s ease, height 0.5s ease';
    itemImage.style.transition = 'transform 0.5s ease';
    
    const moveY = startY - currentY;
    const threshold = window.innerHeight * 0.3;
    
    if (moveY < -150) {  // Aşağı kaydırma eşiği kontrolü
      hideBottomSheet();  // Aşağı kaydırılırsa kapat
    } else if (moveY > threshold) {  // Yukarı kaydırma kontrolü
      bottomSheet.style.transform = 'translateY(0)';
      bottomSheet.style.height = '100%';
      itemImage.style.transform = 'scale(1.5)';
    } else {
      bottomSheet.style.transform = 'translateY(0)';
      bottomSheet.style.height = '60%';
      itemImage.style.transform = 'scale(1)';
    }
  }
  
  // Ortak olay dinleyicileri
  bottomSheet.addEventListener('pointerdown', dragStart);
  window.addEventListener('pointermove', dragging);
  window.addEventListener('pointerup', dragStop);
  
  bottomSheet.addEventListener('touchstart', dragStart);
  window.addEventListener('touchmove', dragging);
  window.addEventListener('touchend', dragStop);
  
  // Overlay'e tıklandığında kapatma
  overlay.addEventListener('click', hideBottomSheet);
  