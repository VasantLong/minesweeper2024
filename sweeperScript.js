document.addEventListener('DOMContentLoaded', () => {
  /* M0 网格参数定义 
  let [gridRows, gridCols, mineNum] = [9, 9, 10];
  let remainingMines = mineNum; // 初始化未标记雷数为总雷数*/
  // 定义不同难度配置
  const difficultySettings = {
    easy: { gridRows: 9, gridCols: 9, mineNum: 10 },
    medium: { gridRows: 16, gridCols: 16, mineNum: 40 },
    hard: { gridRows: 16, gridCols: 30, mineNum: 99 }
  };

  // 初始难度设置为简单
  let currentDifficulty = 'easy';
  let [gridRows, gridCols, mineNum] = [difficultySettings[currentDifficulty].gridRows, difficultySettings[currentDifficulty].gridCols, difficultySettings[currentDifficulty].mineNum];
  let remainingMines = mineNum; // 初始化未标记雷数为总雷数


  createBoard(gridRows, gridCols);

  let minePositions = minePosition(gridRows, gridCols, mineNum);
  //let minePositions = ['0-4', '2-2', '7-4', '6-1', '3-6', '6-5', '8-5', '1-5', '1-3', '1-0']
  console.log(minePositions);
  placeMines(minePositions);

  placeCSM(gridRows, gridCols);

  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    cell.addEventListener('click', () => handleCellClick(cell, minePositions));
    cell.addEventListener('contextmenu', (event) => handleRightClick(event, cell));
    cell.addEventListener('dblclick', () => handleDoubleClick(cell, minePositions));
  });




  /* M1 网格初步建立 */
  function createBoard(rows, cols) {
    for (let r = 0; r < rows; r++) {
      let tr = document.createElement('tr');
      grid.appendChild(tr);
      for (let c = 0; c < cols; c++) {
        let td = document.createElement('td');
        tr.appendChild(td);
        let cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        //cell.dataset.mine = false;
        //cell.dataset.mineCount = '';//有点逻辑重复 mine和mineCount有互斥关系疑似
        td.append(cell);
      }
    }
  }


  /* M2.1 随机生成不同位置的雷*/
  function minePosition(rows, cols, mines) {
    const minePositions = [];
    while (minePositions.length < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      const position = `${row}-${col}`;
      if (!minePositions.includes(position)) {
        minePositions.push(position);
      }
    }
    return minePositions;
  }


  /* M2.2 放置雷 */
  function placeMines(minePositions) {
    minePositions.forEach(position => {
      const [mineRow, mineCol] = position.split('-');
      const cell = document.querySelector(`.cell[data-row='${mineRow}'][data-col='${mineCol}']`);
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
        const surroundingCell = document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
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
        const cell = document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
        //console.log(cell)
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

  function handleCellClick(cell, minePositions) {
    if (!isTimerRunning) {
      // 如果计时器未运行，启动计时器
      startTimer();
      isTimerRunning = true; // 标记计时器正在运行
    }
    const row = parseInt(cell.dataset.row);//字符串换为整数
    const col = parseInt(cell.dataset.col);
    // 如果已经显示/被标记旗子，跳过
    if (cell.classList.contains('revealed') ||
      cell.classList.contains('flagged')) return;
    // 如果点击的是雷，游戏结束
    if (cell.dataset.mine &&
      !cell.classList.contains('flagged')) {
      alert('Game Over!');
      revealAllMines(minePositions);
      lockClickEvents(); // 锁定点击事件
    } else {// 如果点击的不是雷，显示周围的雷数
      const mineCount = cell.dataset.mineCount;
      cell.textContent = mineCount > 0 ? mineCount : '';
      cell.classList.add('revealed');
      if (mineCount === '0') {// 如果周围没有雷，自动展开周围的空白区域
        revealEmptyCells(row, col);
      }
      // 检查是否胜利
      if (checkWinCondition()) {
        winEvent();
      }
    }
  }

  /* M4.0 锁定事件  */
  function lockClickEvents() {
    clearInterval(timerInterval); // 停止计时器
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
      cell.classList.add('lockclick');
    });
  }

  /* M4.0 胜利事件  */
  function winEvent() {
    alert('Win!');
    lockClickEvents(); // 锁定点击事件
  }

  /* M4.1 显示所有雷 */
  function revealAllMines(minePositions) {
    console.log(minePositions)
    minePositions.forEach(position => {
      const [row, col] = position.split('-');
      const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
      cell.textContent = '💣';
      cell.classList.add('mine');
    });
  }
  /* M4.2 自动展开空白区域 */
  function revealEmptyCells(row, col) {
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r < 0 || r >= gridRows || c < 0 || c >= gridCols) continue; // 跳过越界的单元格

        const cell = document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
        if (!cell.classList.contains('revealed') &&
          !cell.dataset.mine &&
          !cell.classList.contains('flagged')) {
          cell.classList.add('revealed');
          if (cell.dataset.mineCount === '0') {
            revealEmptyCells(r, c);
          }
          if (cell.dataset.mineCount !== '0') {
            cell.textContent = cell.dataset.mineCount;
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
      isTimerRunning = true; // 标记计时器正在运行
    }
    event.preventDefault(); // 阻止默认的右键菜单
    if (cell.classList.contains('revealed')) return; // 如果已经显示，跳过

    if (cell.textContent === '🚩') {// 取消标记旗子
      cell.textContent = '';
      cell.classList.remove('flagged');
      remainingMines = Math.min(remainingMines + 1, mineNum); // 确保不超过 mineNum
    } else {
      // 检查当前标记的旗子数量是否已经达到或超过 mineNum
      const flaggedCells = document.querySelectorAll('.cell.flagged');
      if (flaggedCells.length >= mineNum) return;// 如果已经达到或超过 mineNum，禁止标记
      // 标记为旗子
      cell.textContent = '🚩';
      cell.classList.add('flagged');
      remainingMines = Math.max(remainingMines - 1, 0); // 确保不小于 0
    }
    // 更新剩余雷数的显示
    remainingMinesDisplay.textContent = `${remainingMines}`;
    // 检查是否胜利
    if (checkWinCondition()) {
      winEvent();
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
        const flaggedCount = surroundingCells.filter(cell => cell.classList.contains('flagged')).length;
        const mineCount = parseInt(cell.dataset.mineCount);
        if (flaggedCount === mineCount) {
          // 如果标记的旗子数量与实际雷数匹配，清除周围未标记的单元格
          surroundingCells.forEach(cell => {
            if (!cell.classList.contains('flagged') &&
              !cell.classList.contains('revealed')) {
              handleCellClick(cell, minePositions); // 调用左键单击处理函数
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
        if (r < 0 || r >= gridRows || c < 0 || c >= gridCols) continue; // 跳过越界的单元格
        const cell = document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
        surroundingCells.push(cell);
      }
    }
    return surroundingCells;
  }



  /* M7 游戏面板*/
  /* M7.1 创建显示未标记雷数的元素 */
  const remainingMinesDisplay = document.createElement('div');
  remainingMinesDisplay.id = 'remainingMines';
  remainingMinesDisplay.textContent = `${remainingMines}`;
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
    // 清空网格
    grid.innerHTML = '';

    // 重新生成网格和雷
    createBoard(gridRows, gridCols);
    //let minePositions = ['0-1', '2-2', '7-7', '6-6', '3-3', '5-5', '8-8', '1-1', '2-2', '1-0']
    minePositions = minePosition(gridRows, gridCols, mineNum);
    placeMines(minePositions);
    placeCSM(gridRows, gridCols);
    console.log(grid)
    console.log(minePositions)

    // 重置剩余雷数
    remainingMines = mineNum;
    remainingMinesDisplay.textContent = `${remainingMines}`;

    // 重置计时器
    clearInterval(timerInterval);
    startTime = null;
    isTimerRunning = false;
    timerDisplay.textContent = '0';

    // 重新绑定事件监听器
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
      cell.addEventListener('click', () => handleCellClick(cell, minePositions));
      cell.addEventListener('contextmenu', (event) => handleRightClick(event, cell));
      cell.addEventListener('dblclick', () => handleDoubleClick(cell, minePositions));
    });
  }

  /* M7.3 计时器 */
  let startTime = Date.now(); // 记录游戏开始时间
  let timerInterval; // 计时器间隔
  let isTimerRunning = false; // 标记计时器是否正在运行

  // 创建计时器显示元素
  const timerDisplay = document.createElement('div');
  timerDisplay.id = 'timer';
  timerDisplay.textContent = '0';
  document.querySelector('.sweeperInfo').appendChild(timerDisplay);

  // 启动计时器
  function startTimer() {
    startTime = Date.now(); // 记录游戏开始时间
    timerInterval = setInterval(() => {
      const currentTime = Math.floor((Date.now() - startTime) / 1000);
      timerDisplay.textContent = `${currentTime}`;
    }, 1000);
  }

  /* M8 胜利条件判断 */
  function checkWinCondition() {
    const cells = document.querySelectorAll('.cell');
    let allNonMineCellsRevealed = true;
    let allMinesFlagged = true;

    cells.forEach(cell => {
      if (cell.dataset.mine === 'true' && !cell.classList.contains('flagged')) {
        allMinesFlagged = false;
      }
      if (cell.dataset.mine !== 'true' && !cell.classList.contains('revealed')) {
        allNonMineCellsRevealed = false;
      }
    });

    return allNonMineCellsRevealed || allMinesFlagged;
  }

  /* M9 难度切换 */
  // 获取难度选择按钮
  const easyButton = document.getElementById('easyButton');
  const mediumButton = document.getElementById('mediumButton');
  const hardButton = document.getElementById('hardButton');

  // 为难度选择按钮添加点击事件
  easyButton.addEventListener('click', () => setDifficulty('easy'));
  mediumButton.addEventListener('click', () => setDifficulty('medium'));
  hardButton.addEventListener('click', () => setDifficulty('hard'));

  // 设置难度
  function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    [gridRows, gridCols, mineNum] = [difficultySettings[currentDifficulty].gridRows, difficultySettings[currentDifficulty].gridCols, difficultySettings[currentDifficulty].mineNum];
    resetGame();
  }



})