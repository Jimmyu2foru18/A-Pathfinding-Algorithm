# Testing and Validation

## Testing Strategy Overview

### Testing Pyramid
```
        /\     E2E Tests
       /  \    (Integration)
      /____\   
     /      \  Unit Tests
    /        \ (Algorithm Logic)
   /__________\
  Manual Testing
  (Visual Validation)
```

### Test Categories
1. **Unit Tests**: Individual function validation
2. **Integration Tests**: Component interaction
3. **Performance Tests**: Speed and memory usage
4. **Visual Tests**: UI and animation correctness
5. **Edge Case Tests**: Boundary conditions
6. **Regression Tests**: Prevent breaking changes

## Unit Testing Framework

### Simple Test Runner
```javascript
class TestRunner {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }
    
    test(name, testFunction) {
        this.tests.push({ name, testFunction });
    }
    
    async runAll() {
        console.log('🧪 Running A* Algorithm Tests\n');
        
        for (const test of this.tests) {
            try {
                await test.testFunction();
                console.log(`✅ ${test.name}`);
                this.results.passed++;
            } catch (error) {
                console.log(`❌ ${test.name}: ${error.message}`);
                this.results.failed++;
            }
            this.results.total++;
        }
        
        this.printSummary();
    }
    
    printSummary() {
        console.log('\n📊 Test Results:');
        console.log(`Total: ${this.results.total}`);
        console.log(`Passed: ${this.results.passed}`);
        console.log(`Failed: ${this.results.failed}`);
        console.log(`Success Rate: ${(this.results.passed / this.results.total * 100).toFixed(1)}%`);
    }
}

// Assertion helpers
function assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
        throw new Error(`${message} Expected: ${expected}, Actual: ${actual}`);
    }
}

function assertArrayEqual(actual, expected, message = '') {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`${message} Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
    }
}

function assertApproximatelyEqual(actual, expected, tolerance = 0.001, message = '') {
    if (Math.abs(actual - expected) > tolerance) {
        throw new Error(`${message} Expected: ~${expected}, Actual: ${actual}`);
    }
}

function assertTrue(condition, message = '') {
    if (!condition) {
        throw new Error(`${message} Expected condition to be true`);
    }
}

function assertFalse(condition, message = '') {
    if (condition) {
        throw new Error(`${message} Expected condition to be false`);
    }
}
```

## Heuristic Function Tests

### Manhattan Distance Tests
```javascript
const runner = new TestRunner();

runner.test('Manhattan Distance - Same Point', () => {
    const nodeA = { x: 5, y: 3 };
    const nodeB = { x: 5, y: 3 };
    const result = manhattanDistance(nodeA, nodeB);
    assertEqual(result, 0, 'Distance to same point should be 0');
});

runner.test('Manhattan Distance - Horizontal', () => {
    const nodeA = { x: 0, y: 0 };
    const nodeB = { x: 5, y: 0 };
    const result = manhattanDistance(nodeA, nodeB);
    assertEqual(result, 5, 'Horizontal distance should be 5');
});

runner.test('Manhattan Distance - Vertical', () => {
    const nodeA = { x: 0, y: 0 };
    const nodeB = { x: 0, y: 3 };
    const result = manhattanDistance(nodeA, nodeB);
    assertEqual(result, 3, 'Vertical distance should be 3');
});

runner.test('Manhattan Distance - Diagonal', () => {
    const nodeA = { x: 0, y: 0 };
    const nodeB = { x: 3, y: 4 };
    const result = manhattanDistance(nodeA, nodeB);
    assertEqual(result, 7, 'Manhattan distance should be 7');
});

runner.test('Manhattan Distance - Negative Coordinates', () => {
    const nodeA = { x: -2, y: -1 };
    const nodeB = { x: 1, y: 2 };
    const result = manhattanDistance(nodeA, nodeB);
    assertEqual(result, 6, 'Should handle negative coordinates');
});
```

### Euclidean Distance Tests
```javascript
runner.test('Euclidean Distance - Same Point', () => {
    const nodeA = { x: 5, y: 3 };
    const nodeB = { x: 5, y: 3 };
    const result = euclideanDistance(nodeA, nodeB);
    assertEqual(result, 0, 'Distance to same point should be 0');
});

runner.test('Euclidean Distance - 3-4-5 Triangle', () => {
    const nodeA = { x: 0, y: 0 };
    const nodeB = { x: 3, y: 4 };
    const result = euclideanDistance(nodeA, nodeB);
    assertEqual(result, 5, 'Should calculate 3-4-5 triangle correctly');
});

runner.test('Euclidean Distance - Unit Diagonal', () => {
    const nodeA = { x: 0, y: 0 };
    const nodeB = { x: 1, y: 1 };
    const result = euclideanDistance(nodeA, nodeB);
    assertApproximatelyEqual(result, Math.sqrt(2), 0.001, 'Unit diagonal should be √2');
});

runner.test('Euclidean vs Manhattan - Comparison', () => {
    const nodeA = { x: 0, y: 0 };
    const nodeB = { x: 3, y: 4 };
    
    const euclidean = euclideanDistance(nodeA, nodeB);
    const manhattan = manhattanDistance(nodeA, nodeB);
    
    assertTrue(euclidean <= manhattan, 'Euclidean should be ≤ Manhattan distance');
});
```

## Movement Cost Tests

```javascript
runner.test('Movement Cost - Cardinal Direction', () => {
    const nodeA = { x: 5, y: 5 };
    const nodeB = { x: 6, y: 5 }; // Right
    const cost = getMovementCost(nodeA, nodeB);
    assertEqual(cost, 1, 'Cardinal movement should cost 1');
});

runner.test('Movement Cost - Diagonal Direction', () => {
    const nodeA = { x: 5, y: 5 };
    const nodeB = { x: 6, y: 6 }; // Diagonal
    const cost = getMovementCost(nodeA, nodeB);
    assertApproximatelyEqual(cost, 1.414, 0.001, 'Diagonal movement should cost √2');
});

runner.test('Movement Cost - Invalid Movement', () => {
    const nodeA = { x: 0, y: 0 };
    const nodeB = { x: 2, y: 1 }; // Knight's move
    const cost = getMovementCost(nodeA, nodeB);
    // Should handle gracefully or throw error
    assertTrue(cost > 0, 'Should return positive cost or handle error');
});
```

## Grid and Neighbor Tests

```javascript
runner.test('Grid Initialization', () => {
    initializeGrid();
    
    assertEqual(grid.length, GRID_HEIGHT, 'Grid should have correct height');
    assertEqual(grid[0].length, GRID_WIDTH, 'Grid should have correct width');
    
    // Check a sample node
    const node = grid[5][10];
    assertEqual(node.x, 10, 'Node should have correct x coordinate');
    assertEqual(node.y, 5, 'Node should have correct y coordinate');
    assertEqual(node.gCost, Infinity, 'Initial g-cost should be Infinity');
    assertFalse(node.isObstacle, 'Initial nodes should not be obstacles');
});

runner.test('Get Neighbors - Center Node', () => {
    initializeGrid();
    const centerNode = grid[10][15]; // Middle of grid
    const neighbors = getNeighbors(centerNode);
    
    assertEqual(neighbors.length, 8, 'Center node should have 8 neighbors');
    
    // Check that all neighbors are valid
    for (const neighbor of neighbors) {
        assertTrue(neighbor.x >= 0 && neighbor.x < GRID_WIDTH, 'Neighbor x in bounds');
        assertTrue(neighbor.y >= 0 && neighbor.y < GRID_HEIGHT, 'Neighbor y in bounds');
        assertFalse(neighbor.isObstacle, 'Neighbor should not be obstacle');
    }
});

runner.test('Get Neighbors - Corner Node', () => {
    initializeGrid();
    const cornerNode = grid[0][0]; // Top-left corner
    const neighbors = getNeighbors(cornerNode);
    
    assertEqual(neighbors.length, 3, 'Corner node should have 3 neighbors');
    
    // Verify specific neighbors
    const expectedPositions = [
        { x: 1, y: 0 }, // Right
        { x: 0, y: 1 }, // Down
        { x: 1, y: 1 }  // Diagonal
    ];
    
    for (const expected of expectedPositions) {
        const found = neighbors.find(n => n.x === expected.x && n.y === expected.y);
        assertTrue(found !== undefined, `Should find neighbor at (${expected.x}, ${expected.y})`);
    }
});

runner.test('Get Neighbors - With Obstacles', () => {
    initializeGrid();
    const centerNode = grid[10][15];
    
    // Add obstacles around center
    grid[9][15].isObstacle = true;  // North
    grid[11][15].isObstacle = true; // South
    
    const neighbors = getNeighbors(centerNode);
    assertEqual(neighbors.length, 6, 'Should have 6 neighbors with 2 obstacles');
    
    // Verify no obstacles in neighbors
    for (const neighbor of neighbors) {
        assertFalse(neighbor.isObstacle, 'Returned neighbors should not be obstacles');
    }
});
```

## Path Reconstruction Tests

```javascript
runner.test('Path Reconstruction - Simple Path', () => {
    // Create a simple 3-node path
    const start = { x: 0, y: 0, parent: null };
    const middle = { x: 1, y: 0, parent: start };
    const goal = { x: 2, y: 0, parent: middle };
    
    const path = reconstructPath(goal);
    
    assertEqual(path.length, 3, 'Path should have 3 nodes');
    assertEqual(path[0], start, 'First node should be start');
    assertEqual(path[1], middle, 'Middle node should be correct');
    assertEqual(path[2], goal, 'Last node should be goal');
});

runner.test('Path Reconstruction - Single Node', () => {
    const singleNode = { x: 5, y: 5, parent: null };
    const path = reconstructPath(singleNode);
    
    assertEqual(path.length, 1, 'Single node path should have length 1');
    assertEqual(path[0], singleNode, 'Should return the single node');
});

runner.test('Path Reconstruction - Zigzag Path', () => {
    // Create a zigzag path
    const nodes = [];
    for (let i = 0; i < 5; i++) {
        nodes.push({
            x: i,
            y: i % 2,
            parent: i > 0 ? nodes[i - 1] : null
        });
    }
    
    const path = reconstructPath(nodes[4]);
    assertEqual(path.length, 5, 'Zigzag path should have 5 nodes');
    
    // Verify path order
    for (let i = 0; i < 5; i++) {
        assertEqual(path[i], nodes[i], `Node ${i} should be in correct position`);
    }
});
```

## Algorithm Integration Tests

```javascript
runner.test('A* - Straight Line Path', async () => {
    initializeGrid();
    
    // Set start and goal in straight line
    startNode = grid[5][5];
    goalNode = grid[5][10];
    
    const path = await findPathForTesting();
    
    assertTrue(path !== null, 'Should find a path');
    assertEqual(path[0], startNode, 'Path should start at start node');
    assertEqual(path[path.length - 1], goalNode, 'Path should end at goal node');
    assertEqual(path.length, 6, 'Straight line should have 6 nodes');
});

runner.test('A* - Path Around Obstacle', async () => {
    initializeGrid();
    
    // Create a wall
    for (let y = 3; y <= 7; y++) {
        grid[y][5].isObstacle = true;
    }
    
    startNode = grid[5][3];
    goalNode = grid[5][7];
    
    const path = await findPathForTesting();
    
    assertTrue(path !== null, 'Should find path around obstacle');
    assertTrue(path.length > 5, 'Path should be longer than direct route');
    
    // Verify path doesn't go through obstacles
    for (const node of path) {
        assertFalse(node.isObstacle, 'Path should not contain obstacles');
    }
});

runner.test('A* - No Path Available', async () => {
    initializeGrid();
    
    // Surround goal with obstacles
    const goalX = 10, goalY = 10;
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue; // Skip goal itself
            grid[goalY + dy][goalX + dx].isObstacle = true;
        }
    }
    
    startNode = grid[5][5];
    goalNode = grid[goalY][goalX];
    
    const path = await findPathForTesting();
    
    assertEqual(path, null, 'Should return null when no path exists');
});

// Helper function for testing without visualization
async function findPathForTesting() {
    if (!startNode || !goalNode) {
        return null;
    }
    
    const openSet = [startNode];
    const closedSet = new Set();
    
    startNode.gCost = 0;
    startNode.hCost = manhattanDistance(startNode, goalNode);
    startNode.fCost = startNode.gCost + startNode.hCost;
    
    while (openSet.length > 0) {
        let currentNode = openSet[0];
        for (let i = 1; i < openSet.length; i++) {
            if (openSet[i].fCost < currentNode.fCost || 
                (openSet[i].fCost === currentNode.fCost && 
                 openSet[i].hCost < currentNode.hCost)) {
                currentNode = openSet[i];
            }
        }
        
        const currentIndex = openSet.indexOf(currentNode);
        openSet.splice(currentIndex, 1);
        closedSet.add(currentNode);
        
        if (currentNode === goalNode) {
            return reconstructPath(currentNode);
        }
        
        const neighbors = getNeighbors(currentNode);
        
        for (const neighbor of neighbors) {
            if (closedSet.has(neighbor)) continue;
            
            const tentativeGCost = currentNode.gCost + 
                                 getMovementCost(currentNode, neighbor);
            
            if (!openSet.includes(neighbor)) {
                openSet.push(neighbor);
            } else if (tentativeGCost >= neighbor.gCost) {
                continue;
            }
            
            neighbor.parent = currentNode;
            neighbor.gCost = tentativeGCost;
            neighbor.hCost = manhattanDistance(neighbor, goalNode);
            neighbor.fCost = neighbor.gCost + neighbor.hCost;
        }
    }
    
    return null;
}
```

## Performance Tests

```javascript
class PerformanceTest {
    constructor() {
        this.results = [];
    }
    
    async benchmarkPathfinding(gridSize, obstaclePercent, iterations = 10) {
        const results = [];
        
        for (let i = 0; i < iterations; i++) {
            // Setup test grid
            this.setupTestGrid(gridSize, obstaclePercent);
            
            const startTime = performance.now();
            const path = await findPathForTesting();
            const endTime = performance.now();
            
            results.push({
                time: endTime - startTime,
                pathLength: path ? path.length : 0,
                pathFound: path !== null
            });
        }
        
        return this.analyzeResults(results, gridSize, obstaclePercent);
    }
    
    setupTestGrid(size, obstaclePercent) {
        // Temporarily modify grid size
        const originalWidth = GRID_WIDTH;
        const originalHeight = GRID_HEIGHT;
        
        GRID_WIDTH = size;
        GRID_HEIGHT = size;
        
        initializeGrid();
        
        // Add random obstacles
        const totalCells = size * size;
        const obstacleCount = Math.floor(totalCells * obstaclePercent / 100);
        
        for (let i = 0; i < obstacleCount; i++) {
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);
            grid[y][x].isObstacle = true;
        }
        
        // Set start and goal
        startNode = grid[0][0];
        goalNode = grid[size - 1][size - 1];
        
        // Ensure start and goal are not obstacles
        startNode.isObstacle = false;
        goalNode.isObstacle = false;
    }
    
    analyzeResults(results, gridSize, obstaclePercent) {
        const validResults = results.filter(r => r.pathFound);
        
        if (validResults.length === 0) {
            return {
                gridSize,
                obstaclePercent,
                avgTime: null,
                avgPathLength: null,
                successRate: 0
            };
        }
        
        const avgTime = validResults.reduce((sum, r) => sum + r.time, 0) / validResults.length;
        const avgPathLength = validResults.reduce((sum, r) => sum + r.pathLength, 0) / validResults.length;
        const successRate = (validResults.length / results.length) * 100;
        
        return {
            gridSize,
            obstaclePercent,
            avgTime: avgTime.toFixed(2),
            avgPathLength: avgPathLength.toFixed(1),
            successRate: successRate.toFixed(1)
        };
    }
    
    async runPerformanceSuite() {
        console.log('🚀 Running Performance Tests\n');
        
        const testCases = [
            { size: 20, obstacles: 10 },
            { size: 20, obstacles: 30 },
            { size: 50, obstacles: 10 },
            { size: 50, obstacles: 30 },
            { size: 100, obstacles: 10 },
            { size: 100, obstacles: 30 }
        ];
        
        for (const testCase of testCases) {
            const result = await this.benchmarkPathfinding(testCase.size, testCase.obstacles);
            console.log(`Grid: ${result.gridSize}x${result.gridSize}, Obstacles: ${result.obstaclePercent}%`);
            console.log(`  Avg Time: ${result.avgTime}ms`);
            console.log(`  Avg Path Length: ${result.avgPathLength}`);
            console.log(`  Success Rate: ${result.successRate}%\n`);
        }
    }
}
```

## Memory Leak Tests

```javascript
runner.test('Memory Leak - Repeated Pathfinding', async () => {
    const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
    
    // Run pathfinding many times
    for (let i = 0; i < 100; i++) {
        initializeGrid();
        startNode = grid[0][0];
        goalNode = grid[GRID_HEIGHT - 1][GRID_WIDTH - 1];
        await findPathForTesting();
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
    }
    
    const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Allow for some memory increase, but not excessive
    assertTrue(memoryIncrease < 10 * 1024 * 1024, // 10MB threshold
        `Memory increase should be reasonable: ${memoryIncrease} bytes`);
});
```

## Visual Validation Tests

```javascript
class VisualTest {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }
    
    captureGridState() {
        const state = [];
        for (let y = 0; y < GRID_HEIGHT; y++) {
            state[y] = [];
            for (let x = 0; x < GRID_WIDTH; x++) {
                const node = grid[y][x];
                state[y][x] = {
                    isObstacle: node.isObstacle,
                    isStart: node === startNode,
                    isGoal: node === goalNode,
                    classes: node.element ? Array.from(node.element.classList) : []
                };
            }
        }
        return state;
    }
    
    validatePathVisualization(path) {
        if (!path) return true;
        
        for (let i = 1; i < path.length - 1; i++) {
            const node = path[i];
            const hasPathClass = node.element && node.element.classList.contains('path');
            
            if (!hasPathClass) {
                throw new Error(`Path node at (${node.x}, ${node.y}) missing 'path' class`);
            }
        }
        
        return true;
    }
    
    validateSearchVisualization() {
        let openCount = 0;
        let closedCount = 0;
        
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                const node = grid[y][x];
                if (node.element) {
                    if (node.element.classList.contains('open')) openCount++;
                    if (node.element.classList.contains('closed')) closedCount++;
                }
            }
        }
        
        console.log(`Visual validation: ${openCount} open, ${closedCount} closed cells`);
        return { openCount, closedCount };
    }
}
```

## Test Execution and Reporting

```javascript
// Main test execution
async function runAllTests() {
    console.clear();
    console.log('🧪 A* Algorithm Test Suite\n');
    
    // Unit tests
    await runner.runAll();
    
    // Performance tests
    const perfTest = new PerformanceTest();
    await perfTest.runPerformanceSuite();
    
    // Generate test report
    generateTestReport();
}

function generateTestReport() {
    const report = {
        timestamp: new Date().toISOString(),
        unitTests: runner.results,
        browser: navigator.userAgent,
        performance: performance.memory ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        } : null
    };
    
    console.log('📋 Test Report Generated:', report);
    
    // Save to localStorage for persistence
    localStorage.setItem('astar-test-report', JSON.stringify(report));
}

// Automated testing on page load
window.addEventListener('load', () => {
    // Add test button to UI
    const testButton = document.createElement('button');
    testButton.textContent = 'Run Tests';
    testButton.onclick = runAllTests;
    testButton.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 1000;
        padding: 10px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    `;
    document.body.appendChild(testButton);
});
```

## Continuous Integration Setup

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: A* Algorithm Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - name: Install dependencies
      run: npm install puppeteer
    
    - name: Run tests
      run: node test-runner.js
    
    - name: Upload test results
      uses: actions/upload-artifact@v2
      with:
        name: test-results
        path: test-results.json
```

### Automated Browser Testing
```javascript
// test-runner.js (Node.js)
const puppeteer = require('puppeteer');
const fs = require('fs');

async function runBrowserTests() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    // Load the demo page
    await page.goto(`file://${__dirname}/demo.html`);
    
    // Wait for page to load
    await page.waitForSelector('#grid');
    
    // Run tests
    const results = await page.evaluate(() => {
        return new Promise((resolve) => {
            runAllTests().then(() => {
                resolve({
                    unitTests: runner.results,
                    timestamp: new Date().toISOString()
                });
            });
        });
    });
    
    // Save results
    fs.writeFileSync('test-results.json', JSON.stringify(results, null, 2));
    
    await browser.close();
    
    // Exit with error code if tests failed
    if (results.unitTests.failed > 0) {
        process.exit(1);
    }
}

runBrowserTests().catch(console.error);
```

## Test Coverage Analysis

### Coverage Tracking
```javascript
class CoverageTracker {
    constructor() {
        this.coverage = {
            functions: new Set(),
            branches: new Set(),
            lines: new Set()
        };
    }
    
    trackFunction(name) {
        this.coverage.functions.add(name);
    }
    
    trackBranch(id) {
        this.coverage.branches.add(id);
    }
    
    trackLine(file, line) {
        this.coverage.lines.add(`${file}:${line}`);
    }
    
    getReport() {
        return {
            functions: this.coverage.functions.size,
            branches: this.coverage.branches.size,
            lines: this.coverage.lines.size
        };
    }
}

// Instrument functions for coverage
const originalManhattanDistance = manhattanDistance;
manhattanDistance = function(...args) {
    coverageTracker.trackFunction('manhattanDistance');
    return originalManhattanDistance.apply(this, args);
};
```

---
**Previous:** [Code Walkthrough](11-code-walkthrough.md)
**Next:** [Performance Analysis](13-performance.md)

**Interactive:** [Run tests](demo.html)