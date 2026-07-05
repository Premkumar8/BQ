document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  
  if (!productId) {
    showError();
    return;
  }

  try {
    // Fetch product details
    const res = await fetch(`/api/products/${productId}`);
    if (!res.ok) throw new Error('Product not found');
    
    const product = await res.json();
    
    document.getElementById('productTitle')!.textContent = product.name;
    document.getElementById('productPrice')!.textContent = product.price;
    document.getElementById('productDesc')!.textContent = product.description || 'No description available.';

    const images = product.images.split(',');
    const mainImage = document.getElementById('mainImage') as HTMLImageElement;
    mainImage.src = images[0];

    const thumbnailGrid = document.getElementById('thumbnailGrid');
    if (thumbnailGrid) {
      images.forEach((imgSrc: string, index: number) => {
        const thumbDiv = document.createElement('div');
        thumbDiv.className = `thumbnail ${index === 0 ? 'active' : ''}`;
        
        const img = document.createElement('img');
        img.src = imgSrc;
        
        thumbDiv.appendChild(img);
        
        thumbDiv.addEventListener('click', () => {
          mainImage.src = imgSrc;
          document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
          thumbDiv.classList.add('active');
        });
        
        thumbnailGrid.appendChild(thumbDiv);
      });
    }

    // Quantity Logic
    const qtyInput = document.getElementById('qtyInput') as HTMLInputElement;
    document.getElementById('qtyMinus')?.addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 1;
      if (val > 1) qtyInput.value = (val - 1).toString();
    });
    document.getElementById('qtyPlus')?.addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 1;
      qtyInput.value = (val + 1).toString();
    });

    // Add to Cart Logic
    document.getElementById('addToCartBtn')?.addEventListener('click', async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login from the homepage to add items to your cart.');
        window.location.href = '/'; 
        return;
      }
      
      const quantity = parseInt(qtyInput.value) || 1;
      
      try {
        const cartRes = await fetch('/api/cart', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ product_id: product.id, quantity: quantity })
        });
        
        if (cartRes.ok) {
          alert(`Added ${quantity} item(s) to cart!`);
          window.location.href = '/'; 
        } else {
          alert('Failed to add to cart.');
        }
      } catch (err) {
        console.error(err);
      }
    });

    // Fetch and render suggested products
    fetchSuggestions(product.id);

  } catch (error) {
    console.error(error);
    showError();
  }
});

function showError() {
  document.getElementById('productTitle')!.textContent = 'Product Not Found';
  document.getElementById('productDesc')!.textContent = 'The product you are looking for does not exist.';
}

async function fetchSuggestions(currentProductId: number) {
  try {
    const res = await fetch('/api/products');
    if (!res.ok) return;
    
    const allProducts = await res.json();
    
    // Filter out current product and pick 3 random ones
    const filtered = allProducts.filter((p: any) => p.id !== currentProductId);
    const shuffled = filtered.sort(() => 0.5 - Math.random());
    const suggestions = shuffled.slice(0, 3);
    
    const suggestedGrid = document.getElementById('suggestedGrid');
    if (!suggestedGrid) return;
    
    let html = '';
    suggestions.forEach((product: any) => {
      const firstImg = product.images.split(',')[0];
      html += `
        <div class="card">
          <div class="card-img-wrapper product-carousel fade-img" data-images="${product.images}" onclick="window.location.href='/details.html?id=${product.id}'" style="cursor:pointer;">
            <img src="${firstImg}" alt="${product.name}" class="main-img" />
          </div>
          <div class="card-content">
            <h3>${product.name}</h3>
            <p class="price">${product.price}</p>
            <div class="card-actions">
              <div class="card-quantity">
                <button onclick="changeQty(${product.id}, -1)">-</button>
                <input type="number" id="qty-${product.id}" value="1" min="1">
                <button onclick="changeQty(${product.id}, 1)">+</button>
              </div>
              <button class="btn-icon-cart" onclick="addCardToCart(${product.id})" title="Add to Cart">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              </button>
            </div>
            <a href="/details.html?id=${product.id}" class="view-details-btn">View Details</a>
          </div>
        </div>
      `;
    });
    suggestedGrid.innerHTML = html;
    initProductCarousels();
    
  } catch (err) {
    console.error('Failed to load suggestions', err);
  }
}

// Global functions for inline onclick handlers
(window as any).changeQty = (productId: number, delta: number) => {
  const input = document.getElementById(`qty-${productId}`) as HTMLInputElement;
  if (!input) return;
  let val = parseInt(input.value) || 1;
  val += delta;
  if (val < 1) val = 1;
  input.value = val.toString();
};

(window as any).addCardToCart = async (productId: number) => {
  const input = document.getElementById(`qty-${productId}`) as HTMLInputElement;
  const quantity = input ? (parseInt(input.value) || 1) : 1;
  
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login from the homepage to add items to your cart.');
    window.location.href = '/'; 
    return;
  }
  
  try {
    const res = await fetch('http://localhost:5000/api/cart', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ product_id: productId, quantity: quantity })
    });
    
    if (res.ok) {
      alert(`Added ${quantity} item(s) to cart!`);
      window.location.href = '/'; 
    }
  } catch (err) {
    console.error(err);
  }
};

function initProductCarousels() {
  const carousels = document.querySelectorAll('.product-carousel');
  
  carousels.forEach((carousel, index) => {
    const imagesAttr = carousel.getAttribute('data-images');
    if (!imagesAttr) return;
    
    const images = imagesAttr.split(',');
    if (images.length <= 1) return; // No animation needed if only 1 image
    
    const imgElement = carousel.querySelector('img.main-img') as HTMLImageElement;
    let currentIdx = 0;
    
    // Stagger the start times so they don't all change perfectly in sync
    setTimeout(() => {
      setInterval(() => {
        imgElement.style.opacity = '0';
        
        setTimeout(() => {
          currentIdx = (currentIdx + 1) % images.length;
          imgElement.src = images[currentIdx];
          imgElement.style.opacity = '1';
        }, 500); // Wait for fade out to complete before changing src and fading in
        
      }, 3000);
    }, index * 1000); // 1-second delay stagger per card
  });
}
