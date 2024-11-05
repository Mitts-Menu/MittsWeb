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

// Menü verisini çekme ve listeleme fonksiyonu
const menuContainer = document.getElementById('menu-container');
const categoryTitles = document.getElementById('category-titles');
const searchBar = document.getElementById('search-bar');
const suggestions = document.getElementById('suggestions');
let allMenuItems = []; // Tüm menü öğelerini tutacak dizi

function fetchMenu() {
  database.ref('menu').once('value')
    .then(snapshot => {
      const categories = snapshot.val();
      if (categories) {
        Object.values(categories).forEach(renderCategory);
      }
    })
    .catch(error => {
      console.error("Veri çekme hatası:", error);
    });
}

// Kategori render fonksiyonu
function renderCategory(category) {
  createCategoryHeader(category);
  createCategoryButton(category);
  renderMenuItems(category);
}

// Kategori başlığını oluşturma
function createCategoryHeader(category) {
  const categoryHeader = document.createElement('div');
  categoryHeader.className = 'category-header';
  categoryHeader.innerHTML = `
    <h3>${category.category_name}</h3>
    <a href="category.html?category=${encodeURIComponent(category.category_name)}">Hepsini Gör</a>
  `;
  menuContainer.appendChild(categoryHeader);
}

// Kategori butonunu oluşturma
function createCategoryButton(category) {

  let isMouseDown = false; // Fare basılı mı
  let startX; // Başlangıç X koordinatı
  let scrollLeft; // Başlangıç kaydırma değeri

  const categoryButton = document.createElement('button');
  categoryButton.className = 'category-button';
  categoryButton.innerText = category.category_name;
  categoryButton.addEventListener('click', () => scrollToCategory(category.category_name));
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
    categoryTitles.scrollLeft = scrollLeft - walk; // Yeni kaydırma değerini ayarla
  });
}

// Menü öğelerini listeleme
// Menü öğelerini listeleme
function renderMenuItems(category) {
  const itemContainer = document.createElement('div');
  itemContainer.className = 'item-container';
  itemContainer.setAttribute('data-category', category.category_name);

  // Sadece is_active: true olan öğeleri filtrele
  const activeItems = category.items.filter(item => item.is_active === true);

  // Aktif öğeleri render et
  activeItems.forEach(item => {
    const menuItem = createMenuItem(item);
    itemContainer.appendChild(menuItem);
    allMenuItems.push(item); // Aktif menü öğelerini diziye ekle
  });

  // Eğer aktif öğe yoksa, bir mesaj göster
  if (activeItems.length === 0) {
    const noItemsMessage = document.createElement('div');
    noItemsMessage.textContent = "Bu kategoride gösterilecek öğe yok.";
    itemContainer.appendChild(noItemsMessage);
  }

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

function adjustFontSize(element) {
  const maxFontSize = 16; // Maksimum font boyutu (px)
  const minFontSize = 10; // Minimum font boyutu (px)
  const lengthThreshold = 20; // Karakter uzunluğu eşiği

  // Ekran genişliğine göre font boyutunu ölçekleme katsayısı
  const screenScale = window.innerWidth / 1920; // 375 px genişlik referans alınır
  const scaledMaxFontSize = maxFontSize * screenScale;
  const scaledMinFontSize = minFontSize * screenScale;

  let fontSize = scaledMaxFontSize;
  if (element.textContent.length > lengthThreshold) {
    fontSize = scaledMaxFontSize - (element.textContent.length - lengthThreshold) * 0.5;
    fontSize = Math.max(fontSize, scaledMinFontSize); // Minimum font boyutuna kadar küçült
  }
  element.style.fontSize = `${fontSize}px`;
}

// Ekran boyutu değiştikçe fontları yeniden ayarla
window.addEventListener('resize', () => {
  document.querySelectorAll('.menu-item .item-name, .menu-item .item-price').forEach(adjustFontSize);
});


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
  startY = e.clientY;
  bottomSheet.style.transition = 'none'; // Kaydırma sırasında geçişi kaldır
});

window.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  currentY = e.clientY;
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

// Overlay'e tıklandığında kapatma
overlay.addEventListener('click', hideBottomSheet);
// Kategorilere kaydırma fonksiyonu
function scrollToCategory(categoryName) {
  const itemContainers = document.querySelectorAll('.item-container');
  itemContainers.forEach(container => {
    if (container.getAttribute('data-category') === categoryName) {
      const containerRect = container.getBoundingClientRect();
      const offset = 50; // İstediğiniz offset değerini buraya girin
      const scrollPosition = containerRect.top + window.scrollY - offset;

      window.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  });
}

// Arama fonksiyonu
function filterItems() {
  const input = searchBar.value.toLowerCase();
  suggestions.innerHTML = ''; // Önceki önerileri temizle

  if (input) {
    const filteredItems = allMenuItems.filter(item => item.name.toLowerCase().includes(input));
    
    filteredItems.forEach(item => {
      const div = document.createElement('div');
      div.classList.add('suggestion-item');

      // Resmi oluştur
      const img = document.createElement('img');
      img.src = item.image_url; // Her öğe için resim kaynağını atayın
      img.alt = item.name; // Erişilebilirlik için alt metin

      // Metni oluştur
      const text = document.createTextNode(item.name);
      
      // Resmi ve metni div'e ekle
      div.appendChild(img);
      div.appendChild(text);
      
      // Tıklama olayını ekle
      div.onclick = () => selectItem(item.name);
      suggestions.appendChild(div);
    });

    suggestions.style.display = filteredItems.length ? 'block' : 'none';
  } else {
    suggestions.style.display = 'none'; // Giriş boşsa öneri penceresini gizle
  }
}


// Seçilen öğeyi arama çubuğuna yaz ve öneri penceresini gizle
function selectItem(item) {
  searchBar.value = item;
  suggestions.style.display = 'none'; // Öneri penceresini gizle
}

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

// Arama çubuğu olay dinleyicisi
searchBar.addEventListener('input', filterItems);

// Veriyi çekme
fetchMenu();
