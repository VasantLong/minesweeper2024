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
  function minePosition() {
    let el = document.querySelector("#board > #grid");
    console.log(el);

  }
  minePosition()
})




/*function main() {
  console.log("main")
  createBoard(9, 9)
  console.log("createboard")
}*/
