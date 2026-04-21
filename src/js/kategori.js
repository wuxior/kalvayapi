

document.addEventListener('DOMContentLoaded', async () => {

  const urlParams = new URLSearchParams(window.location.search);
  let categoryId = urlParams.get('id');

  let retries = 0;
  while (!window.Kalva.allProducts.length && retries < 20) {
    await new Promise(r => setTimeout(r, 100));
    retries++;
  }

  const { allProducts, CATEGORIES, createProductCard, formatPrice } = window.Kalva;

  if (!categoryId && CATEGORIES.length > 0) {
    categoryId = CATEGORIES[0].id;
  }

  const currentCat = CATEGORIES.find(c => c.id === categoryId);

  if (!currentCat) {
    document.getElementById('catTitle').textContent = 'Kategori Bulunamadı';
    document.getElementById('catDesc').textContent = 'Lütfen geçerli bir kategori seçiniz.';
    document.getElementById('categoryProductsGrid').innerHTML = '<div class="empty-state">Geçersiz kategori.</div>';
    document.getElementById('productsCount').textContent = '0 ürün';
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  document.title = `${currentCat.name} | Kalva Yapı Dekorasyon`;
  document.getElementById('catTitle').innerHTML = currentCat.name;
  document.getElementById('catDesc').textContent = currentCat.description || `${currentCat.name} kategorisindeki ürünlerimiz.`;

  const catListEl = document.getElementById('filterCategoriesList');
  if (catListEl) {
    catListEl.innerHTML = CATEGORIES.map(cat => {
      const isSelected = cat.id === categoryId;
      return `
        <li>
          <a href="kategori.html?id=${cat.id}" style="
            display: flex; 
            align-items: center; 
            gap: 8px; 
            color: ${isSelected ? 'var(--accent)' : 'var(--text)'}; 
            font-weight: ${isSelected ? '600' : '400'}; 
            text-decoration: none; 
            padding: 4px 0;
            transition: color 0.2s;
          " onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='${isSelected ? 'var(--accent)' : 'var(--text)'}'">
            ${cat.name}
          </a>
        </li>
      `;
    }).join('');
  }

  const rawProducts = allProducts.filter(p => p.category === categoryId);
  let displayedProducts = [...rawProducts];

  const grid = document.getElementById('categoryProductsGrid');
  const countDisplay = document.getElementById('productsCount');
  const sortSelect = document.getElementById('sortSelect');
  const priceFilters = document.querySelectorAll('input[name="price"]');

  const subcategoryWrapper = document.getElementById('filterSubcategoriesWrapper');
  const subcategoryList = document.getElementById('filterSubcategories');
  const uniqueSubcats = [...new Set(rawProducts.map(p => p.subCategory).filter(Boolean))];

  if (uniqueSubcats.length > 1) {
    subcategoryWrapper.style.display = 'block';
    subcategoryList.innerHTML = `
      <li><label class="filter-label"><input type="radio" name="subcat" value="all" checked> Tümü</label></li>
      ${uniqueSubcats.map(sub => `<li><label class="filter-label"><input type="radio" name="subcat" value="${sub}"> ${sub}</label></li>`).join('')}
    `;

    document.querySelectorAll('input[name="subcat"]').forEach(el => {
      el.addEventListener('change', runFilters);
    });
  }

  sortSelect.addEventListener('change', runFilters);
  priceFilters.forEach(el => el.addEventListener('change', runFilters));

  renderGrid();

  function runFilters() {
    let temp = [...rawProducts];

    const activeSubcat = document.querySelector('input[name="subcat"]:checked');
    if (activeSubcat && activeSubcat.value !== 'all') {
      temp = temp.filter(p => p.subCategory === activeSubcat.value);
    }

    const activePrice = document.querySelector('input[name="price"]:checked');
    if (activePrice && activePrice.value !== 'all') {
      const parts = activePrice.value.split('-');
      if (parts.length === 2) {
        temp = temp.filter(p => p.price >= parseInt(parts[0]) && p.price <= parseInt(parts[1]));
      } else if (activePrice.value === '10000+') {
        temp = temp.filter(p => p.price >= 10000);
      }
    }

    const sortVal = sortSelect.value;
    if (sortVal === 'fiyat-artan') temp.sort((a, b) => a.price - b.price);
    else if (sortVal === 'fiyat-azalan') temp.sort((a, b) => b.price - a.price);
    else if (sortVal === 'yeni') temp.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));

    displayedProducts = temp;
    renderGrid();
  }

  function renderGrid() {
    countDisplay.innerHTML = `<strong>${displayedProducts.length}</strong> ürün listeleniyor`;

    if (displayedProducts.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <i data-lucide="package-search" class="icon-lg"></i>
          <h3>Sonuç Bulunamadı</h3>
          <p>Kriterlerinize uygun ürün bulunamadı. Lütfen filtreleri değiştirin.</p>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    grid.innerHTML = displayedProducts.map(p => createProductCard(p)).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
});

