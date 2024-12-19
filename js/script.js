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

let isManualScroll = false;
let scrollTimeout;
let isButtonClick = false;

const languageTexts = {
  tr: {
    viewAll: "Hepsini Gör"
  },
  en: {
    viewAll: "View All"
  }
};
fetchMenu(); 

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
  console.log("Selected Language:", selectedLanguage);
  database.ref('menu').once('value')
    .then(snapshot => {
      const categories = snapshot.val();
      if (categories) {
        const currentCategories = Object.values(categories[selectedLanguage]);
        console.log("Current Categories:", currentCategories);
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
  console.log('Updating category titles:', categories);
  categoryTitles.innerHTML = '';
  
  const allButton = document.createElement('button');
  allButton.className = 'category-button active';
  allButton.innerText = 'Tümü';
  
  allButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    document.querySelectorAll('.category-button').forEach(btn => {
      btn.classList.remove('active');
    });
    allButton.classList.add('active');
  });
  
  categoryTitles.appendChild(allButton);

  categories.forEach(category => {
    createCategoryButton(category);
  });
}

let isUserScrolling = false;
let scrollTimeoutt;
let isTouching = false;

// createCategoryButton fonksiyonunu güncelle
function createCategoryButton(category) {
  const categoryButton = document.createElement('button');
  categoryButton.className = 'category-button';
  categoryButton.innerText = category.category_name;

  // Click event listener for desktop and mobile
  categoryButton.addEventListener('click', (e) => {
    if (!isTouching) {  // Only allow click if not in the middle of a touch move
      handleCategoryClick(categoryButton);
    }
  });

  // Touch event listeners for mobile devices
  categoryButton.addEventListener('touchstart', (e) => {
    isTouching = true;  // Start touch event
  }, { passive: true });

  categoryButton.addEventListener('touchend', (e) => {
    isTouching = false;  // End touch event, enabling click again
  });

  categoryTitles.appendChild(categoryButton);
}
function handleCategoryClick(categoryButton) {
  isUserScrolling = true;

  // Remove 'active' class from all category buttons
  document.querySelectorAll('.category-button').forEach(btn => {
    btn.classList.remove('active');
  });

  // Add 'active' class to the clicked button
  categoryButton.classList.add('active');

  // Smooth scroll to the category
  const categoryName = categoryButton.innerText;
  const itemContainer = document.querySelector(`.item-container[data-category="${categoryName}"]`);
  
  if (itemContainer) {
    const offset = 150;
    const elementPosition = itemContainer.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    // Optionally center the button in the view
    categoryButton.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });

    // Reset scroll timeout
    clearTimeout(scrollTimeoutt);
    scrollTimeoutt = setTimeout(() => {
      isUserScrolling = false;
    }, 1000);
  }
}
window.addEventListener('scroll', () => {
  if (isUserScrolling) return; // Kullanıcı manuel seçim yaptıysa işlemi atla

  // Sayfa en üstte olduğunda "Tümü" butonunu aktif yap
  if (window.scrollY === 0) {
    document.querySelectorAll('.category-button').forEach(btn => {
      btn.classList.remove('active');
    });
    const allButton = document.querySelector('.category-button');
    if (allButton) {
      allButton.classList.add('active');
    }
    return;
  }

  // Kategorilerdeki en yakın olanı bul
  const offset = 150;
  const categories = document.querySelectorAll('.item-container');
  let closestCategory = null;
  let minDistance = Infinity;

  categories.forEach(category => {
    const rect = category.getBoundingClientRect();
    const distance = Math.abs(rect.top - offset);

    if (distance < minDistance) {
      minDistance = distance;
      closestCategory = category;
    }
  });

  if (closestCategory) {
    const categoryName = closestCategory.dataset.category;

    // Aktif başlığı güncelle
    document.querySelectorAll('.category-button').forEach(btn => {
      btn.classList.remove('active');
    });

    const activeButton = Array.from(document.querySelectorAll('.category-button'))
      .find(btn => btn.innerText === categoryName);

    if (activeButton) {
      activeButton.classList.add('active');

      // Kaydırma işlemi sırasında aktif kategoriyi yatay kaydırarak göster
      activeButton.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center' // Kategoriyi yatayda ortalar
      });
    }
  }
});

categoryTitles.appendChild(categoryButton);

  categoryTitles.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    startX = e.pageX - categoryTitles.offsetLeft;
    scrollLeft = categoryTitles.scrollLeft;
  });

  categoryTitles.addEventListener('mouseleave', () => {
    isMouseDown = false;
  });

  categoryTitles.addEventListener('mouseup', () => {
    isMouseDown = false;
  });

  categoryTitles.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;
    e.preventDefault();
    const x = e.pageX - categoryTitles.offsetLeft;
    const walk = (x - startX) * 2;
    categoryTitles.scrollLeft = scrollLeft - walk;
  });


function scrollToCategory(categoryName) {
  const itemContainer = document.querySelector(`.item-container[data-category="${categoryName}"]`);
  if (itemContainer) {
    const offset = 150;
    const elementPosition = itemContainer.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}

function renderMenuItems(category) {
  const itemContainer = document.createElement('div');
  itemContainer.className = 'item-container';
  itemContainer.setAttribute('data-category', category.category_name);

  category.items.forEach(item => {
    if (item.is_active === true) {
      const menuItem = createMenuItem(item);
      itemContainer.appendChild(menuItem);
      allMenuItems.push(item);
    }
  });

  menuContainer.appendChild(itemContainer);

  let isMouseDown = false;
  let startX;
  let scrollLeft;

  itemContainer.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    startX = e.pageX - itemContainer.offsetLeft;
    scrollLeft = itemContainer.scrollLeft;
  });

  itemContainer.addEventListener('mouseleave', () => {
    isMouseDown = false;
  });

  itemContainer.addEventListener('mouseup', () => {
    isMouseDown = false;
  });

  itemContainer.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;
    e.preventDefault();
    const x = e.pageX - itemContainer.offsetLeft;
    const walk = (x - startX) * 2;
    itemContainer.scrollLeft = scrollLeft - walk;
  });
}

function createMenuItem(item) {
  const menuItem = document.createElement('div');
  menuItem.className = 'menu-item';
  menuItem.innerHTML = `
    <img src="${item.image_url}" alt="${item.name}">
    <h3 class="item-name">${item.name}</h3>
    <p class="item-price">₺${item.price} </p>
  `;

  menuItem.addEventListener('click', () => {
    showBottomSheet(item);
  });

  adjustFontSize(menuItem.querySelector('.item-name'));
  adjustFontSize(menuItem.querySelector('.item-price'));

  return menuItem;
}

window.addEventListener('resize', () => {
  document.querySelectorAll('.menu-item .item-name, .menu-item .item-price').forEach(adjustFontSize);
});

function adjustFontSize(element) {
  const maxFontSize = 16;
  const minFontSize = 12;
  const lengthThreshold = 30;

  let screenScale = window.innerWidth / 1440;
  screenScale = Math.max(0.8, Math.min(screenScale, 1));

  const scaledMaxFontSize = maxFontSize * screenScale;
  const scaledMinFontSize = minFontSize * screenScale;

  let fontSize = scaledMaxFontSize;
  if (element.textContent.length > lengthThreshold) {
    fontSize = scaledMaxFontSize - (element.textContent.length - lengthThreshold) * 0.2;
    fontSize = Math.max(fontSize, scaledMinFontSize);
  }

  element.style.fontSize = `${fontSize}px`;
}

function filterItems() {
  const searchTerm = searchBar.value.toLowerCase();
  const categoryHeaders = document.querySelectorAll('.category-header');

  categoryHeaders.forEach(header => {
    const menuItems = header.nextElementSibling.querySelectorAll('.menu-item');
    
    let foundMatch = false;

    menuItems.forEach(item => {
      const itemName = item.querySelector('.item-name').textContent.toLowerCase();

      if (itemName.includes(searchTerm)) {
        item.style.display = 'block';
        foundMatch = true;
      } else {
        item.style.display = 'none';
      }
    });

    if (foundMatch) {
      header.style.display = 'flex';
    } else {
      header.style.display = 'none';
    }

    const itemContainer = header.nextElementSibling;
    if (Array.from(itemContainer.querySelectorAll('.menu-item')).every(item => item.style.display === 'none')) {
      itemContainer.style.display = 'none';
    } else {
      itemContainer.style.display = 'flex';
    }
  });

  if (searchTerm === '') {
    categoryHeaders.forEach(header => {
      header.style.display = 'flex';
      const menuItems = header.nextElementSibling.querySelectorAll('.menu-item');
      menuItems.forEach(item => {
        item.style.display = 'block';
      });
      const itemContainer = header.nextElementSibling;
      itemContainer.style.display = 'flex';
    });
  }
}

searchBar.addEventListener('input', filterItems);

window.addEventListener('scroll', () => {
  const scrollToTopButton = document.getElementById('scroll-to-top');
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    scrollToTopButton.style.display = 'block';
  } else {
    scrollToTopButton.style.display = 'none';
  }

  if (isButtonClick) {
    return;
  }

  clearTimeout(scrollTimeout);
  isManualScroll = true;

  if (window.scrollY === 0) {
    document.querySelectorAll('.category-button').forEach(btn => {
      btn.classList.remove('active');
    });
    const allButton = document.querySelector('.category-button');
    if (allButton) {
      allButton.classList.add('active');
    }
    return;
  }

  const categoryHeaders = document.querySelectorAll('.category-header');
  const offset = 200;
  let currentCategory = null;
  let maxVisibility = 0;

  categoryHeaders.forEach(header => {
    const rect = header.getBoundingClientRect();
    const visibility = Math.min(
      Math.max(0, rect.bottom),
      window.innerHeight
    ) - Math.max(0, rect.top);
    
    if (visibility > maxVisibility) {
      maxVisibility = visibility;
      currentCategory = header.querySelector('h3').textContent;
    }
  });

  if (currentCategory) {
    const categoryButtons = document.querySelectorAll('.category-button');
    categoryButtons.forEach(button => {
      if (button.textContent === currentCategory) {
        document.querySelectorAll('.category-button').forEach(btn => {
          btn.classList.remove('active');
        });
        button.classList.add('active');
        
        if (isManualScroll) {
          button.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }
      }
    });
  }

  scrollTimeout = setTimeout(() => {
    isManualScroll = false;
    isButtonClick = false;
  }, 150);
});

document.getElementById('scroll-to-top').addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  document.querySelectorAll('.category-button').forEach(btn => {
    btn.classList.remove('active');
  });
  const allButton = document.querySelector('.category-button');
  if (allButton) {
    allButton.classList.add('active');
  }
});


window.addEventListener('scroll', () => {
  if (!isScrolling) {
    isScrolling = true;
    window.requestAnimationFrame(() => {
      updateActiveCategory(); // Aktif kategoriyi güncelle
      isScrolling = false;
    });
  }
});

function updateActiveCategory() {
  const offset = 150;
  const categories = document.querySelectorAll('.item-container');
  let closestCategory = null;
  let minDistance = Infinity;

  categories.forEach(category => {
    const rect = category.getBoundingClientRect();
    const distance = Math.abs(rect.top - offset);

    if (distance < minDistance) {
      minDistance = distance;
      closestCategory = category;
    }
  });

  if (closestCategory) {
    const categoryName = closestCategory.dataset.category;

    // Aktif başlığı güncelle
    document.querySelectorAll('.category-button').forEach(btn => {
      btn.classList.remove('active');
    });

    const activeButton = Array.from(document.querySelectorAll('.category-button'))
      .find(btn => btn.innerText === categoryName);

    if (activeButton) {
      activeButton.classList.add('active');

      // Kaydırma işlemi sırasında aktif kategoriyi yatay kaydırarak göster
      activeButton.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center' // Kategoriyi yatayda ortalar
      });
    }
  }
}
