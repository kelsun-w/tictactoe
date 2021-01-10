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

function Player(isHuman, check_type){
  return {
    isHuman,
    check_type
  }
};

const CONTROLLER = (() => {
  let _dom_board;
  let _msg_Modal;
  let _modal_overlay;
  let _gameover;
  let _gamescreen;
  let _gameboard;
  let _p1;
  let _p2;
  let _round;

  //Game state controls
  let _btn_startGame;
  let _btn_restartGame;
  let _btn_returnToMenu;

  function init() {
    _gameboard = GAMEBOARD.gameboard;
    _gamescreen = 1;
    _round = 0;
    _gameover = false;
    _dom_board = document.querySelector('#gameboard');
    _msg_Modal = document.querySelector('#msg_modal');
    _modal_overlay = document.querySelector('.modal_overlay');

    _btn_startGame = document.querySelector('#btn-start');
    _btn_restartGame = document.querySelector('#btn-restart');
    _btn_returnToMenu = document.querySelector('#btn-return');

    _btn_startGame.addEventListener('click', startGame);
    _btn_restartGame.addEventListener('click', restartGame);
    _btn_returnToMenu.addEventListener('click', resetGame);
    render();
  }

  function playerMove(selectedTile){
    let currentPlayer = (_round % 2) + 1;
    let isValid = GAMEBOARD.checkTile(selectedTile, currentPlayer);
    if(isValid){
      checkWin();
      if(!_gameover && _round === 8) {
        //It's a draw
        endGame(null);
      }else{
        //Moving on to next player's turn
        _round++;
        render();
      }
    }
  }

  function checkWin() {
    let winner = _checkRow() || _checkCol() || _checkDiag();
    console.log(winner);
    if(!winner) return false;
    _gameover = true;
    endGame(winner);
  }

  function _checkRow(){
    const WIN_CON = [[0,1,2],[3,4,5],[6,7,8]];
    let winner = null;
    let subset;
    for(let i = 0; i<WIN_CON.length; i++){
      subset = [];
      for(let j=0; j<WIN_CON[i].length; j++){
        subset.push(_gameboard[WIN_CON[i][j]]);
      }
      if(subset.every((elem) => elem === 1)) winner = 1;
      else if(subset.every((elem) => elem === 2)) winner = 2;
    }
    return winner;
  }

  function _checkCol(){
    const WIN_CON = [[0,3,6],[1,4,7],[6,5,8]]
    let winner = null;
    let subset;
    for(let i = 0; i<WIN_CON.length; i++){
      subset = [];
      for(let j=0; j<WIN_CON[i].length; j++){
        subset.push(_gameboard[WIN_CON[i][j]]);
      }
      if(subset.every((elem) => elem === 1)) winner = 1;
      else if(subset.every((elem) => elem === 2)) winner = 2;
    }
    return winner;
  }

  function _checkDiag(){
    const WIN_CON = [[0,4,8],[2,4,6]]
    let winner = null;
    let subset;
    for(let i = 0; i<WIN_CON.length; i++){
      subset = [];
      for(let j=0; j<WIN_CON[i].length; j++){
        subset.push(_gameboard[WIN_CON[i][j]]);
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
    _msg_Modal.appendChild(text_elem);

    let resetBtn = document.createElement('button');
    resetBtn.innerText = "New Game";
    resetBtn.addEventListener('click', restartGame);
    _msg_Modal.appendChild(resetBtn);

    _msg_Modal.style.display = "flex";
    _modal_overlay.style.display = "block";
  }

  function render() {
    console.log("render");
    let menu_screen = document.querySelector('#menu');
    let main_screen = document.querySelector('#main');

    if(_gamescreen === 1) {
      menu_screen.style.display = "flex";
      main_screen.style.display = "none";
    }else if(_gamescreen === 2){
      menu_screen.style.display = "none";
      main_screen.style.display = "flex";
      renderBoard();
    }
  }

  function renderBoard(){
    console.log(_gameboard);
    //Erasing prev state
    _dom_board.innerHTML = "";
    for(let i = 0; i < _gameboard.length; i++) {
      let board_tile = document.createElement('div');
      board_tile.classList.add('gameboard-tile');
      board_tile.addEventListener('click', () => playerMove(i));

      if(_gameboard[i]){
        switch(_gameboard[i]){
          case 1 :
          board_tile.innerText = _p1.check_type;
          break;
          case 2 :
          board_tile.innerText = _p2.check_type;
          break;
          default: break
        }
      }
      _dom_board.appendChild(board_tile);
    };
  }

  function restartGame(){
    console.log("Game restarted");
    GAMEBOARD.reset();
    _gameover = false;
    _round = 0;
    _msg_Modal.style.display = "none";
    _msg_Modal.innerHTML = "";
    _modal_overlay.style.display = "none";
    render();
  }

  function resetGame(){
    console.log("Game reset")
    GAMEBOARD.reset();
    _gamescreen = 1;
    _gameover = false;
    _round = 0;
    _p1 = null;
    _p2 = null;
    render();
  }

  function startGame(){
    console.log("Game started");
    _gamescreen = 2;
    _p1 = Player(true, 'X');
    _p2 = Player(true, 'O');
    render();
  }

  return {
    init
  }
})();

window.addEventListener('DOMContentLoaded', CONTROLLER.init);
