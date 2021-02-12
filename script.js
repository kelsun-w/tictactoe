const GAMEBOARD = (() => {
    let gameboard = [
        ['','',''],
        ['','',''],
        ['','','']
    ]

    function reset() {
        for (let i = 0; i < gameboard.length; i++) {
            for (let j = 0; j < gameboard[i].length; j++) {
                gameboard[i][j] = '';
            }
        }
    }
    
    function getEmptyTiles() {
        let vacant = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (gameboard[i][j] == '') {
                    vacant.push({
                        x: i,
                        y :j
                    });
                }
            }
        }
        return vacant;
    }

    return {
        gameboard,
        reset,
        getEmptyTiles
    }
})();

class Player {
    isHuman;
    check_type;

    constructor (isHuman, check_type) {
        this.isHuman = isHuman;
        this.check_type = check_type;
    }

    computerMove(options) {
        let move = options[Math.floor(Math.random()*options.length)];
        return {
            x : move.i,
            y : move.j
        }
    }
}

const CONTROLLER = (() => {
    let dom_board;
    let msg_Modal;
    let modal_overlay;
    let gamescreen;
    let gameboard;
    let p1;
    let p2;
    let currPlayer;
    let oppPlayer;
    let round;

    //Game state controls
    let btn_startGame;
    let btn_restartGame;
    let btn_returnToMenu;

    function init() {
        gameboard = GAMEBOARD.gameboard;
        gamescreen = 1;
        dom_board = document.querySelector('#gameboard');
        msg_Modal = document.querySelector('#msg_modal');
        modal_overlay = document.querySelector('.modal_overlay');

        btn_startGame = document.querySelector('#btn-start');
        btn_restartGame = document.querySelector('#btn-restart');
        btn_returnToMenu = document.querySelector('#btn-return');

        btn_startGame.addEventListener('click', startGame);
        btn_restartGame.addEventListener('click', restartGame);
        btn_returnToMenu.addEventListener('click', resetGame);
        render();
    }

    function checkWin(board) {
        let winner = checkRow(board) || checkCol(board) || checkDiag(board);
        if (winner == null && round == 9) {
            return 'draw';
        } else {
            return winner;
        }
    }

    function equals3(a, b, c) {
        return a == b && b == c && a != '';
    }

    function checkRow(board) {
        for (let i = 0; i < 3; i++) {
            if (equals3(board[i][0], board[i][1], board[i][2])) {
                return board[i][0];
            }
        } 
        return null;
    }

    function checkCol(board) {
        for (let i = 0; i < 3; i++) {
            if (equals3(board[0][i],board[1][i],board[2][i])) {
                return board[0][i];
            }
        }
        return null;
    }

    function checkDiag(board) {
        for (let i = 0; i < 3; i++) {
            if (equals3(board[0][0], board[1][1],board[2][2])) {
                return board[0][0];
            } else if (equals3(board[0][2], board[1][1], board[2][0])) {
                return board[0][2]; 
            }
        }
        return null;
    }

    function endGame(winner) {
        let text = winner ? `Player ${winner} wins!🥳🎉` : "It's a draw!";
        let text_elem = document.createElement('p');
        text_elem.innerText = text;
        msg_Modal.appendChild(text_elem);

        let resetBtn = document.createElement('button');
        resetBtn.innerText = "New Game";
        resetBtn.addEventListener('click', restartGame);
        msg_Modal.appendChild(resetBtn);

        msg_Modal.style.display = "flex";
        modal_overlay.style.display = "block";
    }

    function playerMove (x, y) {
        if (gameboard[x][y] == '') {
            gameboard[x][y] = currPlayer.check_type;
            nextRound();
        }
    }

    function nextRound() {
        // We evaluate the previous round first before moving on to the next
        render();
        let result = checkWin(gameboard);
        if (result != null) {
            // We got a game over scenario
            if (result == 'draw') {
                endGame();
            } else {
                endGame(result);
            }
            // Game over. End game loop
            return;
        }

        round++;
        // Determine the current player based on the current round no.
        let currPlayerNo = Math.ceil(round%2);
        if (currPlayerNo !== 0) {
            currPlayer = p1;
            oppPlayer  = p2;
        } else {
            currPlayer = p2;
            oppPlayer  = p1;
        }

        // AI's turn. Determine best move
        if (!currPlayer.isHuman) {
            let bestScore = -Infinity;
            let move;
            let vacant_tiles = GAMEBOARD.getEmptyTiles();  
            for (let i = 0; i < vacant_tiles.length; i++) {
                let tile = vacant_tiles[i];
                gameboard[tile.x][tile.y] = currPlayer.check_type;
                let score = minimax(gameboard, vacant_tiles.length - 1, bestScore, +Infinity, false); 
                gameboard[tile.x][tile.y] = ''; 
                if (score > bestScore) {
                    bestScore = score;
                    move = tile; 
                }
            }
            playerMove(move.x, move.y);
        }
    }

    function minimax(board, depth, alpha, beta, maximisingPlayer) {
        console.log(depth);
        let result = checkWin(board);
        if (result !== null) {
            if(result !== currPlayer.check_type) {
                return -10;
            } else if (result === currPlayer.check_type) {
                return 10;
            } else {
                return 0;
            }
        } else if(depth === 0) {
            return 0;
        }

        let bestScore;
        if (maximisingPlayer) {
            bestScore = -Infinity;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (board[i][j] == '') {
                        board[i][j] = currPlayer.check_type;
                        let score = minimax(board, depth - 1, alpha, beta, false);
                        bestScore = Math.max(score, bestScore);
                        board[i][j] = '';

                        alpha = Math.max(alpha, score);
                        if (beta <= alpha) {
                            break;
                        }
                    }
                }
            }
            return bestScore;
        } else {
            bestScore = Infinity;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (board[i][j] == '') {
                        board[i][j] = oppPlayer.check_type;
                        let score = minimax(board, depth - 1, alpha, beta, true);
                        bestScore = Math.min(score, bestScore);
                        board[i][j] = '';

                        beta = Math.min(beta, score);
                        if (beta <= alpha) {
                            break;
                        }
                    }
                }
            }
            return bestScore;
        }
    }

    function render() {
        let menu_screen = document.querySelector('#menu');
        let main_screen = document.querySelector('#main');

        if (gamescreen === 1) {
            menu_screen.style.display = "flex";
            main_screen.style.display = "none";
        } else if (gamescreen === 2) {
            menu_screen.style.display = "none";
            main_screen.style.display = "flex";
            displayBoard();
        }
    }

    function displayBoard() {
        console.log(gameboard);
        //Erasing prev state
        dom_board.innerHTML = "";
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let board_tile = document.createElement('div');
                board_tile.classList.add('gameboard-tile');
                board_tile.addEventListener('click', () => playerMove(i, j));
                if (gameboard[i][j] != '')
                    board_tile.innerText = gameboard[i][j];

                dom_board.appendChild(board_tile);
            };
        }
    }

    function restartGame() {
        GAMEBOARD.reset();
        round = 1;
        msg_Modal.style.display = "none";
        msg_Modal.innerHTML = "";
        modal_overlay.style.display = "none";
        currPlayer = p1;
        render();
    }

    function resetGame() {
        GAMEBOARD.reset();
        gamescreen = 1;
        round = 1;
        p1 = null;
        p2 = null;
        render();
    }

    function startGame() {
        gamescreen = 2;
        var option= document.querySelector('input[name = "selection-p"]:checked').value;
        p1 = new Player(true, 'X');
        p2 = new Player((option === "human"), 'O');
        currPlayer = p1;
        round = 1;
        render();
    }

    return {
        init
    }
})();

window.addEventListener('DOMContentLoaded', CONTROLLER.init);
