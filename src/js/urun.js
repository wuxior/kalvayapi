

document.addEventListener('DOMContentLoaded', async () => {

  const urlParams = new URLSearchParams(window.location.search);
  const productSlug = urlParams.get('id');

  let retries = 0;
  while (!window.Kalva.allProducts.length && retries < 20) {
    await new Promise(r => setTimeout(r, 100));
    retries++;
  }

  const { allProducts, CATEGORIES, createProductCard, formatPrice, getProductIcon } = window.Kalva;

  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const layoutEl = document.getElementById('productLayout');

  loadingEl.style.display = 'none';

  if (!productSlug) {
    errorEl.style.display = 'block';
    return;
  }

  const product = allProducts.find(p => p.id == productSlug);
  if (!product) {
    errorEl.style.display = 'block';
    return;
  }

  const category = CATEGORIES.find(c => c.id === product.category);

  document.title = `${product.name} | Kalva Yapı Dekorasyon`;

  const breadCategory = document.getElementById('breadCategory');
  breadCategory.textContent = category ? category.name : product.category;
  breadCategory.href = `kategori.html?id=${product.category}`;
  document.getElementById('breadProduct').textContent = product.name;

  const imgWrapper = document.getElementById('productImageWrapper');
  if (product.image) {
    const src = (product.image.startsWith('http') || product.image.startsWith('assets/') || product.image.startsWith('/assets/')) ? product.image : `assets/images/${product.image}`;
    imgWrapper.innerHTML = `<img src="${src}" loading="lazy" alt="${product.name}" />`;
  } else {

    const fallbackIds = ['dusakabin', 'mutfak-dolabi', 'klozet-takimi', 'banyo-dolabi', 'pimapen'];
    if (fallbackIds.includes(product.category)) {
      imgWrapper.innerHTML = `<img src="assets/images/categories/${product.category}.png" loading="lazy" alt="${product.name}" />`;
    } else {
      imgWrapper.innerHTML = `<div class="product-gallery__placeholder">
        <i data-lucide="${getProductIcon(product.category)}" style="width:64px;height:64px"></i>
        <span>Görsel Yüklenemedi</span>
      </div>`;
    }
  }

  document.getElementById('productTitle').textContent = product.name;
  document.getElementById('productCategory').textContent = product.subCategory || (category ? category.name : '');

  const priceDisplay = document.getElementById('productPrice');
  const oldPriceDisplay = document.getElementById('productOldPrice');

  if (priceDisplay) priceDisplay.style.display = 'none';
  if (oldPriceDisplay) oldPriceDisplay.style.display = 'none';

  document.getElementById('productDesc').textContent = product.description && product.description !== product.name
    ? product.description
    : 'Bu ürün hakkında detaylı açıklama bulunmamaktadır. Bilgi almak için bize ulaşabilirsiniz.';

  const wpMsg = encodeURIComponent(`Merhaba, "${product.name}" ürünü hakkında fiyat bilgisi almak istiyorum.`);
  document.getElementById('wpLink').href = `https://wa.me/905332861097?text=${wpMsg}`;

  const relatedSection = document.getElementById('relatedSection');
  const relatedGrid = document.getElementById('relatedGrid');

  const related = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  if (related.length > 0) {
    relatedGrid.innerHTML = related.map(p => createProductCard(p)).join('');
    relatedSection.style.display = 'block';
  }

  layoutEl.style.display = 'block';

  if (typeof lucide !== 'undefined') lucide.createIcons();

  const addBtn = document.getElementById('addToCartBtn');
  const toast = document.getElementById('toast');
  if (addBtn) {
    addBtn.addEventListener('click', () => {

      window.Kalva.Cart.add(product.id, 1);

      toast.style.visibility = 'visible';
      toast.style.opacity = '1';
      toast.style.bottom = '50px';

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.bottom = '30px';
        setTimeout(() => { toast.style.visibility = 'hidden'; }, 300);
      }, 2500);
    });
  }
});

