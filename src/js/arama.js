

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q');

  let retries = 0;
  while (!window.Kalva.allProducts.length && retries < 20) {
    await new Promise(r => setTimeout(r, 100));
    retries++;
  }

  const { allProducts, createProductCard, highlightMatch, getCategoryName, fuzzySearchMatches } = window.Kalva;
  
  const loadingEl = document.getElementById('loading');
  const layoutEl = document.getElementById('searchLayout');
  const productsGrid = document.getElementById('productsGrid');
  const noResults = document.getElementById('noResults');
  
  loadingEl.style.display = 'none';

  if (!query) {
    document.getElementById('searchTitle').textContent = "Arama Sonuçları";
    document.getElementById('searchDesc').textContent = "Lütfen bir arama kelimesi girin.";
    layoutEl.style.display = 'block';
    noResults.style.display = 'block';
    return;
  }

  document.getElementById('searchTitle').textContent = `"${query}" İçin Sonuçlar`;
  document.title = `${query} Arama Sonuçları | Kalva Yapı Dekorasyon`;

  const safeQuery = query.toLocaleLowerCase('tr-TR').trim();
  const searchWords = safeQuery.split(/\s+/);
  
  let matches = allProducts.filter(p => {
    const searchText = (p.name + ' ' + (p.description||'') + ' ' + getCategoryName(p.category)).toLocaleLowerCase('tr-TR');
    return fuzzySearchMatches(searchWords, searchText);
  });

  document.getElementById('searchDesc').textContent = `Toplam ${matches.length} ürün bulundu.`;

  if (matches.length === 0) {
    noResults.style.display = 'block';
  } else {

    productsGrid.innerHTML = matches.map(p => createProductCard(p)).join('');
  }

  layoutEl.style.display = 'block';
  

  if (typeof lucide !== 'undefined') lucide.createIcons();
});

