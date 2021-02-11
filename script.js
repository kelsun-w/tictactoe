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
                if(gameboard[i][j] == '') vacant.push({i,j});
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

    function checkWin() {
        let winner = checkRow() || checkCol() || checkDiag();
        if (winner == null && round == 9) {
            return 'draw';
        } else {
            return winner;
        }
    }

    function equals3(a, b, c) {
        return a == b && b == c && a != '';
    }

    function checkRow() {
        for (let i = 0; i < 3; i++) {
            if (equals3(gameboard[i][0], gameboard[i][1], gameboard[i][2])) {
                return gameboard[i][0];
            }
        } 
        return null;
    }

    function checkCol() {
        for (let i = 0; i < 3; i++) {
            if (equals3(gameboard[0][i],gameboard[1][i],gameboard[2][i])) {
                return gameboard[0][i];
            }
        }
        return null;
    }

    function checkDiag() {
        for (let i = 0; i < 3; i++) {
            if (equals3(gameboard[0][0], gameboard[1][1],gameboard[2][2])) {
                return gameboard[0][0];
            } else if (equals3(gameboard[0][2], gameboard[1][1], gameboard[2][0])) {
                return gameboard[0][2]; 
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
        let result = checkWin();
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
        currPlayer = currPlayerNo !== 0 ? p1 : p2;
        if (!currPlayer.isHuman) {
            let vacant_tiles = GAMEBOARD.getEmptyTiles();  
            let move = currPlayer.computerMove(vacant_tiles);
            playerMove(move.x, move.y);
        }
    }

    function render() {
        let menu_screen = document.querySelector('#menu');
        let main_screen = document.querySelector('#main');

        if(gamescreen === 1) {
            menu_screen.style.display = "flex";
            main_screen.style.display = "none";
        }else if(gamescreen === 2){
            menu_screen.style.display = "none";
            main_screen.style.display = "flex";
            displayBoard();
        }
    }

    function displayBoard(){
        console.log(gameboard);
        //Erasing prev state
        dom_board.innerHTML = "";
        for (let i = 0; i < 3; i++) {
            for(let j = 0; j < 3; j++) {
                let board_tile = document.createElement('div');
                board_tile.classList.add('gameboard-tile');
                board_tile.addEventListener('click', () => playerMove(i,j));
                if(gameboard[i][j] != '')
                    board_tile.innerText = gameboard[i][j];

                dom_board.appendChild(board_tile);
            };
        }
    }

    function restartGame(){
        GAMEBOARD.reset();
        round = 1;
        msg_Modal.style.display = "none";
        msg_Modal.innerHTML = "";
        modal_overlay.style.display = "none";
        currPlayer = p1;
        render();
    }

    function resetGame(){
        GAMEBOARD.reset();
        gamescreen = 1;
        round = 1;
        p1 = null;
        p2 = null;
        render();
    }

    function startGame(){
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
