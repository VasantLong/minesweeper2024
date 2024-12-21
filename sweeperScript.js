document.addEventListener('DOMContentLoaded', () => {
  /* M0 网格参数定义 */
  let [gridRows, gridCols] = [9, 9];

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
  //let minePositions = minePosition(9, 9, 10);
  let minePositions = ['0-4', '2-2', '7-4', '6-1', '3-6', '6-5', '8-5', '1-5', '1-3', '1-0']
  console.log(minePositions);

  /* M2 放置雷 */
  function placeMines(minePositions) {
    minePositions.forEach(position => {
      const [mineRow, mineCol] = position.split('-');
      const cell = document.querySelector(`.cell[data-row='${mineRow}'][data-col='${mineCol}']`);
      cell.classList.add('mine'); // 添加雷的样式
      cell.textContent = '💣'; // 显示雷的图标
    });
  }
  placeMines(minePositions)
  console.log("placeMines");

  /* M3 周边雷计数 */
  function countSurroundingMines(row, col, minePositions) {
    let count = 0;
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r === row && c === col) continue; // 跳过当前单元格
        if (r < 0 || r >= gridRows || c < 0 || c >= gridCols) continue; // 跳过越界的单元格
        const position = `${r}-${c}`;
        if (minePositions.includes(position)) {
          count++;
        }
      }
    }
    return count;
  }

  /* M3 放置雷计数 */
  function placeCSM(gridRows, gridCols){
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const cell = document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
        if (!cell.classList.contains('mine')) {
          const mineCount = countSurroundingMines(r, c, minePositions);
          if (mineCount > 0) {
            cell.textContent = mineCount; // 显示雷数
            cell.classList.add('revealed'); // 添加已显示的样式
          }
        }
      }
    }
  }
  placeCSM(gridRows, gridCols)
  console.log("placeCountSurroundingMines");









})




/*function main() {
  console.log("main")
  createBoard(9, 9)
  console.log("createboard")
}*/
