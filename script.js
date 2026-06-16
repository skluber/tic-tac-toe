const Player = (name, marker) => {
    let score = 0;

    const getScore = () => score;
    const resetScore = () => score = 0;
    const addScore = () => { score++; };
    const setName = (newName) => { name = newName; };

    return { get name() { return name; }, setName, marker, getScore, addScore, resetScore }
}

const leaderboard = {
    p1User: document.getElementById("p1-user"),
    p1Marker: document.getElementById("p1-marker"),
    p1Score: document.getElementById("p1-score"),
    
    p2User: document.getElementById("p2-user"),
    p2Marker: document.getElementById("p2-marker"),
    p2Score: document.getElementById("p2-score")
};

const player1 = Player(leaderboard.p1User.textContent, leaderboard.p1Marker.textContent);
const player2 = Player(leaderboard.p2User.textContent, leaderboard.p2Marker.textContent);

const cells = document.querySelectorAll(".cell");
const modal = document.getElementById("game-modal");
const modalMessage = document.getElementById("modal-message");
const modalScore = document.getElementById("modal-score");
const restartButton = document.getElementById("restart-btn");

const gameBoard = (() => {
    const board = ["", "", "", "", "", "", "", "", ""];

    function setMarker(index, marker) {
        board[index] = marker;
    }; 

    const getBoard = () => [...board];

    const resetBoard = () => {
        board.fill("");
        cells.forEach(cell => {
            cell.textContent = "";
        })
    }
    const isSquareAvailable = (index) => board[index] === "";

    return { setMarker, getBoard, resetBoard, isSquareAvailable }
})();

const gameController = ((gameBoard, player1, player2) => {
    let firstPlayerTurn = true;
    let isGameOver = false;

    const handleEndGame = (resultText, score) => {
        modalMessage.textContent = resultText;
        if (score === null) { 
            modalScore.style.display = "none";
        } else { 
            modalScore.style.display = "block";
            modalScore.textContent = `Score: ${score}`; 
        }
        
        modal.classList.add("show");
    }

    function updateLeaderBoard () {
        leaderboard.p1User.textContent = player1.name;
        leaderboard.p1Marker.textContent = player1.marker;
        leaderboard.p1Score.textContent = player1.getScore();
        leaderboard.p2User.textContent = player2.name;
        leaderboard.p2Marker.textContent = player2.marker;
        leaderboard.p2Score.textContent = player2.getScore();
    }

    function displayController () {
        let board = gameBoard.getBoard();
        const format = (val) => val === "" ? " " : val;

        console.log(`${format(board[0])} | ${format(board[1])} | ${format(board[2])}`);
        console.log(`${format(board[3])} | ${format(board[4])} | ${format(board[5])}`);
        console.log(`${format(board[6])} | ${format(board[7])} | ${format(board[8])}`);
    }

    function checkWinner () {
        const winScenarios = [[0, 1, 2], [3, 4, 5], [6, 7, 8], 
                              [0, 3, 6], [1, 4, 7], [2, 5, 8],
                              [0, 4, 8], [2, 4, 6]];

        const board = gameBoard.getBoard();
        const marker = firstPlayerTurn ? "❌" : "⭕";
        
        return winScenarios.some(scenario => {
            return scenario.every(index => board[index] === marker)
        })
    }

    const playRound = (index) => {
        if(!gameBoard.isSquareAvailable(index) || isGameOver) return;

        const marker = firstPlayerTurn ? "❌" : "⭕";
        gameBoard.setMarker(index, marker);

        if (checkWinner()) {
            const activePlayer = firstPlayerTurn ? player1 : player2;
            activePlayer.addScore();
            isGameOver = true;
            handleEndGame(`Ganador: ${activePlayer.name}`, activePlayer.getScore());

        } else if (gameBoard.getBoard().every(cell => cell !== "")) {
            handleEndGame("¡Empate!", null);
            isGameOver = true;

        } else {
            firstPlayerTurn = !firstPlayerTurn;
        }
    }

    const getGameStatus = () => isGameOver;

    const resetGame = () => {
        firstPlayerTurn = true;
        isGameOver = false;
        gameBoard.resetBoard();
        displayController();
        modal.classList.remove("show");
        updateHovers();
        updateLeaderBoard();
    }

    const updateHovers = () => {
        if (isGameOver) {
            cells.forEach(cell => cell.removeAttribute("data-hover"));
            return;
        }

        const currentMarker = firstPlayerTurn ? "❌" : "⭕";

        cells.forEach((cell, index) => {
            if (gameBoard.isSquareAvailable(index)) {
                cell.setAttribute("data-hover", currentMarker)
            } else {
                cell.removeAttribute("data-hover");
            }
        });
    }

    return { playRound, displayController, getGameStatus, resetGame, updateHovers }
})(gameBoard, player1, player2);

gameController.updateHovers();

cells.forEach((cell, index) => {
    cell.addEventListener("click", () => {
        if(!gameBoard.isSquareAvailable(index) || gameController.getGameStatus()) return;

        gameController.playRound(index);
        gameController.displayController();

        const updatedBoard = gameBoard.getBoard();
        cell.textContent = updatedBoard[index];
        gameController.updateHovers()
    })
})

restartButton.addEventListener("click", () => {
    gameController.resetGame();
});

leaderboard.p1User.addEventListener("blur", () => {
    const newName = leaderboard.p1User.textContent.trim();

    if (newName === player2.name) {
        alert("Duplicated name");
    } else {
        player1.setName(newName === "" ? "Player 1" : newName)
    }

    leaderboard.p1User.textContent = player1.name;
})

leaderboard.p2User.addEventListener("blur", () => {
    const newName = leaderboard.p2User.textContent.trim();

    if (newName === player1.name) {
        alert("Duplicated name");
    } else {
        player2.setName(newName === "" ? "Player 2" : newName)
    }

    leaderboard.p2User.textContent = player2.name;
})

document.querySelector(".leaderboard").addEventListener("beforeinput", (event) => {
    if (event.inputType === "insertParagraph" || event.inputType === "insertLineBreak") {
        event.preventDefault(); 
        if (document.activeElement) {
            document.activeElement.blur();
            player1.resetScore();
            player2.resetScore();
            gameController.resetGame();
        }
    }
});

document.addEventListener("keydown", (event) => {
    if (event.metaKey || event.ctrlKey) return;
    if (event.key === "Escape") {
        const active = document.activeElement;
        
        if (active === leaderboard.p1User || active === leaderboard.p2User) {
            event.preventDefault();
            active.blur();
            player1.resetScore();
            player2.resetScore();
            gameController.resetGame();
        }
    }
});