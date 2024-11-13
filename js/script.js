// Firebase ayarları
const firebaseConfig = {
  apiKey: "AIzaSyCCI4I7yCCHEjhe4sOMnzP4j35S592aods",
  authDomain: "mitts-menu.firebaseapp.com",
  databaseURL: "https://mitts-menu-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mitts-menu",
  storageBucket: "mitts-menu.appspot.com",
  messagingSenderId: "1023674735399",
  appId: "1:1023674735399:web:5bfbd8c6f3fa4f44e0e702",
  measurementId: "G-FY4717JPP5"
};

// Firebase başlatma
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();
let selectedLanguage = localStorage.getItem("language") || 'tr'; // Varsayılan dil Türkçe, localStorage'dan al

// Menü verisini çekme ve listeleme fonksiyonu
const menuContainer = document.getElementById('menu-items');
const categoryTitles = document.getElementById('category-titles');
const searchBar = document.getElementById('search-bar');
let allMenuItems = []; // Tüm menü öğelerini tutacak dizi


const languageTexts = {
  tr: {
    viewAll: "Hepsini Gör"
  },
  en: {
    viewAll: "View All"
  }
};
// Sayfa yüklendiğinde menüyü ve kategori başlıklarını çek
fetchMenu(); 

// Dil seçiciye Select2 uygulama
$(document).ready(function() {
  $('#language-selector').select2({
    minimumResultsForSearch: Infinity, // Arama alanını gizler
    templateResult: function(state) {
      if (!state.id) {
        return ''; // Eğer bir seçenek yoksa, sadece bayrağı göster
      }

      // Bayrak resmi yolunu al
      var flagUrl = "../img/" + state.element.getAttribute("data-flag") + ".jpg"; 

      // Bayrak ikonunu döndür
      var $state = $( 
        '<span><img src="' + flagUrl + '" class="flag" style="width: 20px; height: 15px;" /></span>'
      );
      return $state;
    },
    templateSelection: function(state) {
      if (!state.id) {
        return ''; // Eğer bir seçenek yoksa, sadece bayrağı göster
      }

      // Bayrak resmi yolunu al
      var flagUrl = "../img/" + state.element.getAttribute("data-flag") + ".jpg"; 

      // Bayrak ikonunu döndür
      var $state = $( 
        '<span><img src="' + flagUrl + '" class="flag" style="width: 20px; height: 15px;" /></span>'
      );
      return $state;
    }
  });

  // Başlangıç dilini seç
  $('#language-selector').val(selectedLanguage).trigger('change');

  // Dil seçimi değiştiğinde menüyü yeniden çek
  $('#language-selector').on('change', function() {
    selectedLanguage = $(this).val();
    localStorage.setItem("language", selectedLanguage);  // Dil bilgisini sakla
    fetchMenu(); // Dil değiştiğinde menüyü yeniden çek
  });
});


function fetchMenu() {
  console.log("Selected Language:", selectedLanguage); // Hangi dil seçildiğini kontrol et
  database.ref('menu').once('value')
    .then(snapshot => {
      const categories = snapshot.val();
      if (categories) {
        const currentCategories = Object.values(categories[selectedLanguage]);
        console.log("Current Categories:", currentCategories); // Yüklenen kategorileri kontrol et
        updateCategoryTitles(currentCategories);
        menuContainer.innerHTML = '';
        allMenuItems = [];
        currentCategories.forEach(renderCategory);
      }
    })
    .catch(error => {
      console.error("Veri çekme hatası:", error);
    });
}

// Kategori render fonksiyonu
function renderCategory(category) {
  createCategoryHeader(category);
  renderMenuItems(category);
}

// Kategori başlığını oluşturma
function createCategoryHeader(category) {
  const categoryHeader = document.createElement('div');
  categoryHeader.className = 'category-header';
  categoryHeader.innerHTML = `
    <h3>${category.category_name}</h3>
    <a href="category.html?category=${encodeURIComponent(category.category_name)}">${languageTexts[selectedLanguage].viewAll}</a>
  `;
  menuContainer.appendChild(categoryHeader);
}

function updateCategoryTitles(categories) {
  console.log('Updating category titles:', categories); // Başlıklar güncelleniyor mu kontrol et
  categoryTitles.innerHTML = ''; // Önceki başlıkları temizle
  categories.forEach(category => {
    createCategoryButton(category); // Yeni başlıkları oluştur
  });
}

// Kategori butonunu oluşturma
function createCategoryButton(category) {
  let isMouseDown = false; // Fare basılı mı
  let startX; // Başlangıç X koordinatı
  let scrollLeft; // Başlangıç kaydırma değeri

  const categoryButton = document.createElement('button');
  categoryButton.className = 'category-button';
  categoryButton.innerText = category.category_name;

  // Butona tıklandığında kaydırma işlemi
  categoryButton.addEventListener('click', () => {
    scrollToCategory(category.category_name); // Kategoriye kaydır
  });

  categoryTitles.appendChild(categoryButton);

  categoryTitles.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    startX = e.pageX - categoryTitles.offsetLeft; // Fare basıldığında başlangıç pozisyonunu al
    scrollLeft = categoryTitles.scrollLeft; // Başlangıç kaydırma değerini al
  });

  categoryTitles.addEventListener('mouseleave', () => {
    isMouseDown = false; // Fare bırakıldığında durumu değiştir
  });

  categoryTitles.addEventListener('mouseup', () => {
    isMouseDown = false; // Fare bırakıldığında durumu değiştir
  });

  categoryTitles.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return; // Eğer fare basılı değilse, işleme devam etme
    e.preventDefault(); // Varsayılan kaydırmayı durdur
    const x = e.pageX - categoryTitles.offsetLeft; // Şu anki X koordinatını al
    const walk = (x - startX) * 2; // Kaydırma hızı
    categoryTitles.scrollLeft = scrollLeft - walk; // Yeni kaydırma değerini ayarla
  });
}

function scrollToCategory(categoryName) {
  const itemContainer = document.querySelector(`.item-container[data-category="${categoryName}"]`);
  if (itemContainer) {
    const offset = 150; // Ekranın üst kısmında kaç piksel boşluk bırakmak istediğiniz
    const elementPosition = itemContainer.getBoundingClientRect().top + window.pageYOffset; // Elemanın ekran üzerindeki konumu
    const offsetPosition = elementPosition - offset; // Yeni kaydırma pozisyonu

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth' // Kaydırma animasyonu
    });
  }
}

// Menü öğelerini listeleme
function renderMenuItems(category) {
  const itemContainer = document.createElement('div');
  itemContainer.className = 'item-container';
  itemContainer.setAttribute('data-category', category.category_name);

  category.items.forEach(item => {
    const menuItem = createMenuItem(item);
    itemContainer.appendChild(menuItem);
    allMenuItems.push(item); // Tüm menü öğelerini diziye ekle
  });

  menuContainer.appendChild(itemContainer);

  // Fare ile kaydırma işlemleri
  let isMouseDown = false; // Fare basılı mı
  let startX; // Başlangıç X koordinatı
  let scrollLeft; // Başlangıç kaydırma değeri

  itemContainer.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    startX = e.pageX - itemContainer.offsetLeft; // Fare basıldığında başlangıç pozisyonunu al
    scrollLeft = itemContainer.scrollLeft; // Başlangıç kaydırma değerini al
  });

  itemContainer.addEventListener('mouseleave', () => {
    isMouseDown = false; // Fare bırakıldığında durumu değiştir
  });

  itemContainer.addEventListener('mouseup', () => {
    isMouseDown = false; // Fare bırakıldığında durumu değiştir
  });

  itemContainer.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return; // Eğer fare basılı değilse, işleme devam etme
    e.preventDefault(); // Varsayılan kaydırmayı durdur
    const x = e.pageX - itemContainer.offsetLeft; // Şu anki X koordinatını al
    const walk = (x - startX) * 2; // Kaydırma hızı
    itemContainer.scrollLeft = scrollLeft - walk; // Yeni kaydırma değerini ayarla
  });
}

// Menü öğesini oluşturma
function createMenuItem(item) {
  const menuItem = document.createElement('div');
  menuItem.className = 'menu-item';
  menuItem.innerHTML = `
    <img src="${item.image_url}" alt="${item.name}">
    <h3 class="item-name">${item.name}</h3>
    <p class="item-price">${item.price} ₺</p>
  `;

  // Tıklama olayı: Ürün tıklandığında bottom sheet'i göster
  menuItem.addEventListener('click', () => {
    showBottomSheet(item);
  });

  // Dinamik font ayarlama
  adjustFontSize(menuItem.querySelector('.item-name'));
  adjustFontSize(menuItem.querySelector('.item-price'));

  return menuItem;
}

window.addEventListener('resize', () => {
  document.querySelectorAll('.menu-item .item-name, .menu-item .item-price').forEach(adjustFontSize);
});

function adjustFontSize(element) {
  const maxFontSize = 16; // Maksimum font boyutu (px)
  const minFontSize = 12; // Minimum font boyutu (px)
  const lengthThreshold = 30; // Karakter uzunluğu eşiği

  // Ekran genişliğine göre font boyutunu ölçekleme katsayısı (alt ve üst limitlerle)
  let screenScale = window.innerWidth / 1440; // 1440 px genişlik referans alınır
  screenScale = Math.max(0.8, Math.min(screenScale, 1)); // Ölçeği 0.8 ile 1 arasında tut

  // Ölçeklenmiş maksimum ve minimum font boyutları
  const scaledMaxFontSize = maxFontSize * screenScale;
  const scaledMinFontSize = minFontSize * screenScale;

  let fontSize = scaledMaxFontSize;
  if (element.textContent.length > lengthThreshold) {
    fontSize = scaledMaxFontSize - (element.textContent.length - lengthThreshold) * 0.5;
    fontSize = Math.max(fontSize, scaledMinFontSize); // Minimum font boyutuna kadar küçült
  }

  // Font boyutunu elemente uygula
  element.style.fontSize = `${fontSize}px`;
}

function showBottomSheet(item) {
  const bottomSheet = document.getElementById('bottomSheet');
  const overlay = document.getElementById('overlay');
  const itemName = document.getElementById('itemName');
  const itemPrice = document.getElementById('itemPrice');
  const itemDescription = document.getElementById('itemDescription');
  const itemImage = document.getElementById('itemImage');

  // İçeriği doldur
  itemName.textContent = item.name;
  itemPrice.textContent =`${item.price} ₺`;
  itemDescription.textContent = item.description;
  itemImage.src = item.image_url;

  // BottomSheet ve overlay'i görünür yap
  bottomSheet.classList.add('active');
  overlay.classList.add('active');
  bottomSheet.style.transform = 'translateY(0)'; // Aşağı kaydır

  document.body.style.overflow = 'hidden';
}

function hideBottomSheet() {
  const bottomSheet = document.getElementById('bottomSheet');
  const overlay = document.getElementById('overlay');

  // Aşağı kaydırmak için CSS'yi değiştir
  bottomSheet.style.transform = 'translateY(100%)'; // Aşağı kaydır
  setTimeout(() => {
    // Aşağı kaydırma animasyonu bittikten sonra gizle
    bottomSheet.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
  }, 300); // Geçiş süresi ile aynı süre
}


// Kaydırma ve kapatma işlemleri
const bottomSheet = document.getElementById('bottomSheet');
const overlay = document.getElementById('overlay');
let startY;
let currentY;
let isDragging = false;

bottomSheet.addEventListener('pointerdown', (e) => {
  isDragging = true;
  startY = e.clientY || e.touches[0].clientY; // Fare veya parmak başlangıç koordinatı
  bottomSheet.style.transition = 'none'; // Kaydırma sırasında geçişi kaldır
});

window.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  currentY = e.clientY || e.touches[0].clientY; // Fare veya parmak pozisyonu
  const moveY = currentY - startY;
  if (moveY > 0) {
      bottomSheet.style.transform = `translateY(${moveY}px)`; // Aşağı kaydır
  }
});

window.addEventListener('pointerup', () => {
  if (!isDragging) return;
  isDragging = false;
  bottomSheet.style.transition = 'transform 0.3s ease'; // Kaydırma tamamlandığında geçişi geri yükle

  const moveY = currentY - startY;
  if (moveY > 100) { // 100px'den fazla kaydırırsa kapat
      hideBottomSheet();
  } else {
      bottomSheet.style.transform = 'translateY(0)'; // Yeniden aç
  }
});

// Touch olaylarını da ekliyoruz
bottomSheet.addEventListener('touchstart', (e) => {
  isDragging = true;
  startY = e.touches[0].clientY; // Parmakla başlangıç koordinatını al
  bottomSheet.style.transition = 'none'; // Kaydırma sırasında geçişi kaldır
});

window.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  currentY = e.touches[0].clientY; // Parmak pozisyonu
  const moveY = currentY - startY;
  if (moveY > 0) {
      bottomSheet.style.transform = `translateY(${moveY}px)`; // Aşağı kaydır
  }
});

window.addEventListener('touchend', () => {
  if (!isDragging) return;
  isDragging = false;
  bottomSheet.style.transition = 'transform 0.3s ease'; // Kaydırma tamamlandığında geçişi geri yükle

  const moveY = currentY - startY;
  if (moveY > 100) { // 100px'den fazla kaydırırsa kapat
      hideBottomSheet();
  } else {
      bottomSheet.style.transform = 'translateY(0)'; // Yeniden aç
  }
});

// Overlay'e tıklandığında kapatma
overlay.addEventListener('click', hideBottomSheet);
function filterItems() {
  const searchTerm = searchBar.value.toLowerCase();  // Arama terimini al
  const categoryHeaders = document.querySelectorAll('.category-header');  // Kategori başlıklarını al

  categoryHeaders.forEach(header => {
    const menuItems = header.nextElementSibling.querySelectorAll('.menu-item');  // Kategori başlığının altındaki menü öğelerini al
    
    let foundMatch = false;  // Eşleşme durumu kontrolü için flag

    menuItems.forEach(item => {
      const itemName = item.querySelector('.item-name').textContent.toLowerCase();  // Menü öğesinin adını al

      // Eğer öğenin adı arama terimiyle eşleşiyorsa
      if (itemName.includes(searchTerm)) {
        item.style.display = 'block';  // Menü öğesini göster
        foundMatch = true;  // Eşleşme bulundu
      } else {
        item.style.display = 'none';  // Menü öğesini gizle
      }
    });

    // Kategori başlığını yalnızca eşleşen ürün varsa göster
    if (foundMatch) {
      header.style.display = 'flex';  // Kategori başlığını göster
    } else {
      header.style.display = 'none';  // Kategori başlığını gizle
    }

    // Eğer kategori altında hiç öğe kalmadıysa, item-container'ı gizle
    const itemContainer = header.nextElementSibling;
    if (Array.from(itemContainer.querySelectorAll('.menu-item')).every(item => item.style.display === 'none')) {
      itemContainer.style.display = 'none';  // item-container'ı gizle
    } else {
      itemContainer.style.display = 'flex';  // item-container'ı göster
    }
  });

  // Eğer arama terimi boşsa, tüm öğeleri ve başlıkları tekrar göster
  if (searchTerm === '') {
    categoryHeaders.forEach(header => {
      header.style.display = 'flex';  // Kategori başlıklarını göster
      const menuItems = header.nextElementSibling.querySelectorAll('.menu-item');
      menuItems.forEach(item => {
        item.style.display = 'block';  // Menü öğelerini göster
      });
      const itemContainer = header.nextElementSibling;
      itemContainer.style.display = 'flex';  // item-container'ı göster
    });
  }
}

// Arama çubuğuna event listener ekle
searchBar.addEventListener('input', filterItems);


// Sayfa kaydırıldığında butonu göster
window.addEventListener('scroll', () => {
  const scrollToTopButton = document.getElementById('scroll-to-top');
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
      scrollToTopButton.style.display = 'block'; // Butonu göster
  } else {
      scrollToTopButton.style.display = 'none'; // Butonu gizle
  }
});

// Butona tıklandığında sayfayı yukarı kaydır
document.getElementById('scroll-to-top').addEventListener('click', () => {
  window.scrollTo({
      top: 0,
      behavior: 'smooth' // Kaydırma animasyonu
  });
});