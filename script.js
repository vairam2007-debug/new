// Default menu items - images will be auto-fetched from open source websites
const defaultMenu = [
    { id: 1, name: 'Idly', price: 20, image: '' },
    { id: 2, name: 'Dosa', price: 30, image: '' },
    { id: 3, name: 'Poori', price: 25, image: '' },
    { id: 4, name: 'Vada', price: 15, image: '' },
    { id: 5, name: 'Tea', price: 10, image: '' },
    { id: 6, name: 'Coffee', price: 15, image: '' },
    { id: 7, name: 'Milk', price: 12, image: '' },
    { id: 8, name: 'Boost', price: 20, image: '' }
];

// Initialize application
let menu = [];
let cart = [];
let orders = [];
let salesChart = null;
let editingItemId = null;
let uploadedQRCode = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    loadQRCode();
    displayMenu();
    displayCart();
    displayPermanentQR();
    displayManageMenu();
    updateSalesReport();
});

// Section Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Activate corresponding tab
    event.target.classList.add('active');
    
    // Refresh data if needed
    if (sectionId === 'report') {
        updateSalesReport();
    }
}

// ==================== Menu Management (CRUD) ====================

function loadData() {
    // Load menu from localStorage
    const savedMenu = localStorage.getItem('restaurantMenu');
    if (savedMenu) {
        menu = JSON.parse(savedMenu);
    } else {
        menu = JSON.parse(JSON.stringify(defaultMenu));
        saveMenu();
    }
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('restaurantCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    
    // Load orders from localStorage
    const savedOrders = localStorage.getItem('restaurantOrders');
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
    }
}

function saveMenu() {
    localStorage.setItem('restaurantMenu', JSON.stringify(menu));
}

function saveCart() {
    localStorage.setItem('restaurantCart', JSON.stringify(cart));
}

function saveOrders() {
    localStorage.setItem('restaurantOrders', JSON.stringify(orders));
}

function loadQRCode() {
    const savedQR = localStorage.getItem('restaurantQRCode');
    if (savedQR) {
        uploadedQRCode = savedQR;
    }
}

function saveQRCode() {
    if (uploadedQRCode) {
        localStorage.setItem('restaurantQRCode', uploadedQRCode);
    }
}

// Function to fetch image from open source websites based on item name
function fetchItemImage(itemName) {
    // Map item names to better search terms for open source images
    const searchTermMap = {
        'idly': 'idli indian food',
        'idli': 'idli indian food',
        'dosa': 'dosa indian food',
        'poori': 'puri indian food',
        'puri': 'puri indian food',
        'vada': 'vada indian food',
        'tea': 'tea indian chai',
        'coffee': 'coffee indian filter',
        'milk': 'milk drink',
        'boost': 'energy drink'
    };
    
    const normalizedName = itemName.toLowerCase().trim();
    const searchTerm = searchTermMap[normalizedName] || (normalizedName + ' food indian');
    const encodedTerm = encodeURIComponent(searchTerm);
    const simpleTerm = encodeURIComponent(normalizedName);
    
    // Use Unsplash Source API - reliable open source images
    // Format: https://source.unsplash.com/width/height/?search_term
    return `https://source.unsplash.com/400x300/?${encodedTerm}`;
}

// Function to get fallback image URLs from multiple open source websites
function getFallbackImageUrls(itemName) {
    const normalizedName = itemName.toLowerCase().trim();
    const searchTerm = encodeURIComponent(normalizedName + ' food');
    const simpleTerm = encodeURIComponent(normalizedName);
    const itemHash = itemName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    return [
        // Unsplash Source API - multiple search variations (open source, no API key needed)
        `https://source.unsplash.com/400x300/?${searchTerm}`,
        `https://source.unsplash.com/400x300/?food,${simpleTerm}`,
        `https://source.unsplash.com/400x300/?indian,food,${simpleTerm}`,
        `https://source.unsplash.com/400x300/?${simpleTerm}`,
        // Direct Unsplash curated food images (open source, high quality)
        `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop`,
        `https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop`,
        `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop`,
        `https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop`,
        `https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop`,
        // Picsum Photos (open source random images with seed for consistency)
        `https://picsum.photos/seed/${itemHash}/400/300`
    ];
}

// Function to get or fetch image for menu item
function getItemImage(item) {
    // If image already exists and is a valid URL, use it
    if (item.image && item.image.trim() !== '' && item.image.startsWith('http')) {
        return item.image;
    }
    // Otherwise, fetch based on item name
    return fetchItemImage(item.name);
}

function displayMenu() {
    const menuGrid = document.getElementById('menuGrid');
    menuGrid.innerHTML = '';
    
    menu.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        
        // Get image URL (auto-fetch based on name if not provided)
        const imageUrl = getItemImage(item);
        const fallbackUrls = getFallbackImageUrls(item.name);
        
        // Create image element with multiple fallbacks
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = item.name;
        img.loading = 'lazy';
        img.style.width = '100%';
        img.style.height = '180px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '8px';
        
        // Implement fallback chain
        let fallbackIndex = 0;
        img.onerror = function() {
            if (fallbackIndex < fallbackUrls.length) {
                this.src = fallbackUrls[fallbackIndex];
                fallbackIndex++;
            } else {
                // Final fallback - generic food image
                this.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
            }
        };
        
        menuItem.innerHTML = `
            <h3>${item.name}</h3>
            <div class="price">₹${item.price}</div>
            <button class="add-btn" onclick="addToCart(${item.id})">Add to Cart</button>
        `;
        
        // Insert image at the beginning
        menuItem.insertBefore(img, menuItem.firstChild);
        
        menuGrid.appendChild(menuItem);
    });
}

// ==================== Cart & Billing ====================

function addToCart(itemId) {
    const item = menu.find(m => m.id === itemId);
    if (!item) return;
    
    const existingItem = cart.find(c => c.id === itemId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
        });
    }
    
    saveCart();
    displayCart();
    updateBill();
}

function removeFromCart(itemId) {
    cart = cart.filter(c => c.id !== itemId);
    saveCart();
    displayCart();
    updateBill();
}

function updateQuantity(itemId, change) {
    const item = cart.find(c => c.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        saveCart();
        displayCart();
        updateBill();
    }
}

function clearCart() {
    if (confirm('Are you sure you want to clear the cart?')) {
        cart = [];
        saveCart();
        displayCart();
        updateBill();
    }
}

function displayCart() {
    const cartItems = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        return;
    }
    
    cartItems.innerHTML = '';
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="item-price">₹${item.price} × ${item.quantity} = ₹${item.price * item.quantity}</div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
}

function updateBill() {
    const billDetails = document.getElementById('billDetails');
    
    if (cart.length === 0) {
        billDetails.innerHTML = '<p class="empty-cart">No items in cart</p>';
        document.getElementById('subtotal').textContent = '₹0';
        document.getElementById('tax').textContent = '₹0';
        document.getElementById('total').textContent = '₹0';
        return;
    }
    
    let billHTML = '<div class="bill-items">';
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        billHTML += `
            <div class="bill-item-row">
                <span>${item.name} (${item.quantity}×)</span>
                <span>₹${itemTotal}</span>
            </div>
        `;
    });
    billHTML += '</div>';
    billDetails.innerHTML = billHTML;
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
}

// ==================== Payment & QR Code ====================

function showQRCode() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const total = calculateTotal();
    const modal = document.getElementById('qrModal');
    const qrContainer = document.getElementById('qrcode');
    const qrAmount = document.getElementById('qrAmount');
    
    qrAmount.textContent = `₹${total.toFixed(2)}`;
    
    // Clear previous QR code
    qrContainer.innerHTML = '';
    
    // Show uploaded QR code if available, otherwise show message
    if (uploadedQRCode) {
        const img = document.createElement('img');
        img.src = uploadedQRCode;
        img.alt = 'QR Code';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';
        img.style.margin = '0 auto';
        qrContainer.appendChild(img);
    } else {
        qrContainer.innerHTML = '<p style="color: #999; padding: 20px; text-align: center;">Please upload a QR code in Manage Menu section</p>';
    }
    
    modal.style.display = 'block';
}

function closeQRModal() {
    document.getElementById('qrModal').style.display = 'none';
}

function completePayment() {
    if (cart.length === 0) {
        alert('Cart is empty!');
        return;
    }
    
    const total = calculateTotal();
    const order = {
        date: new Date().toISOString(),
        items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        total: total
    };
    
    orders.push(order);
    saveOrders();
    
    cart = [];
    saveCart();
    displayCart();
    updateBill();
    
    closeQRModal();
    alert('Payment completed! Order saved.');
    
    // Refresh sales report if on that section
    if (document.getElementById('report').classList.contains('active')) {
        updateSalesReport();
    }
}

function calculateTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// ==================== Bill Printing ====================

function printBill() {
    if (cart.length === 0) {
        alert('Cart is empty!');
        return;
    }
    
    const total = calculateTotal();
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Bill</title>
            <style>
                body {
                    font-family: 'Courier New', monospace;
                    padding: 20px;
                    max-width: 400px;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #000;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
                .bill-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 5px 0;
                    border-bottom: 1px dotted #ddd;
                }
                .bill-total {
                    margin-top: 20px;
                    border-top: 2px solid #000;
                    padding-top: 10px;
                }
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 5px 0;
                }
                .final-total {
                    font-weight: bold;
                    font-size: 1.2em;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    font-size: 0.9em;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>Restaurant Bill</h2>
                <p>Date: ${new Date().toLocaleString()}</p>
            </div>
            <div class="bill-items">
                ${cart.map(item => `
                    <div class="bill-item">
                        <span>${item.name} (${item.quantity}×)</span>
                        <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="bill-total">
                <div class="total-row final-total">
                    <span>Total:</span>
                    <span>₹${total.toFixed(2)}</span>
                </div>
            </div>
            <div class="footer">
                <p>Thank you for your visit!</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// ==================== Menu Management ====================

function saveMenuItem(event) {
    event.preventDefault();
    
    const name = document.getElementById('itemName').value;
    const price = parseFloat(document.getElementById('itemPrice').value);
    const image = document.getElementById('itemImage').value.trim();
    
    if (editingItemId !== null) {
        // Update existing item
        const item = menu.find(m => m.id === editingItemId);
        if (item) {
            item.name = name;
            item.price = price;
            // If image URL provided, use it; otherwise auto-fetch based on name
            if (image) {
                item.image = image;
            } else {
                item.image = ''; // Empty string will trigger auto-fetch in displayMenu
            }
        }
        editingItemId = null;
    } else {
        // Create new item
        const newId = menu.length > 0 ? Math.max(...menu.map(m => m.id)) + 1 : 1;
        // If no image URL provided, leave empty to auto-fetch based on name
        menu.push({
            id: newId,
            name: name,
            price: price,
            image: image || '' // Empty string will trigger auto-fetch in displayMenu
        });
    }
    
    saveMenu();
    displayMenu();
    displayManageMenu();
    resetForm();
}

function editMenuItem(itemId) {
    const item = menu.find(m => m.id === itemId);
    if (!item) return;
    
    editingItemId = itemId;
    document.getElementById('itemId').value = itemId;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemPrice').value = item.price;
    document.getElementById('itemImage').value = item.image || '';
    
    // Scroll to form
    document.getElementById('menuForm').scrollIntoView({ behavior: 'smooth' });
}

function deleteMenuItem(itemId) {
    if (confirm('Are you sure you want to delete this menu item?')) {
        menu = menu.filter(m => m.id !== itemId);
        // Also remove from cart if present
        cart = cart.filter(c => c.id !== itemId);
        saveMenu();
        saveCart();
        displayMenu();
        displayManageMenu();
        displayCart();
        updateBill();
    }
}

function resetForm() {
    document.getElementById('menuForm').reset();
    document.getElementById('itemId').value = '';
    editingItemId = null;
}

function displayManageMenu() {
    const manageList = document.getElementById('manageMenuList');
    manageList.innerHTML = '';
    
    if (menu.length === 0) {
        manageList.innerHTML = '<p class="empty-cart">No menu items. Add some items to get started.</p>';
        return;
    }
    
    menu.forEach(item => {
        const manageItem = document.createElement('div');
        manageItem.className = 'manage-item';
        manageItem.innerHTML = `
            <div class="manage-item-info">
                <h4>${item.name}</h4>
                <div class="item-price">₹${item.price}</div>
            </div>
            <div class="manage-item-actions">
                <button class="btn btn-primary btn-small" onclick="editMenuItem(${item.id})">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteMenuItem(${item.id})">Delete</button>
            </div>
        `;
        manageList.appendChild(manageItem);
    });
}

// ==================== Sales Report ====================

function updateSalesReport() {
    const monthFilter = document.getElementById('monthFilter').value;
    const filteredOrders = filterOrdersByMonth(monthFilter);
    
    displaySalesTable(filteredOrders);
    displaySalesChart(filteredOrders);
}

function filterOrdersByMonth(monthFilter) {
    if (!monthFilter) {
        // Show current month by default
        const now = new Date();
        monthFilter = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        document.getElementById('monthFilter').value = monthFilter;
    }
    
    return orders.filter(order => {
        const orderDate = new Date(order.date);
        const orderMonth = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        return orderMonth === monthFilter;
    });
}

function displaySalesTable(filteredOrders) {
    const tableBody = document.getElementById('salesTableBody');
    const monthlyTotal = document.getElementById('monthlyTotal');
    
    tableBody.innerHTML = '';
    
    if (filteredOrders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px;">No sales data for this month</td></tr>';
        monthlyTotal.textContent = '₹0';
        return;
    }
    
    let total = 0;
    filteredOrders.forEach(order => {
        const row = document.createElement('tr');
        const date = new Date(order.date);
        const itemsList = order.items.map(item => `${item.name} (${item.quantity})`).join(', ');
        
        row.innerHTML = `
            <td>${date.toLocaleDateString()}</td>
            <td>${itemsList}</td>
            <td>₹${order.total.toFixed(2)}</td>
        `;
        tableBody.appendChild(row);
        total += order.total;
    });
    
    monthlyTotal.textContent = `₹${total.toFixed(2)}`;
}

function displaySalesChart(filteredOrders) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (salesChart) {
        salesChart.destroy();
    }
    
    if (filteredOrders.length === 0) {
        // Show empty chart
        salesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['No Data'],
                datasets: [{
                    label: 'Sales (₹)',
                    data: [0],
                    backgroundColor: 'rgba(102, 126, 234, 0.5)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        return;
    }
    
    // Group orders by date
    const salesByDate = {};
    filteredOrders.forEach(order => {
        const date = new Date(order.date).toLocaleDateString();
        if (salesByDate[date]) {
            salesByDate[date] += order.total;
        } else {
            salesByDate[date] = order.total;
        }
    });
    
    const dates = Object.keys(salesByDate).sort();
    const amounts = dates.map(date => salesByDate[date]);
    
    salesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Daily Sales (₹)',
                data: amounts,
                backgroundColor: 'rgba(102, 126, 234, 0.6)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toFixed(2);
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Sales: ₹' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

// ==================== QR Code Upload ====================

function handleQRUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedQRCode = e.target.result;
        saveQRCode();
        document.getElementById('qrUploadStatus').textContent = 'QR Code uploaded successfully!';
        document.getElementById('qrUploadStatus').style.color = '#28a745';
        // Update permanent QR display
        displayPermanentQR();
    };
    reader.onerror = function() {
        document.getElementById('qrUploadStatus').textContent = 'Error uploading QR code. Please try again.';
        document.getElementById('qrUploadStatus').style.color = '#dc3545';
    };
    reader.readAsDataURL(file);
}

// Display permanent QR code
function displayPermanentQR() {
    const permanentQRContainer = document.getElementById('permanentQRCode');
    
    if (uploadedQRCode) {
        permanentQRContainer.innerHTML = `
            <img src="${uploadedQRCode}" alt="Payment QR Code" class="permanent-qr-image">
        `;
    } else {
        permanentQRContainer.innerHTML = '<p class="empty-cart">Upload QR code in Manage Menu</p>';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('qrModal');
    if (event.target === modal) {
        closeQRModal();
    }
}

