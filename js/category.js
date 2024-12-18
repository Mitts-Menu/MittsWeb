// Firebase ayarlarını buraya ekleyin
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

// Kategori ürünlerini çekme
const categoryProductsContainer = document.getElementById('category-products-container');

// URL'den kategori bilgisini alma
const urlParams = new URLSearchParams(window.location.search);
const categoryName = urlParams.get('category');
const currentLanguage = localStorage.getItem("language") || "tr"; // Varsayılan dil İngilizce

// Kategori başlığını güncelle
const categoryTitle = document.querySelector('.category-detail-title');
if (categoryTitle && categoryName) {
    categoryTitle.textContent = categoryName;
}

// Kategori ürünlerini çekme
function fetchCategoryProducts() {
  database.ref('menu').once('value').then(snapshot => {
    const categories = snapshot.val(); // Verileri al
    console.log("Tüm kategoriler:", categories); // Kategorileri kontrol et
    if (categories && categories[currentLanguage]) { // Dilin mevcut olup olmadığını kontrol et
      const categoryList = categories[currentLanguage]; // Seçilen dildeki kategorileri al
      
      // Seçilen kategoriye ait ürünleri bul
      const selectedCategory = categoryList.find(cat => cat.category_name === categoryName);
      console.log("Seçilen kategori:", selectedCategory); // Seçilen kategoriyi kontrol et
      
      if (selectedCategory) {
        if (selectedCategory.items && Array.isArray(selectedCategory.items)) { // Kategori öğeleri var mı kontrol et
          selectedCategory.items.forEach(item => {
            // Menü öğelerini oluştur
            const menuItem = document.createElement('div');
            menuItem.className = 'category-content';
            menuItem.innerHTML = `
              <div class="content-img">
                <img src="${item.image_url}" alt="${item.name}">
              </div>
              <div class="content-desc">
                <h3>${item.name}</h3>
                <p class="item-description">${item.description}</p>
                <p class="item-price">${item.price} ₺</p>
              </div>
            `;

            // Tıklama olayını ekleyelim
            menuItem.addEventListener('click', () => {
              showBottomSheet({
                name: item.name,
                price: item.price,
                description: item.description,
                image_url: item.image_url
              });
            });

            categoryProductsContainer.appendChild(menuItem); // Ekrana ekle
          });
        } else {
          console.error('Kategori öğeleri bulunamadı:', selectedCategory.items);
        }
      } else {
        console.error('Seçilen kategori bulunamadı:', categoryName);
      }
    } else {
      console.error('Kategori verisi veya dil bulunamadı');
    }
  }).catch(error => {
    console.error("Veri çekme hatası:", error);
  });
}

// Kategori ürünlerini çek
fetchCategoryProducts();