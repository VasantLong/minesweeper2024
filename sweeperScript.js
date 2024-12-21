document.addEventListener('DOMContentLoaded', () => {
  /* 网格初步建立 */
  const board = document.getElementById('board');
  const grid = document.getElementById('grid');
  function createBoard(rows, cols) {
    for (let r = 0; r < rows; r++) {
      const tr = document.createElement('tr');
      grid.appendChild(tr);
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement('td');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        tr.appendChild(cell);
      }
    }
  }
  createBoard(9, 9);
  console.log("createboard");
})




/*function main() {
  console.log("main")
  createBoard(9, 9)
  console.log("createboard")
}*/
