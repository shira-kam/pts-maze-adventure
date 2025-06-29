// CSV Grid Parser for Maze Game
// Parses Grid.csv to generate doors, paths, and watering hole arrays

const csvData = `→,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T
1,o,o,o,o,o,o,o,o,o,o,o,o,o,m,o,o,o,o,o,o
2,,o,,,,,,,,,,,,,,,o,,,o
3,,r,o,o,o,,o,,o,o,o,o,o,o,o,,o,,,
4,,,,,o,,o,,o,,,,,,o,,o,o,o,m
5,o,o,o,o,o,,o,o,m,,o,o,o,o,o,,,,,o
6,m,,,,,,,,o,,o,,,,,,,,,o
7,o,o,o,o,o,o,m,,o,,o,,o,o,o,o,o,o,o,o
8,,,,,,,o,,o,,m,,,,,,,,,o
9,,o,o,m,o,,o,,o,,o,o,o,o,o,o,o,o,o,o
10,,o,,,o,,o,,o,,,,,,,,,,,m
11,,o,,o,o,o,o,o,m,o,o,m,o,o,o,o,o,o,,o
12,,o,,,,,o,,o,,,,,,,,,o,,o
13,,o,o,o,o,o,o,,o,,,o,o,o,o,o,,o,,o
14,,,,,,,,,o,o,o,m,,,,m,,o,o,o
15,o,o,o,o,o,o,o, ,o,,,o,,m,,o,,,,
16,m,,,,,,,,o,o,o,o,,o,,o,o,o,o,o
17,o,,o,o,o,o,o,o,o,,,,,o,,,,,,o
18,o,,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o
19,m,,,,,,,,,,,,,,,,,,,o
20,o,o,o,o,o,o,o,o,o,m,o,o,o,o,o,m,o,o,o,w`;

function parseMazeFromCSV() {
    const lines = csvData.trim().split('\n');
    const doors = [];
    const paths = [];
    let watering_hole = null;
    
    // Skip header row (line 0)
    for (let rowIndex = 1; rowIndex < lines.length; rowIndex++) {
        const cells = lines[rowIndex].split(',');
        
        // Skip first column (row number), start from column 1
        for (let colIndex = 1; colIndex < cells.length; colIndex++) {
            const cellValue = cells[colIndex].trim();
            
            // Calculate actual coordinates (0-based for arrays)
            const x = (colIndex - 1) * 40; // Column A=0, B=1, etc. * 40
            const y = (rowIndex - 1) * 40; // Row 1=0, Row 2=1, etc. * 40
            
            switch (cellValue) {
                case 'o':
                    paths.push({ x, y });
                    break;
                case 'm':
                    doors.push({ x, y, type: 'math' });
                    break;
                case 'r':
                    doors.push({ x, y, type: 'reading' });
                    break;
                case 's':
                    doors.push({ x, y, type: 'sorting' });
                    break;
                case 'w':
                    watering_hole = { x, y };
                    break;
                // Empty cells and walls are ignored
            }
        }
    }
    
    return { doors, paths, watering_hole };
}

// Generate the arrays
const mazeData = parseMazeFromCSV();

// Output the JavaScript code to replace in your maze game
console.log('// Generated maze data from Grid.csv');
console.log('');
console.log('const doors = [');
mazeData.doors.forEach((door, index) => {
    const comma = index < mazeData.doors.length - 1 ? ',' : '';
    console.log(`    { x: ${door.x}, y: ${door.y}, type: '${door.type}' }${comma}`);
});
console.log('];');
console.log('');
console.log('const paths = [');
mazeData.paths.forEach((path, index) => {
    const comma = index < mazeData.paths.length - 1 ? ',' : '';
    console.log(`    { x: ${path.x}, y: ${path.y} }${comma}`);
});
console.log('];');
console.log('');
if (mazeData.watering_hole) {
    console.log(`const watering_hole = { x: ${mazeData.watering_hole.x}, y: ${mazeData.watering_hole.y} };`);
} else {
    console.log('const watering_hole = null; // No watering hole found in grid');
}

// Also export as object for direct use
module.exports = { doors: mazeData.doors, paths: mazeData.paths, watering_hole: mazeData.watering_hole };