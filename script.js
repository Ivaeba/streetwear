let allProducts = [];
let activeCategory = "all";
let cartTotal = parseFloat(localStorage.getItem('cartTotal')) || 0;
let cartItems = [];

const catalog = document.getElementById("product-catalog");
const cartCount = document.getElementById("cart-count");
const searchInput = document.getElementById("search-input");
const productCount = document.getElementById("product-count");
const activeFilterLabel = document.getElementById("active-filter-label");
const filterButtons = Array.from(document.querySelectorAll(".filter-chip"));

// Initialize cart display
cartCount.textContent = cartTotal.toFixed(2);

async function fetchProducts() {
    try {
        const response = await fetch("businessLogic.php");

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        allProducts = await response.json();
        productCount.textContent = String(allProducts.length).padStart(2, "0");
        applyFilters();
    } catch (error) {
        console.error("Failed to load products:", error);
        catalog.innerHTML =
            '<div class="error-message">Products could not be loaded. Check your PHP endpoint and database connection.</div>';
    }
}

function getCategoryLabel(category) {
    const labels = {
        all: "All pieces",
        "T-shirt": "T-shirts",
        Hoodie: "Hoodies",
        Jeans: "Jeans",
        Cargo: "Cargo",
        Jacket: "Jackets",
        Sneakers: "Sneakers",
    };

    return labels[category] || category;
}

function getProductCategory(product) {
    const name = product.name.toLowerCase();

    if (name.includes("sneaker")) {
        return "Sneakers";
    }

    if (name.includes("jacket")) {
        return "Jacket";
    }

    if (name.includes("cargo")) {
        return "Cargo";
    }

    if (name.includes("jeans")) {
        return "Jeans";
    }

    if (name.includes("hoodie")) {
        return "Hoodie";
    }

    if (name.includes("shirt") || name.includes("tee")) {
        return "T-shirt";
    }

    return "Other";
}

function getProductImage(product) {
    if (!product.image_url || product.image_url.includes("via.placeholder.com")) {
        return createPosterImage(product);
    }

    return product.image_url;
}

function getProductMood(product) {
    const category = getProductCategory(product);
    const moods = {
        "T-shirt": "Core layer",
        Hoodie: "Heavy comfort",
        Jeans: "Utility denim",
        Cargo: "Field ready",
        Jacket: "Outer shell",
        Sneakers: "Fast step",
        Other: "Daily essential",
    };

    return moods[category] || moods.Other;
}

function createPosterImage(product) {
    const category = getProductCategory(product);
    const palettes = {
        "T-shirt": {
            top: "%23161616",
            bottom: "%23393834",
            accent: "%23ef5a29",
            soft: "%23ffd46b",
        },
        Hoodie: {
            top: "%2317121b",
            bottom: "%2340354b",
            accent: "%23ff8a5b",
            soft: "%23f7d9c7",
        },
        Jeans: {
            top: "%23151c28",
            bottom: "%23314569",
            accent: "%23f4b860",
            soft: "%23f7eedb",
        },
        Cargo: {
            top: "%23161c17",
            bottom: "%233d4b37",
            accent: "%23d4a44a",
            soft: "%23efe4c7",
        },
        Jacket: {
            top: "%23101412",
            bottom: "%2327462f",
            accent: "%23e77739",
            soft: "%23f4e6c8",
        },
        Sneakers: {
            top: "%23141824",
            bottom: "%23393f57",
            accent: "%23f47d60",
            soft: "%23f3ede3",
        },
        Other: {
            top: "%23191818",
            bottom: "%23413930",
            accent: "%23ef5a29",
            soft: "%23f8efe1",
        },
    };
    const palette = palettes[category] || palettes.Other;
    const title = product.name.toUpperCase();
    const size = `SIZE ${product.size || "N/A"}`;
    const label = getProductMood(product).toUpperCase();
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 720">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="${palette.top.replace("%23", "#")}" />
<stop offset="100%" stop-color="${palette.bottom.replace("%23", "#")}" />
</linearGradient>
<radialGradient id="glow" cx="50%" cy="20%" r="60%">
<stop offset="0%" stop-color="${palette.soft.replace("%23", "#")}" stop-opacity="0.55" />
<stop offset="100%" stop-color="${palette.soft.replace("%23", "#")}" stop-opacity="0" />
</radialGradient>
</defs>
<rect width="640" height="720" fill="url(#bg)" />
<rect width="640" height="720" fill="url(#glow)" />
<circle cx="490" cy="140" r="120" fill="${palette.accent.replace("%23", "#")}" fill-opacity="0.26" />
<rect x="60" y="70" width="520" height="580" rx="34" fill="none" stroke="${palette.soft.replace("%23", "#")}" stroke-opacity="0.18" />
<path d="M170 245h300l-40 230H210z" fill="${palette.soft.replace("%23", "#")}" fill-opacity="0.1" />
<path d="M260 170h120l50 95H210z" fill="${palette.accent.replace("%23", "#")}" fill-opacity="0.82" />
<text x="70" y="102" fill="${palette.soft.replace("%23", "#")}" fill-opacity="0.92" font-family="Bahnschrift, Arial Narrow, sans-serif" font-size="26" letter-spacing="4">${label}</text>
<text x="70" y="610" fill="${palette.soft.replace("%23", "#")}" font-family="Bahnschrift, Arial Narrow, sans-serif" font-size="48" font-weight="700">${title}</text>
<text x="70" y="650" fill="${palette.soft.replace("%23", "#")}" fill-opacity="0.82" font-family="Candara, Trebuchet MS, sans-serif" font-size="22" letter-spacing="3">${size}</text>
</svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function renderCatalog(products) {
    if (!products.length) {
        catalog.innerHTML =
            '<div class="empty-state">No items match this search right now. Try another keyword or switch the category.</div>';
        return;
    }

    catalog.innerHTML = products
        .map((item) => {
            const size = item.size || "N/A";
            const image = getProductImage(item);
            const mood = getProductMood(item);

            return `
                <article class="product-card">
                    <div class="card-media">
                        <img src="${image}" alt="${item.name}">
                    </div>
                    <div class="card-topline">
                        <span>${mood}</span>
                        <span class="size-badge">Size ${size}</span>
                    </div>
                    <h3>${item.name}</h3>
                    <p>Strong silhouette, easy layering, and a clean palette built for everyday rotation.</p>
                    <div class="card-footer">
                        <span class="price">${Number(item.price).toFixed(2)} PLN</span>
                        <button class="btn btn-buy" type="button" onclick="addToCart(${Number(item.price)})">Add to cart</button>
                    </div>
                </article>
            `;
        })
        .join("");
}

function applyFilters() {
    const searchTerm = searchInput.value.trim().toLowerCase();

    const filtered = allProducts.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        const matchesCategory =
            activeCategory === "all" || getProductCategory(product) === activeCategory;

        return matchesSearch && matchesCategory;
    });

    activeFilterLabel.textContent =
        activeCategory === "all"
            ? searchTerm
                ? `All pieces / ${searchTerm}`
                : "All pieces"
            : getCategoryLabel(activeCategory);

    renderCatalog(filtered);
}

function setActiveButton(category) {
    filterButtons.forEach((button) => {
        const isActive = button.dataset.category === category;
        button.classList.toggle("active", isActive);
    });
}

function filterCategory(category) {
    activeCategory = category;
    setActiveButton(category);
    applyFilters();
}

function addToCart(price) {
    cartTotal += Number(price);
    cartCount.textContent = cartTotal.toFixed(2);
    localStorage.setItem('cartTotal', cartTotal.toString());
    // For simplicity, assume adding one item, but in real app, track specific items
    // Here, just show checkout if logged in
    checkAuthForCheckout();
}

searchInput.addEventListener("input", applyFilters);

document.getElementById("auth-toggle-register").addEventListener("click", () => toggleAuthMode("register"));
document.getElementById("auth-toggle-login").addEventListener("click", () => toggleAuthMode("login"));

document.getElementById("register-form").addEventListener("submit", registerUser);
document.getElementById("login-form").addEventListener("submit", loginUser);

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        filterCategory(button.dataset.category);
    });
});

window.filterCategory = filterCategory;
window.addToCart = addToCart;
window.toggleAuthMode = toggleAuthMode;
window.registerUser = registerUser;
window.loginUser = loginUser;
window.goToAccount = goToAccount;
window.toggleCart = toggleCart;
window.logout = logout;

function toggleCart() {
    if (cartTotal === 0) {
        alert('Cart is empty.');
    } else {
        alert(`Cart total: ${cartTotal.toFixed(2)} PLN`);
    }
}

function goToAccount() {
    window.location.href = 'account.php';
}

function toggleAuthMode(mode) {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");
    const registerTab = document.getElementById("auth-toggle-register");
    const loginTab = document.getElementById("auth-toggle-login");

    const isRegister = mode === "register";
    registerForm.classList.toggle("hidden", !isRegister);
    loginForm.classList.toggle("hidden", isRegister);
    registerTab.classList.toggle("active", isRegister);
    loginTab.classList.toggle("active", !isRegister);
    showAuthMessage("", true);
}

function showAuthMessage(message, success = false) {
    const messageElement = document.getElementById("auth-message");
    messageElement.textContent = message;
    messageElement.classList.toggle("success", success);
}

function hideAuthPanel() {
    const authPanel = document.getElementById("auth-panel");
    if (authPanel) {
        authPanel.style.display = "none";
    }
}

async function postJSON(url, data) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify(data),
    });

    return response.json();
}

async function registerUser(event) {
    event.preventDefault();

    const data = {
        first_name: document.getElementById("register-firstname").value.trim(),
        last_name: document.getElementById("register-lastname").value.trim(),
        birth_date: document.getElementById("register-birthdate").value,
        location: document.getElementById("register-location").value.trim(),
        email: document.getElementById("register-email").value.trim(),
        phone: document.getElementById("register-phone").value.trim(),
        password: document.getElementById("register-password").value,
    };

    try {
        const result = await postJSON("auth.php?action=register", data);

        if (result.success) {
            showAuthMessage("Account created successfully.", true);
            hideAuthPanel();
            document.getElementById("register-form").reset();
        } else {
            showAuthMessage(result.error || "Registration failed.");
        }
    } catch (error) {
        showAuthMessage("Registration error. Check network and try again.");
        console.error(error);
    }
}

async function loginUser(event) {
    event.preventDefault();

    const data = {
        identifier: document.getElementById("login-identifier").value.trim(),
        password: document.getElementById("login-password").value,
    };

    try {
        const result = await postJSON("auth.php?action=login", data);

        if (result.success) {
            showAuthMessage(`Welcome back, ${result.user.first_name} ${result.user.last_name}.`, true);
            document.getElementById("login-form").reset();
            hideAuthPanel();
            document.getElementById('account-btn').style.display = 'inline-flex';
            document.getElementById('logout-btn').style.display = 'inline-flex';
            // Redirect to account page
            setTimeout(() => {
                window.location.href = 'account.php';
            }, 1500);
        } else {
            showAuthMessage(result.error || "Login failed.");
        }
    } catch (error) {
        showAuthMessage("Login error. Check network and try again.");
        console.error(error);
    }
}

async function checkAuth() {
    try {
        const response = await fetch('auth.php?action=check');
        const result = await response.json();
        if (result.success) {
            document.getElementById('account-btn').style.display = 'inline-flex';
            document.getElementById('logout-btn').style.display = 'inline-flex';
        }
    } catch (error) {
        // Not logged in
    }
}

async function checkAuthForCheckout() {
    try {
        const response = await fetch('auth.php?action=check');
        const result = await response.json();
        if (result.success) {
            document.getElementById('checkout-btn').style.display = 'inline-flex';
        } else {
            alert('Please log in to checkout.');
        }
    } catch (error) {
        alert('Please log in to checkout.');
    }
}

async function checkout() {
    if (cartTotal === 0) {
        alert('Cart is empty.');
        return;
    }
    // For demo, create a simple order. In real app, send cart items.
    try {
        const response = await fetch('auth.php?action=checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ total: cartTotal })
        });
        const result = await response.json();
        if (result.success) {
            alert('Order placed successfully!');
            cartTotal = 0;
            cartCount.textContent = '0.00';
            localStorage.setItem('cartTotal', '0');
            document.getElementById('checkout-btn').style.display = 'none';
        } else {
            alert('Checkout failed: ' + result.error);
        }
    } catch (error) {
        alert('Checkout error.');
    }
}

async function logout() {
    try {
        const response = await fetch('auth.php?action=logout');
        const result = await response.json();
        if (result.success) {
            document.getElementById('account-btn').style.display = 'none';
            document.getElementById('logout-btn').style.display = 'none';
            document.getElementById('checkout-btn').style.display = 'none';
            document.getElementById('auth-panel').style.display = 'block';
            alert('Logged out successfully.');
        } else {
            alert('Logout failed.');
        }
    } catch (error) {
        alert('Logout error.');
    }
}
