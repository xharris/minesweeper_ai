
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
        id: "#"+(x+1)+"_"+(y+1)
     };
}

function clickCell(x, y) {
    console.log($(getCell(x,y).id))
    $(getCell(x,y).id).click();
    let el_position = $(getCell(x,y).id).position();
    console.log(el_position.left, el_position.top)
    $(document.elementFromPoint(el_position.left, el_position.top)).click();
}

function prepareAI() {
    size = [$("#game .bordertb").length/3, $("#game .borderlr").length/2];
    cells = $("#game .square"); 
    
    document.addEventListener("click",function(e){
        cells = $("#game .square"); 
    });
    
    
}

function runAI() {
    clickCell(2,2);
}

prepareAI();