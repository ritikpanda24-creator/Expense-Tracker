
const form = document.getElementById("transaction-form");

const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");

const transactionList = document.getElementById("transaction-list");
const filterInput = document.getElementById("filter");

// Load saved transactions
let transactions = JSON.parse(
  localStorage.getItem("transactions")
) || [];

// Set today's date
dateInput.value = new Date().toISOString().split("T")[0];

// Save transactions
function saveTransactions() {
  localStorage.setItem(
    "transactions",
    JSON.stringify(transactions)
  );
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format(amount);
}

// Calculate summary
function updateSummary() {
  const income = transactions
    .filter(item => item.type === "income")
    .reduce((total, item) => total + item.amount, 0);

  const expense = transactions
    .filter(item => item.type === "expense")
    .reduce((total, item) => total + item.amount, 0);

  const balance = income - expense;

  balanceElement.textContent = formatCurrency(balance);
  incomeElement.textContent = formatCurrency(income);
  expenseElement.textContent = formatCurrency(expense);
}

// Add transaction
form.addEventListener("submit", function(event) {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);
  const date = dateInput.value;

  if (
    !description ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !date
  ) {
    alert("Please enter valid transaction details.");
    return;
  }

  const transaction = {
    id: crypto.randomUUID(),
    description: description,
    amount: amount,
    type: typeInput.value,
    category: categoryInput.value,
    date: date
  };

  transactions.push(transaction);

  saveTransactions();
  updateApp();

  form.reset();
  dateInput.value = new Date().toISOString().split("T")[0];
});

// Delete transaction
function deleteTransaction(id) {
  transactions = transactions.filter(
    item => item.id !== id
  );

  saveTransactions();
  updateApp();
}

// Display transactions
function displayTransactions() {
  const filterValue = filterInput.value;

  const filteredTransactions = transactions
    .filter(item =>
      filterValue === "all" || item.type === filterValue
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  transactionList.replaceChildren();

  if (filteredTransactions.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "empty";
    emptyMessage.textContent = "No transactions found.";
    transactionList.appendChild(emptyMessage);
    return;
  }

  filteredTransactions.forEach(item => {
    const li = document.createElement("li");
    li.className = "transaction-item";

    const info = document.createElement("div");
    info.className = "transaction-info";

    const title = document.createElement("h4");
    title.textContent = item.description;

    const details = document.createElement("p");
    details.textContent =
      `${item.category} • ${item.date}`;

    info.append(title, details);

    const right = document.createElement("div");
    right.className = "transaction-right";

    const amount = document.createElement("span");
    amount.className =
      `transaction-amount ${
        item.type === "income" ? "positive" : "negative"
      }`;

    amount.textContent =
      `${item.type === "income" ? "+" : "-"}${formatCurrency(item.amount)}`;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete ${item.description}`);

    deleteButton.addEventListener("click", () => {
      deleteTransaction(item.id);
    });

    right.append(amount, deleteButton);
    li.append(info, right);

    transactionList.appendChild(li);
  });
}

// Filter transactions
filterInput.addEventListener("change", displayTransactions);

// Refresh entire application
function updateApp() {
  updateSummary();
  displayTransactions();
}

// Initial render
updateApp();
