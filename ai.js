var PROBABILITY_THRESHOLD = 50;
var size = []; // [width, height]

function isGameOver() {
    let el_face = document.getElementById("face");
    if (el_face.classList.contains("facesmile"))
        return false;
    return true;
}

function getCellFromId(id) {
    let position = id.replace("#","").split('_');
    position = [parseInt(position[1])-1, parseInt(position[0])-1];
    return getCell(position[0], position[1]);
}

function getCell(x, y) {
    let index = x + size[0] * y
    if (x < 0 || y < 0 || y > size[0] || x > size[1] || index < 0 || index >= cells.length || !cells[index])
        return;

    let class_val = cells[index].classList[1];

    if (class_val.includes("blank")) class_val = -2;
    else if (class_val.includes("bombflagged")) class_val = -1;
    else class_val = parseInt(class_val.replace("open",""));

    return {
        value: class_val, // -2 : unclicked, -1 : flagged, 0 : no number, 1 - 8 : number
        element: $("#"+(y+1)+"_"+(x+1)),
        id: "#"+(y+1)+"_"+(x+1),
        position: [x, y]
     };
}

function clickCell(x, y, button) {
    let element;
    if (button === undefined) {
        let cell = getCellFromId(x)
        if (cell) 
            element = cell.element.get(0);
        button = y;
    } else {
        element = getCell(x,y).element.get(0);
    }

    if (element) {
        element.dispatchEvent(new MouseEvent("mousedown", {'view':window, 'bubbles':true, 'cancelable':true, 'button':button}));
        element.dispatchEvent(new MouseEvent("mouseup", {'view':window, 'bubbles':true, 'cancelable':true, 'button':button}));
    } 
    scanBoard();
}

var cells = [];
var border_cells = [];
var mines_left = 0;
var open_cells = {};    // { cell_id : [border_cells indexes] }
function scanBoard() {
    cells = $("#game .square"); 
    border_cells = [];
    open_cells = {};

    // find border cells
    let _open_cells = $(".square.open1, .square.open2, .square.open3, .square.open4");

    _open_cells.each(function(i, e){
        // check all neighboring cells
        let open_cell = getCellFromId(e.id);

        if (open_cell) {
            for (let offx = -1; offx <= 1; offx++) {
                for (let offy = -1; offy <= 1; offy++) {
                    let cell = getCell(open_cell.position[0]+offx, open_cell.position[1]+offy);

                    // add untouched cell to collection
                    if (cell && cell.value <= -1) {
                        if (!(open_cell.id in open_cells))
                            open_cells[open_cell.id] = [];

                        let el_index = border_cells.findIndex((element) => element == cell.id);
                        if (el_index < 0) {
                            border_cells.push(cell.id);
                            el_index = border_cells.length - 1;
                        }
                        if (!open_cells[open_cell.id].includes(el_index))
                            open_cells[open_cell.id].push(el_index);

                        let b_cell = getCellFromId(border_cells[el_index])
                        //b_cell.element.html(el_index);
                        b_cell.element.addClass("suspect")
                    }
                }
            }
        }
    });
}

function prepareAI() {
    iterations = 0;
    size = [$("#game .bordertb").length/3, $("#game .borderlr").length/2];
    scanBoard();
}

// returns true if it can't make a good choice
let min_count = [];
function showProbabilities() {
    scanBoard();

    let probabilities = {};
    let safe_border_cells = [];
    let no_zero = false;
    let max = 0;

    // iterate cells with a number in it
    for (let cell_id in open_cells) {
        let open_cell = getCellFromId(cell_id);
        let open_cell_value = open_cell.value;

        // decrement value if there are flags nearby
        for (let b = 0; b < open_cells[cell_id].length; b++) {
            let border_cell = getCellFromId(border_cells[open_cells[cell_id][b]]);

            if (border_cell.value == -1)
                open_cell_value--;

            if (open_cell_value <= 0)
                safe_border_cells.push(border_cell.id);
        }

        // iterate cells that are adjacent to the open cell
        for (let b = 0; b < open_cells[cell_id].length; b++) {
            let border_cell = getCellFromId(border_cells[open_cells[cell_id][b]]);

            // is this an unclicked cell
            if (border_cell.value == -2) {
                if (!probabilities[border_cell.id]) probabilities[border_cell.id] = 0;

                // this cell is marked safe, skip it
                if (safe_border_cells.includes(border_cell.id)) {
                    probabilities[border_cell.id] = 0;
                    continue;
                }

                probabilities[border_cell.id] += open_cell_value;

                if (probabilities[border_cell.id] > 0) no_zero = true;
                if (probabilities[border_cell.id] > max) max = probabilities[border_cell.id];
            }
        }
    }

    // print probabilities
    console.log("-- probabilties (chance of having a mine) --");
    let min = 101, min_id = '';
    min_count = [];
    for (let id in probabilities) {
        probabilities[id] = Math.floor(probabilities[id] / max * 100);
        if (probabilities[id] < min) {
            min = probabilities[id];
            min_id = id;
            min_count = [id];
        }
        // is this probability the same as the previous min?
        if (probabilities[id] == min && !min_count.includes(id)) {
            min_count.push(id);
        }
        console.log(`${id}: ${probabilities[id]}%`);
    }
    console.log(`-- min probabilty cell ids (${min}%) --`);
    console.log(min_count.join(', '))


    // minimum probability not low enoug. make the user choose one :)
    if (min >= PROBABILITY_THRESHOLD) {

        console.log("[!!] This is a tough choice. Click a gray cell. [!!]");
        for (let id of min_count) {
            let el_cell = getCellFromId(id).element.get(0);
            el_cell.classList.add("highlight");
            // no_zero = false;
        }
    } else {

        // click all of the least potential cells
        for (let id in probabilities) {
            if (probabilities[id] <= PROBABILITY_THRESHOLD) {
                clickCell(id, 0);
                no_zero = true;
            }
        }
    }

    return no_zero;
}

// returns whether game is over
let last_mine_matrix = "";
function calculateMove() {
    console.log("calling calculate move");
    scanBoard();

    let mine_matrix = [];
    // fill 'mine_matrix'
    for (let cell_id in open_cells) {
        let b_cell_indexes = open_cells[cell_id];
        let new_array = [];
        new_array.length = border_cells.length + 1;
        new_array.fill(0.0);

        for (let b = 0; b < b_cell_indexes.length; b++) {
            let b_cell_index = b_cell_indexes[b];
            let b_cell = getCellFromId(border_cells[b_cell_index]);

            let val = b_cell.value;

            if (val == -2) val = 1;
            if (val > 0) val = 1;
            new_array[b_cell_index] = val;
        }
        new_array[new_array.length - 1] = getCellFromId(cell_id).value
        mine_matrix.push(new_array);
    }

    // gaussian elimination
    // console.log(JSON.stringify(mine_matrix))
    let columns = mine_matrix[0].length;
    mine_matrix = gauss(mine_matrix);


/*
Set the maximum bound and minimum bound to zero
For each column in the row (not including the augmented column of course) if the number is positive add it to the maximum bound and if it is negative then add it to the minimum bound.
If the augmented column value is equal to the minimum bound then
   All of the negative numbers in that row are mines and all of the positive values in that row are not mines
else if the augmented column value is equal to the maximum bound then
   All of the negative numbers in that row are not mines and all of the positive values in that row are mines.
*/
    let mine_indexes = [];
    function suspectMines (row, sign) {
        for (let m = 0; m < columns - 1; m++) {
            if (mine_matrix[row][m] * sign > 0 && !mine_indexes.includes(m)) {
                mine_indexes.push(m);
            }
        }
    }

    // attempt to get a full/partial solution
    for (let y = 0; y < mine_matrix.length; y++) {
        let min_bound = 0, max_bound = 0;
        for (let x = 0; x < columns - 1; x++) {
            if (mine_matrix[y][x] < 0)
                min_bound += mine_matrix[y][x];
            else
                max_bound += mine_matrix[y][x];
        }
        // console.log("min",min_bound,"max",max_bound,"row",mine_matrix[y])

        // aug column == MIN bound -> NEG numbers are mines
        if (mine_matrix[y][columns -1] == min_bound) {
            suspectMines(y, -1);
        }

        // aug column == MAX bound -> POS numbers are mines
        if (mine_matrix[y][columns -1] == max_bound) {
            suspectMines(y, 1);
        }
    }

    // 
 
    // label the suspected spaces
    for (let s = 0; s < mine_indexes.length; s++) {
        let cell = getCellFromId(border_cells[mine_indexes[s]]); 
        clickCell(cell.position[0], cell.position[1], 2);
        return !isGameOver();
    }

    // reveal cells that are guaranteed to be safe (Ex. a cell with a '1' that has 1 nearby flag is correct. reveal all the other cells around it)
    let safe_count = 0;
    for (let cell_id in open_cells) {
        let open_cell = getCellFromId(cell_id);
        let open_cell_value = open_cell.value;
        let safe = false;

        // look at surrounding cells
        for (let b = 0; b < open_cells[cell_id].length; b++) {
            let border_cell = getCellFromId(border_cells[open_cells[cell_id][b]]);

            if (border_cell.value == -1) {
                open_cell_value--;
            }

            // this group of cells is safe
            if (open_cell_value <= 0) {
                safe = true;
                break;
            }
        }

        // reveal all other cells
        if (safe) {
            for (let b = 0; b < open_cells[cell_id].length; b++) {
                safe_count++;
                clickCell(border_cells[open_cells[cell_id][b]], 0);
            }
        }
    }
    console.log(`Revealing ${safe_count} safe cells...`)

    if (JSON.stringify(mine_matrix) != last_mine_matrix) {
        last_mine_matrix = JSON.stringify(mine_matrix);
        console.log("suspecting",mine_indexes.length,"mines...")
        return calculateMove();
    } else if (!isGameOver()) {
        console.log("flagged",mine_indexes.length,"mines.")
        mine_matrix = "";
        return showProbabilities();
    }
}

let iterations = 0;
let max_moves = 150;
function runAI() {
    if (iterations == 0) clickCell(0,0,0);

    // clear any red cells
    for (let id of min_count) {
        el_cell = getCellFromId(id);
        if (el_cell.element)
            el_cell.element.get(0).classList.remove('highlight');
    }

    while (calculateMove() && iterations < max_moves) {
        iterations++;
        console.log("continue")
    }
}

// "Run AI" button
$('<input type="button" value="Run AI" id="ai" style="margin-left:10px;" /><div id="hovered-cell">...</div>' ).insertAfter($('#display-link')[0]);

$("#ai").on("click", function() {
    prepareAI();
    runAI();
});

$(document).ready(function(){
    $("#game .square").mouseover(function(e){
        $("#hovered-cell").html(e.target.id);
    }).click(function(e){
        prepareAI();
        runAI();
    });
});