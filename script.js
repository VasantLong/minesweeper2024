let boardSize = 9;
let numMines = 10;
let board = [];
let remainingMines = numMines;
let gameOver = false;

const boardElement = document.getElementById('board');
const remainingMinesElement = document.getElementById('remaining-mines');

// 初始化游戏
function initGame(size, mines) {
    boardSize = size;
    numMines = mines;
    remainingMines = numMines;
    remainingMinesElement.textContent = remainingMines;
    gameOver = false;
    board = createBoard(boardSize, numMines);
    renderBoard();
}

// 创建游戏板
function createBoard(size, mines) {
    const board = Array.from({ length: size }, () => Array(size).fill(0));
    placeMines(board, mines);
    calculateNumbers(board);
    return board;
}

// 放置雷
function placeMines(board, mines) {
    const size = board.length;
    let placed = 0;
    while (placed < mines) {
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);
        if (board[row][col] !== 'X') {
            board[row][col] = 'X';
            placed++;
        }
    }
}

// 计算每个格子周围的雷数
function calculateNumbers(board) {
    const size = board.length;
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (board[row][col] === 'X') continue;
            let count = 0;
            for (let r = -1; r <= 1; r++) {
                for (let c = -1; c <= 1; c++) {
                    if (row + r >= 0 && row + r < size && col + c >= 0 && col + c < size) {
                        if (board[row + r][col + c] === 'X') count++;
                    }
                }
            }
            board[row][col] = count;
        }
    }
}

// 渲染游戏板
function renderBoard() {
    boardElement.innerHTML = '';
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', handleLeftClick);
            cell.addEventListener('contextmenu', handleRightClick);
            boardElement.appendChild(cell);
        }
    }
}

// 处理左键点击
function handleLeftClick(event) {
    if (gameOver) return;
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    revealCell(row, col);
}

// 处理右键点击
function handleRightClick(event) {
    event.preventDefault();
    if (gameOver) return;
    const cell = event.target;
    if (cell.classList.contains('revealed')) return;
    if (cell.classList.contains('flagged')) {
        cell.classList.remove('flagged');
        remainingMines++;
    } else {
        cell.classList.add('flagged');
        remainingMines--;
    }
    remainingMinesElement.textContent = remainingMines;
}

// 揭示格子
function revealCell(row, col) {
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (!cell || cell.classList.contains('revealed') || cell.classList.contains('flagged')) return;

    cell.classList.add('revealed');
    if (board[row][col] === 'X') {
        cell.classList.add('mine');
        endGame(false);
    } else {
        cell.textContent = board[row][col] === 0 ? '' : board[row][col];
        if (board[row][col] === 0) {
            for (let r = -1; r <= 1; r++) {
                for (let c = -1; c <= 1; c++) {
                    if (row + r >= 0 && row + r < boardSize && col + c >= 0 && col + c < boardSize) {
                        revealCell(row + r, col + c);
                    }
                }
            }
        }
    }
    checkWin();
}

// 检查是否获胜
function checkWin() {
    const revealedCells = document.querySelectorAll('.cell.revealed');
    if (revealedCells.length === boardSize * boardSize - numMines) {
        endGame(true);
    }
}

// 结束游戏
function endGame(win) {
    gameOver = true;
    if (win) {
        alert('恭喜你，你赢了！');
    } else {
        alert('游戏结束，你踩到雷了！');
    }
}

// 初始化不同难度
document.getElementById('easy').addEventListener('click', () => initGame(9, 10));
document.getElementById('medium').addEventListener('click', () => initGame(16, 40));
document.getElementById('hard').addEventListener('click', () => initGame(24, 99));

// 默认初始化为简单模式
initGame(9, 10);