document.addEventListener('DOMContentLoaded', () => {
  /* 网格初步建立 */
  const board = document.getElementById('board');
  function createBoard(rows, cols) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        board.appendChild(cell);
      }
    }
  }
  createBoard(9,9);
  console.log("createboard");
})
/*function main() {
  console.log("main")
  createBoard(9, 9)
  console.log("createboard")
}*/
