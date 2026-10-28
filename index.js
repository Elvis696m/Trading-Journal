"use strict";

// =========================================
// USERNAME
// =========================================

const welcomeName = document.getElementById("userNameDisplay");

let userName = localStorage.getItem("userName");

if (!userName || !userName.trim()) {
    userName = prompt("Enter your username:");

    if (!userName || !userName.trim()) {
        userName = "Trader";
    }

    userName = userName.trim();
    localStorage.setItem("userName", userName);
}

welcomeName.textContent = userName;


// =========================================
// ELEMENTS
// =========================================

const results = document.querySelectorAll(
    '#calendar input[type="radio"]'
);

const totalWins = document.getElementById("totalWins");
const totalLosses = document.getElementById("totalLosses");
const winRate = document.getElementById("winRate");
const recordedDays = document.getElementById("recordedDays");

const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const progressBar = document.getElementById("progressBar");

const restartButton = document.getElementById("restartButton");

const historyBody = document.getElementById("historyBody");


// =========================================
// MENU
// =========================================

const menuButton = document.getElementById("menuButton");
const sideMenu = document.getElementById("sideMenu");
const closeMenuButton = document.getElementById("closeMenu");
const menuOverlay = document.getElementById("menuOverlay");

const navigationLinks = document.querySelectorAll(".nav-link");

function openMenu() {
    sideMenu.classList.add("open");
    menuOverlay.classList.add("visible");

    menuButton.setAttribute("aria-expanded", "true");
    closeMenuButton.focus();
}

function closeMenu() {
    sideMenu.classList.remove("open");
    menuOverlay.classList.remove("visible");

    menuButton.setAttribute("aria-expanded", "false");
}

menuButton.addEventListener("click", function () {
    if (sideMenu.classList.contains("open")) {
        closeMenu();
    } else {
        openMenu();
    }
});

closeMenuButton.addEventListener("click", function () {
    closeMenu();
    menuButton.focus();
});

menuOverlay.addEventListener("click", closeMenu);

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && sideMenu.classList.contains("open")) {
        closeMenu();
        menuButton.focus();
    }
});

// Navigate to sections and highlight the selected menu item.

navigationLinks.forEach(function (link) {
    link.addEventListener("click", function () {
        navigationLinks.forEach(function (otherLink) {
            otherLink.classList.remove("active");
        });

        link.classList.add("active");

        closeMenu();
    });
});


// =========================================
// RESTORE DAILY RESULTS
// =========================================

results.forEach(function (radio) {
    const savedResult = localStorage.getItem(radio.name);

    if (savedResult === radio.value) {
        radio.checked = true;
    }
});


// =========================================
// CALCULATE STATISTICS
// =========================================

function calculateStatistics() {
    let wins = 0;
    let losses = 0;

    results.forEach(function (radio) {
        if (!radio.checked) {
            return;
        }

        if (radio.value === "win") {
            wins++;
        } else if (radio.value === "loss") {
            losses++;
        }
    });

    const totalTrades = wins + losses;

    let calculatedWinRate = 0;

    if (totalTrades > 0) {
        calculatedWinRate = (wins / totalTrades) * 100;
    }

    return {
        wins: wins,
        losses: losses,
        totalTrades: totalTrades,
        winRate: Number(calculatedWinRate.toFixed(1))
    };
}


// =========================================
// UPDATE STATISTICS AND DAY CARDS
// =========================================

function updateStatistics() {
    const statistics = calculateStatistics();

    totalWins.textContent = statistics.wins;
    totalLosses.textContent = statistics.losses;

    winRate.textContent = statistics.winRate + "%";

    recordedDays.textContent =
        statistics.totalTrades + "/" + results.length / 2;

    const totalDays = results.length / 2;

    const progressPercentage =
        totalDays > 0
            ? (statistics.totalTrades / totalDays) * 100
            : 0;

    progressText.textContent =
        statistics.totalTrades + " of " + totalDays + " days";

    progressFill.style.width = progressPercentage + "%";

    progressBar.setAttribute(
        "aria-valuenow",
        statistics.totalTrades
    );

    // Update each calendar card's appearance.

    document.querySelectorAll(".day-card").forEach(function (card) {
        card.classList.remove("day-win", "day-loss");

        const selectedResult = card.querySelector(
            'input[type="radio"]:checked'
        );

        if (!selectedResult) {
            return;
        }

        if (selectedResult.value === "win") {
            card.classList.add("day-win");
        } else if (selectedResult.value === "loss") {
            card.classList.add("day-loss");
        }
    });

    return statistics;
}


// =========================================
// SAVE DAILY RESULTS
// =========================================

results.forEach(function (radio) {
    radio.addEventListener("change", function () {
        try {
            localStorage.setItem(radio.name, radio.value);
            updateStatistics();
        } catch (error) {
            alert(
                "Your result could not be saved in this browser. " +
                "Check your browser storage settings."
            );
        }
    });
});


// =========================================
// CYCLE HISTORY STORAGE
// =========================================

function getCycleHistory() {
    try {
        const savedHistory = localStorage.getItem("tradingCycleHistory");

        if (!savedHistory) {
            return [];
        }

        const parsedHistory = JSON.parse(savedHistory);

        if (!Array.isArray(parsedHistory)) {
            return [];
        }

        return parsedHistory;
    } catch (error) {
        console.error("Could not read cycle history:", error);

        return null;
    }
}


// =========================================
// DISPLAY COMPLETED CYCLES
// =========================================

function displayCycleHistory() {
    const cycleHistory = getCycleHistory();

    historyBody.replaceChildren();

    if (cycleHistory === null) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.className = "empty-history";
        cell.textContent =
            "Cycle history could not be read. Your saved data has not been deleted.";

        row.appendChild(cell);
        historyBody.appendChild(row);

        return;
    }

    if (cycleHistory.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.className = "empty-history";
        cell.textContent =
            "No completed cycles yet. Your saved cycles will appear here.";

        row.appendChild(cell);
        historyBody.appendChild(row);

        return;
    }

    // Show the newest cycle first.

    cycleHistory.slice().reverse().forEach(function (cycle) {
        const row = document.createElement("tr");

        const cycleNumberCell = document.createElement("td");
        const dateCell = document.createElement("td");
        const winsCell = document.createElement("td");
        const lossesCell = document.createElement("td");
        const tradesCell = document.createElement("td");
        const winRateCell = document.createElement("td");

        cycleNumberCell.textContent = "Cycle " + cycle.cycleNumber;
        dateCell.textContent = cycle.completedAt || "Unknown";
        winsCell.textContent = cycle.wins;
        lossesCell.textContent = cycle.losses;
        tradesCell.textContent = cycle.totalTrades;

        winRateCell.textContent =
            Number(cycle.winRate).toFixed(1) + "%";

        winRateCell.className = "history-win-rate";

        row.append(
            cycleNumberCell,
            dateCell,
            winsCell,
            lossesCell,
            tradesCell,
            winRateCell
        );

        historyBody.appendChild(row);
    });
}


// =========================================
// COMPLETE AND RESTART TRADING CYCLE
// =========================================

restartButton.addEventListener("click", function () {
    const statistics = updateStatistics();

    if (statistics.totalTrades === 0) {
        alert(
            "Record at least one Win or Loss before completing this cycle."
        );

        return;
    }

    const confirmed = confirm(
        "Complete this trading cycle?\n\n" +
        "Wins: " + statistics.wins + "\n" +
        "Losses: " + statistics.losses + "\n" +
        "Recorded days: " + statistics.totalTrades + "\n" +
        "Win rate: " + statistics.winRate + "%\n\n" +
        "Your results will be saved in Cycle History before the calendar resets."
    );

    if (!confirmed) {
        return;
    }

    // Read existing history before changing anything.

    const cycleHistory = getCycleHistory();

    if (cycleHistory === null) {
        alert(
            "Your previous cycle history could not be read. " +
            "Nothing has been reset."
        );

        return;
    }

    // Create a record of the completed cycle.

    const completedCycle = {
        cycleNumber: cycleHistory.length + 1,
        completedAt: new Date().toLocaleString(),
        wins: statistics.wins,
        losses: statistics.losses,
        totalTrades: statistics.totalTrades,
        winRate: statistics.winRate
    };

    cycleHistory.push(completedCycle);

    // Save history before clearing the daily results.

    try {
        localStorage.setItem(
            "tradingCycleHistory",
            JSON.stringify(cycleHistory)
        );
    } catch (error) {
        alert(
            "The cycle could not be saved. " +
            "Your current trading results have been preserved."
        );

        return;
    }

    // Clear the selected radio buttons and saved daily results.

    try {
        results.forEach(function (radio) {
            localStorage.removeItem(radio.name);
            radio.checked = false;
        });
    } catch (error) {
        alert(
            "The cycle was saved, but the daily results could not be " +
            "fully cleared. Please refresh the page and check the calendar."
        );

        displayCycleHistory();

        return;
    }

    // Refresh statistics and cycle history.

    updateStatistics();
    displayCycleHistory();

    alert(
        "Cycle " + completedCycle.cycleNumber +
        " saved successfully!\n\n" +
        "Your calendar is ready for a new trading cycle."
    );

    // Return to the calendar.

    document.getElementById("calendarSection").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});


// =========================================
// INITIALIZE THE DASHBOARD
// =========================================

updateStatistics();
displayCycleHistory();