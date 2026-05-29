# Complete A* Implementation

## Production-Ready JavaScript Implementation

```javascript
class AStarPathfinder {
    constructor(options = {}) {
        this.heuristic = options.heuristic || 'manhattan';
        this.allowDiagonal = options.allowDiagonal || false;
        this.diagonalCost = options.diagonalCost || Math.sqrt(2);
        this.weight = options.weight || 1.0;  // Heuristic weight (1.0 = optimal)
    }
    
    /**
     * Find path from start to goal
     * @param {Object} grid - 2D array of nodes
     * @param {Object} start - {x, y} coordinates
     * @param {Object} goal - {x, y} coordinates
     * @returns {Array|null} - Path array or null if no path found
     */
    findPath(grid, start, goal) {
        // Validate inputs
        if (!this.isValidCoordinate(grid, start) || 
            !this.isValidCoordinate(grid, goal)) {
            throw new Error('Invalid start or goal coordinates');
        }
        
        if (grid[start.y][start.x].isObstacle || 
            grid[goal.y][goal.x].isObstacle) {
            return null;  // Start or goal is blocked
        }
        
        // Initialize data structures
        const openSet = new MinHeap();
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();
        
        // Helper function to get node key
        const getKey = (node) => `${node.x},${node.y}`;
        
        // Initialize start node
        const startKey = getKey(start);
        gScore.set(startKey, 0);
        fScore.set(startKey, this.calculateHeuristic(start, goal));
        openSet.insert({...start, fCost: fScore.get(startKey)});
        
        while (!openSet.isEmpty()) {
            // Get node with lowest f-cost
            const current = openSet.extractMin();
            const currentKey = getKey(current);
            
            // Check if we reached the goal
            if (current.x === goal.x && current.y === goal.y) {
                return this.reconstructPath(cameFrom, current);
            }
            
            // Move current to closed set
            closedSet.add(currentKey);
            
            // Examine neighbors
            const neighbors = this.getNeighbors(grid, current);
            
            for (const neighbor of neighbors) {
                const neighborKey = getKey(neighbor);
                
                // Skip if already evaluated
                if (closedSet.has(neighborKey)) {
                    continue;
                }
                
                // Calculate tentative g-score
                const tentativeGScore = gScore.get(currentKey) + 
                    this.getMovementCost(current, neighbor);
                
                // Initialize neighbor scores if not seen before
                if (!gScore.has(neighborKey)) {
                    gScore.set(neighborKey, Infinity);
                }
                
                // Check if this path is better
                if (tentativeGScore < gScore.get(neighborKey)) {
                    // Record the best path
                    cameFrom.set(neighborKey, current);
                    gScore.set(neighborKey, tentativeGScore);
                    
                    const hCost = this.calculateHeuristic(neighbor, goal);
                    const fCost = tentativeGScore + this.weight * hCost;
                    fScore.set(neighborKey, fCost);
                    
                    // Add to open set if not already there
                    if (!openSet.contains(neighbor)) {
                        openSet.insert({...neighbor, fCost});
                    }
                }
            }
        }
        
        return null;  // No path found
    }
    
    /**
     * Get valid neighbors for a node
     */
    getNeighbors(grid, node) {
        const neighbors = [];
        const directions = this.allowDiagonal ? 
            [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]] :
            [[-1,0], [1,0], [0,-1], [0,1]];
        
        for (const [dx, dy] of directions) {
            const x = node.x + dx;
            const y = node.y + dy;
            
            if (this.isValidCoordinate(grid, {x, y}) && 
                !grid[y][x].isObstacle) {
                
                // Check diagonal movement restrictions
                if (this.allowDiagonal && Math.abs(dx) === 1 && Math.abs(dy) === 1) {
                    // Ensure diagonal movement doesn't cut corners
                    if (grid[node.y + dy][node.x].isObstacle || 
                        grid[node.y][node.x + dx].isObstacle) {
                        continue;
                    }
                }
                
                neighbors.push({x, y});
            }
        }
        
        return neighbors;
    }
    
    /**
     * Calculate movement cost between two adjacent nodes
     */
    getMovementCost(from, to) {
        const dx = Math.abs(to.x - from.x);
        const dy = Math.abs(to.y - from.y);
        
        if (dx === 1 && dy === 1) {
            return this.diagonalCost;  // Diagonal movement
        }
        return 1;  // Cardinal movement
    }
    
    /**
     * Calculate heuristic distance
     */
    calculateHeuristic(from, to) {
        const dx = Math.abs(to.x - from.x);
        const dy = Math.abs(to.y - from.y);
        
        switch (this.heuristic) {
            case 'manhattan':
                return dx + dy;
            
            case 'euclidean':
                return Math.sqrt(dx * dx + dy * dy);
            
            case 'chebyshev':
                return Math.max(dx, dy);
            
            case 'octile':  // Optimized for 8-directional movement
                return Math.max(dx, dy) + (Math.sqrt(2) - 1) * Math.min(dx, dy);
            
            default:
                return dx + dy;  // Default to Manhattan
        }
    }
    
    /**
     * Reconstruct path from goal to start
     */
    reconstructPath(cameFrom, goal) {
        const path = [];
        let current = goal;
        
        while (current) {
            path.unshift({x: current.x, y: current.y});
            current = cameFrom.get(`${current.x},${current.y}`);
        }
        
        return path;
    }
    
    /**
     * Validate coordinate bounds
     */
    isValidCoordinate(grid, coord) {
        return coord.x >= 0 && coord.x < grid[0].length &&
               coord.y >= 0 && coord.y < grid.length;
    }
}

/**
 * Optimized Min-Heap implementation for open set
 */
class MinHeap {
    constructor() {
        this.heap = [];
        this.nodeMap = new Map();  // For O(1) contains check
    }
    
    insert(node) {
        const key = `${node.x},${node.y}`;
        if (this.nodeMap.has(key)) {
            // Update existing node if this path is better
            const index = this.nodeMap.get(key);
            if (node.fCost < this.heap[index].fCost) {
                this.heap[index] = node;
                this.bubbleUp(index);
                this.bubbleDown(index);
            }
            return;
        }
        
        this.heap.push(node);
        this.nodeMap.set(key, this.heap.length - 1);
        this.bubbleUp(this.heap.length - 1);
    }
    
    extractMin() {
        if (this.heap.length === 0) return null;
        
        const min = this.heap[0];
        const last = this.heap.pop();
        this.nodeMap.delete(`${min.x},${min.y}`);
        
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.nodeMap.set(`${last.x},${last.y}`, 0);
            this.bubbleDown(0);
        }
        
        return min;
    }
    
    contains(node) {
        return this.nodeMap.has(`${node.x},${node.y}`);
    }
    
    isEmpty() {
        return this.heap.length === 0;
    }
    
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex].fCost <= this.heap[index].fCost) break;
            
            this.swap(parentIndex, index);
            index = parentIndex;
        }
    }
    
    bubbleDown(index) {
        while (true) {
            let minIndex = index;
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            
            if (leftChild < this.heap.length && 
                this.heap[leftChild].fCost < this.heap[minIndex].fCost) {
                minIndex = leftChild;
            }
            
            if (rightChild < this.heap.length && 
                this.heap[rightChild].fCost < this.heap[minIndex].fCost) {
                minIndex = rightChild;
            }
            
            if (minIndex === index) break;
            
            this.swap(index, minIndex);
            index = minIndex;
        }
    }
    
    swap(i, j) {
        // Update node map
        this.nodeMap.set(`${this.heap[i].x},${this.heap[i].y}`, j);
        this.nodeMap.set(`${this.heap[j].x},${this.heap[j].y}`, i);
        
        // Swap elements
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
}

/**
 * Grid node class
 */
class GridNode {
    constructor(x, y, isObstacle = false) {
        this.x = x;
        this.y = y;
        this.isObstacle = isObstacle;
    }
}

/**
 * Utility functions
 */
class PathfindingUtils {
    /**
     * Create a grid from a 2D array
     */
    static createGrid(width, height, obstacles = []) {
        const grid = [];
        
        for (let y = 0; y < height; y++) {
            grid[y] = [];
            for (let x = 0; x < width; x++) {
                const isObstacle = obstacles.some(obs => obs.x === x && obs.y === y);
                grid[y][x] = new GridNode(x, y, isObstacle);
            }
        }
        
        return grid;
    }
    
    /**
     * Calculate path length
     */
    static calculatePathLength(path) {
        if (!path || path.length < 2) return 0;
        
        let length = 0;
        for (let i = 1; i < path.length; i++) {
            const dx = path[i].x - path[i-1].x;
            const dy = path[i].y - path[i-1].y;
            length += Math.sqrt(dx * dx + dy * dy);
        }
        
        return length;
    }
    
    /**
     * Smooth path using line-of-sight optimization
     */
    static smoothPath(path, grid) {
        if (!path || path.length < 3) return path;
        
        const smoothed = [path[0]];
        let current = 0;
        
        while (current < path.length - 1) {
            let farthest = current + 1;
            
            for (let i = current + 2; i < path.length; i++) {
                if (this.hasLineOfSight(path[current], path[i], grid)) {
                    farthest = i;
                } else {
                    break;
                }
            }
            
            smoothed.push(path[farthest]);
            current = farthest;
        }
        
        return smoothed;
    }
    
    /**
     * Check line of sight between two points
     */
    static hasLineOfSight(start, end, grid) {
        const dx = Math.abs(end.x - start.x);
        const dy = Math.abs(end.y - start.y);
        const sx = start.x < end.x ? 1 : -1;
        const sy = start.y < end.y ? 1 : -1;
        let err = dx - dy;
        
        let x = start.x;
        let y = start.y;
        
        while (true) {
            if (x < 0 || x >= grid[0].length || y < 0 || y >= grid.length ||
                grid[y][x].isObstacle) {
                return false;
            }
            
            if (x === end.x && y === end.y) break;
            
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
        
        return true;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AStarPathfinder, GridNode, PathfindingUtils };
}
```

## Usage Examples

### Basic Usage
```javascript
// Create a 10x10 grid with some obstacles
const obstacles = [
    {x: 2, y: 1}, {x: 2, y: 2}, {x: 2, y: 3},
    {x: 6, y: 4}, {x: 6, y: 5}, {x: 6, y: 6}
];
const grid = PathfindingUtils.createGrid(10, 10, obstacles);

// Create pathfinder with default settings
const pathfinder = new AStarPathfinder();

// Find path
const start = {x: 0, y: 0};
const goal = {x: 9, y: 9};
const path = pathfinder.findPath(grid, start, goal);

if (path) {
    console.log('Path found:', path);
    console.log('Path length:', PathfindingUtils.calculatePathLength(path));
} else {
    console.log('No path found');
}
```

### Advanced Configuration
```javascript
// Create pathfinder with custom settings
const pathfinder = new AStarPathfinder({
    heuristic: 'octile',      // Best for 8-directional movement
    allowDiagonal: true,      // Enable diagonal movement
    diagonalCost: 1.414,      // √2 cost for diagonal moves
    weight: 1.2               // Slightly weighted for faster search
});

// Find and smooth path
const path = pathfinder.findPath(grid, start, goal);
const smoothedPath = PathfindingUtils.smoothPath(path, grid);

console.log('Original path length:', path.length);
console.log('Smoothed path length:', smoothedPath.length);
```

### Performance Testing
```javascript
function benchmarkPathfinding() {
    const sizes = [50, 100, 200, 500];
    const results = [];
    
    for (const size of sizes) {
        const grid = PathfindingUtils.createGrid(size, size, []);
        const pathfinder = new AStarPathfinder();
        
        const start = performance.now();
        const path = pathfinder.findPath(
            grid, 
            {x: 0, y: 0}, 
            {x: size-1, y: size-1}
        );
        const end = performance.now();
        
        results.push({
            gridSize: `${size}x${size}`,
            pathLength: path ? path.length : 0,
            timeMs: (end - start).toFixed(2)
        });
    }
    
    console.table(results);
}
```

## Error Handling

```javascript
try {
    const path = pathfinder.findPath(grid, start, goal);
    
    if (!path) {
        console.log('No path exists between start and goal');
        // Handle no path case
    } else {
        console.log('Path found successfully');
        // Process path
    }
} catch (error) {
    console.error('Pathfinding error:', error.message);
    // Handle invalid inputs or other errors
}
```

---
**Previous:** [Path Reconstruction](06-path-reconstruction.md)
**Next:** [Real-World Applications](08-applications.md)

**Interactive:** [Test complete implementation](demo.html)