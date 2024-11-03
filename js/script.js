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
  const categoryButton = document.createElement('button');
  categoryButton.className = 'category-button';
  categoryButton.innerText = category.category_name;
  categoryButton.addEventListener('click', () => scrollToCategory(category.category_name));
  categoryTitles.appendChild(categoryButton);
}


// Menü öğelerini listeleme
function renderMenuItems(category) {
  const itemContainer = document.createElement('div');
  itemContainer.className = 'item-container';
  itemContainer.setAttribute('data-category', category.category_name);

  category.items.forEach(item => {
    const menuItem = createMenuItem(item);
    itemContainer.appendChild(menuItem);
  });

  menuContainer.appendChild(itemContainer);
}


// Menü öğesini oluşturma
function createMenuItem(item) {
  const menuItem = document.createElement('div');
  menuItem.className = 'menu-item';
    const fontSize = item.name.length > 20 ? '14px' : '18px';
  
  menuItem.innerHTML = `
    <img src="${item.image_url}" alt="${item.name}">
    <h3 style="font-size: ${fontSize};">${item.name}</h3>
    <p>${item.price} ₺</p>
  `;
  
  return menuItem;
}


// Kategorilere kaydırma fonksiyonu
function scrollToCategory(categoryName) {
  const itemContainers = document.querySelectorAll('.item-container');
  itemContainers.forEach(container => {
    if (container.getAttribute('data-category') === categoryName) {
      const containerRect = container.getBoundingClientRect();
      const offset = 20; // İstediğiniz offset değerini buraya girin
      const scrollPosition = containerRect.top + window.scrollY - offset;

      window.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  });
}



// Veriyi çekme
fetchMenu();
