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

function fetchCategoryProducts() {
  database.ref('menu').once('value').then(snapshot => {
    snapshot.val().forEach(category => {
      if (category.category_name === categoryName) {
        category.items.forEach(item => {
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
          categoryProductsContainer.appendChild(menuItem);
        });
      }
    });
  }).catch(error => {
    console.error("Veri çekme hatası:", error);
  });
}

// Kategori ürünlerini çek
fetchCategoryProducts();