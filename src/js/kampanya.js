

document.addEventListener('DOMContentLoaded', async () => {

  let retries = 0;
  while (!window.Kalva.allProducts.length && retries < 20) {
    await new Promise(r => setTimeout(r, 100));
    retries++;
  }

  const { allProducts, createProductCard } = window.Kalva;
  

  const grid = document.getElementById('categoryProductsGrid');
  const countDisplay = document.getElementById('productsCount');
  const sortSelect = document.getElementById('sortSelect');
  

  const subcategoryWrapper = document.getElementById('filterSubcategoriesWrapper');
  if (subcategoryWrapper) subcategoryWrapper.style.display = 'none';

  const rawProducts = allProducts.filter(p => p.oldPrice && p.oldPrice > p.price);
  

  let displayedProducts = [...rawProducts];
  if (displayedProducts.length === 0) {
    let tempAll = [...allProducts];
    tempAll.sort(() => 0.5 - Math.random());
    displayedProducts = tempAll.slice(0, 8);

    displayedProducts.forEach(p => {
        p.oldPrice = Math.floor(p.price * 1.25);
    });
  }

  if (sortSelect) {
      sortSelect.addEventListener('change', runFilters);
  }

  renderGrid();

  function runFilters() {
    let temp = [...displayedProducts];

    const sortVal = sortSelect.value;
    if (sortVal === 'fiyat-artan') temp.sort((a,b) => a.price - b.price);
    else if (sortVal === 'fiyat-azalan') temp.sort((a,b) => b.price - a.price);
    else if (sortVal === 'yeni') temp.sort((a,b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));

    displayedProducts = temp;
    renderGrid();
  }

  function renderGrid() {
    if (countDisplay) {
        countDisplay.innerHTML = `<strong>${displayedProducts.length}</strong> indirimli ürün listeleniyor`;
    }
    
    if (displayedProducts.length === 0) {
      if (grid) {
          grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
              <i data-lucide="package-search" class="icon-lg"></i>
              <h3>Sonuç Bulunamadı</h3>
              <p>Mevcut kampanyamız sona ermiştir. Yeni fırsatlar için beklemede kalın.</p>
            </div>
          `;
      }
      if(typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    if (grid) {
        grid.innerHTML = displayedProducts.map(p => createProductCard(p)).join('');
    }
    
    if(typeof lucide !== 'undefined') lucide.createIcons();
  }
});

