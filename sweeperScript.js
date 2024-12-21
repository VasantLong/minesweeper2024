document.addEventListener('DOMContentLoaded', () => {
  /* 网格初步建立 */
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
  createBoard(9, 9);
  console.log("createboard");

  /* 随机布雷 */
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
  let minePositions = minePosition(9, 9, 10);
  console.log(minePositions);

  // 在网格中放置雷
  function placeMines(minePositions) {
    minePositions.forEach(position => {
      const [row, col] = position.split('-');
      const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
      cell.classList.add('mine'); // 添加雷的样式
      cell.textContent = '💣'; // 显示雷的图标
    });
  }
  placeMines(minePositions)
  console.log("placeMines");
})




/*function main() {
  console.log("main")
  createBoard(9, 9)
  console.log("createboard")
}*/
