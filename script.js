const GAMEBOARD = (() => {
    let gameboard = new Array(9);

    function reset() {
        for(let i = 0; i<gameboard.length; i++) {
            gameboard[i] = null;
        }
    }

    function checkTile(index, player){
        if(!gameboard[index]){
            gameboard[index] = player;
            return true;
        }

        return false;
    }

    return {
        gameboard,
        reset,
        checkTile
    }
})();

class Player{
    isHuman;
    check_type;

    constructor(isHuman, check_type){
        this.isHuman = isHuman;
        this.check_type = check_type;
    }

    computerMove(valid_moves){
        let move = Math.floor(Math.random()*valid_moves.length) 
        return valid_moves[move]; 
    }
};

const CONTROLLER = (() => {
    let dom_board;
    let msg_Modal;
    let modal_overlay;
    let gameover;
    let gamescreen;
    let gameboard;
    let p1;
    let p2;
    let round;

    //Game state controls
    let btn_startGame;
    let btn_restartGame;
    let btn_returnToMenu;

    function init() {
        gameboard = GAMEBOARD.gameboard;
        gamescreen = 1;
        round = 1;
        gameover = false;
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
        if(!winner) return false;
        gameover = true;
        endGame(winner);
    }

    function checkRow(){
        const WIN_CON = [[0,1,2],[3,4,5],[6,7,8]];
        let winner = null;
        let subset;
        for(let i = 0; i<WIN_CON.length; i++){
            subset = [];
            for(let j=0; j<WIN_CON[i].length; j++){
                subset.push(gameboard[WIN_CON[i][j]]);
            }
            if(subset.every((elem) => elem === 1)) winner = 1;
            else if(subset.every((elem) => elem === 2)) winner = 2;
        }
        return winner;
    }

    function checkCol(){
        const WIN_CON = [[0,3,6],[1,4,7],[2,5,8]]
        let winner = null;
        let subset;
        for(let i = 0; i<WIN_CON.length; i++){
            subset = [];
            for(let j=0; j<WIN_CON[i].length; j++){
                subset.push(gameboard[WIN_CON[i][j]]);
            }
            if(subset.every((elem) => elem === 1)) winner = 1;
            else if(subset.every((elem) => elem === 2)) winner = 2;
        }
        return winner;
    }

    function checkDiag(){
        const WIN_CON = [[0,4,8],[2,4,6]]
        let winner = null;
        let subset;
        for(let i = 0; i<WIN_CON.length; i++){
            subset = [];
            for(let j=0; j<WIN_CON[i].length; j++){
                subset.push(gameboard[WIN_CON[i][j]]);
            }
            if(subset.every((elem) => elem === 1)) winner = 1;
            else if(subset.every((elem) => elem === 2)) winner = 2;
        }
        return winner;
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

    function playerMove(selectedTile, currPlayer){
        let isValid = GAMEBOARD.checkTile(selectedTile, currPlayer);
        if(isValid){
            if(!gameover){
                if(round === 9) {
                    //It's a draw
                    endGame(null);
                }else{
                    //Moving on to next player's turn
                    ++round;
                    nextRound();
                }
            }
        }
    }

    function nextRound(){
        //console.log("current round"+round);
        let currPlayerNo = Math.ceil(round%2);
        let currPlayer = currPlayerNo !== 0 ? p1 : p2;
        if(currPlayer.isHuman){
            render(currPlayerNo === 0 ? 2 : 1);
        }else{
            let vacant_tiles = [];
            for(let i=0; i<gameboard.length; i++){
                if(!gameboard[i]) vacant_tiles.push(i);
            }
            let tile_no = currPlayer.computerMove(vacant_tiles);
            playerMove(tile_no, currPlayerNo === 0 ? 2 : 1);
        }
    }

    function render(currPlayer=0) {
        let menu_screen = document.querySelector('#menu');
        let main_screen = document.querySelector('#main');

        if(gamescreen === 1) {
            menu_screen.style.display = "flex";
            main_screen.style.display = "none";
        }else if(gamescreen === 2){
            menu_screen.style.display = "none";
            main_screen.style.display = "flex";
            displayBoard(currPlayer);
        }
    }

    function displayBoard(currPlayer){
        checkWin();
        console.log(gameboard);
        //Erasing prev state
        dom_board.innerHTML = "";
        for(let i = 0; i < gameboard.length; i++) {
            let board_tile = document.createElement('div');
            board_tile.classList.add('gameboard-tile');
            board_tile.addEventListener('click', () => playerMove(i, currPlayer));

            if(gameboard[i]){
                switch(gameboard[i]){
                    case 1 :
                        board_tile.innerText = p1.check_type;
                        break;
                    case 2 :
                        board_tile.innerText = p2.check_type;
                        break;
                    default: break
                }
            }
            dom_board.appendChild(board_tile);
        };
    }

    function restartGame(){
        GAMEBOARD.reset();
        gameover = false;
        round = 1;
        msg_Modal.style.display = "none";
        msg_Modal.innerHTML = "";
        modal_overlay.style.display = "none";
        render(1);
    }

    function resetGame(){
        GAMEBOARD.reset();
        gamescreen = 1;
        gameover = false;
        round = 1;
        p1 = null;
        p2 = null;
        render();
    }

    function startGame(){
        gamescreen = 2;
        var option= document.querySelector('input[name = "selection-p"]:checked').value;
        console.log(option);
        p1 = new Player(true, 'X');
        p2 = new Player((option === "human"), 'O');
        render(1);
    }

    return {
        init
    }
})();

window.addEventListener('DOMContentLoaded', CONTROLLER.init);
