const form = document.getElementById("transactionForm");
const descInput = document.getElementById("desc");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");

const balanceDisplay = document.getElementById("balanceAmount");
const incomeDisplay = document.getElementById("incomeAmount");
const expenseDisplay = document.getElementById("expenseAmount");
const transactionList = document.getElementById("transactionList");
const chartText = document.getElementById("chartText");
const pingDisplay = document.getElementById("pingDisplay");

let transactions = [];
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const descValue = descInput.value;
  const amountValue = parseFloat(amountInput.value);
  const typeValue = typeInput.value;
  if (descValue.trim() === "" || isNaN(amountValue))
    return alert("Please enter a valid description and amount");

  const newTransaction = {
    id: Date.now(),
    desc: descValue,
    amount: amountValue,
    type: typeValue,
  };

  transactions.push(newTransaction);

  descInput.value = "";
  amountInput.value = "";

  updateTotals();
  renderList();
  saveSystemState();
});

function renderList(listToRender = transactions) {
  transactionList.innerHTML = "";
  if (transactions.length > 0) {
    chartText.style.display = "none";
  } else {
    chartText.style.display = "flex";
  }
  listToRender.forEach(function (t) {
    let time = new Date(t.id).toLocaleTimeString();
    const isIncome = t.type === "income";
    const sign = isIncome ? "+Ð" : "-Ð";
    const icon = isIncome ? "fa-database" : "fa-skull";
    const item = document.createElement("li");
    item.classList.add("cyber-list-item", t.type);
    item.innerHTML = `
       <div class="item-hex">
                                <i class="fa-solid ${icon}"></i>
                            </div>
                            <div class="item-info">
                                <span class="item-desc">${t.desc}</span>
                                <span class="item-date">T: ${time} // SYS.CLK</span>
                            </div>
                            <div class="item-actions">
                                <span class="item-amount">${sign} ${t.amount}</span>
                                <button class="btn-purge" title="Purge Node"><i class="fa-solid fa-xmark"></i></button>
                            </div>
        `;

    const btnPurge = item.querySelector(".btn-purge");
    btnPurge.addEventListener("click", function () {
      transactions = transactions.filter((item) => item.id !== t.id);
      updateTotals();
      renderList();
      saveSystemState();
    });
    transactionList.appendChild(item);
  });
}

function updateTotals() {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;
  incomeDisplay.textContent = `+Ð ${totalIncome.toFixed(2)}`;
  expenseDisplay.textContent = `-Ð ${totalExpense.toFixed(2)}`;
  balanceDisplay.textContent = `Ð ${balance.toFixed(2)}`;
  updateChart();
}

function saveSystemState() {
  localStorage.setItem("neuro_finance_data", JSON.stringify(transactions));
}

function loadSystemState() {
  const savedData = localStorage.getItem("neuro_finance_data");
  if (savedData) {
    transactions = JSON.parse(savedData);
  }
}

let neuroChart = null;
const ctx = document.getElementById("expenseChart").getContext("2d");

function updateChart() {
  // 1. Recalculate totals for the chart
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // 2. If the chart already exists, destroy it before drawing a new one (prevents visual glitches)
  if (neuroChart) {
    neuroChart.destroy();
  }

  // 3. If there is no data at all, stop here so we don't draw an empty circle
  if (totalIncome === 0 && totalExpense === 0) return;

  // 4. Draw the new Hologram Chart
  neuroChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["INFLOW", "OUTFLOW"],
      datasets: [
        {
          data: [totalIncome, totalExpense],
          backgroundColor: [
            "rgba(0, 255, 170, 0.2)", // Translucent Neon Green
            "rgba(255, 0, 85, 0.2)", // Translucent Neon Red
          ],
          borderColor: [
            "#00ffaa", // Solid Neon Green
            "#ff0055", // Solid Neon Red
          ],
          borderWidth: 2,
          hoverOffset: 5, // Pops out slightly when you hover with your mouse
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "80%", // Makes the ring super thin and futuristic
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#00ffaa", // Neon text for the legend
            font: {
              family: "'Share Tech Mono', monospace", // Matches your CSS
              size: 14,
            },
          },
        },
      },
    },
  });
}

function updateLivePing() {
  let currentPing;

  if (navigator.connection && navigator.connection.rtt) {
    currentPing = navigator.connection.rtt;

    currentPing += Math.floor(Math.random() * 5) - 2;
  } else {
    currentPing = Math.floor(Math.random() * (28 - 12 + 1)) + 12;
  }

  if (currentPing < 1) currentPing = 1;

  pingDisplay.innerText = `${currentPing}ms`;

  if (currentPing < 50) {
    pingDisplay.className = "income-text";
  } else if (currentPing < 100) {
    pingDisplay.style.color = "#ffaa00";
  } else {
    pingDisplay.className = "expense-text";
  }
}

updateLivePing();

setInterval(updateLivePing, 1000);
loadSystemState();
updateTotals();
renderList(transactions);
