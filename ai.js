


var size = []; // [width, height]

function getCellFromId(id) {
    let position = id.replace("#","").split('_');
    position = [parseInt(position[1])-1, parseInt(position[0])-1];
    return getCell(position[0], position[1]);
}

function getCell(x, y) {
    let index = x + size[0] * y
    if (x < 0 || y < 0 || index < 0 || index >= cells.length)
        return;

    let class_val = cells[index].classList[1];
    class_val = parseInt(class_val.replace("open","").replace("blank","-1"));
    return {
        value: class_val, // -1 : unclicked, 0 : no number, 1 - 3 : number
        element: $("#"+(y+1)+"_"+(x+1)),
        id: "#"+(y+1)+"_"+(x+1),
        position: [x, y]
     };
}

function clickCell(x, y, button) {
    let element = getCell(x,y).element.get(0);
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

    // find border cells
    let _open_cells = $(".square.open1, .square.open2, .square.open3, .square.open4");

    _open_cells.each(function(i, e){
        // check all neighboring cells
        let open_cell = getCellFromId(e.id);

        for (let offx = -1; offx <= 1; offx++) {
            for (let offy = -1; offy <= 1; offy++) {
                let cell = getCell(open_cell.position[0]+offx, open_cell.position[1]+offy);

                // add untouched cell to collection and add the open cells value to it's 'potential'
                if (cell && cell.value == -1) {
                    if (!(open_cell.id in open_cells))
                        open_cells[open_cell.id] = [];

                    let el_index = border_cells.findIndex((element) => element.id == cell.id);
                    if (el_index < 0) {
                        border_cells.push(cell);
                        el_index = border_cells.length - 1;
                    }
                    if (!open_cells[open_cell.id].includes(el_index))
                        open_cells[open_cell.id].push(el_index);
                }
            }
        }
    });
}

function prepareAI() {
    size = [$("#game .bordertb").length/3, $("#game .borderlr").length/2];
    scanBoard();
    
}

/*
Set the maximum bound and minimum bound to zero
For each column in the row (not including the augmented column of course) if the number is positive add it to the maximum bound and if it is negative then add it to the minimum bound.
If the augmented column value is equal to the minimum bound then
   All of the negative numbers in that row are mines and all of the positive values in that row are not mines
else if the augmented column value is equal to the maximum bound then
   All of the negative numbers in that row are not mines and all of the positive values in that row are mines.
Finishing the Simple Example
*/

function makeMove() {
    let mine_matrix = [];
    let end_vals = [];
    for (let cell_id in open_cells) {
        let b_cell_indexes = open_cells[cell_id];
        let new_array = [];
        new_array.length = border_cells.length + 1;
        new_array.fill(0.0);

        for (let b = 0; b < b_cell_indexes.length; b++) {
            new_array[b_cell_indexes[b]] = 1.0;
        }
        new_array[new_array.length - 1] = getCellFromId(cell_id).value
        mine_matrix.push(new_array);
    }

    console.log(JSON.parse(JSON.stringify(mine_matrix)))
    let g_matrix = gauss(mine_matrix);
    console.log(g_matrix);

    let suspects = [];
    for (let r = 0; r < g_matrix.length; r++) {
        let last_index = -1;
        let changes = 0;
        for (let c = 0; c < g_matrix[r].length - 1; c++) {
            if (g_matrix[r][c] > 0) {
                last_index = c;
                changes++;
            }
        }

        if (changes == 1 && last_index != -1) {
            suspects.push(last_index);
        }
    }

    // label the suspected spaces
    for (let s = 0; s < suspects.length; s++) {
        let cell = border_cells[suspects[s]]; 
        clickCell(cell.position[0], cell.position[1], 2);
    }
}

function runAI() {
    clickCell(0,0,0);
    makeMove();
    
}

// "Run AI" button
$('<input type="button" value="Run AI" id="ai" style="margin-left:10px;" />' ).insertAfter($('#display-link')[0]);
$("#ai").on("click", function() {
    prepareAI();
    runAI();
});