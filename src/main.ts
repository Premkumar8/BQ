import './style.css';

// Navbar scroll effect
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar?.classList.add('scrolled');
  } else {
    navbar?.classList.remove('scrolled');
  }
});

// Mobile menu toggle
const mobileBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileBtn?.addEventListener('click', () => {
  navLinks?.classList.toggle('active');
});

// Close mobile menu on link click
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks?.classList.remove('active');
  });
});

// Hero Carousel
let slideIndex = 0;
const slides = document.querySelectorAll('.carousel-slide') as NodeListOf<HTMLElement>;

function showSlides() {
  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";  
  }
  slideIndex++;
  if (slideIndex > slides.length) {slideIndex = 1}    
  if (slides[slideIndex-1]) {
    slides[slideIndex-1].style.display = "block";  
  }
  setTimeout(showSlides, 4000); // Change image every 4 seconds
}

if (slides.length > 0) {
  showSlides();
}

// Product Card Carousels - Auto Cycle
function initProductCarousels() {
  document.querySelectorAll('.product-carousel').forEach((carousel, index) => {
    const imgElement = carousel.querySelector('.main-img') as HTMLImageElement;
    
    const imagesAttr = carousel.getAttribute('data-images');
    if (!imagesAttr || !imgElement) {
      return;
    }

    const images = imagesAttr.split(',');
    if (images.length <= 1) {
      return;
    }

    let currentIndex = 0;

    // Add a fade effect class manually
    imgElement.style.transition = 'opacity 0.5s ease';

    // Stagger the start time of the intervals so they don't all flip at the exact same moment
    setTimeout(() => {
      setInterval(() => {
        // Fade out
        imgElement.style.opacity = '0.7';
        setTimeout(() => {
          currentIndex = (currentIndex === images.length - 1) ? 0 : currentIndex + 1;
          imgElement.src = images[currentIndex];
          // Fade in
          imgElement.style.opacity = '1';
        }, 500);
      }, 3000);
    }, index * 1000); // 1-second delay stagger per card
  });
}

// Fetch products from Flask Backend
async function fetchProducts() {
  const collectionSliderEl = document.getElementById('collectionSlider');
  if (!collectionSliderEl) return;

  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Failed to fetch products');
    const products = await response.json();
    
    let html = '';
    products.forEach((product: any) => {
      const imagesList = product.images.split(',');
      const firstImg = imagesList[0];
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
    
    collectionSliderEl.innerHTML = html;
    initProductCarousels(); // Re-initialize the fade animations for the newly injected cards

  } catch (error) {
    console.error('Error fetching products:', error);
    collectionSliderEl.innerHTML = '<p style="padding:20px; color:red;">Could not load collections at this time.</p>';
  }
}

// Initialize fetches
fetchProducts();

// Collection Slider
const collectionSlider = document.querySelector('.collection-slider') as HTMLElement;
const prevSliderBtn = document.querySelector('.prev-slider') as HTMLButtonElement;
const nextSliderBtn = document.querySelector('.next-slider') as HTMLButtonElement;

if (collectionSlider && prevSliderBtn && nextSliderBtn) {
  prevSliderBtn.addEventListener('click', () => {
    const cardWidth = collectionSlider.querySelector('.card')?.clientWidth || 300;
    collectionSlider.scrollBy({ left: -(cardWidth + 30), behavior: 'smooth' }); // 30 is the gap
  });

  nextSliderBtn.addEventListener('click', () => {
    const cardWidth = collectionSlider.querySelector('.card')?.clientWidth || 300;
    collectionSlider.scrollBy({ left: cardWidth + 30, behavior: 'smooth' });
  });
}

// Quote Modal Logic
const quoteModal = document.getElementById('quoteModal');
const openQuoteBtn = document.getElementById('openQuoteBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const quoteForm = document.getElementById('quoteForm');

if (quoteModal && openQuoteBtn && closeModalBtn) {
  openQuoteBtn.addEventListener('click', () => {
    quoteModal.classList.add('active');
  });

  closeModalBtn.addEventListener('click', () => {
    quoteModal.classList.remove('active');
  });

  // Close when clicking outside content
  quoteModal.addEventListener('click', (e) => {
    if (e.target === quoteModal) {
      quoteModal.classList.remove('active');
    }
  });
}

if (quoteForm) {
  quoteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you! Your quote request has been submitted successfully.');
    quoteModal?.classList.remove('active');
    (quoteForm as HTMLFormElement).reset();
  });
}

// Contact Modal Logic
const contactModal = document.getElementById('contactModal');
const openContactBtn = document.getElementById('openContactBtn');
const closeContactBtn = document.getElementById('closeContactBtn');
const contactForm = document.getElementById('contactForm');

if (contactModal && openContactBtn && closeContactBtn) {
  openContactBtn.addEventListener('click', () => {
    contactModal.classList.add('active');
  });

  closeContactBtn.addEventListener('click', () => {
    contactModal.classList.remove('active');
  });

  // Close when clicking outside content
  contactModal.addEventListener('click', (e) => {
    if (e.target === contactModal) {
      contactModal.classList.remove('active');
    }
  });
}

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you! Your message has been sent to our manager successfully.');
    contactModal?.classList.remove('active');
    (contactForm as HTMLFormElement).reset();
  });
}

// Infinite Marquee Logic
const marqueeTrack = document.getElementById('marqueeTrack');
if (marqueeTrack) {
  // Clone the contents once to allow smooth infinite scrolling
  const cards = Array.from(marqueeTrack.children);
  cards.forEach(card => {
    const clone = card.cloneNode(true);
    marqueeTrack.appendChild(clone);
  });
}

// -------------------------
// AUTHENTICATION & CART UI
// -------------------------

const loginBtn = document.getElementById('loginBtn');
const cartBtn = document.getElementById('cartBtn');
const authModal = document.getElementById('authModal');
const cartSidebar = document.getElementById('cartSidebar');
const authClose = document.querySelector('.auth-close');
const cartClose = document.querySelector('.cart-close');
const authTabs = document.querySelectorAll('.auth-tab');
const emailInput = document.getElementById('emailInput');
const phoneInput = document.getElementById('phoneInput');
const authForm = document.getElementById('authForm') as HTMLFormElement;
const cartItemsContainer = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');

// Toggle Modals
loginBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  authModal?.classList.add('active');
});

cartBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  cartSidebar?.classList.add('active');
  fetchCart(); // Fetch cart when opened
});

authClose?.addEventListener('click', () => authModal?.classList.remove('active'));
cartClose?.addEventListener('click', () => cartSidebar?.classList.remove('active'));

window.addEventListener('click', (e) => {
  if (e.target === authModal) {
    authModal?.classList.remove('active');
  }
});

// Auth Tabs (Email vs Phone)
let currentAuthMethod = 'email';
authTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    authTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentAuthMethod = tab.getAttribute('data-tab') || 'email';
    
    if (currentAuthMethod === 'email') {
      emailInput!.style.display = 'block';
      phoneInput!.style.display = 'none';
    } else {
      emailInput!.style.display = 'none';
      phoneInput!.style.display = 'block';
    }
  });
});

// Auth Form Submission
authForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = (document.getElementById('authEmail') as HTMLInputElement).value;
  const phone = (document.getElementById('authPhone') as HTMLInputElement).value;
  const password = (document.getElementById('authPassword') as HTMLInputElement).value;
  
  const payload: any = { password };
  if (currentAuthMethod === 'email') payload.email = email;
  if (currentAuthMethod === 'phone') payload.phone = phone;
  
  try {
    // Try login first
    let res = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    // If user not found, try register
    if (res.status === 404) {
      const regRes = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (regRes.ok) {
        // Log them in after successful registration
        res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        const data = await regRes.json();
        alert(data.message || 'Registration failed');
        return;
      }
    }
    
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.token);
      authModal?.classList.remove('active');
      alert('Successfully logged in!');
      fetchCart();
    } else {
      const data = await res.json();
      alert(data.message || 'Login failed');
    }
  } catch (err) {
    console.error(err);
    alert('An error occurred during authentication.');
  }
});

// Mock Google Login
document.getElementById('googleAuthBtn')?.addEventListener('click', async () => {
  const mockGoogleId = 'google-user-123';
  const mockEmail = 'user@gmail.com';
  
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ google_id: mockGoogleId, email: mockEmail })
    });
    
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.token);
      authModal?.classList.remove('active');
      alert('Successfully logged in with Google!');
      fetchCart();
    }
  } catch (err) {
    console.error(err);
  }
});

// Fetch Cart
async function fetchCart() {
  const token = localStorage.getItem('token');
  if (!token) {
    if (cartItemsContainer) cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Please login to view your cart.</p>';
    if (cartCount) cartCount.innerText = '0';
    return;
  }
  
  try {
    const res = await fetch('/api/cart', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.ok) {
      const items = await res.json();
      renderCart(items);
    } else if (res.status === 401) {
      localStorage.removeItem('token');
      if (cartItemsContainer) cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Session expired. Please login again.</p>';
      if (cartCount) cartCount.innerText = '0';
    }
  } catch (err) {
    console.error(err);
  }
}

// Render Cart HTML
function renderCart(items: any[]) {
  if (!cartItemsContainer || !cartCount) return;
  
  cartCount.innerText = items.reduce((sum, item) => sum + item.quantity, 0).toString();
  
  if (items.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
    return;
  }
  
  let html = '';
  items.forEach(item => {
    const imgUrl = item.product.images.split(',')[0];
    html += `
      <div class="cart-item">
        <img src="${imgUrl}" alt="${item.product.name}">
        <div class="cart-item-details">
          <h4>${item.product.name}</h4>
          <p>${item.product.price} x ${item.quantity}</p>
          <button class="remove-item" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
      </div>
    `;
  });
  cartItemsContainer.innerHTML = html;
}

// Global functions for inline onclick handlers
(window as any).removeFromCart = async (itemId: number) => {
  const token = localStorage.getItem('token');
  if (!token) return;
  
  try {
    const res = await fetch(`/api/cart/${itemId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      fetchCart();
    }
  } catch (err) {
    console.error(err);
  }
};

(window as any).addToCart = async (productId: number, quantity: number = 1) => {
  const token = localStorage.getItem('token');
  if (!token) {
    authModal?.classList.add('active');
    return;
  }
  
  try {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ product_id: productId, quantity: quantity })
    });
    
    if (res.ok) {
      alert(`Added ${quantity} item(s) to cart!`);
      fetchCart();
    }
  } catch (err) {
    console.error(err);
  }
};

(window as any).changeQty = (productId: number, delta: number) => {
  const input = document.getElementById(`qty-${productId}`) as HTMLInputElement;
  if (!input) return;
  let val = parseInt(input.value) || 1;
  val += delta;
  if (val < 1) val = 1;
  input.value = val.toString();
};

(window as any).addCardToCart = (productId: number) => {
  const input = document.getElementById(`qty-${productId}`) as HTMLInputElement;
  const qty = input ? (parseInt(input.value) || 1) : 1;
  (window as any).addToCart(productId, qty);
};

// Initial cart fetch if token exists
fetchCart();
