let abs = Math.abs;

function gauss(A) {
    function getValue(r, c) { return A[r][c]; }

     // n => totalColumns
     let totalColumns = A[0].length;
     // m => totalRows
     let totalRows = A.length;

     // i => row
     let row = 0;
     // j => col
     let col = 0;
     while ((row < totalRows) && (col < totalColumns)) {
        let max_row = row;
        // k => currentRow
        // (*log) << "Current row: " << col << logging::endl;
        for (let currentRow = row + 1; currentRow < totalRows; ++currentRow) {
           if (abs(getValue(currentRow, col)) > abs(getValue(max_row, col))) {
              max_row = currentRow;
           }
        }
        
        if (getValue(max_row, col) != 0.0)
        {
           // Swap the rows around. Put it in its own scope to remove the temp
           // variable asap.
           if(row != max_row)
           {
              let temp = A[row]; 
              A[row] = A[max_row]; 
              A[max_row] = temp;
              // (*log) << "Swapped rows " << row << " and " << max_row << logging::endl;
           }

           let currentValue = getValue(row, col);
           A[row] = A[row].map((x) => x * (1.0 / currentValue));

           // u => iterRow
           for(let iterRow = row + 1; iterRow < totalRows; ++iterRow)
           {
              let mulVal = -getValue(iterRow, col);
              if(mulVal != 0.0)
              {
                 A[row] = A[row].map((x) => x * mulVal);
                 A[iterRow] = A[iterRow].map((x, i) => x + A[row][i]);
                 A[row] = A[row].map((x => x * (1.0 / mulVal)));
                 // (*log) << "Using row " << row << " to fix " << iterRow << logging::endl; 
                 // render();
              }
           }

           row++;
        }

        col++;
     }
     return A;
}

function sleep(miliseconds) {
   var currentTime = new Date().getTime();

   while (currentTime + miliseconds >= new Date().getTime()) {
   }
}