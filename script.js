const Player = (name, marker) => {
    let score = 0;
    const getScore = () => score;
    const addScore = () => score++;

    return { name, marker, getScore, addScore }
}

const player1 = Player("Antonio", "X");
const player2 = Player("Ana", "O");

const gameBoard = (() => {
    const board = ["", "", "", "", "", "", "", "", ""];

    function setMarker(index, marker) {
        board[index] = marker;
    }; 

    const getBoard = () => [...board];

    const isSquareAvailable = (index) => board[index] === "";

    return { setMarker, getBoard, isSquareAvailable }
})();

const gameController = ((gameBoard, player1, player2) => {
    let firstPlayerTurn = true;

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
        const marker = firstPlayerTurn ? "X" : "O";
        
        return winScenarios.some(scenario => {
            return scenario.every(index => board[index] === marker)
        })
    }

    const playRound = (index) => {
        if(!gameBoard.isSquareAvailable(index)) return;

        const marker = firstPlayerTurn ? "X" : "O";
        gameBoard.setMarker(index, marker);

        if (checkWinner()) {
            let user = firstPlayerTurn ? player1.name : player2.name
            console.log(`Ganador ${user}: ${marker}`)
        } else {
            firstPlayerTurn = !firstPlayerTurn;
        }
    }

    return { playRound, displayController }
})(gameBoard, player1, player2);
