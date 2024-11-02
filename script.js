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
  
  // Menü verisini çekme ve listeleme fonksiyonu
  const menuContainer = document.getElementById('menu-container');
  
  function fetchMenu() {
    database.ref('menu').once('value').then(snapshot => {
      console.log(snapshot.val()); // Veriyi kontrol edin
      snapshot.val().forEach(category => {
        // Kategori başlığını oluşturma
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'category-header';
        categoryHeader.innerHTML = `
          <h2>${category.category_name}</h2>
          <a href="#">Hepsini Gör</a>
        `;
        menuContainer.appendChild(categoryHeader);
  
        // Menü öğelerini listeleme
        const itemContainer = document.createElement('div');
        itemContainer.className = 'item-container';
  
        category.items.forEach(item => {
          const menuItem = document.createElement('div');
          menuItem.className = 'menu-item';
          menuItem.innerHTML = `
            <img src="${item.image_url}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>${item.price} ₺</p>
          `;
          itemContainer.appendChild(menuItem);
        });
  
        menuContainer.appendChild(itemContainer);
      });
    }).catch(error => {
      console.error("Veri çekme hatası:", error);
    });
  }
  
  // Veriyi çekme
  fetchMenu();
  