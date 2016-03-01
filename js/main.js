// Define Sudoku object
var Sudoku = function() {
  this.regionSize = 3;
  this.gridSize = 9;

  $('.collapse').collapse('show');

  this.ElapsedTime=0;
  this.grid = [];

  this.$messageBox = $('.js-show-message');
  this.$gridBox = $('#grid');
};

Sudoku.prototype.hasErrors = function() {
  return $('.sudoku td').hasClass('danger');
};

Sudoku.prototype.initGrid = function() {
  for (var i = 0; i < this.gridSize; i++) {
    this.grid[i] = new Array(this.gridSize);
    for (var j = 0; j < this.gridSize; j++) {
      this.grid[i][j] = undefined;
    }
  }
};

Sudoku.prototype.isAllowedRow = function(item, row) {
  for (var i = 0; i < this.gridSize; i++) {
    if (this.grid[row][i] == item) {
      return false;
    }
  }
  return true;
};

Sudoku.prototype.isAllowedCol = function(item, col) {

  for (var i = 0; i < this.gridSize; i++) {
    if (this.grid[i][col] == item) {
      return false;
    }
  }
  return true;
};

Sudoku.prototype.isAllowedRegion = function(item, x, y) {

  var xMin = (Math.floor(x/this.regionSize)) * this.regionSize;
  var xMax = xMin + this.regionSize;

  var yMin = (Math.floor(y/this.regionSize)) * this.regionSize;
  var yMax = yMin + this.regionSize;

  for (var i=xMin; i<xMax; i++) {
    for (var j=yMin; j<yMax; j++) {

      if (this.grid[i][j] === item) {
        return false;
      }
    }
  }
  return true;
};

/**
 * isAllowed function
 * @param  int  item
 * @param  int row
 * @param  int col
 * @return boolean
 */
Sudoku.prototype.isAllowed = function(item, row, col) {
  return !isNaN(item) && this.isAllowedRow(item, row) && this.isAllowedCol(item, col) && this.isAllowedRegion(item, row, col);
};

/**
* getGridTpl function
* @return string
*/
Sudoku.prototype.getGridTpl = function () {
  var tpl = [
    '<table class="table-hover table-bordered sudoku">'
  ];

  for (var i = 0; i < this.gridSize; i++) {

    tpl.push('<tr data-row="' + i + '">');

    for (var j = 0; j < this.gridSize; j++) {

      var isRowPeer = Math.ceil((i+1) / this.regionSize) % 2 === 0;
      var isCellPeer = Math.ceil((j+1) / this.regionSize) % 2 === 0;
      var colorClassName = (isRowPeer && isCellPeer) || (!isRowPeer && !isCellPeer) ? "colorised" : "";

      var gridXNum = Math.ceil((i+1)/this.regionSize);
      var gridYNum = Math.ceil((j+1)/this.regionSize);
      var gridNum = gridXNum+''+gridYNum;

      // TODO a decommenter
      var initializedClassName = '';
      // var currentvalue = '';

      // var initializedClassName = (undefined === this.grid[i][j]) ? '' : ' initialized';
      var currentvalue = (undefined === this.grid[i][j] ? '' : this.grid[i][j]);

      tpl.push(
        '<td data-row="'+i+'" data-col="'+j+'" '+' data-grid="'+gridNum+'" class="'+colorClassName+initializedClassName+' grid-'+ gridNum +' row-'+i+' col-'+j+'"'+'>',
          '<input type="text" data-row="' + i + '" data-col="' + j + '" data-grid="'+gridNum+'" class="grid-item" value="' + currentvalue + '">',
        '</td>'
      );

    }
    tpl.push('</tr>');
  }
  tpl.push('</table>');

  return tpl.join('');
};

/**
* Generates a grid
* @return false | void
*/
Sudoku.prototype.showGrid = function () {
  this.$gridBox.html(this.getGridTpl());
};

/**
 * Get current grid cell
 * @param  array grid
 * @param  int x
 * @param  int y
 * @return array [coords]
 */
Sudoku.prototype.getCurrentCell = function(x, y) {
  var done = false;
  var res = [-1, -1];

  while (!done) {
    if (x === this.gridSize) {
      done = true;
    } else {
      if (undefined === this.grid[x][y]) {
        res[0] = x;
        res[1] = y;
        done = true;
      } else {
        if (y < this.gridSize - 1) {
          y++;
        } else {
          x++;
          y = 0;
        }
      }
    }
  }

  return res;
};

/**
 * The backTracking recursive function
 * @param  array grid
 * @param  int row
 * @param  int col
 * @return boolean
 */
Sudoku.prototype.getBacktrackingSolution = function(row, col) {
  var cell = this.getCurrentCell(row, col);
  row = cell[0];
  col = cell[1];

  // base case: if no empty cell
  if (row == -1) {
    return true;
  }

  for (var num = 1; num <= this.gridSize; num++) {

    if (this.isAllowed(num, row, col)) {
      this.grid[row][col] = num;

      var currentTime = new Date();

      if (currentTime - this.ElapsedTime >= 10000) {
        this.showAlert('Too long. ' + (currentTime - this.ElapsedTime) + ' milliseconds !', 'danger');
        return false;
      }

      if (this.getBacktrackingSolution(row, col)) {
        return true;
      }

      // mark cell as empty
      this.grid[row][col] = undefined;
    }
  }

  // trigger backtracking
  return false;
};

Sudoku.prototype.getSolution = function() {

  this.ElapsedTime = new Date();

  if (this.getBacktrackingSolution(0, 0)) {
    var end = new Date();
    this.ElapsedTime = end - this.ElapsedTime;

    this.showAlert('Solved for ' + this.ElapsedTime + ' milliseconds !', 'success');
  }
  this.showGrid();
};

/**
* Shows alert box
* @param  string message   [the alert message]
* @param  string type    [type of the alert message]
* @return void
*/
Sudoku.prototype.showAlert = function (message, type) {
  this.$messageBox
    .addClass('alert-' + type)
    .text(message)
    .fadeIn('slow')
    .delay(3000)
    .fadeOut('slow');
};

Sudoku.prototype.hideAlert = function () {
  this.$messageBox
    .hide()
    .text('');
};


Sudoku.prototype.initGridEvents = function() {
  var self = this;

  $('.grid-item')
    .on('click', function() {
      var x = $(this).data('row');
      var y = $(this).data('col');
      var gridNum = $(this).data('grid');

      $('td').removeClass('selected');

      $('.row-'+ x).addClass('selected');
      $('.col-'+ y).addClass('selected');
      $('.grid-'+ gridNum).addClass('selected');
    })
    .change(function() {
      var x = $(this).data('row');
      var y = $(this).data('col');
      var value = $(this).val();

      if (self.isAllowed(value, x, y)) {
          $(this)
            .closest('td')
            .removeClass('danger')
            .addClass('initialized')
            ;
          self.grid[x][y] = value;
      } else {
        $(this).closest('td').addClass('danger');
      }
    });
};

Sudoku.prototype.initControlEvents = function() {
  var self = this;
  $('.js-input-size')
    .on('click', '.btn', function(e) {
      e.preventDefault();
      self.showGrid();
    })
    .on('submit', function(e) {
      e.preventDefault();
      self.showGrid();
    });

  $('.js-set-controls')
    .on('click', '.js-switch-mode', function(e) {
      e.preventDefault();
      $(this).toggleClass('active');
    })
    .on('click', '.js-empty-grid', function(e) {
      e.preventDefault();
      self.hideAlert();
      self.initFunctions();
      // self.initGrid();
      // self.showGrid();
      // self.initGridEvents();
    })
    .on('click', '.js-get-solution', function(e) {
      e.preventDefault();
      if (self.hasErrors()) {
        self.showAlert('La grille contient des erreurs.', 'danger');
      } else {
        self.getSolution();
      }
    });
};

Sudoku.prototype.initFunctions = function() {
  this.initGrid();
  this.showGrid();
  this.initGridEvents();
};

Sudoku.prototype.init = function() {
  this.initFunctions();
  this.initControlEvents();
};
(function() {

  var SudokuSolver = new Sudoku();
  SudokuSolver.init();
})();