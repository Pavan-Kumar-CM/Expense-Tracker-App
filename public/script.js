document.addEventListener("DOMContentLoaded", async function () {
    await loadExpenses();
});

let totalAmount = 0;

const categorySelect = document.getElementById("category_select");
const amountInput = document.getElementById("amount_input");
const infoInput = document.getElementById("info");
const dateInput = document.getElementById("date_input");
const addBtn = document.getElementById("add_btn");
const expenseTableBody = document.getElementById("expense-table-body");
const totalAmountCell = document.getElementById("total-amount");

async function loadExpenses() {
    try {
        const response = await fetch("/expenses");
        const expenses = await response.json();

        expenseTableBody.innerHTML = "";
        totalAmount = 0;

        expenses.forEach(expense => addExpenseToTable(expense));

        totalAmountCell.textContent = totalAmount;
    } catch (error) {
        console.error("Error fetching expenses:", error);
    }
}

addBtn.addEventListener("click", async function () {
    const category = categorySelect.value;
    const info = infoInput.value;
    const amount = Number(amountInput.value);
    const date = dateInput.value;

    if (category === "" || isNaN(amount) || amount <= 0 || info === "" || date === "") {
        alert("Please fill in all fields correctly");
        return;
    }

    addBtn.disabled = true;

    const newExpense = {
        category_select: category,
        amount_input: amount,
        info,
        date_input: date,
    };

    try {
        const response = await fetch("/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newExpense),
        });

        if (response.ok) {
            await loadExpenses();
            clearInputs();
        } else {
            const errorMessage = await response.text();
            alert(errorMessage);
        }
    } catch (error) {
        console.error("Error adding expense:", error);
    } finally {
        addBtn.disabled = false;
    }
});

function addExpenseToTable(expense) {
    const newRow = expenseTableBody.insertRow();

    const categoryCell = newRow.insertCell();
    const amountCell = newRow.insertCell();
    const infoCell = newRow.insertCell();
    const dateCell = newRow.insertCell();
    const deleteCell = newRow.insertCell();

    categoryCell.textContent = expense.Category;
    amountCell.textContent = expense.Amount;
    infoCell.textContent = expense.Info;
    dateCell.textContent = expense.Date;


    if (expense.Category === "Income") {
        totalAmount += expense.Amount;
    } else {
        totalAmount -= expense.Amount;
    }
    totalAmountCell.textContent = totalAmount;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", async function () {
        try {
            await fetch(`/delete/${expense._id}`, { method: "DELETE" });
            newRow.remove();
            totalAmount -= expense.Category === "Income" ? expense.Amount : -expense.Amount;
            totalAmountCell.textContent = totalAmount;
        } catch (err) {
            console.error("Error deleting expense:", err);
        }
    });

    deleteCell.appendChild(deleteBtn);
}

function clearInputs() {
    categorySelect.value = "";
    amountInput.value = "";
    infoInput.value = "";
    dateInput.value = "";
}
