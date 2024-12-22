document.addEventListener('DOMContentLoaded', () => {
  /* M0 网格参数定义 */
  let [gridRows, gridCols, mineNum] = [9, 9, 10];

  /* M1 网格初步建立 */
  const grid = document.getElementById('grid');
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
  createBoard(gridRows, gridCols);
  console.log("createboard");

  /* M2 随机生成不同位置的雷*/
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
  //let minePositions = minePosition(gridRows, gridCols, mineNum);
  let minePositions = ['0-4', '2-2', '7-4', '6-1', '3-6', '6-5', '8-5', '1-5', '1-3', '1-0']
  console.log(minePositions);

  /* M2 放置雷 */
  function placeMines(minePositions) {
    minePositions.forEach(position => {
      const [mineRow, mineCol] = position.split('-');
      const cell = document.querySelector(`.cell[data-row='${mineRow}'][data-col='${mineCol}']`);
      cell.dataset.mine = true; // 标记为雷
    });
  }
  placeMines(minePositions)
  console.log("placeMines");

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
  placeCSM(gridRows, gridCols)
  console.log("placeCSM");

  /* M4 左键单击事件 */
  const cells = document.querySelectorAll('.cell');
  function handleCellClick(cell) {
    const row = parseInt(cell.dataset.row);//字符串换为整数
    const col = parseInt(cell.dataset.col);

    if (cell.classList.contains('revealed')) return; // 如果已经显示，跳过
    if (cell.dataset.mine) {
      // 如果点击的是雷，游戏结束
      alert('Game Over!');
      revealAllMines();
      lockClickEvents(); // 锁定点击事件
    } else {
      // 如果点击的不是雷，显示周围的雷数
      const mineCount = cell.dataset.mineCount;
      cell.textContent = mineCount > 0 ? mineCount : '';
      cell.classList.add('revealed');

      // 如果周围没有雷，自动展开周围的空白区域
      if (mineCount === '0') {
        revealEmptyCells(row, col);
      }
    }
  }
  cells.forEach(cell => {
    cell.addEventListener('click', () => handleCellClick(cell));
  });

  /* M4.0 锁定事件  */
  function lockClickEvents() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
      cell.classList.add('lockclick');
    })
  }

  /* M4.0 胜利事件  */
  function winEvent(cells) {////////
    alert('Win!');
    cells.forEach(cell => {
      const revealCells = document.querySelectorAll('.cell.revealed');
      const mineCells = document.querySelectorAll('.cell.dataset.mine');
    });
  }

  /* M4.1 显示所有雷 */
  function revealAllMines() {
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
        if (!cell.classList.contains('revealed') && !cell.dataset.mine) {
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





})




/*function main() {
  console.log("main")
  createBoard(9, 9)
  console.log("createboard")
}*/
