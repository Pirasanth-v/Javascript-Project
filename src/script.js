// Initialize app
function init() {
  // DOM elements
  const transactionListEl = document.getElementById("transaction-list");
  const dateEl = document.getElementById("date");
  const balanceEl = document.getElementById("balance");
  const incomeEl = document.getElementById("income");
  const expenseEl = document.getElementById("expense");
  const generateReportBtn = document.getElementById("generate-report-btn");
  const categoryDropdowns = [document.getElementById("category")];
  const addCategoryBtn = document.getElementById("add-category-btn");
  const saveCategoryBtn = document.getElementById("save-category-btn");
  const closeCategoryModalBtn = document.getElementById("close-modal");
  const chartContainer = document.getElementById("chart");

  // Event listeners
  generateReportBtn.addEventListener("click", generateReport);
  addCategoryBtn.addEventListener("click", openCategoryModal);
  saveCategoryBtn.addEventListener("click", addNewCategory);
  closeCategoryModalBtn.addEventListener("click", closeCategoryModal);

  // Set default date to today
  dateEl.valueAsDate = new Date();
  transactionListEl.innerHTML = "";
  transactions
    .slice()
    .reverse()
    .forEach((transaction) => {
      addTransactionDOM(transaction, transactionListEl);
    });
  updateValues(balanceEl, incomeEl, expenseEl);
  updateCategoryDropdowns(categoryDropdowns);
  setupTabs();

  createChart(chartContainer);
}

function getTransactionsFromStorage() {
  let transactions = localStorage.getItem("transactions");
  return transactions ? JSON.parse(transactions) : [];
}

let categories = JSON.parse(localStorage.getItem("categories")) || [
  "Food",
  "Transportation",
  "Housing",
  "Utilities",
  "Entertainment",
  "Income",
  "Other",
];

const transactions = getTransactionsFromStorage();

// Add transaction
function addTransaction(e, descriptionEl, amountEl, categoryEl, dateEl) {
  e.preventDefault();

  // --- Issue #1: Input validation ---
  const description = descriptionEl.value.trim();
  const amount = parseFloat(amountEl.value);
  const category = categoryEl.value;
  const date = dateEl.value;

  if (!description) {
    alert("Please enter a description.");
    return;
  }
  if (isNaN(amount) || amount === 0) {
    alert("Please enter a valid non-zero amount.");
    return;
  }
  if (!category) {
    alert("Please select a category.");
    return;
  }
  if (!date) {
    alert("Please select a date.");
    return;
  }

  const newTransaction = {
    id: generateID(),
    description,
    amount,
    category,
    date,
  };

  transactions.push(newTransaction);
  updateLocalStorage();

  // --- Issue #1: Reset input fields after adding ---
  descriptionEl.value = "";
  amountEl.value = "";
  // Optionally reset category and date if desired
  // categoryEl.selectedIndex = 0;
  // dateEl.valueAsDate = new Date();
}

// --- Issue #2: Consistent formatting of output values ---
function updateValues(balanceEl, incomeEl, expenseEl) {
  const amounts = transactions.map((transaction) => transaction.amount);

  const total = amounts.reduce((acc, amount) => acc + amount, 0);
  const income = amounts
    .filter((amount) => amount > 0)
    .reduce((acc, amount) => acc + amount, 0);
  const expense = amounts
    .filter((amount) => amount < 0)
    .reduce((acc, amount) => acc - amount, 0);

  balanceEl.textContent = `Rs ${total.toFixed(2)}`;
  incomeEl.textContent = `+Rs ${income.toFixed(2)}`;
  expenseEl.textContent = `-Rs ${Math.abs(expense).toFixed(2)}`;
}

// --- Issue #3: Correct class assignment for transaction list items ---
function addTransactionDOM(transaction, transactionListEl) {
  const sign = transaction.amount < 0 ? "-" : "+";
  const item = document.createElement("li");
  item.className = transaction.amount < 0 ? "expense" : "income";
  item.setAttribute("data-id", transaction.id);

  const detailsDiv = document.createElement("div");
  detailsDiv.className = "details";

  const descSpan = document.createElement("span");
  descSpan.className = "description";
  descSpan.textContent = transaction.description;

  const catSpan = document.createElement("span");
  catSpan.className = "category";
  catSpan.textContent = transaction.category;

  const dateSpan = document.createElement("span");
  dateSpan.className = "date";
  dateSpan.textContent = transaction.date;

  detailsDiv.appendChild(descSpan);
  detailsDiv.appendChild(catSpan);
  detailsDiv.appendChild(dateSpan);

  const amountSpan = document.createElement("span");
  amountSpan.className = "amount";
  amountSpan.textContent = `${sign}Rs ${Math.abs(transaction.amount).toFixed(2)}`;

  let deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "×";

  item.appendChild(detailsDiv);
  item.appendChild(amountSpan);
  item.appendChild(deleteBtn);

  transactionListEl.appendChild(item);

  deleteBtn.addEventListener("click", function () {
    removeTransaction(transaction.id);
  });
}

// --- Issue #4: Fix category deletion and transaction update ---
function deleteCategory(categoryName) {
  if (categories.length <= 1) {
    alert("You must have at least one category");
    return;
  }

  if (categoryName == "Other") {
    alert("You can not delete Other category");
    return;
  }

  if (
    confirm(`Are you sure you want to delete the "${categoryName}" category?`)
  ) {
    // Remove category from array
    categories = categories.filter((cat) => cat !== categoryName);

    // Update transactions with this category to "Other"
    const defaultCategory = "Other";
    // Use the global transactions array, not a redeclared one
    transactions.forEach((transaction) => {
      if (transaction.category === categoryName) {
        transaction.category = defaultCategory;
      }
    });

    updateLocalStorage();
  }
}

// --- Issue #5: Remove unnecessary value formatting in category dropdowns ---
function updateCategoryDropdowns(categoryDropdowns) {
  categoryDropdowns.forEach((dropdown) => {
    if (!dropdown) return;

    const currentValue = dropdown.value;
    dropdown.innerHTML = "";

    // Add all categories
    categories.forEach((category) => {
      dropdown.insertAdjacentHTML(
        "beforeend",
        `<option value="${category}">${category}</option>`
      );
    });

    if (
      currentValue &&
      dropdown.querySelector(`option[value="${currentValue}"]`)
    ) {
      dropdown.value = currentValue;
    }
  });
}

// Initialize app
document.addEventListener("DOMContentLoaded", function () {
  const formEl = document.getElementById("transaction-form");
  const descriptionEl = document.getElementById("description");
  const amountEl = document.getElementById("amount");
  const categoryEl = document.getElementById("category");
  const dateEl = document.getElementById("date");
  formEl.addEventListener("submit", (e) => {
    addTransaction(e, descriptionEl, amountEl, categoryEl, dateEl);
    init();
  });
  init();
  const helpBtn = document.getElementById("helpBtn");
  const helpContent = document.getElementById("helpContent");
  const closeHelp = document.getElementById("closeHelp");

  helpBtn.addEventListener("click", function () {
    helpContent.classList.toggle("show");
  });

  closeHelp.addEventListener("click", function () {
    helpContent.classList.remove("show");
  });

  // Close help panel when clicking outside of it
  document.addEventListener("click", function (event) {
    if (!helpContent.contains(event.target) && event.target !== helpBtn) {
      helpContent.classList.remove("show");
    }
  });
});

export {
  addTransaction,
  transactions,
  categories,
  getTransactionsFromStorage,
  updateLocalStorage,
  updateCategoryDropdowns,
  removeTransaction,
  createChart,
  generateReport,
  openCategoryModal,
  closeCategoryModal,
  addNewCategory,
  deleteCategory,
  saveCategoriesAndUpdate,
  renderCategoryList,
  setupTabs,
  updateValues,
  addTransactionDOM
};
