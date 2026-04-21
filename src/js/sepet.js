

document.addEventListener('DOMContentLoaded', async () => {

    let retries = 0;
    while (!window.Kalva.allProducts.length && retries < 20) {
        await new Promise(r => setTimeout(r, 100));
        retries++;
    }

    const { allProducts, Cart, formatPrice, getProductIcon } = window.Kalva;

    const loadingEl = document.getElementById('loading');
    const emptyEl = document.getElementById('cartEmpty');
    const contentEl = document.getElementById('cartContent');
    const itemsContainer = document.getElementById('cartItemsContainer');
    const subTotalStr = document.getElementById('subTotalStr');
    const totalStr = document.getElementById('totalStr');
    const checkoutBtn = document.getElementById('checkoutBtn');

    loadingEl.style.display = 'none';

    function renderCart() {
        if (!Cart.items || Cart.items.length === 0) {
            contentEl.style.display = 'none';
            emptyEl.style.display = 'block';
            return;
        }

        emptyEl.style.display = 'none';
        contentEl.style.display = 'grid';

        let html = '';
        let totalItems = 0;

        Cart.items.forEach(cartItem => {
            const product = allProducts.find(p => p.id === cartItem.id);
            if (!product) return;

            totalItems += cartItem.quantity;

            const imgUrl = (product.image && (product.image.startsWith('http') || product.image.startsWith('assets/') || product.image.startsWith('/assets/')))
                ? product.image
                : (product.image ? `assets/images/${product.image}` : '');

            const imgSrc = imgUrl
                ? `<img src="${imgUrl}" loading="lazy" style="width:100%;height:100%;object-fit:cover;" />`
                : `<div style="width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#f8f9fa;">
                     <i data-lucide="${getProductIcon(product.category)}" style="width:36px;height:36px;color:rgba(0,0,0,0.3)"></i>
                     <span style="font-size:10px; color:#666; text-align:center; padding:0 4px; margin-top:4px;">${product.name}</span>
                   </div>`;

            html += `
            <div class="cart-item">
                <div class="cart-item__img">
                    ${imgSrc}
                </div>
                <div class="cart-item__details">
                    <div>
                        <a href="urun.html?id=${product.id}" class="cart-item__title" style="color:var(--text); text-decoration:none; transition: color 0.2s;" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--text)'">${product.name}</a>
                        <div style="color:var(--text-light); font-size: 0.9rem; margin-top:4px;">Kategori: ${product.category}</div>
                    </div>
                    <div class="cart-item__controls">
                        <div class="quantity-control">
                            <button onclick="window.updateCartQuantity('${cartItem.id}', -1)"><i data-lucide="minus" class="icon-sm"></i></button>
                            <div>${cartItem.quantity}</div>
                            <button onclick="window.updateCartQuantity('${cartItem.id}', 1)"><i data-lucide="plus" class="icon-sm"></i></button>
                        </div>
                        <button class="cart-item__remove" onclick="window.removeCartItem('${cartItem.id}')">
                            <i data-lucide="trash-2" class="icon-sm"></i> Sil
                        </button>
                    </div>
                </div>
            </div>
            `;
        });

        itemsContainer.innerHTML = html;
        totalStr.textContent = `${totalItems} Adet`;

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    window.updateCartQuantity = (id, delta) => {
        const existing = Cart.items.find(i => String(i.id) === String(id));
        if (existing) {
            Cart.updateQuantity(existing.id, existing.quantity + delta);
            renderCart();
        }
    };

    window.removeCartItem = (id) => {
        const existing = Cart.items.find(i => String(i.id) === String(id));
        if (existing) {
            Cart.remove(existing.id);
            renderCart();
        }
    };

    checkoutBtn.addEventListener('click', () => {
        if (Cart.items.length === 0) return;

        let pList = Cart.items.map((cartItem, idx) => {
            const product = allProducts.find(p => p.id === cartItem.id);
            if (!product) return '';
            return `${idx + 1}. ${product.name} - ${cartItem.quantity} Adet`;
        }).filter(str => str !== '').join('%0A');

        const dateStr = new Date().toLocaleString('tr-TR');
        const header = encodeURIComponent(`*Fiyat Teklifi Talebi - Kalva Yapı Dekorasyon*`);
        const text = `${header}%0A%0A_Aşağıdaki ürünler için güncel fiyat bilgisi rica ediyorum:_%0A%0A${pList}%0A%0A_Tarih: ${dateStr}_`;

        window.open(`https://wa.me/905332861097?text=${text}`, '_blank');
    });

    renderCart();
});

