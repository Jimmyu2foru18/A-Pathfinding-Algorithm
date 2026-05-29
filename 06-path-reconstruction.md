# Path Reconstruction

## The Final Step: Building the Path

Once A* finds the goal, we need to reconstruct the actual path by following parent pointers backward from goal to start.

## Basic Reconstruction Algorithm

```javascript
function reconstructPath(goalNode) {
    const path = [];
    let current = goalNode;
    
    while (current !== null) {
        path.push(current);
        current = current.parent;
    }
    
    return path.reverse();  // Start to goal order
}
```

## Visual Example

### Parent Pointer Chain
```
Grid with parent pointers:
┌─┬─┬─┬─┬─┐
│ │ │ │G│ │  G ← (3,1) ← (2,1) ← (1,1) ← S
├─┼─┼─┼─┼─┤  ↑    ↑      ↑      ↑      ↑
│ │ │█│↑│ │  Goal (3,1) (2,1) (1,1)  Start
├─┼─┼─┼─┼─┤
│ │←│←│↑│ │  Arrows show parent direction
├─┼─┼─┼─┼─┤
│ │S│ │ │ │  S = Start (1,3)
└─┴─┴─┴─┴─┘
```

### Reconstruction Steps
```
Step 1: current = Goal(3,0), path = [(3,0)]
Step 2: current = (3,1), path = [(3,0), (3,1)]
Step 3: current = (2,1), path = [(3,0), (3,1), (2,1)]
Step 4: current = (1,1), path = [(3,0), (3,1), (2,1), (1,1)]
Step 5: current = Start(1,3), path = [(3,0), (3,1), (2,1), (1,1), (1,3)]
Step 6: current = null, STOP

Reverse: [(1,3), (1,1), (2,1), (3,1), (3,0)]
Final path: Start → (1,1) → (2,1) → (3,1) → Goal
```

## Advanced Reconstruction Techniques

### 1. Coordinate-Only Storage
```javascript
// Instead of storing full parent objects
class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.parentX = -1;
        this.parentY = -1;
    }
    
    setParent(parent) {
        this.parentX = parent.x;
        this.parentY = parent.y;
    }
}

function reconstructPath(goalNode, nodeGrid) {
    const path = [];
    let x = goalNode.x;
    let y = goalNode.y;
    
    while (x !== -1 && y !== -1) {
        path.push({x, y});
        const node = nodeGrid[y][x];
        x = node.parentX;
        y = node.parentY;
    }
    
    return path.reverse();
}
```

### 2. Direction-Based Storage
```javascript
// Store movement direction instead of coordinates
const DIRECTIONS = {
    NONE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4,
    UP_LEFT: 5,
    UP_RIGHT: 6,
    DOWN_LEFT: 7,
    DOWN_RIGHT: 8
};

class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.parentDirection = DIRECTIONS.NONE;
    }
}

function getParentCoords(node) {
    const dx = [0, 0, 0, -1, 1, -1, 1, -1, 1];
    const dy = [0, -1, 1, 0, 0, -1, -1, 1, 1];
    
    const dir = node.parentDirection;
    return {
        x: node.x + dx[dir],
        y: node.y + dy[dir]
    };
}
```

### 3. Compressed Path Storage
```javascript
// Store only direction changes (for long straight paths)
function compressPath(path) {
    if (path.length < 3) return path;
    
    const compressed = [path[0]];
    
    for (let i = 1; i < path.length - 1; i++) {
        const prev = path[i - 1];
        const curr = path[i];
        const next = path[i + 1];
        
        // Check if direction changes
        const dir1 = getDirection(prev, curr);
        const dir2 = getDirection(curr, next);
        
        if (dir1 !== dir2) {
            compressed.push(curr);
        }
    }
    
    compressed.push(path[path.length - 1]);
    return compressed;
}

function getDirection(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    return `${dx},${dy}`;
}
```

## Path Smoothing

### Line-of-Sight Optimization
```javascript
function smoothPath(path, grid) {
    if (path.length < 3) return path;
    
    const smoothed = [path[0]];
    let current = 0;
    
    while (current < path.length - 1) {
        let farthest = current + 1;
        
        // Find farthest visible point
        for (let i = current + 2; i < path.length; i++) {
            if (hasLineOfSight(path[current], path[i], grid)) {
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

function hasLineOfSight(start, end, grid) {
    // Bresenham's line algorithm
    const dx = Math.abs(end.x - start.x);
    const dy = Math.abs(end.y - start.y);
    const sx = start.x < end.x ? 1 : -1;
    const sy = start.y < end.y ? 1 : -1;
    let err = dx - dy;
    
    let x = start.x;
    let y = start.y;
    
    while (true) {
        if (grid[y][x].isObstacle) return false;
        
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
```

## Path Validation

### Verify Path Integrity
```javascript
function validatePath(path, grid) {
    const errors = [];
    
    // Check path continuity
    for (let i = 1; i < path.length; i++) {
        const prev = path[i - 1];
        const curr = path[i];
        
        const dx = Math.abs(curr.x - prev.x);
        const dy = Math.abs(curr.y - prev.y);
        
        // Check if move is valid (adjacent cells)
        if (dx > 1 || dy > 1 || (dx === 0 && dy === 0)) {
            errors.push(`Invalid move from (${prev.x},${prev.y}) to (${curr.x},${curr.y})`);
        }
        
        // Check if cell is passable
        if (grid[curr.y][curr.x].isObstacle) {
            errors.push(`Path goes through obstacle at (${curr.x},${curr.y})`);
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}
```

## Path Metrics

### Calculate Path Statistics
```javascript
function analyzePathMetrics(path) {
    let totalDistance = 0;
    let straightMoves = 0;
    let diagonalMoves = 0;
    let directionChanges = 0;
    
    for (let i = 1; i < path.length; i++) {
        const prev = path[i - 1];
        const curr = path[i];
        
        const dx = Math.abs(curr.x - prev.x);
        const dy = Math.abs(curr.y - prev.y);
        
        // Calculate distance
        if (dx === 1 && dy === 1) {
            totalDistance += Math.sqrt(2);  // Diagonal
            diagonalMoves++;
        } else {
            totalDistance += 1;  // Cardinal
            straightMoves++;
        }
        
        // Count direction changes
        if (i > 1) {
            const prevPrev = path[i - 2];
            const dir1 = getDirection(prevPrev, prev);
            const dir2 = getDirection(prev, curr);
            if (dir1 !== dir2) {
                directionChanges++;
            }
        }
    }
    
    return {
        totalDistance: totalDistance.toFixed(2),
        pathLength: path.length,
        straightMoves,
        diagonalMoves,
        directionChanges,
        efficiency: (totalDistance / (path.length - 1)).toFixed(2)
    };
}
```

## Memory-Efficient Reconstruction

### Iterative (Stack-Free) Approach
```javascript
function reconstructPathIterative(goalNode) {
    // Count path length first
    let length = 0;
    let current = goalNode;
    while (current !== null) {
        length++;
        current = current.parent;
    }
    
    // Pre-allocate array
    const path = new Array(length);
    
    // Fill array backwards
    current = goalNode;
    for (let i = length - 1; i >= 0; i--) {
        path[i] = {x: current.x, y: current.y};
        current = current.parent;
    }
    
    return path;
}
```

## Debugging Path Issues

### Common Problems
1. **Infinite Loop**: Circular parent references
2. **Broken Chain**: Missing parent pointer
3. **Wrong Direction**: Parent points to child
4. **Memory Leak**: Keeping full node references

### Debug Visualization
```javascript
function debugPath(goalNode) {
    const visited = new Set();
    let current = goalNode;
    let steps = 0;
    
    console.log('Path reconstruction debug:');
    
    while (current !== null && steps < 1000) {
        const key = `${current.x},${current.y}`;
        
        if (visited.has(key)) {
            console.error('Circular reference detected at:', key);
            break;
        }
        
        visited.add(key);
        console.log(`Step ${steps}: (${current.x}, ${current.y})`);
        
        current = current.parent;
        steps++;
    }
    
    if (steps >= 1000) {
        console.error('Path too long, possible infinite loop');
    }
}
```

---
**Previous:** [Open/Closed Set Management](05-set-management.md)
**Next:** [Complete Implementation](07-complete-implementation.md)

**Interactive:** [Trace path reconstruction](demo.html)