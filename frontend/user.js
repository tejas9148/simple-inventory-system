const API = "http://localhost:5000/api/products";

window.onload = async () => {
  await Clerk.load();

  if (Clerk.user.publicMetadata.role === "admin") {
    location.href = "admin.html";
  }

  loadProducts();
};

async function loadProducts() {
  const res = await fetch(API);
  const data = await res.json();
  const table = document.getElementById("table");
  table.innerHTML = "";

  data.forEach(p => {
    const row = document.createElement("tr");
    if (p.quantity < 5) row.classList.add("low-stock-row");
    else row.classList.add("in-stock-row");

    row.innerHTML = `
      <td>${p.productName}</td>
      <td>${p.category}</td>
      <td>${p.price}</td>
      <td>${p.quantity}</td>
    `;
    table.appendChild(row);
  });
}
