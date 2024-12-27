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

const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const categoryProductsContainer = document.getElementById('category-products-container');

const urlParams = new URLSearchParams(window.location.search);
const categoryName = urlParams.get('category');
const currentLanguage = localStorage.getItem("language") || "tr";

const categoryTitle = document.querySelector('.category-detail-title');
if (categoryTitle && categoryName) {
    categoryTitle.textContent = categoryName;
}

function fetchCategoryProducts() {
  database.ref('menu').once('value').then(snapshot => {
    const categories = snapshot.val();
    console.log("Tüm kategoriler:", categories);
    if (categories && categories[currentLanguage]) {
      const categoryList = categories[currentLanguage];
      
      const selectedCategory = categoryList.find(cat => cat.category_name === categoryName);
      console.log("Seçilen kategori:", selectedCategory);
      
      if (selectedCategory) {
        if (selectedCategory.items && Array.isArray(selectedCategory.items)) {
          selectedCategory.items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'category-content';

            // Placeholder resmi
            const placeholderImage = '../img/mitts_logo.png';

            // HTML yapısında başlangıçta placeholder gösteriliyor
            menuItem.innerHTML = `
              <div class="content-img">
                <img src="${placeholderImage}" alt="${item.name}" class="menu-image">
              </div>
              <div class="content-desc">
                <h3>${item.name}</h3>
                <p class="item-description">${item.description}</p>
                <p class="item-price">₺${item.price}</p>
              </div>
            `;

            // Resim öğesini al
            const imageElement = menuItem.querySelector('.menu-image');
            const realImageSrc = item.image_url;

            // Gerçek resmi asenkron olarak yükle
            const realImage = new Image();
            realImage.onload = () => {
              imageElement.src = realImageSrc; // Resim yüklendiğinde gerçek resmi ata
            };
            realImage.onerror = () => {
              console.error(`Resim yüklenemedi: ${realImageSrc}`); // Yüklenemezse placeholder kalır
            };
            realImage.src = realImageSrc;

            // Menü öğesine tıklama olayı ekle
            menuItem.addEventListener('click', () => {
              showBottomSheet({
                name: item.name,
                price: item.price,
                description: item.description,
                image_url: item.image_url,
              });
            });

            categoryProductsContainer.appendChild(menuItem);
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

fetchCategoryProducts();
