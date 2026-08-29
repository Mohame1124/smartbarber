import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyB0K7LJWDM9uXe9EOPUpL9UCme8QI627-Q",
  authDomain: "smartbarber-bb5eb.firebaseapp.com",
  projectId: "smartbarber-bb5eb",
  storageBucket: "smartbarber-bb5eb.firebasestorage.app",
  messagingSenderId: "710351788782",
  appId: "1:710351788782:web:35667e9f17452f7deb71ff",
  measurementId: "G-P7FSE7DDKP"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const transactionsRef = collection(db, "transactions");

let transactions = [];


// ================= MODALS =================

window.openIncomeModal = function () {
  document.getElementById("incomeModal").style.display = "flex";
};

window.closeIncomeModal = function () {
  document.getElementById("incomeModal").style.display = "none";
};

window.openExpenseModal = function () {
  document.getElementById("expenseModal").style.display = "flex";
};

window.closeExpenseModal = function () {
  document.getElementById("expenseModal").style.display = "none";
};


// ================= SAVE INCOME =================

window.saveIncome = async function () {

  const service =
    document.getElementById("service").value;

  const amount =
    Number(document.getElementById("incomeAmount").value);

  const payment =
    document.getElementById("paymentMethod").value;


  if (!amount || amount <= 0) {
    alert("Please enter a valid amount");
    return;
  }


  try {

    await addDoc(transactionsRef, {
      type: "income",
      service: service,
      amount: amount,
      payment: payment,
      timestamp: Date.now(),
      date: new Date().toLocaleString()
    });


    document.getElementById("incomeAmount").value = "";

    window.closeIncomeModal();

  } catch (error) {

    console.error(error);

    alert("Unable to save income.");

  }

};


// ================= SAVE EXPENSE =================

window.saveExpense = async function () {

  const category =
    document.getElementById("expenseCategory").value;

  const amount =
    Number(document.getElementById("expenseAmount").value);

  const note =
    document.getElementById("expenseNote").value;


  if (!amount || amount <= 0) {
    alert("Please enter a valid expense amount");
    return;
  }


  try {

    await addDoc(transactionsRef, {
      type: "expense",
      category: category,
      amount: amount,
      note: note,
      timestamp: Date.now(),
      date: new Date().toLocaleString()
    });


    document.getElementById("expenseAmount").value = "";
    document.getElementById("expenseNote").value = "";

    window.closeExpenseModal();

  } catch (error) {

    console.error(error);

    alert("Unable to save expense.");

  }

};


// ================= RESET =================

window.resetAllData = async function () {

  const confirmReset = confirm(
    "Reset ALL SmartBarber data?\n\nThis will permanently delete all income and expense records."
  );


  if (!confirmReset) return;


  try {

    const snapshot = await getDocs(transactionsRef);

    const deletes = [];

    snapshot.forEach((item) => {

      deletes.push(
        deleteDoc(
          doc(db, "transactions", item.id)
        )
      );

    });


    await Promise.all(deletes);

    alert("All data has been reset.");

  } catch (error) {

    console.error(error);

    alert("Unable to reset data.");

  }

};


// ================= DASHBOARD =================

function updateDashboard() {

  let income = 0;
  let expense = 0;
  let cash = 0;
  let gpay = 0;


  transactions.forEach(function (transaction) {

    if (transaction.type === "income") {

      income += Number(transaction.amount || 0);


      if (transaction.payment === "Cash") {

        cash += Number(transaction.amount || 0);

      } else {

        gpay += Number(transaction.amount || 0);

      }

    }


    if (transaction.type === "expense") {

      expense += Number(transaction.amount || 0);

    }

  });


  const profit = income - expense;


  document.getElementById("totalIncome").innerText =
    "₹" + income.toLocaleString("en-IN");

  document.getElementById("totalExpense").innerText =
    "₹" + expense.toLocaleString("en-IN");

  document.getElementById("netProfit").innerText =
    "₹" + profit.toLocaleString("en-IN");

  document.getElementById("cashTotal").innerText =
    "₹" + cash.toLocaleString("en-IN");

  document.getElementById("gpayTotal").innerText =
    "₹" + gpay.toLocaleString("en-IN");


  showTransactions();

  updateReports();

}


// ================= TRANSACTIONS =================

function showTransactions() {

  const list =
    document.getElementById("transactionList");


  if (transactions.length === 0) {

    list.innerHTML = `
      <div class="transaction">
        <div>
          <strong>No transactions yet</strong>
          <p>Add your first income or expense.</p>
        </div>
      </div>
    `;

    return;

  }


  list.innerHTML = "";


  transactions
    .slice(0, 10)
    .forEach(function (transaction) {

      const item =
        document.createElement("div");

      item.className = "transaction";


      if (transaction.type === "income") {

        item.innerHTML = `
          <div>
            <strong>💇 ${transaction.service || "Income"}</strong>

            <p>
              ${transaction.payment || ""}
              •
              ${transaction.date || ""}
            </p>
          </div>

          <span class="money-in">
            + ₹${Number(transaction.amount).toLocaleString("en-IN")}
          </span>
        `;

      } else {

        item.innerHTML = `
          <div>
            <strong>💸 ${transaction.category || "Expense"}</strong>

            <p>
              ${transaction.note || "Expense"}
              •
              ${transaction.date || ""}
            </p>
          </div>

          <span class="money-out">
            - ₹${Number(transaction.amount).toLocaleString("en-IN")}
          </span>
        `;

      }


      list.appendChild(item);

    });

}


// ================= REPORTS =================

function calculateReport(startTime, endTime) {

  let income = 0;
  let expense = 0;


  transactions.forEach(function (transaction) {

    const time =
      Number(transaction.timestamp || 0);


    if (
      time >= startTime &&
      time <= endTime
    ) {

      if (transaction.type === "income") {
        income += Number(transaction.amount || 0);
      }

      if (transaction.type === "expense") {
        expense += Number(transaction.amount || 0);
      }

    }

  });


  return {
    income: income,
    expense: expense,
    profit: income - expense
  };

}


function updateReports() {

  const now = new Date();


  const todayStart =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();


  const todayEnd =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    ).getTime();


  const weekStartDate =
    new Date(now);


  let day =
    weekStartDate.getDay();


  if (day === 0) {
    day = 7;
  }


  weekStartDate.setDate(
    weekStartDate.getDate() - day + 1
  );


  weekStartDate.setHours(
    0,
    0,
    0,
    0
  );


  const weekStart =
    weekStartDate.getTime();


  const monthStart =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).getTime();


  const nowTime =
    now.getTime();


  setReportValues(
    "today",
    calculateReport(
      todayStart,
      todayEnd
    )
  );


  setReportValues(
    "week",
    calculateReport(
      weekStart,
      nowTime
    )
  );


  setReportValues(
    "month",
    calculateReport(
      monthStart,
      nowTime
    )
  );

}


function setReportValues(type, report) {

  document.getElementById(
    type + "Income"
  ).innerText =
    "₹" +
    report.income.toLocaleString("en-IN");


  document.getElementById(
    type + "Expense"
  ).innerText =
    "₹" +
    report.expense.toLocaleString("en-IN");


  document.getElementById(
    type + "Profit"
  ).innerText =
    "₹" +
    report.profit.toLocaleString("en-IN");

}


// ================= REALTIME FIREBASE SYNC =================

const firebaseQuery =
  query(
    transactionsRef,
    orderBy("timestamp", "desc")
  );


onSnapshot(
  firebaseQuery,

  function (snapshot) {

    transactions = [];

    snapshot.forEach(function (item) {

      transactions.push({
        firebaseId: item.id,
        ...item.data()
      });

    });


    updateDashboard();

  },

  function (error) {

    console.error(
      "Firebase error:",
      error
    );

    alert(
      "Database connection failed. Check Firebase rules."
    );

  }
);
