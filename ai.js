
$('<input type="button" value="Run AI" id="ai" style="margin-left:10px;" />' ).insertAfter($('#display-link')[0]);
let runningButton = $("#ai")[0];

runningButton.addEventListener("click", function() {
    runAI();
});

let size = []; // [width, height]

function getCellFromId(id) {
    let position = id.split('_');
    position = [parseInt(position[1])-1, parseInt(position[0])-1];
    return getCell(position[0], position[1]);
}

function getCell(x, y) {
    let index = x + size[0] * y
    if (index < 0 || index >= cells.length)
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
}

let cells = [];
let border_cells = {};
let mines_left = 0;
function scanBoard() {
    cells = $("#game .square"); 
    border_cells = {};

    // find border cells
    let open_cells = $(".square.open1, .square.open2, .square.open3, .square.open4");

    open_cells.each(function(i, e){
        // check all neighboring cells
        let open_cell = getCellFromId(e.id);

        for (let offx = -1; offx <= 1; offx++) {
            for (let offy = -1; offy <= 1; offy++) {
                let cell = getCell(open_cell.position[0]+offx, open_cell.position[1]+offy);

                // add untouched cell to collection and add the open cells value to it's 'potential'
                if (cell && cell.value == -1) {
                    if (!(cell.id in border_cells)) {
                        border_cells[cell.id] = cell;
                        border_cells[cell.id].potential = [];
                        cell.element.addClass("has-potential");
                    }

                    if (!border_cells[cell.id].potential.includes(open_cell.value)) {
                        border_cells[cell.id].potential.push(open_cell.value);
                    }

                    // get a sum of all neighboring cells ignoring any repeating values
                    cell.element.html(border_cells[cell.id].potential.reduce((a, b) => a+b, 0))
                }
            }
        }
    });
}

function prepareAI() {
    size = [$("#game .bordertb").length/3, $("#game .borderlr").length/2];
    scanBoard();
    
    document.addEventListener("click",function(e){
        scanBoard();
    });
    
}

function makeMove() {
    clickCell(0,0,0);
}

function runAI() {
    makeMove();
}

prepareAI();