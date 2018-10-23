
$('<input type="button" value="Run AI" id="ai" style="margin-left:10px;" />' ).insertAfter($('#display-link')[0]);
let runningButton = $("#ai")[0];

runningButton.addEventListener("click", function() {
    runAI();
});

let cells = [];
let size = []; // [width, height]

function getCell(x, y) {
    let class_val = cells[x + size[0] * y].classList[1];
    class_val = class_val.replace("open","");
    class_val = class_val.replace("blank","-");
    return {
        value: class_val,
        element: cells[x+size[0]*y]
     };
}

function clickCell(x, y) {
    console.log(getCell(x,y).element)
    getCell(x,y).element.click();
}

function prepareAI() {
    size = [$("#game .bordertb").length/3, $("#game .borderlr").length/2];
    cells = $("#game .square");
    
    document.addEventListener("click",function(e){
        cells = $("#game .square"); 
    });
    
    
}

function runAI() {
    clickCell(0,0);
}

prepareAI();