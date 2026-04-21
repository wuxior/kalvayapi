
let CATEGORIES = [];
let allProducts = [];

window.Kalva = {
  allProducts,
  CATEGORIES,
  formatPrice,
  getCategoryName,
  getProductIcon,
  fuzzySearchMatches,
  createProductCard,
  loadProducts: async () => await loadProducts(),
  initLucide: () => initLucide()
};

document.addEventListener('DOMContentLoaded', async () => {
  initLucide();
  initHeader();
  initMobileNav();
  initHeroSlider();
  initBackToTop();
  await loadProducts();
  renderCategories();
  renderFeaturedProducts();
  renderNewArrivals();
  initSearch();
  initScrollAnimations();
});

function initLucide() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  } else {

    const check = setInterval(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
        clearInterval(check);
      }
    }, 100);

    setTimeout(() => clearInterval(check), 5000);
  }
}

function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 50) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
    lastScroll = currentScroll;
  }, { passive: true });
}

function initMobileNav() {
  const toggle = document.getElementById('mobileMenuToggle');
  const nav = document.getElementById('mobileNav');
  const overlay = document.getElementById('mobileNavOverlay');
  const close = document.getElementById('mobileNavClose');

  if (!toggle || !nav || !overlay) return;

  function openNav() {
    nav.classList.add('mobile-nav--open');
    overlay.classList.add('mobile-nav__overlay--visible');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    nav.classList.remove('mobile-nav--open');
    overlay.classList.remove('mobile-nav__overlay--visible');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', openNav);
  overlay.addEventListener('click', closeNav);
  if (close) close.addEventListener('click', closeNav);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });
}

function initHeroSlider() {
  const slider = document.getElementById('heroSlider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.hero__slide');
  const dots = document.querySelectorAll('.hero__dot');
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');

  if (slides.length === 0) return;

  let currentSlide = 0;
  let autoPlay;

  function goToSlide(index) {
    slides.forEach(s => s.classList.remove('hero__slide--active'));
    dots.forEach(d => d.classList.remove('hero__dot--active'));

    currentSlide = ((index % slides.length) + slides.length) % slides.length;
    slides[currentSlide].classList.add('hero__slide--active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('hero__dot--active');
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  function startAutoPlay() {
    autoPlay = setInterval(nextSlide, 5500);
  }

  function resetAutoPlay() {
    clearInterval(autoPlay);
    startAutoPlay();
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoPlay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoPlay(); });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const slideIndex = parseInt(dot.dataset.slide);
      goToSlide(slideIndex);
      resetAutoPlay();
    });
  });

  startAutoPlay();
}

function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('back-to-top--visible');
    } else {
      btn.classList.remove('back-to-top--visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

async function loadProducts() {
  try {
    const resp = await fetch('data/products.json');
    const data = await resp.json();

    allProducts.length = 0;
    allProducts.push(...(data.products || []));

    CATEGORIES.length = 0;
    CATEGORIES.push(...(data.categories || []));

    CATEGORIES.forEach(c => {
      c.href = `kategori.html?id=${c.id}`;
    });
  } catch (err) {
    console.warn('Veriler yüklenemedi:', err);
    allProducts = [];
    CATEGORIES = [];
  }
}

function renderCategories() {
  const grid = document.getElementById('categoriesGrid');
  if (!grid) return;

  grid.innerHTML = CATEGORIES.map((cat, i) => {

    let imgSrc = `assets/images/categories/${cat.id}.png`;

    if (cat.image) {
      imgSrc = cat.image;
    } else {
      const catProduct = allProducts.find(p => p.category === cat.id && p.image);
      if (catProduct) {
        imgSrc = (catProduct.image.startsWith('http') || catProduct.image.startsWith('assets/') || catProduct.image.startsWith('/assets/'))
          ? catProduct.image
          : `assets/images/${catProduct.image}`;
      }
    }

    return `
    <a href="${cat.href}" class="category-card animate-in" style="animation-delay: ${i * 60}ms; border-radius: 12px; overflow: hidden; padding: 20px;">
      <div class="category-card__image-wrapper" style="width: 100px; height: 100px; margin: 0 auto 16px auto; display: flex; align-items: center; justify-content: center; background: #fff;">
        <img src="${imgSrc}" alt="${cat.name}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;" onerror="this.outerHTML='<i data-lucide=\\'${cat.icon || 'package'}\\' style=\\'width:32px;height:32px;color:rgba(0,0,0,0.4);\\'></i>'" />
      </div>
      <span class="category-card__name" style="font-weight: 600; color: var(--text);">${cat.name}</span>
    </a>
    `;
  }).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function formatPrice(price) {
  if (!price || price === 0) return 'Fiyat Teklifi İsteyin';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0
  }).format(price);
}

function getCategoryName(categoryId) {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  return cat ? cat.name : categoryId;
}

function createProductCard(product) {
  const badges = [];
  if (product.isNew) badges.push('<span class="product-card__badge product-card__badge--new">Yeni</span>');
  if (product.oldPrice) {
    const discount = Math.round((1 - product.price / product.oldPrice) * 100);
    badges.push(`<span class="product-card__badge product-card__badge--sale">%${discount}</span>`);
  }

  const whatsappMsg = encodeURIComponent(`Merhaba, "${product.name}" ürünü hakkında bilgi almak istiyorum.`);

  return `
    <div class="product-card animate-in">
      <a href="urun.html?id=${product.id}" class="product-card__img" style="display:block;">
        ${product.image ? `<img src="${(product.image.startsWith('http') || product.image.startsWith('assets/') || product.image.startsWith('/assets/')) ? product.image : `assets/images/${product.image}`}" loading="lazy" alt="${product.name}" class="product-card__img-real" />` :
      `<div class="product-card__img-placeholder">
          <i data-lucide="${getProductIcon(product.category)}" style="width:48px;height:48px"></i>
        </div>` }
        ${badges.length ? `<div class="product-card__badges">${badges.join('')}</div>` : ''}
      </a>
      <div class="product-card__body">
        <span class="product-card__category">${getCategoryName(product.category)}</span>
        <h3 class="product-card__name">${product.name}</h3>
        <div class="product-card__actions">
          <a href="urun.html?id=${product.id}" class="product-card__btn product-card__btn--primary">
            <i data-lucide="eye" class="icon-sm"></i> Detay
          </a>
          <a href="https://wa.me/905332861097?text=${whatsappMsg}" target="_blank" class="product-card__btn product-card__btn--whatsapp" aria-label="WhatsApp ile soru sor">
            <svg viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 012.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 01-1.26-4.38c.01-4.54 3.7-8.24 8.26-8.24zM8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.87.86-.87 2.07 0 1.22.89 2.39 1 2.56.14.17 1.76 2.67 4.25 3.73.59.27 1.05.42 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.07-.1-.22-.16-.47-.28-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.53.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.11-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.43-.14 0-.3-.01-.47-.01z"></svg>
          </a>
        </div>
      </div>
    </div>
  `;
}

function getProductIcon(category) {
  const icons = {
    'panel-kapi': 'door-open',
    'lake-kapi': 'door-closed',
    'melamin-kapi': 'layout-grid',
    'celik-kapi': 'shield',
    'mutfak-dolabi': 'cooking-pot',
    'banyo-dolabi': 'bath',
    'dusakabin': 'droplets',
    'pimapen': 'app-window',
    'klozet-takimi': 'armchair',
    'musluk-batarya': 'pipette',
    'hirdavat': 'wrench',
    'elektrik': 'zap',
    'tesisat': 'cylinder',
    'boya-firca': 'paintbrush',
    'kilit-kol': 'lock'
  };
  return icons[category] || 'package';
}

function renderFeaturedProducts() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;

  const featured = allProducts.filter(p => p.isFeatured).slice(0, 8);
  grid.innerHTML = featured.map(p => createProductCard(p)).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderNewArrivals() {
  const grid = document.getElementById('newArrivalsGrid');
  if (!grid) return;

  const newProducts = allProducts.filter(p => p.isNew).slice(0, 4);
  grid.innerHTML = newProducts.map(p => createProductCard(p)).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function initSearch() {
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  if (!input || !results) return;

  function performSearchRedirect() {
    const query = input.value.trim();
    if (query.length > 0) {
      window.location.href = `arama.html?q=${encodeURIComponent(query)}`;
    }
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearchRedirect();
    }
  });

  const searchBtn = document.querySelector('.search-bar__btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      performSearchRedirect();
    });
  }

  let debounceTimer;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = input.value.trim().toLocaleLowerCase('tr-TR');
      if (query.length < 2) {
        results.classList.remove('search-results--visible');
        return;
      }

      const searchWords = query.split(/\s+/);

      const matches = allProducts.filter(p => {
        const searchText = (p.name + ' ' + (p.description || '') + ' ' + getCategoryName(p.category)).toLocaleLowerCase('tr-TR');
        return fuzzySearchMatches(searchWords, searchText);
      }).slice(0, 6);

      if (matches.length === 0) {
        results.innerHTML = '<div class="search-results__empty"><i data-lucide="search-x" class="icon-md" style="margin-bottom:8px;display:inline-block"></i><br/>Sonuç bulunamadı</div>';
      } else {
        results.innerHTML = matches.map(p => {
          let imgSrcHtml = p.image
            ? `<img src="${(p.image.startsWith('http') || p.image.startsWith('assets/') || p.image.startsWith('/assets/')) ? p.image : `assets/images/${p.image}`}" alt="" style="width:100%; height:100%; object-fit:contain; border-radius:4px" />`
            : `<i data-lucide="${getProductIcon(p.category)}" style="width:24px;height:24px;color:var(--text-muted)"></i>`;

          return `
          <a href="urun.html?id=${p.id}" class="search-results__item" style="text-decoration:none; color:inherit;">
            <div class="search-results__img" style="display:flex;align-items:center;justify-content:center;background:#fff;border-radius:4px;overflow:hidden;">
              ${imgSrcHtml}
            </div>
            <div class="search-results__info">
              <div class="search-results__name">${highlightMatch(p.name, query)}</div>
              <div class="search-results__category">${getCategoryName(p.category)}</div>
            </div>
          </a>
        `}).join('');
      }

      results.classList.add('search-results--visible');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 250);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header__search')) {
      results.classList.remove('search-results--visible');
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      results.classList.remove('search-results--visible');
      input.blur();
    }
  });
}

function highlightMatch(text, query) {
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<strong style="color:var(--accent)">$1</strong>');
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  return matrix[b.length][a.length];
}

function fuzzySearchMatches(searchWords, text) {
  const textWords = text.split(/[\s\-.,()]+/);
  return searchWords.every(searchWord => {

    if (textWords.some(tw => tw.includes(searchWord))) return true;

    const maxErrors = searchWord.length > 5 ? 2 : (searchWord.length > 3 ? 1 : 0);
    if (maxErrors === 0) return false;

    return textWords.some(tw => {
      if (Math.abs(tw.length - searchWord.length) > maxErrors + 1) return false;
      return levenshteinDistance(searchWord, tw) <= maxErrors;
    });
  });
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.why-us__card, .about-stat').forEach(el => {
    observer.observe(el);
  });
}

window.Kalva.Cart = {
  items: JSON.parse(localStorage.getItem('kalva_cart') || '[]'),
  save() {
    localStorage.setItem('kalva_cart', JSON.stringify(this.items));
    this.updateBadges();
  },
  add(productId, quantity = 1) {
    const existing = this.items.find(i => i.id === productId);
    if (existing) existing.quantity += quantity;
    else this.items.push({ id: productId, quantity });
    this.save();
  },
  remove(productId) {
    this.items = this.items.filter(i => i.id !== productId);
    this.save();
  },
  updateQuantity(productId, quantity) {
    const item = this.items.find(i => i.id === productId);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) this.remove(productId);
      else this.save();
    }
  },
  updateBadges() {
    const totalCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.header__cart-badge').forEach(b => {
      b.textContent = totalCount;
      b.style.display = totalCount > 0 ? 'flex' : 'none';
    });
  }
};

setTimeout(() => window.Kalva.Cart.updateBadges(), 100);

