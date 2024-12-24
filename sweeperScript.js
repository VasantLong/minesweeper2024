document.addEventListener('DOMContentLoaded', () => {

  /* M0 难度配置(初始为简单) */
  const modeSettings = {
    easy: { gridRows: 9, gridCols: 9, mineNum: 10 },
    medium: { gridRows: 16, gridCols: 16, mineNum: 40 },
    hard: { gridRows: 16, gridCols: 30, mineNum: 99 }
  };

  let currentMode = 'easy';
  let [gridRows, gridCols, mineNum] =
    [modeSettings[currentMode].gridRows,
    modeSettings[currentMode].gridCols,
    modeSettings[currentMode].mineNum];
  let remainingMines = mineNum;
  let isFirstClick = true; // 记录是否是第一次点击

  createBoard(gridRows, gridCols);
  let minePositions = []; // 初始为空

  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    cell.addEventListener('click',
      () => handleCellClick(cell));
    cell.addEventListener('contextmenu',
      (event) => handleRightClick(event, cell));
    cell.addEventListener('dblclick',
      () => handleDoubleClick(cell, minePositions));
  });




  /* M1 网格初步建立 */
  function createBoard(rows, cols) {
    for (let r = 0; r < rows; r++) {
      let tr = document.createElement('tr');
      grid.appendChild(tr);
      for (let c = 0; c < cols; c++) {
        let td = document.createElement('td');
        td.style.padding = '0.5px';
        tr.appendChild(td);
        let cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        td.append(cell);
      }
    }
  }


  /* M2.1 随机生成不同位置的雷
     M2.2 放置雷 */
  function placeMines(minePositions) {
    minePositions.forEach(position => {
      const [mineRow, mineCol] = position.split('-');
      const cell = document.querySelector(
        `.cell[data-row='${mineRow}'][data-col='${mineCol}']`);
      cell.dataset.mine = true; // 标记为雷
    });
  }

  /* M3 周边雷计数 */
  function countSurroundingMines(row, col) {
    let count = 0;
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r === row && c === col) continue; // 跳过当前单元格
        if (r < 0 || r >= gridRows || c < 0 || c >= gridCols) continue; // 跳过越界的单元格
        const surroundingCell = document.querySelector(
          `.cell[data-row='${r}'][data-col='${c}']`);
        if (surroundingCell.dataset.mine) {
          count++;
        }
      }
    }
    return count;
  }

  /* M3 放置雷计数文本 */
  function placeCSM(gridRows, gridCols) {
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const cell = document.querySelector(
          `.cell[data-row='${r}'][data-col='${c}']`);
        if (!cell.dataset.mine) {
          const mineCount = countSurroundingMines(r, c);
          if (mineCount >= 0) {
            cell.dataset.mineCount = mineCount; // 设置计数属性
          }
        }
      }
    }
  }


  /* M4 左键单击事件 */
  function handleCellClick(cell) {
    if (!isTimerRunning) {
      // 如果计时器未运行，启动计时器
      startTimer();
      isTimerRunning = true;
    }
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    // 如果已经显示/被标记旗子，跳过
    if (cell.classList.contains('revealed') ||
      cell.classList.contains('flagged') ||
      cell.classList.contains('question')) return;

    if (isFirstClick) {
      // 如果是第一次点击，确保该单元格及其周围的单元格不包含地雷
      minePositions = generateSafeMinePositions(row, col,
        gridRows, gridCols, mineNum);
      placeMines(minePositions);
      placeCSM(gridRows, gridCols);
      isFirstClick = false; // 标记为已经进行过第一次点击
    } else {
      // 检查是否胜利
      if (checkWinCondition()) {
        winEvent();
        lockClickEvents()
      }
    }

    if (cell.dataset.mine &&
      !cell.classList.contains('flagged')) {
      // 如果点击的是雷，显示失败界面
      loseEvent();

    } else {
      // 如果点击的不是雷，显示周围的雷数
      const mineCount = cell.dataset.mineCount;
      cell.textContent = mineCount > 0 ? mineCount : '';
      cell.classList.add('revealed');
      if (mineCount === '0') {
        // 如果周围没有雷，自动展开周围的空白区域
        revealEmptyCells(row, col);
      }
      // 检查是否胜利
      if (checkWinCondition()) {
        winEvent();
        lockClickEvents()
      }
    }
  }

  /* M4.0 锁定事件  */
  function lockClickEvents() {
    clearInterval(timerInterval); // 停止计时器
    cells.forEach(cell => {
      cell.classList.add('lockclick');
    });
  }

  /* M4.0 胜利事件  */
  const winMessage = document.createElement('div');
  function winEvent() {
    winMessage.textContent = 'You Win!';
    winMessage.style.display = 'block';
    winMessage.id = 'winMessage';
    document.body.appendChild(winMessage);
    lockClickEvents();
  }

  /* M4.1 显示所有雷 */
  function revealUnflaggedMines() {
    if (minePositions.length === 0) {
      console.warn('minePositions is empty. No mines to reveal.');
      return;
    }
    minePositions.forEach(position => {
      const [row, col] = position.split('-');
      const cell = document.querySelector(
        `.cell[data-row='${row}'][data-col='${col}']`);

      if (!cell.classList.contains('flagged')) {
        cell.textContent = '💣';
        cell.classList.add('mine');
      }
    });
  }

  function revealWrongFlags() {
    cells.forEach(cell => {
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);
      const position = `${row}-${col}`;
      if (!minePositions.includes(position) &&
        cell.classList.contains('flagged')) {
        cell.textContent = '❌'; // 显示错误标记
        cell.classList.remove('flagged')
        cell.classList.add('wrong-flag');
      }
    })

  }

  /* M4.2 自动展开空白区域 */
  function revealEmptyCells(row, col) {
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r < 0 || r >= gridRows ||
          c < 0 || c >= gridCols) continue; // 跳过越界的单元格

        const cell = document.querySelector(
          `.cell[data-row='${r}'][data-col='${c}']`);
        if (!cell.classList.contains('revealed') &&
          !cell.dataset.mine &&
          !cell.classList.contains('flagged')) {
          cell.classList.add('revealed');
          if (cell.dataset.mineCount === '0') {
            revealEmptyCells(r, c);
          } else {
            cell.textContent = cell.dataset.mineCount;
          }
          // 检查是否胜利
          if (checkWinCondition()) {
            winEvent();
            lockClickEvents()
          }
        }
      }
    }
  }

  /* M5 右键单击事件 */
  function handleRightClick(event, cell) {
    if (!isTimerRunning) {
      // 如果计时器未运行，启动计时器
      startTimer();
      isTimerRunning = true;
    }
    event.preventDefault(); // 阻止默认的右键菜单
    if (cell.classList.contains('revealed')) return; // 如果已经显示，跳过

    // 状态切换逻辑：旗子 🚩 -> 问号 ❓︎ -> 取消标记 -> 旗子 🚩
    if (cell.textContent === '🚩') {
      cell.textContent = '❓︎';
      cell.classList.remove('flagged');
      cell.classList.add('question');
      remainingMines = Math.min(remainingMines + 1, mineNum); // 增加剩余雷数
    } else if (cell.textContent === '❓︎') {
      cell.textContent = '';
      cell.classList.remove('question');
    } else if (cell.textContent === '') {
      // 旗子数量如果已经达到或超过 mineNum，禁止标记
      const flaggedCells = document.querySelectorAll('.cell.flagged');
      if (flaggedCells.length >= mineNum) return;
      cell.textContent = '🚩';
      cell.classList.add('flagged');
      remainingMines = Math.max(remainingMines - 1, 0); // 减少剩余雷数
    }

    // 更新剩余雷数的显示
    remainingMinesDisplay.textContent = formatNumber(remainingMines);
    // 检查是否胜利
    if (checkWinCondition() &&
      !isFirstClick) {
      winEvent();
      lockClickEvents()
    }
  }

  /* M6 左键双击事件 */
  function handleDoubleClick(cell, minePositions) {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if (cell.classList.contains('flagged')) return;
    if (cell.classList.contains('revealed') &&
      cell.dataset.mineCount) {
      // 获取周围的单元格
      if (cell.dataset.mineCount !== '0') {
        const surroundingCells = getSurroundingCells(row, col);
        // 检查周围标记的旗子数量是否与实际雷数匹配
        const flaggedCount = surroundingCells.filter(cell =>
          cell.classList.contains('flagged')).length;
        const mineCount = parseInt(cell.dataset.mineCount);
        if (flaggedCount === mineCount) {
          // 如果标记的旗子数量与实际雷数匹配，清除周围未标记的单元格
          surroundingCells.forEach(cell => {
            if (!cell.classList.contains('flagged') &&
              !cell.classList.contains('revealed')) {
              handleCellClick(cell); // 调用左键单击处理函数
            }
          });
        }

      }
    }
  }

  /* M6.1 获取单元格周围的单元格 后面看和M3能否合并 */
  function getSurroundingCells(row, col) {
    const surroundingCells = [];
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r < 0 || r >= gridRows ||
          c < 0 || c >= gridCols) continue;
        const cell = document.querySelector(
          `.cell[data-row='${r}'][data-col='${c}']`);
        surroundingCells.push(cell);
      }
    }
    return surroundingCells;
  }



  /* M7 游戏面板*/
  /* M7.1 创建显示未标记雷数的元素 */
  const remainingMinesDisplay = document.createElement('div');
  remainingMinesDisplay.id = 'remainingMines';
  remainingMinesDisplay.textContent = formatNumber(remainingMines);
  document.querySelector('.sweeperInfo').appendChild(remainingMinesDisplay);
  /* M7.2 创建重置按钮 */
  const resetButton = document.createElement('button');
  resetButton.id = 'resetButton';
  resetButton.textContent = 'RESET';
  document.querySelector('.sweeperInfo').appendChild(resetButton);
  // 添加重置按钮的点击事件
  resetButton.addEventListener('click', resetGame);

  /* M7.2重置游戏 */
  function resetGame() {
    // 重置网格
    grid.innerHTML = '';
    createBoard(gridRows, gridCols);

    // 重置雷、剩余雷数
    minePositions = [];
    remainingMines = mineNum;
    remainingMinesDisplay.textContent = formatNumber(remainingMines);

    // 重置计时器
    clearInterval(timerInterval);
    startTime = null;
    isTimerRunning = false;
    timerDisplay.textContent = '000';

    // 重置第一次点击标志
    isFirstClick = true;

    // 隐藏失败界面
    loseMessage.style.display = 'none';
    winMessage.style.display = 'none';

    // 重新绑定事件监听器
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
      cell.addEventListener('click',
        () => handleCellClick(cell));
      cell.addEventListener('contextmenu',
        (event) => handleRightClick(event, cell));
      cell.addEventListener('dblclick',
        () => handleDoubleClick(cell, minePositions));
    });
  }

  /* M7.3 计时器 */
  let startTime = Date.now(); // 记录游戏开始时间
  let timerInterval; // 计时器间隔
  let isTimerRunning = false; // 标记计时器是否正在运行

  // 创建计时器显示元素
  const timerDisplay = document.createElement('div');
  timerDisplay.id = 'timer';
  timerDisplay.textContent = '000';
  document.querySelector('.sweeperInfo').appendChild(timerDisplay);

  // 启动计时器
  function startTimer() {
    startTime = Date.now(); // 记录游戏开始时间
    timerInterval = setInterval(() => {
      const currentTime = Math.floor((Date.now() - startTime) / 1000);
      timerDisplay.textContent = formatNumber(currentTime);
    }, 1000);
  }

  /* M8 胜利条件判断 
      1.全部雷被标记为旗子
      2.非雷单元格全部被揭开*/
  function checkWinCondition() {
    const cells = document.querySelectorAll('.cell');
    let allNonMineCellsRevealed = true;
    let allMinesFlagged = true;

    cells.forEach(cell => {
      if (cell.dataset.mine === 'true') {
        if (!cell.classList.contains('flagged')) {
          allMinesFlagged = false;
        }
      } else {
        // 如果单元格不是雷，并且没有被揭开，则未胜利
        if (!cell.classList.contains('revealed')) {
          allNonMineCellsRevealed = false;
        }
      }
    });
    return allNonMineCellsRevealed || allMinesFlagged;
  }

  /* M9 难度切换 */
  const easyButton = document.getElementById('easyButton');
  const mediumButton = document.getElementById('mediumButton');
  const hardButton = document.getElementById('hardButton');
  easyButton.addEventListener('click',
    () => setMode('easy'));
  mediumButton.addEventListener('click',
    () => setMode('medium'));
  hardButton.addEventListener('click',
    () => setMode('hard'));

  /* M9.1 设置难度 */
  function setMode(mode) {
    currentMode = mode;
    [gridRows, gridCols, mineNum] =
      [modeSettings[currentMode].gridRows,
      modeSettings[currentMode].gridCols,
      modeSettings[currentMode].mineNum];
    resetGame();
  }

  /* M10 第一次点击不触雷*/
  function generateSafeMinePositions
    (clickedRow, clickedCol, gridRows, gridCols, mineNum) {
    const safePositions = [];
    // 将第一次点击的单元格及其周围的单元格标记为安全区域
    for (let r = clickedRow - 1; r <= clickedRow + 1; r++) {
      for (let c = clickedCol - 1; c <= clickedCol + 1; c++) {
        if (r >= 0 && r < gridRows && c >= 0 && c < gridCols) {
          safePositions.push(`${r}-${c}`);
        }
      }
    }
    // 生成地雷位置，确保不包含安全区域
    const minePositions = [];
    while (minePositions.length < mineNum) {
      const row = Math.floor(Math.random() * gridRows);
      const col = Math.floor(Math.random() * gridCols);
      const position = `${row}-${col}`;
      if (!minePositions.includes(position) &&
        !safePositions.includes(position)) {
        minePositions.push(position);
      }
    }

    return minePositions;
  }



  /* M11 失败事件  */
  const loseMessage = document.createElement('div');
  const viewBoardButton = document.createElement('button');
  function loseEvent() {
    loseMessage.id = 'loseMessage';
    loseMessage.textContent = 'Game Over!';
    loseMessage.style.display = 'block';
    document.body.appendChild(loseMessage);
    viewBoardButton.textContent = 'View Board';
    viewBoardButton.className = 'viewBoard';
    loseMessage.appendChild(viewBoardButton);

    viewBoardButton.addEventListener('click', () => {
      loseMessage.style.display = 'none';
      revealUnflaggedMines();
      revealWrongFlags();
      revealAllCells();
    });
    lockClickEvents();
    revealWrongFlags()
  }


  /* M11.1 显示所有单元格状态 */
  function revealAllCells() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
      const mineCount = parseInt(cell.dataset.mineCount);
      if (cell.classList.contains('revealed') ||
        cell.classList.contains('mine') ||
        cell.classList.contains('flagged') ||
        cell.classList.contains('wrong-flag')) return;
      else {
        cell.textContent = mineCount > 0 ? mineCount : '';
        cell.classList.add('revealed');
      }
    });
  }

  /* M12 优化界面*/
  /* M12.1 数字格式化*/
  function formatNumber(num) {
    return num.toString().padStart(3, '0');
  }



})