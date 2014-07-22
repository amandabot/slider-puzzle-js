//Initial settings
var sliderPuzzle = {
    numberOfRows: 4,
    numberOfColumns: 4,
    numberOfTiles: 16,
    numberOfMoves: 0,
    isSolved: false,
    isFirstClick: true,
    elapsedSeconds: 0,
    gameboard: [],
    timer: {},
    directions: {
        up: {
            column: 0,
            row: -1
        },
        down: {
            column: 0,
            row: 1
        },
        left: {
            column: -1,
            row: 0
        },
        right: {
            column: 1,
            row: 0
        }
    }
};

createGUI(sliderPuzzle);
startNewGame(sliderPuzzle);

//Classes
function Tile(value, row, column) {
    this.value = value;
    this.column = column;
    this.row = row;
    this.element = {};
}

//GUI
function createGUI(sliderPuzzle) {
    var newDiv,
        tile,
        button,
        gameboard = document.getElementById('gameboard');

    for (var index = 1; index < sliderPuzzle.numberOfTiles + 1; index += 1) {
            newDiv = document.createElement('div');
            newDiv.setAttribute('class', 'puzzleTile');

            newDiv.innerHTML = index;

            newDiv.addEventListener('click', function() {
                //the + converts the innerHTML to an int
                pieceClicked(+this.innerHTML, sliderPuzzle);
            });

            gameboard.appendChild(newDiv);
    }
    newDiv = gameboard.childNodes[sliderPuzzle.numberOfTiles - 1];
    newDiv.removeAttribute('class');
    newDiv.setAttribute('id', 'emptyTile');
    
    button = document
        .getElementById('controlPanel')
        .getElementsByTagName('button')[0];
    button.addEventListener('click', function() {
        startNewGame(sliderPuzzle);
    });
}

function updateGUITime(sliderPuzzle) {
    var time = secondsToTime(sliderPuzzle.elapsedSeconds);

    document
        .getElementById('scoreboard')
        .getElementsByTagName('span')[1]
        .innerHTML = 'Time: ' + ('0' + time.m).slice(-2) + ':' + ('0' + time.s).slice(-2);
}

function updateGUINumberOfMoves(sliderPuzzle) {
        document
        .getElementById('scoreboard')
        .getElementsByTagName('span')[0]
        .innerHTML = 'Number of moves: ' + sliderPuzzle.numberOfMoves;
}

function secondsToTime(secs) {
    secs = Math.round(secs);
    var hours = Math.floor(secs / (60 * 60));

    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);

    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);

    var obj = {
        'h': hours,
        'm': minutes,
        's': seconds
    };
    return obj;
}

//Game Logic
function startNewGame(sliderPuzzle) {
    
    clearTimeout(sliderPuzzle.timer);
    sliderPuzzle.elapsedSeconds = 0;
    updateGUITime(sliderPuzzle);
    sliderPuzzle.numberOfMoves = 0;
    updateGUINumberOfMoves(sliderPuzzle);
    sliderPuzzle.isFirstClick = true;
    sliderPuzzle.isSolved = false;
    
    createGameBoard(sliderPuzzle);
    
    var currentDiv,
        tile,
        tiles = document.getElementById('gameboard').childNodes;

    for (var row = 0; row < sliderPuzzle.numberOfRows; row += 1) {
        for (var column = 0; column < sliderPuzzle.numberOfColumns; column += 1) {
            
            currentDiv = tiles[sliderPuzzle.numberOfRows * row + column];
            currentDiv.setAttribute('class', 'puzzleTile');
            currentDiv.removeAttribute('id');

            tile = sliderPuzzle.gameboard[row][column];
            currentDiv.innerHTML = tile.value;

            tile.element = currentDiv;
        }
    }
    currentDiv = gameboard.childNodes[sliderPuzzle.numberOfTiles - 1];
    currentDiv.removeAttribute('class');
    currentDiv.setAttribute('id', 'emptyTile');
}

function createGameBoard(sliderPuzzle) {
    var tileValues,
        numberOfTiles =
        sliderPuzzle.numberOfTiles = sliderPuzzle.numberOfRows * sliderPuzzle.numberOfColumns;

    tileValues = generateTileValues(numberOfTiles);

    if (!parityIsEven(tileValues)) {
        fixParity(tileValues);
    }
    addTilesToGameboard(tileValues, sliderPuzzle);
}

function generateTileValues(numberOfTiles) {
    var tileValues = [];

    for (var i = 1; i < numberOfTiles; i += 1) {
        tileValues.push(i);
    }
    tileValues = _.shuffle(tileValues);
    //This is the empty tile
    tileValues.push(numberOfTiles);
    return tileValues;
}

function parityIsEven(list) {
    var count = 0,
        currentValue;

    for (var i = 0; i < list.length; i += 1) {
        currentValue = list[i];
        for (var j = i + 1; j < list.length; j += 1) {
            if (list[j] < currentValue) {
                count += 1;
            }
        }
    }
    return count % 2 === 0;
}

function fixParity(list) {
    var temp = list[0];
    list[0] = list[1];
    list[1] = temp;
}

function addTilesToGameboard(tileValues, sliderPuzzle) {
    var currentTile;

    for (var row = 0; row < sliderPuzzle.numberOfRows; row += 1) {
        sliderPuzzle.gameboard[row] = [];
        for (var column = 0; column < sliderPuzzle.numberOfColumns; column += 1) {
            currentTile = new Tile(tileValues[sliderPuzzle.numberOfRows * row + column], row, column);
            sliderPuzzle.gameboard[row][column] = currentTile;
        }
    }
}

//Event Handling
function pieceClicked(value, sliderPuzzle) {
    if (!sliderPuzzle.isSolved) {
        if (sliderPuzzle.isFirstClick) {
            sliderPuzzle.timer = setTimeout(function() {
                incrementTime(sliderPuzzle);
            }, 1000);
            sliderPuzzle.isFirstClick = false;
        }
        moveSelectedPiece(value, sliderPuzzle);
    }
}

function moveSelectedPiece(value, sliderPuzzle) {
    var neighbors,
        selectedTile;

    //empty tile clicked
    if (value === sliderPuzzle.numberOfTiles) {
        return;
    }

    selectedTile = getTileByValue(value, sliderPuzzle);

    neighbors = getNeighborTiles(selectedTile, sliderPuzzle);
    for (var neighbor in neighbors) {
        if (neighbors[neighbor].value === sliderPuzzle.numberOfTiles) {
            swapPositionOfPieces(selectedTile, neighbors[neighbor], sliderPuzzle.gameboard);
            break;
        }
    }
    
    sliderPuzzle.numberOfMoves += 1;
    updateGUINumberOfMoves(sliderPuzzle);
    checkForWin(sliderPuzzle);
}

function getNeighborTiles(selectedTile, sliderPuzzle) {
    var neighbors = [],
        neighbor,
        neighborColumn,
        neighborRow;

    for (var direction in sliderPuzzle.directions) {
        neighborRow = selectedTile.row + sliderPuzzle.directions[direction].row;
        neighborColumn = selectedTile.column + sliderPuzzle.directions[direction].column;

        if (neighborColumn > -1 &&
            neighborColumn < sliderPuzzle.numberOfColumns &&
            neighborRow > -1 &&
            neighborRow < sliderPuzzle.numberOfRows)
        {
            neighbor = sliderPuzzle.gameboard[neighborRow][neighborColumn];
            neighbors.push(neighbor);
        }
    }
    return neighbors;
}

function getTileByValue(value, sliderPuzzle) {
    var tile;
    for (var row = 0; row < sliderPuzzle.numberOfRows; row += 1) {
        for (var column = 0; column < sliderPuzzle.numberOfColumns; column += 1) {

            tile = sliderPuzzle.gameboard[row][column];
            if (tile.value === value) {
                return tile;
            }
        }
    }
}

function swapPositionOfPieces(clickedTile, emptyTile, gameboard) {

    var tempValue = clickedTile.value;

    gameboard[clickedTile.row][clickedTile.column].value = emptyTile.value;
    gameboard[clickedTile.row][clickedTile.column].element.innerHTML = emptyTile.value;
    gameboard[clickedTile.row][clickedTile.column].element.removeAttribute('class');
    gameboard[clickedTile.row][clickedTile.column].element.setAttribute('id', 'emptyTile');

    gameboard[emptyTile.row][emptyTile.column].value = tempValue;
    gameboard[emptyTile.row][emptyTile.column].element.innerHTML = tempValue;
    gameboard[emptyTile.row][emptyTile.column].element.removeAttribute('id');
    gameboard[emptyTile.row][emptyTile.column].element.setAttribute('class', 'puzzleTile');
}

function incrementTime(sliderPuzzle) {
    sliderPuzzle.elapsedSeconds += 1;
    sliderPuzzle.timer = setTimeout(function() {
        incrementTime(sliderPuzzle);
    }, 1000);
    updateGUITime(sliderPuzzle);
}

function checkForWin(sliderPuzzle) {
    var counter = 1,
        lastTile;

    for (var row = 0; row < sliderPuzzle.numberOfRows; row += 1) {
        for (var column = 0; column < sliderPuzzle.numberOfColumns; column += 1) {
            if (sliderPuzzle.gameboard[row][column].value !== counter) {
                return false;
            }
            counter += 1;
        }
    }
    sliderPuzzle.isSolved = true;

    lastTile = sliderPuzzle.gameboard[sliderPuzzle.numberOfRows - 1][sliderPuzzle.numberOfColumns - 1];
    lastTile.element.removeAttribute('id');
    lastTile.element.setAttribute('class', 'puzzleTile');
    alert('You have solved the puzzle!');
    clearTimeout(sliderPuzzle.timer);
}