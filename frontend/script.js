/***********************
 * CONFIG
 ***********************/
const API_URL = "http://localhost:5000/api/products";

/***********************
 * UI ELEMENTS
 ***********************/
const body = document.body;
const header = document.getElementById("header");
const welcome = document.getElementById("welcome");
const app = document.getElementById("app");

const signinBtn = document.getElementById("signinBtn");
const signupBtn = document.getElementById("signupBtn");
const logoutBtn = document.getElementById("logoutBtn");

const modal = document.getElementById("auth-modal");
const closeAuth = document.getElementById("closeAuth");

/***********************
 * INVENTORY ELEMENTS
 ***********************/
const form = document.getElementById("productForm");
const table = document.getElementById("productTable");

const productIdInput = document.getElementById("productId");
const productNameInput = document.getElementById("productName");
const categoryInput = document.getElementById("category");
const priceInput = document.getElementById("price");
const quantityInput = document.getElementById("quantity");

/***********************
 * WAIT FOR CLERK
 ***********************/
window.addEventListener("load", async () => {
  await Clerk.load();

  // Show page only after Clerk loads
  body.style.display = "block";

  if (Clerk.user) {
    // USER LOGGED IN
    welcome.style.display = "none";
    app.style.display = "block";

    signinBtn.style.display = "none";
    signupBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";

    fetchProducts();
  } else {
    // USER NOT LOGGED IN
    welcome.style.display = "block";
    app.style.display = "none";

    signinBtn.style.display = "inline-block";
    signupBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
});

/***********************
 * AUTH BUTTONS
 ***********************/
signinBtn.addEventListener("click", () => {
  modal.style.display = "block";
  Clerk.mountSignIn(document.getElementById("clerk-auth"));
});

signupBtn.addEventListener("click", () => {
  modal.style.display = "block";
  Clerk.mountSignUp(document.getElementById("clerk-auth"));
});

closeAuth.addEventListener("click", () => {
  modal.style.display = "none";
  document.getElementById("clerk-auth").innerHTML = "";
});

logoutBtn.addEventListener("click", async () => {
  await Clerk.signOut();
  location.reload(); // back to welcome page
});

/***********************
 * FETCH PRODUCTS
 ***********************/
async function fetchProducts() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (!Array.isArray(data)) return;

    table.innerHTML = "";

    data.forEach(product => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${product.productName}</td>
        <td>${product.category}</td>
        <td>${product.price}</td>
        <td>${product.quantity}</td>
        <td>
          <button class="edit-btn" onclick="editProduct(
            '${product._id}',
            '${product.productName}',
            '${product.category}',
            ${product.price},
            ${product.quantity}
          )">Edit</button>

          <button class="delete-btn" onclick="deleteProduct('${product._id}')">
            Delete
          </button>
        </td>
      `;

      table.appendChild(row);
    });
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

/***********************
 * ADD / UPDATE PRODUCT
 ***********************/
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const productData = {
    productName: productNameInput.value,
    category: categoryInput.value,
    price: priceInput.value,
    quantity: quantityInput.value
  };

  const productId = productIdInput.value;

  try {
    if (productId) {
      // UPDATE
      await fetch(`${API_URL}/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData)
      });
    } else {
      // ADD
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData)
      });
    }

    form.reset();
    productIdInput.value = "";
    fetchProducts();
  } catch (err) {
    console.error("Save error:", err);
  }
});

/***********************
 * EDIT PRODUCT
 ***********************/
function editProduct(id, name, category, price, quantity) {
  productIdInput.value = id;
  productNameInput.value = name;
  categoryInput.value = category;
  priceInput.value = price;
  quantityInput.value = quantity;
}

/***********************
 * DELETE PRODUCT
 ***********************/
async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });
    fetchProducts();
  } catch (err) {
    console.error("Delete error:", err);
  }
}