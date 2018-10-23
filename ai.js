
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
        element: $("#"+(x+1)+"_"+(y+1)),
        id: "#"+(x+1)+"_"+(y+1)
     };
}

function clickCell(x, y, button) {
    let element = getCell(x,y).element.get(0);
    element.dispatchEvent(new MouseEvent("mousedown", {'view':window, 'bubbles':true, 'cancelable':true, 'button':button}));
    element.dispatchEvent(new MouseEvent("mouseup", {'view':window, 'bubbles':true, 'cancelable':true, 'button':button}));
}

function prepareAI() {
    size = [$("#game .bordertb").length/3, $("#game .borderlr").length/2];
    cells = $("#game .square"); 
    
    document.addEventListener("click",function(e){
        cells = $("#game .square"); 
    });
    
    
}

function runAI() {
   console.log(clickCell(2,2,0))
}

prepareAI();