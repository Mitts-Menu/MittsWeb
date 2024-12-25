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
let selectedLanguage = localStorage.getItem("language") || 'tr';

const menuContainer = document.getElementById('menu-items');
const categoryTitles = document.getElementById('category-titles');
const searchBar = document.getElementById('search-bar');
let allMenuItems = [];

let isUserScrolling = false;
let isTouching = false;
let isMouseDown = false;
let scrollTimeout;
let startX, scrollLeft;

const languageTexts = {
  tr: { viewAll: "Hepsini Gör" },
  en: { viewAll: "View All" }
};

fetchMenu();

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

$(document).ready(function() {
  $('#language-selector').select2({
    minimumResultsForSearch: Infinity,
    templateResult: function(state) {
      if (!state.id) {
        return '';
      }

      var flagUrl = "../MittsWeb/img/" + state.element.getAttribute("data-flag") + ".jpg"; 

      var $state = $( 
        '<span><img src="' + flagUrl + '" class="flag" style="width: 20px; height: 15px;" /></span>'
      );
      return $state;
    },
    templateSelection: function(state) {
      if (!state.id) {
        return '';
      }

      var flagUrl = "../MittsWeb/img/" + state.element.getAttribute("data-flag") + ".jpg"; 

      var $state = $( 
        '<span><img src="' + flagUrl + '" class="flag" style="width: 20px; height: 15px;" /></span>'
      );
      return $state;
    }
  });

  $('#language-selector').val(selectedLanguage).trigger('change');

  $('#language-selector').on('change', function() {
    selectedLanguage = $(this).val();
    localStorage.setItem("language", selectedLanguage);
    fetchMenu();
  });
});

function fetchMenu() {
  database.ref('menu').once('value')
    .then(snapshot => {
      const categories = snapshot.val();
      if (categories) {
        const currentCategories = Object.values(categories[selectedLanguage]);
        updateCategoryTitles(currentCategories);
        menuContainer.innerHTML = '';
        currentCategories.forEach(renderCategory);
      }
    })
    .catch(error => console.error("Veri çekme hatası:", error));
}

function renderCategory(category) {
  createCategoryHeader(category);
  renderMenuItems(category);
}

function createCategoryHeader(category) {
  const categoryHeader = document.createElement('div');
  categoryHeader.className = 'category-header';
  categoryHeader.innerHTML = `
    <h3>${category.category_name}</h3>
    <a href="../MittsWeb/html/category.html?category=${encodeURIComponent(category.category_name)}">${languageTexts[selectedLanguage].viewAll}<img class="arrow" src="../MittsWeb/img/arrow.png"></a>
  `;
  menuContainer.appendChild(categoryHeader);
}

function updateCategoryTitles(categories) {
  categoryTitles.innerHTML = '';
  
  const allButton = document.createElement('button');
  allButton.className = 'category-button active';
  allButton.id = 'all-button';
  allButton.innerText = 'Tümü';
  
  allButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
    allButton.classList.add('active');
    
    allButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    categoryTitles.scrollTo({ left: 0, behavior: 'smooth' });
  });

  categoryTitles.appendChild(allButton);
  
  categories.forEach(createCategoryButton);
}

function createCategoryButton(category) {
  const categoryButton = document.createElement('button');
  categoryButton.className = 'category-button';
  categoryButton.innerText = category.category_name;

  categoryButton.addEventListener('click', () => {
    if (!isTouching) handleCategoryClick(categoryButton);
  });

  categoryButton.addEventListener('touchstart', () => {
    isTouching = true;
    isUserScrolling = false;
  }, { passive: true });

  categoryButton.addEventListener('touchend', () => {
    isTouching = false;
  });

  categoryTitles.appendChild(categoryButton);
}

function handleCategoryClick(categoryButton) {
  isUserScrolling = true;
  document.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
  categoryButton.classList.add('active');

  const categoryName = categoryButton.innerText;
  const itemContainer = document.querySelector(`.item-container[data-category="${categoryName}"]`);
  
  if (itemContainer) {
    const offset = 150;
    const elementPosition = itemContainer.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });

    categoryButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

    scrollTimeout = setTimeout(() => isUserScrolling = false, 1000);
  }
}

window.addEventListener('scroll', debounce(() => {
  if (isUserScrolling) return;

  if (window.scrollY <= 10) {
    document.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
    const allButton = document.getElementById('all-button'); 
    if (allButton) {
      allButton.classList.add('active');
      allButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      categoryTitles.scrollTo({ left: 0, behavior: 'smooth' });
    }
  } else {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      updateActiveCategory();
    }, 65);  
  }
}, 100));

function updateActiveCategory() {
  const categories = document.querySelectorAll('.item-container');
  let closestCategory = null;
  let minDistance = Infinity;

  categories.forEach(category => {
    const rect = category.getBoundingClientRect();
    const distance = Math.abs(rect.top - 150);

    if (distance < minDistance) {
      minDistance = distance;
      closestCategory = category;
    }
  });

  if (closestCategory) {
    const categoryName = closestCategory.dataset.category;
    document.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));

    const activeButton = Array.from(document.querySelectorAll('.category-button')).find(btn => btn.innerText === categoryName);
    if (activeButton) {
      activeButton.classList.add('active');
      
      activeButton.scrollIntoView({
        behavior: 'smooth',  
        block: 'nearest',    
        inline: 'center'     
      });
    }
  }
}

categoryTitles.addEventListener('mousedown', (e) => {
  isMouseDown = true;
  startX = e.pageX - categoryTitles.offsetLeft;
  scrollLeft = categoryTitles.scrollLeft;
});

categoryTitles.addEventListener('mouseleave', () => isMouseDown = false);
categoryTitles.addEventListener('mouseup', () => isMouseDown = false);

categoryTitles.addEventListener('mousemove', (e) => {
  if (!isMouseDown) return;
  e.preventDefault();
  const x = e.pageX - categoryTitles.offsetLeft;
  categoryTitles.scrollLeft = scrollLeft - (x - startX) * 2;
});

function renderMenuItems(category) {
  const itemContainer = document.createElement('div');
  itemContainer.className = 'item-container';
  itemContainer.setAttribute('data-category', category.category_name);
  
  category.items.filter(item => item.is_active).forEach(item => {
    const menuItem = createMenuItem(item);
    itemContainer.appendChild(menuItem);
    allMenuItems.push(item);
  });

  menuContainer.appendChild(itemContainer);
}

function createMenuItem(item) {
  const menuItem = document.createElement('div');
  menuItem.className = 'menu-item';
  menuItem.innerHTML = `
    <img src="${item.image_url}" alt="${item.name}" loading="eager">
    <h3 class="item-name">${item.name}</h3>
    <p class="item-price">₺${item.price}</p>
  `;

  menuItem.addEventListener('click', () => showBottomSheet(item));
  adjustFontSize(menuItem.querySelector('.item-name'));
  adjustFontSize(menuItem.querySelector('.item-price'));

  return menuItem;
}

function adjustFontSize(element) {
  const screenScale = Math.max(0.8, Math.min(window.innerWidth / 1440, 1));  
  const maxFontSize = 16 * screenScale;  
  const minFontSize = 13 * screenScale; 

  let fontSize = maxFontSize;
  if (element.textContent.length > 25) {
    fontSize = maxFontSize - (element.textContent.length - 25);  
  }

  fontSize = Math.max(minFontSize, fontSize);  

  element.style.fontSize = `${fontSize}px`;
  element.style.letterSpacing = '0.5px';  
}

function filterItems() {
  const searchTerm = searchBar.value.toLowerCase();
  document.querySelectorAll('.category-header').forEach(header => {
    const menuItems = header.nextElementSibling.querySelectorAll('.menu-item');
    let foundMatch = false;

    menuItems.forEach(item => {
      const itemName = item.querySelector('.item-name').textContent.toLowerCase();
      item.style.display = itemName.includes(searchTerm) ? 'block' : 'none';
      if (itemName.includes(searchTerm)) foundMatch = true;
    });

    header.style.display = foundMatch ? 'flex' : 'none';
    header.nextElementSibling.style.display = foundMatch ? 'flex' : 'none';
  });
}

searchBar.addEventListener('input', filterItems);
