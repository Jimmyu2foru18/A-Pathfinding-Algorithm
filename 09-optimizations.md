# Optimization Techniques

## Performance Bottlenecks

### Common Performance Issues
1. **Open Set Management**: O(log n) operations
2. **Neighbor Generation**: Repeated calculations
3. **Heuristic Computation**: Called frequently
4. **Memory Allocation**: Creating/destroying objects
5. **Grid Access**: Bounds checking overhead

## Memory Optimizations

### 1. Node Pooling
```javascript
class NodePool {
    constructor(initialSize = 1000) {
        this.available = [];
        this.inUse = new Set();
        
        // Pre-allocate nodes
        for (let i = 0; i < initialSize; i++) {
            this.available.push(new PathNode());
        }
    }
    
    acquire(x, y) {
        const key = `${x},${y}`;
        
        if (this.inUse.has(key)) {
            return this.inUse.get(key);
        }
        
        let node = this.available.pop();
        if (!node) {
            node = new PathNode();
        }
        
        node.reset(x, y);
        this.inUse.set(key, node);
        return node;
    }
    
    release(node) {
        const key = `${node.x},${node.y}`;
        this.inUse.delete(key);
        this.available.push(node);
    }
    
    releaseAll() {
        for (const node of this.inUse.values()) {
            this.available.push(node);
        }
        this.inUse.clear();
    }
}

class PathNode {
    constructor() {
        this.reset(0, 0);
    }
    
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.gCost = Infinity;
        this.hCost = 0;
        this.fCost = Infinity;
        this.parent = null;
        this.inOpenSet = false;
        this.inClosedSet = false;
    }
}
```

### 2. Coordinate Hashing
```javascript
class CoordinateHasher {
    constructor(maxWidth = 10000) {
        this.maxWidth = maxWidth;
    }
    
    hash(x, y) {
        return y * this.maxWidth + x;
    }
    
    unhash(hash) {
        return {
            x: hash % this.maxWidth,
            y: Math.floor(hash / this.maxWidth)
        };
    }
}

// Usage in pathfinder
class OptimizedAStar {
    constructor() {
        this.hasher = new CoordinateHasher();
        this.gScores = new Map();  // hash -> gScore
        this.parents = new Map();  // hash -> parentHash
    }
    
    findPath(grid, start, goal) {
        const startHash = this.hasher.hash(start.x, start.y);
        const goalHash = this.hasher.hash(goal.x, goal.y);
        
        this.gScores.set(startHash, 0);
        // ... rest of algorithm using hashes
    }
}
```

### 3. Bit-Packed Grid
```javascript
class BitPackedGrid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        // Pack 32 cells per integer
        this.data = new Uint32Array(Math.ceil(width * height / 32));
    }
    
    setObstacle(x, y, isObstacle) {
        const index = y * this.width + x;
        const arrayIndex = Math.floor(index / 32);
        const bitIndex = index % 32;
        
        if (isObstacle) {
            this.data[arrayIndex] |= (1 << bitIndex);
        } else {
            this.data[arrayIndex] &= ~(1 << bitIndex);
        }
    }
    
    isObstacle(x, y) {
        const index = y * this.width + x;
        const arrayIndex = Math.floor(index / 32);
        const bitIndex = index % 32;
        
        return (this.data[arrayIndex] & (1 << bitIndex)) !== 0;
    }
    
    isValid(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
}
```

## Algorithmic Optimizations

### 1. Jump Point Search (JPS)
```javascript
class JumpPointSearch {
    constructor(grid) {
        this.grid = grid;
        this.width = grid[0].length;
        this.height = grid.length;
    }
    
    findPath(start, goal) {
        const openSet = new MinHeap();
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        
        const startKey = `${start.x},${start.y}`;
        gScore.set(startKey, 0);
        openSet.insert({
            ...start,
            fCost: this.heuristic(start, goal)
        });
        
        while (!openSet.isEmpty()) {
            const current = openSet.extractMin();
            const currentKey = `${current.x},${current.y}`;
            
            if (current.x === goal.x && current.y === goal.y) {
                return this.reconstructPath(cameFrom, current);
            }
            
            closedSet.add(currentKey);
            
            // Find jump points instead of all neighbors
            const jumpPoints = this.findJumpPoints(current, goal);
            
            for (const jp of jumpPoints) {
                const jpKey = `${jp.x},${jp.y}`;
                
                if (closedSet.has(jpKey)) continue;
                
                const tentativeG = gScore.get(currentKey) + jp.distance;
                
                if (!gScore.has(jpKey) || tentativeG < gScore.get(jpKey)) {
                    cameFrom.set(jpKey, current);
                    gScore.set(jpKey, tentativeG);
                    
                    const fCost = tentativeG + this.heuristic(jp, goal);
                    openSet.insert({...jp, fCost});
                }
            }
        }
        
        return null;
    }
    
    findJumpPoints(current, goal) {
        const jumpPoints = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (const [dx, dy] of directions) {
            const jp = this.jump(current.x, current.y, dx, dy, goal);
            if (jp) {
                const distance = Math.sqrt(
                    (jp.x - current.x) ** 2 + (jp.y - current.y) ** 2
                );
                jumpPoints.push({...jp, distance});
            }
        }
        
        return jumpPoints;
    }
    
    jump(x, y, dx, dy, goal) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (!this.isWalkable(nx, ny)) return null;
        if (nx === goal.x && ny === goal.y) return {x: nx, y: ny};
        
        // Check for forced neighbors
        if (this.hasForcedNeighbors(nx, ny, dx, dy)) {
            return {x: nx, y: ny};
        }
        
        // Diagonal movement: check cardinal directions
        if (dx !== 0 && dy !== 0) {
            if (this.jump(nx, ny, dx, 0, goal) || 
                this.jump(nx, ny, 0, dy, goal)) {
                return {x: nx, y: ny};
            }
        }
        
        // Continue jumping
        return this.jump(nx, ny, dx, dy, goal);
    }
    
    hasForcedNeighbors(x, y, dx, dy) {
        // Implementation depends on movement rules
        // This is a simplified version
        if (dx === 0) {  // Vertical movement
            return (!this.isWalkable(x - 1, y - dy) && this.isWalkable(x - 1, y)) ||
                   (!this.isWalkable(x + 1, y - dy) && this.isWalkable(x + 1, y));
        }
        
        if (dy === 0) {  // Horizontal movement
            return (!this.isWalkable(x - dx, y - 1) && this.isWalkable(x, y - 1)) ||
                   (!this.isWalkable(x - dx, y + 1) && this.isWalkable(x, y + 1));
        }
        
        // Diagonal movement
        return (!this.isWalkable(x - dx, y) && this.isWalkable(x - dx, y + dy)) ||
               (!this.isWalkable(x, y - dy) && this.isWalkable(x + dx, y - dy));
    }
    
    isWalkable(x, y) {
        return x >= 0 && x < this.width && 
               y >= 0 && y < this.height && 
               !this.grid[y][x].isObstacle;
    }
}
```

### 2. Bidirectional A*
```javascript
class BidirectionalAStar {
    constructor() {
        this.forwardSearch = new AStarSearch();
        this.backwardSearch = new AStarSearch();
    }
    
    findPath(grid, start, goal) {
        this.forwardSearch.initialize(grid, start, goal);
        this.backwardSearch.initialize(grid, goal, start);
        
        let bestPath = null;
        let bestCost = Infinity;
        
        while (!this.forwardSearch.openSet.isEmpty() && 
               !this.backwardSearch.openSet.isEmpty()) {
            
            // Expand forward search
            const forwardNode = this.forwardSearch.expandBestNode();
            if (forwardNode) {
                const meetingPoint = this.checkMeeting(
                    forwardNode, this.backwardSearch.closedSet
                );
                
                if (meetingPoint) {
                    const path = this.constructBidirectionalPath(
                        forwardNode, meetingPoint
                    );
                    const cost = this.calculatePathCost(path);
                    
                    if (cost < bestCost) {
                        bestPath = path;
                        bestCost = cost;
                    }
                }
            }
            
            // Expand backward search
            const backwardNode = this.backwardSearch.expandBestNode();
            if (backwardNode) {
                const meetingPoint = this.checkMeeting(
                    backwardNode, this.forwardSearch.closedSet
                );
                
                if (meetingPoint) {
                    const path = this.constructBidirectionalPath(
                        meetingPoint, backwardNode
                    );
                    const cost = this.calculatePathCost(path);
                    
                    if (cost < bestCost) {
                        bestPath = path;
                        bestCost = cost;
                    }
                }
            }
            
            // Early termination condition
            if (bestPath && this.shouldTerminate(bestCost)) {
                break;
            }
        }
        
        return bestPath;
    }
    
    checkMeeting(node, otherClosedSet) {
        const key = `${node.x},${node.y}`;
        return otherClosedSet.has(key) ? otherClosedSet.get(key) : null;
    }
    
    constructBidirectionalPath(forwardNode, backwardNode) {
        const forwardPath = this.forwardSearch.reconstructPath(forwardNode);
        const backwardPath = this.backwardSearch.reconstructPath(backwardNode);
        
        // Reverse backward path and concatenate
        backwardPath.reverse();
        return [...forwardPath, ...backwardPath.slice(1)];
    }
}
```

### 3. Hierarchical Pathfinding
```javascript
class HierarchicalAStar {
    constructor(grid, clusterSize = 10) {
        this.grid = grid;
        this.clusterSize = clusterSize;
        this.abstractGraph = this.buildAbstractGraph();
        this.lowLevelPathfinder = new AStarPathfinder();
        this.highLevelPathfinder = new AStarPathfinder();
    }
    
    findPath(start, goal) {
        // 1. Find abstract path
        const startCluster = this.getCluster(start);
        const goalCluster = this.getCluster(goal);
        
        if (startCluster === goalCluster) {
            // Same cluster, use low-level pathfinding
            return this.lowLevelPathfinder.findPath(this.grid, start, goal);
        }
        
        const abstractPath = this.highLevelPathfinder.findPath(
            this.abstractGraph,
            startCluster,
            goalCluster
        );
        
        if (!abstractPath) return null;
        
        // 2. Refine abstract path
        return this.refinePath(abstractPath, start, goal);
    }
    
    buildAbstractGraph() {
        const clusters = this.createClusters();
        const graph = [];
        
        for (let y = 0; y < clusters.height; y++) {
            graph[y] = [];
            for (let x = 0; x < clusters.width; x++) {
                graph[y][x] = {
                    isObstacle: this.isClusterBlocked(x, y),
                    entrances: this.findClusterEntrances(x, y),
                    exits: this.findClusterExits(x, y)
                };
            }
        }
        
        return graph;
    }
    
    createClusters() {
        const width = Math.ceil(this.grid[0].length / this.clusterSize);
        const height = Math.ceil(this.grid.length / this.clusterSize);
        
        return { width, height };
    }
    
    isClusterBlocked(clusterX, clusterY) {
        const startX = clusterX * this.clusterSize;
        const startY = clusterY * this.clusterSize;
        const endX = Math.min(startX + this.clusterSize, this.grid[0].length);
        const endY = Math.min(startY + this.clusterSize, this.grid.length);
        
        let passableCells = 0;
        let totalCells = 0;
        
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                totalCells++;
                if (!this.grid[y][x].isObstacle) {
                    passableCells++;
                }
            }
        }
        
        return (passableCells / totalCells) < 0.3; // 30% threshold
    }
}
```

## Data Structure Optimizations

### 1. Fibonacci Heap for Open Set
```javascript
class FibonacciHeap {
    constructor() {
        this.minNode = null;
        this.nodeCount = 0;
        this.nodeMap = new Map();
    }
    
    insert(node) {
        const fibNode = new FibNode(node);
        this.nodeMap.set(`${node.x},${node.y}`, fibNode);
        
        if (this.minNode === null) {
            this.minNode = fibNode;
        } else {
            this.addToRootList(fibNode);
            if (fibNode.key < this.minNode.key) {
                this.minNode = fibNode;
            }
        }
        
        this.nodeCount++;
    }
    
    extractMin() {
        const min = this.minNode;
        if (min === null) return null;
        
        // Add children to root list
        if (min.child !== null) {
            let child = min.child;
            do {
                const next = child.right;
                this.addToRootList(child);
                child.parent = null;
                child = next;
            } while (child !== min.child);
        }
        
        // Remove min from root list
        this.removeFromRootList(min);
        
        if (min === min.right) {
            this.minNode = null;
        } else {
            this.minNode = min.right;
            this.consolidate();
        }
        
        this.nodeCount--;
        this.nodeMap.delete(`${min.data.x},${min.data.y}`);
        return min.data;
    }
    
    decreaseKey(node, newKey) {
        const fibNode = this.nodeMap.get(`${node.x},${node.y}`);
        if (!fibNode || newKey >= fibNode.key) return;
        
        fibNode.key = newKey;
        const parent = fibNode.parent;
        
        if (parent !== null && fibNode.key < parent.key) {
            this.cut(fibNode, parent);
            this.cascadingCut(parent);
        }
        
        if (fibNode.key < this.minNode.key) {
            this.minNode = fibNode;
        }
    }
    
    consolidate() {
        const maxDegree = Math.floor(Math.log2(this.nodeCount)) + 1;
        const degreeTable = new Array(maxDegree).fill(null);
        
        const rootList = [];
        let current = this.minNode;
        
        if (current !== null) {
            do {
                rootList.push(current);
                current = current.right;
            } while (current !== this.minNode);
        }
        
        for (const node of rootList) {
            let degree = node.degree;
            
            while (degreeTable[degree] !== null) {
                let other = degreeTable[degree];
                
                if (node.key > other.key) {
                    [node, other] = [other, node];
                }
                
                this.link(other, node);
                degreeTable[degree] = null;
                degree++;
            }
            
            degreeTable[degree] = node;
        }
        
        this.minNode = null;
        
        for (const node of degreeTable) {
            if (node !== null) {
                if (this.minNode === null) {
                    this.minNode = node;
                } else {
                    this.addToRootList(node);
                    if (node.key < this.minNode.key) {
                        this.minNode = node;
                    }
                }
            }
        }
    }
}
```

### 2. Cache-Friendly Memory Layout
```javascript
class CacheOptimizedGrid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        
        // Store grid data in a single flat array for better cache locality
        this.data = new Float32Array(width * height * 4); // x, y, gCost, hCost
        this.obstacles = new Uint8Array(width * height); // 1 byte per cell
    }
    
    getIndex(x, y) {
        return y * this.width + x;
    }
    
    setObstacle(x, y, isObstacle) {
        this.obstacles[this.getIndex(x, y)] = isObstacle ? 1 : 0;
    }
    
    isObstacle(x, y) {
        return this.obstacles[this.getIndex(x, y)] === 1;
    }
    
    setGCost(x, y, cost) {
        const baseIndex = this.getIndex(x, y) * 4;
        this.data[baseIndex + 2] = cost;
    }
    
    getGCost(x, y) {
        const baseIndex = this.getIndex(x, y) * 4;
        return this.data[baseIndex + 2];
    }
    
    setHCost(x, y, cost) {
        const baseIndex = this.getIndex(x, y) * 4;
        this.data[baseIndex + 3] = cost;
    }
    
    getHCost(x, y) {
        const baseIndex = this.getIndex(x, y) * 4;
        return this.data[baseIndex + 3];
    }
    
    getFCost(x, y) {
        return this.getGCost(x, y) + this.getHCost(x, y);
    }
}
```

## Parallel Processing

### 1. Web Workers for Large Grids
```javascript
// main.js
class ParallelPathfinder {
    constructor(numWorkers = 4) {
        this.workers = [];
        this.taskQueue = [];
        this.activeJobs = new Map();
        
        for (let i = 0; i < numWorkers; i++) {
            const worker = new Worker('pathfinding-worker.js');
            worker.onmessage = this.handleWorkerMessage.bind(this);
            this.workers.push(worker);
        }
    }
    
    findPathAsync(grid, start, goal) {
        return new Promise((resolve, reject) => {
            const jobId = this.generateJobId();
            const task = {
                id: jobId,
                grid: grid,
                start: start,
                goal: goal,
                resolve: resolve,
                reject: reject
            };
            
            this.activeJobs.set(jobId, task);
            
            const availableWorker = this.getAvailableWorker();
            if (availableWorker) {
                this.assignTask(availableWorker, task);
            } else {
                this.taskQueue.push(task);
            }
        });
    }
    
    handleWorkerMessage(event) {
        const { jobId, result, error } = event.data;
        const job = this.activeJobs.get(jobId);
        
        if (job) {
            this.activeJobs.delete(jobId);
            
            if (error) {
                job.reject(new Error(error));
            } else {
                job.resolve(result);
            }
            
            // Assign next task if available
            if (this.taskQueue.length > 0) {
                const nextTask = this.taskQueue.shift();
                this.assignTask(event.target, nextTask);
            }
        }
    }
}

// pathfinding-worker.js
self.onmessage = function(event) {
    const { jobId, grid, start, goal } = event.data;
    
    try {
        const pathfinder = new AStarPathfinder();
        const path = pathfinder.findPath(grid, start, goal);
        
        self.postMessage({
            jobId: jobId,
            result: path
        });
    } catch (error) {
        self.postMessage({
            jobId: jobId,
            error: error.message
        });
    }
};
```

### 2. SIMD Optimizations
```javascript
// Using SIMD for heuristic calculations (when available)
class SIMDOptimizedPathfinder {
    constructor() {
        this.simdSupported = typeof SIMD !== 'undefined';
    }
    
    calculateManhattanDistanceBatch(points, goal) {
        if (this.simdSupported && points.length >= 4) {
            return this.calculateManhattanSIMD(points, goal);
        } else {
            return this.calculateManhattanScalar(points, goal);
        }
    }
    
    calculateManhattanSIMD(points, goal) {
        const results = [];
        const goalX = SIMD.Float32x4.splat(goal.x);
        const goalY = SIMD.Float32x4.splat(goal.y);
        
        for (let i = 0; i < points.length; i += 4) {
            const x = SIMD.Float32x4(
                points[i]?.x || 0,
                points[i + 1]?.x || 0,
                points[i + 2]?.x || 0,
                points[i + 3]?.x || 0
            );
            
            const y = SIMD.Float32x4(
                points[i]?.y || 0,
                points[i + 1]?.y || 0,
                points[i + 2]?.y || 0,
                points[i + 3]?.y || 0
            );
            
            const dx = SIMD.Float32x4.abs(SIMD.Float32x4.sub(x, goalX));
            const dy = SIMD.Float32x4.abs(SIMD.Float32x4.sub(y, goalY));
            const distances = SIMD.Float32x4.add(dx, dy);
            
            results.push(
                SIMD.Float32x4.extractLane(distances, 0),
                SIMD.Float32x4.extractLane(distances, 1),
                SIMD.Float32x4.extractLane(distances, 2),
                SIMD.Float32x4.extractLane(distances, 3)
            );
        }
        
        return results.slice(0, points.length);
    }
}
```

## Benchmarking and Profiling

### Performance Measurement
```javascript
class PathfindingBenchmark {
    constructor() {
        this.results = [];
    }
    
    benchmark(pathfinder, testCases) {
        for (const testCase of testCases) {
            const result = this.runSingleBenchmark(pathfinder, testCase);
            this.results.push(result);
        }
        
        return this.analyzeResults();
    }
    
    runSingleBenchmark(pathfinder, testCase) {
        const { grid, start, goal, name } = testCase;
        
        // Warm up
        for (let i = 0; i < 3; i++) {
            pathfinder.findPath(grid, start, goal);
        }
        
        // Measure
        const iterations = 100;
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            pathfinder.findPath(grid, start, goal);
        }
        
        const endTime = performance.now();
        const avgTime = (endTime - startTime) / iterations;
        
        return {
            name: name,
            avgTime: avgTime,
            gridSize: `${grid[0].length}x${grid.length}`,
            pathLength: pathfinder.findPath(grid, start, goal)?.length || 0
        };
    }
    
    analyzeResults() {
        const analysis = {
            totalTests: this.results.length,
            avgTime: this.results.reduce((sum, r) => sum + r.avgTime, 0) / this.results.length,
            fastest: this.results.reduce((min, r) => r.avgTime < min.avgTime ? r : min),
            slowest: this.results.reduce((max, r) => r.avgTime > max.avgTime ? r : max)
        };
        
        console.table(this.results);
        console.log('Analysis:', analysis);
        
        return analysis;
    }
}
```

---
**Previous:** [Real-World Applications](08-applications.md)
**Next:** [Interactive Demo Guide](10-demo-guide.md)

**Interactive:** [Test optimizations](demo.html)