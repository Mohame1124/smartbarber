import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy
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

// Load data from Firebase
async function loadFirebaseTransactions() {
    try {
        const q = query(transactionsRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);

        transactions = [];

        snapshot.forEach((document) => {
            transactions.push({
                firebaseId: document.id,
                ...document.data()
            });
        });

        updateDashboard();

    } catch (error) {
        console.error("Firebase load error:", error);
        alert("Unable to load Firebase data.");
    }
}

// Replace the existing saveTransactions behaviour
async function uploadTransaction(transaction) {
    try {
        await addDoc(transactionsRef, transaction);
        await loadFirebaseTransactions();
    } catch (error) {
        console.error("Firebase save error:", error);
        alert("Unable to save data.");
    }
}

// Connect existing Save Income button to Firebase
window.saveIncome = async function () {

    const service = document.getElementById("service").value;
    const amount = Number(document.getElementById("incomeAmount").value);
    const payment = document.getElementById("paymentMethod").value;

    if (!amount || amount <= 0) {
        alert("Please enter a valid amount");
        return;
    }

    const transaction = {
        type: "income",
        service: service,
        amount: amount,
        payment: payment,
        timestamp: Date.now(),
        date: new Date().toLocaleString()
    };

    document.getElementById("incomeAmount").value = "";
    closeIncomeModal();

    await uploadTransaction(transaction);
};

// Connect existing Save Expense button to Firebase
window.saveExpense = async function () {

    const category = document.getElementById("expenseCategory").value;
    const amount = Number(document.getElementById("expenseAmount").value);
    const note = document.getElementById("expenseNote").value;

    if (!amount || amount <= 0) {
        alert("Please enter a valid expense amount");
        return;
    }

    const transaction = {
        type: "expense",
        category: category,
        amount: amount,
        note: note,
        timestamp: Date.now(),
        date: new Date().toLocaleString()
    };

    document.getElementById("expenseAmount").value = "";
    document.getElementById("expenseNote").value = "";

    closeExpenseModal();

    await uploadTransaction(transaction);
};

// Reset Firebase data
window.resetAllData = async function () {

    const confirmReset = confirm(
        "Reset ALL SmartBarber data?\n\nThis will permanently delete all transactions."
    );

    if (!confirmReset) return;

    try {
        const snapshot = await getDocs(transactionsRef);

        const deletes = [];

        snapshot.forEach((document) => {
            deletes.push(
                deleteDoc(doc(db, "transactions", document.id))
            );
        });

        await Promise.all(deletes);

        transactions = [];

        updateDashboard();

        alert("All data has been reset.");

    } catch (error) {
        console.error("Reset error:", error);
        alert("Unable to reset data.");
    }
};

// Load Firebase data when website opens
loadFirebaseTransactions();
