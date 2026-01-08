const boardEl = document.getElementById("board");
const cells = Array.from(document.querySelectorAll(".cell"));
const statusText = document.getElementById("status-text");
const restartBtn = document.getElementById("restart-btn");
const promoBlock = document.getElementById("promo-block");
const promoCodeEl = document.getElementById("promo-code");

let board = Array(9).fill(null); // "X" | "O" | null
let gameOver = false;
const PLAYER = "X";
const COMPUTER = "O";

const winningCombos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
];

function resetGame() {
    board = Array(9).fill(null);
    gameOver = false;
    cells.forEach(c => {
        c.classList.remove("x", "o", "disabled", "win");
    });
    promoBlock.classList.add("hidden");
    restartBtn.classList.add("hidden");
    statusText.textContent = "Ваш ход — вы играете крестиками";
}

function checkWinner() {
    for (const combo of winningCombos) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a], combo };
        }
    }
    if (board.every(cell => cell !== null)) {
        return { winner: null, combo: null }; // ничья
    }
    return null;
}

function disableBoard() {
    cells.forEach(c => c.classList.add("disabled"));
}

function enableBoard() {
    cells.forEach((c, idx) => {
        if (!board[idx]) c.classList.remove("disabled");
    });
}

function computerMove() {
    if (gameOver) return;
    const emptyIndices = board
        .map((v, i) => v === null ? i : null)
        .filter(v => v !== null);

    if (emptyIndices.length === 0) return;

    const idx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    board[idx] = COMPUTER;
    const cell = cells[idx];
    cell.classList.add("o", "disabled");

    const result = checkWinner();
    if (result) {
        handleGameEnd(result);
    } else {
        statusText.textContent = "Ваш ход";
        enableBoard();
    }
}

function handleGameEnd(result) {
    gameOver = true;
    disableBoard();
    restartBtn.classList.remove("hidden");

    if (result.winner === PLAYER) {
        statusText.textContent = "Вы выиграли!";
        if (result.combo) {
            result.combo.forEach(i => cells[i].classList.add("win"));
        }
        sendResult("win");
    } else if (result.winner === COMPUTER) {
        statusText.textContent = "Сегодня победил компьютер. Попробуете ещё раз?";
        if (result.combo) {
            result.combo.forEach(i => cells[i].classList.add("win"));
        }
        sendResult("lose");
    } else {
        statusText.textContent = "Ничья. Можно попробовать ещё раз.";
        sendResult("draw");
    }
}

function sendResult(outcome) {
    fetch("/result", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ outcome })
    })
        .then(res => res.json())
        .then(data => {
            if (outcome === "win" && data.promo) {
                promoCodeEl.textContent = data.promo;
                promoBlock.classList.remove("hidden");
            }
        })
        .catch(err => {
            console.error("Error sending result:", err);
        });
}

cells.forEach(cell => {
    cell.addEventListener("click", () => {
        const idx = parseInt(cell.dataset.index, 10);
        if (gameOver || board[idx]) return;

        board[idx] = PLAYER;
        cell.classList.add("x", "disabled");

        const result = checkWinner();
        if (result) {
            handleGameEnd(result);
        } else {
            statusText.textContent = "Ход компьютера…";
            disableBoard();
            setTimeout(computerMove, 500);
        }
    });
});

restartBtn.addEventListener("click", resetGame);

resetGame();
