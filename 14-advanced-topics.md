# Advanced Topics

## Hierarchical Pathfinding

### Concept Overview
Hierarchical pathfinding breaks down large pathfinding problems into smaller, manageable chunks by creating multiple levels of abstraction.

### Implementation Strategy
```javascript
class HierarchicalPathfinder {
    constructor(gridWidth, gridHeight, clusterSize = 10) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.clusterSize = clusterSize;
        this.clusters = [];
        this.abstractGraph = new Map();
        this.entrancePoints = new Map();
        
        this.buildHierarchy();
    }
    
    buildHierarchy() {
        // Step 1: Divide grid into clusters
        this.createClusters();
        
        // Step 2: Identify entrance points between clusters
        this.identifyEntrancePoints();
        
        // Step 3: Build abstract graph
        this.buildAbstractGraph();
    }
    
    createClusters() {
        const clustersX = Math.ceil(this.gridWidth / this.clusterSize);
        const clustersY = Math.ceil(this.gridHeight / this.clusterSize);
        
        for (let cy = 0; cy < clustersY; cy++) {
            for (let cx = 0; cx < clustersX; cx++) {
                const cluster = {
                    id: `${cx}_${cy}`,
                    x: cx,
                    y: cy,
                    startX: cx * this.clusterSize,
                    startY: cy * this.clusterSize,
                    endX: Math.min((cx + 1) * this.clusterSize - 1, this.gridWidth - 1),
                    endY: Math.min((cy + 1) * this.clusterSize - 1, this.gridHeight - 1),
                    entrances: [],
                    internalPaths: new Map()
                };
                
                this.clusters.push(cluster);
            }
        }
    }
    
    identifyEntrancePoints() {
        for (const cluster of this.clusters) {
            // Check horizontal borders (top and bottom)
            this.findHorizontalEntrances(cluster);
            
            // Check vertical borders (left and right)
            this.findVerticalEntrances(cluster);
        }
    }
    
    findHorizontalEntrances(cluster) {
        // Top border
        if (cluster.startY > 0) {
            for (let x = cluster.startX; x <= cluster.endX; x++) {
                if (!grid[cluster.startY][x].isObstacle && 
                    !grid[cluster.startY - 1][x].isObstacle) {
                    
                    const entrance = {
                        x: x,
                        y: cluster.startY,
                        direction: 'north',
                        clusterId: cluster.id,
                        neighborClusterId: this.getClusterAt(x, cluster.startY - 1)?.id
                    };
                    
                    cluster.entrances.push(entrance);
                    this.entrancePoints.set(`${x}_${cluster.startY}`, entrance);
                }
            }
        }
        
        // Bottom border
        if (cluster.endY < this.gridHeight - 1) {
            for (let x = cluster.startX; x <= cluster.endX; x++) {
                if (!grid[cluster.endY][x].isObstacle && 
                    !grid[cluster.endY + 1][x].isObstacle) {
                    
                    const entrance = {
                        x: x,
                        y: cluster.endY,
                        direction: 'south',
                        clusterId: cluster.id,
                        neighborClusterId: this.getClusterAt(x, cluster.endY + 1)?.id
                    };
                    
                    cluster.entrances.push(entrance);
                    this.entrancePoints.set(`${x}_${cluster.endY}`, entrance);
                }
            }
        }
    }
    
    findVerticalEntrances(cluster) {
        // Left border
        if (cluster.startX > 0) {
            for (let y = cluster.startY; y <= cluster.endY; y++) {
                if (!grid[y][cluster.startX].isObstacle && 
                    !grid[y][cluster.startX - 1].isObstacle) {
                    
                    const entrance = {
                        x: cluster.startX,
                        y: y,
                        direction: 'west',
                        clusterId: cluster.id,
                        neighborClusterId: this.getClusterAt(cluster.startX - 1, y)?.id
                    };
                    
                    cluster.entrances.push(entrance);
                    this.entrancePoints.set(`${cluster.startX}_${y}`, entrance);
                }
            }
        }
        
        // Right border
        if (cluster.endX < this.gridWidth - 1) {
            for (let y = cluster.startY; y <= cluster.endY; y++) {
                if (!grid[y][cluster.endX].isObstacle && 
                    !grid[y][cluster.endX + 1].isObstacle) {
                    
                    const entrance = {
                        x: cluster.endX,
                        y: y,
                        direction: 'east',
                        clusterId: cluster.id,
                        neighborClusterId: this.getClusterAt(cluster.endX + 1, y)?.id
                    };
                    
                    cluster.entrances.push(entrance);
                    this.entrancePoints.set(`${cluster.endX}_${y}`, entrance);
                }
            }
        }
    }
    
    buildAbstractGraph() {
        for (const cluster of this.clusters) {
            // Pre-compute paths between all entrance points within the cluster
            this.computeIntraClusterPaths(cluster);
            
            // Add cluster to abstract graph
            this.abstractGraph.set(cluster.id, {
                cluster: cluster,
                connections: new Map()
            });
        }
        
        // Connect adjacent clusters
        this.connectAdjacentClusters();
    }
    
    computeIntraClusterPaths(cluster) {
        const entrances = cluster.entrances;
        
        for (let i = 0; i < entrances.length; i++) {
            for (let j = i + 1; j < entrances.length; j++) {
                const start = entrances[i];
                const end = entrances[j];
                
                // Run A* within the cluster
                const path = this.findPathWithinCluster(start, end, cluster);
                
                if (path) {
                    const pathKey = `${start.x}_${start.y}_to_${end.x}_${end.y}`;
                    cluster.internalPaths.set(pathKey, {
                        path: path,
                        cost: path.length - 1
                    });
                    
                    // Also store reverse path
                    const reverseKey = `${end.x}_${end.y}_to_${start.x}_${start.y}`;
                    cluster.internalPaths.set(reverseKey, {
                        path: path.slice().reverse(),
                        cost: path.length - 1
                    });
                }
            }
        }
    }
    
    findPathWithinCluster(start, end, cluster) {
        // Simplified A* implementation for intra-cluster pathfinding
        const openSet = [{ x: start.x, y: start.y, gCost: 0, hCost: 0, fCost: 0, parent: null }];
        const closedSet = new Set();
        
        while (openSet.length > 0) {
            let currentNode = openSet[0];
            for (let i = 1; i < openSet.length; i++) {
                if (openSet[i].fCost < currentNode.fCost) {
                    currentNode = openSet[i];
                }
            }
            
            const currentIndex = openSet.indexOf(currentNode);
            openSet.splice(currentIndex, 1);
            closedSet.add(`${currentNode.x}_${currentNode.y}`);
            
            if (currentNode.x === end.x && currentNode.y === end.y) {
                return this.reconstructClusterPath(currentNode);
            }
            
            const neighbors = this.getClusterNeighbors(currentNode, cluster);
            
            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x}_${neighbor.y}`;
                if (closedSet.has(neighborKey)) continue;
                
                const tentativeGCost = currentNode.gCost + 1;
                
                let neighborNode = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);
                if (!neighborNode) {
                    neighborNode = {
                        x: neighbor.x,
                        y: neighbor.y,
                        gCost: tentativeGCost,
                        hCost: manhattanDistance(neighbor, end),
                        parent: currentNode
                    };
                    neighborNode.fCost = neighborNode.gCost + neighborNode.hCost;
                    openSet.push(neighborNode);
                } else if (tentativeGCost < neighborNode.gCost) {
                    neighborNode.gCost = tentativeGCost;
                    neighborNode.fCost = neighborNode.gCost + neighborNode.hCost;
                    neighborNode.parent = currentNode;
                }
            }
        }
        
        return null; // No path found
    }
    
    getClusterNeighbors(node, cluster) {
        const neighbors = [];
        const directions = [
            { dx: 0, dy: -1 }, { dx: 1, dy: 0 },
            { dx: 0, dy: 1 }, { dx: -1, dy: 0 }
        ];
        
        for (const dir of directions) {
            const newX = node.x + dir.dx;
            const newY = node.y + dir.dy;
            
            // Check if within cluster bounds
            if (newX >= cluster.startX && newX <= cluster.endX &&
                newY >= cluster.startY && newY <= cluster.endY &&
                newX >= 0 && newX < this.gridWidth &&
                newY >= 0 && newY < this.gridHeight &&
                !grid[newY][newX].isObstacle) {
                
                neighbors.push({ x: newX, y: newY });
            }
        }
        
        return neighbors;
    }
    
    reconstructClusterPath(node) {
        const path = [];
        let current = node;
        
        while (current) {
            path.unshift({ x: current.x, y: current.y });
            current = current.parent;
        }
        
        return path;
    }
    
    connectAdjacentClusters() {
        for (const [clusterId, clusterData] of this.abstractGraph) {
            const cluster = clusterData.cluster;
            
            for (const entrance of cluster.entrances) {
                if (entrance.neighborClusterId) {
                    const neighborData = this.abstractGraph.get(entrance.neighborClusterId);
                    if (neighborData) {
                        clusterData.connections.set(entrance.neighborClusterId, {
                            cost: 1, // Base cost for cluster transition
                            entrance: entrance
                        });
                    }
                }
            }
        }
    }
    
    findHierarchicalPath(startX, startY, goalX, goalY) {
        const startCluster = this.getClusterAt(startX, startY);
        const goalCluster = this.getClusterAt(goalX, goalY);
        
        if (!startCluster || !goalCluster) {
            return null;
        }
        
        // If start and goal are in the same cluster
        if (startCluster.id === goalCluster.id) {
            return this.findPathWithinCluster(
                { x: startX, y: startY },
                { x: goalX, y: goalY },
                startCluster
            );
        }
        
        // Find path through abstract graph
        const abstractPath = this.findAbstractPath(startCluster.id, goalCluster.id);
        if (!abstractPath) {
            return null;
        }
        
        // Refine abstract path to concrete path
        return this.refinePath(abstractPath, startX, startY, goalX, goalY);
    }
    
    findAbstractPath(startClusterId, goalClusterId) {
        const openSet = [{ 
            clusterId: startClusterId, 
            gCost: 0, 
            hCost: 0, 
            fCost: 0, 
            parent: null 
        }];
        const closedSet = new Set();
        
        while (openSet.length > 0) {
            let currentNode = openSet[0];
            for (let i = 1; i < openSet.length; i++) {
                if (openSet[i].fCost < currentNode.fCost) {
                    currentNode = openSet[i];
                }
            }
            
            const currentIndex = openSet.indexOf(currentNode);
            openSet.splice(currentIndex, 1);
            closedSet.add(currentNode.clusterId);
            
            if (currentNode.clusterId === goalClusterId) {
                return this.reconstructAbstractPath(currentNode);
            }
            
            const clusterData = this.abstractGraph.get(currentNode.clusterId);
            
            for (const [neighborId, connection] of clusterData.connections) {
                if (closedSet.has(neighborId)) continue;
                
                const tentativeGCost = currentNode.gCost + connection.cost;
                
                let neighborNode = openSet.find(n => n.clusterId === neighborId);
                if (!neighborNode) {
                    neighborNode = {
                        clusterId: neighborId,
                        gCost: tentativeGCost,
                        hCost: this.getClusterHeuristic(neighborId, goalClusterId),
                        parent: currentNode
                    };
                    neighborNode.fCost = neighborNode.gCost + neighborNode.hCost;
                    openSet.push(neighborNode);
                } else if (tentativeGCost < neighborNode.gCost) {
                    neighborNode.gCost = tentativeGCost;
                    neighborNode.fCost = neighborNode.gCost + neighborNode.hCost;
                    neighborNode.parent = currentNode;
                }
            }
        }
        
        return null;
    }
    
    getClusterHeuristic(clusterId1, clusterId2) {
        const cluster1 = this.clusters.find(c => c.id === clusterId1);
        const cluster2 = this.clusters.find(c => c.id === clusterId2);
        
        return Math.abs(cluster1.x - cluster2.x) + Math.abs(cluster1.y - cluster2.y);
    }
    
    reconstructAbstractPath(node) {
        const path = [];
        let current = node;
        
        while (current) {
            path.unshift(current.clusterId);
            current = current.parent;
        }
        
        return path;
    }
    
    refinePath(abstractPath, startX, startY, goalX, goalY) {
        let fullPath = [];
        
        for (let i = 0; i < abstractPath.length; i++) {
            const clusterId = abstractPath[i];
            const cluster = this.clusters.find(c => c.id === clusterId);
            
            if (i === 0) {
                // First cluster: path from start to exit entrance
                if (abstractPath.length === 1) {
                    // Start and goal in same cluster
                    return this.findPathWithinCluster(
                        { x: startX, y: startY },
                        { x: goalX, y: goalY },
                        cluster
                    );
                } else {
                    // Find best exit entrance
                    const nextClusterId = abstractPath[i + 1];
                    const exitEntrance = this.findBestExitEntrance(cluster, nextClusterId);
                    
                    const segmentPath = this.findPathWithinCluster(
                        { x: startX, y: startY },
                        exitEntrance,
                        cluster
                    );
                    
                    if (segmentPath) {
                        fullPath = fullPath.concat(segmentPath.slice(0, -1)); // Exclude last point to avoid duplication
                    }
                }
            } else if (i === abstractPath.length - 1) {
                // Last cluster: path from entrance to goal
                const prevClusterId = abstractPath[i - 1];
                const entryEntrance = this.findBestEntryEntrance(cluster, prevClusterId);
                
                const segmentPath = this.findPathWithinCluster(
                    entryEntrance,
                    { x: goalX, y: goalY },
                    cluster
                );
                
                if (segmentPath) {
                    fullPath = fullPath.concat(segmentPath);
                }
            } else {
                // Middle cluster: path from entrance to exit
                const prevClusterId = abstractPath[i - 1];
                const nextClusterId = abstractPath[i + 1];
                
                const entryEntrance = this.findBestEntryEntrance(cluster, prevClusterId);
                const exitEntrance = this.findBestExitEntrance(cluster, nextClusterId);
                
                const pathKey = `${entryEntrance.x}_${entryEntrance.y}_to_${exitEntrance.x}_${exitEntrance.y}`;
                const precomputedPath = cluster.internalPaths.get(pathKey);
                
                if (precomputedPath) {
                    fullPath = fullPath.concat(precomputedPath.path.slice(0, -1));
                } else {
                    const segmentPath = this.findPathWithinCluster(entryEntrance, exitEntrance, cluster);
                    if (segmentPath) {
                        fullPath = fullPath.concat(segmentPath.slice(0, -1));
                    }
                }
            }
        }
        
        return fullPath;
    }
    
    findBestExitEntrance(cluster, nextClusterId) {
        return cluster.entrances.find(e => e.neighborClusterId === nextClusterId);
    }
    
    findBestEntryEntrance(cluster, prevClusterId) {
        return cluster.entrances.find(e => e.neighborClusterId === prevClusterId);
    }
    
    getClusterAt(x, y) {
        const clusterX = Math.floor(x / this.clusterSize);
        const clusterY = Math.floor(y / this.clusterSize);
        return this.clusters.find(c => c.x === clusterX && c.y === clusterY);
    }
}
```

## Jump Point Search (JPS)

### Concept and Implementation
Jump Point Search is an optimization of A* for uniform-cost grids that can dramatically reduce the number of nodes explored.

```javascript
class JumpPointSearch {
    constructor() {
        this.directions = {
            horizontal: [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }],
            vertical: [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }],
            diagonal: [
                { dx: 1, dy: 1 }, { dx: 1, dy: -1 },
                { dx: -1, dy: 1 }, { dx: -1, dy: -1 }
            ]
        };
    }
    
    findPath(startX, startY, goalX, goalY) {
        const openSet = new MinHeap();
        const closedSet = new Set();
        
        const startNode = {
            x: startX,
            y: startY,
            gCost: 0,
            hCost: this.octileDistance(startX, startY, goalX, goalY),
            parent: null
        };
        startNode.fCost = startNode.gCost + startNode.hCost;
        
        openSet.insert(startNode);
        
        while (!openSet.isEmpty()) {
            const currentNode = openSet.extractMin();
            const nodeKey = `${currentNode.x}_${currentNode.y}`;
            
            if (closedSet.has(nodeKey)) continue;
            closedSet.add(nodeKey);
            
            if (currentNode.x === goalX && currentNode.y === goalY) {
                return this.reconstructPath(currentNode);
            }
            
            const successors = this.getSuccessors(currentNode, goalX, goalY);
            
            for (const successor of successors) {
                const successorKey = `${successor.x}_${successor.y}`;
                if (closedSet.has(successorKey)) continue;
                
                const gCost = currentNode.gCost + this.octileDistance(
                    currentNode.x, currentNode.y,
                    successor.x, successor.y
                );
                
                const successorNode = {
                    x: successor.x,
                    y: successor.y,
                    gCost: gCost,
                    hCost: this.octileDistance(successor.x, successor.y, goalX, goalY),
                    parent: currentNode
                };
                successorNode.fCost = successorNode.gCost + successorNode.hCost;
                
                openSet.insert(successorNode);
            }
        }
        
        return null;
    }
    
    getSuccessors(node, goalX, goalY) {
        const successors = [];
        const neighbors = this.identifySuccessors(node, goalX, goalY);
        
        for (const neighbor of neighbors) {
            const jumpPoint = this.jump(neighbor.x, neighbor.y, node.x, node.y, goalX, goalY);
            if (jumpPoint) {
                successors.push(jumpPoint);
            }
        }
        
        return successors;
    }
    
    identifySuccessors(node, goalX, goalY) {
        const neighbors = [];
        const parent = node.parent;
        
        if (!parent) {
            // Initial node - add all valid neighbors
            return this.getAllNeighbors(node.x, node.y);
        }
        
        const dx = Math.sign(node.x - parent.x);
        const dy = Math.sign(node.y - parent.y);
        
        if (dx !== 0 && dy !== 0) {
            // Diagonal movement
            this.addDiagonalSuccessors(node.x, node.y, dx, dy, neighbors);
        } else if (dx !== 0) {
            // Horizontal movement
            this.addHorizontalSuccessors(node.x, node.y, dx, neighbors);
        } else if (dy !== 0) {
            // Vertical movement
            this.addVerticalSuccessors(node.x, node.y, dy, neighbors);
        }
        
        return neighbors;
    }
    
    addDiagonalSuccessors(x, y, dx, dy, neighbors) {
        // Continue diagonal
        if (this.isWalkable(x + dx, y + dy)) {
            neighbors.push({ x: x + dx, y: y + dy });
        }
        
        // Horizontal component
        if (this.isWalkable(x + dx, y)) {
            neighbors.push({ x: x + dx, y: y });
        }
        
        // Vertical component
        if (this.isWalkable(x, y + dy)) {
            neighbors.push({ x: x, y: y + dy });
        }
        
        // Forced neighbors
        if (!this.isWalkable(x - dx, y) && this.isWalkable(x - dx, y + dy)) {
            neighbors.push({ x: x - dx, y: y + dy });
        }
        if (!this.isWalkable(x, y - dy) && this.isWalkable(x + dx, y - dy)) {
            neighbors.push({ x: x + dx, y: y - dy });
        }
    }
    
    addHorizontalSuccessors(x, y, dx, neighbors) {
        // Continue horizontal
        if (this.isWalkable(x + dx, y)) {
            neighbors.push({ x: x + dx, y: y });
        }
        
        // Forced neighbors
        if (!this.isWalkable(x, y - 1) && this.isWalkable(x + dx, y - 1)) {
            neighbors.push({ x: x + dx, y: y - 1 });
        }
        if (!this.isWalkable(x, y + 1) && this.isWalkable(x + dx, y + 1)) {
            neighbors.push({ x: x + dx, y: y + 1 });
        }
    }
    
    addVerticalSuccessors(x, y, dy, neighbors) {
        // Continue vertical
        if (this.isWalkable(x, y + dy)) {
            neighbors.push({ x: x, y: y + dy });
        }
        
        // Forced neighbors
        if (!this.isWalkable(x - 1, y) && this.isWalkable(x - 1, y + dy)) {
            neighbors.push({ x: x - 1, y: y + dy });
        }
        if (!this.isWalkable(x + 1, y) && this.isWalkable(x + 1, y + dy)) {
            neighbors.push({ x: x + 1, y: y + dy });
        }
    }
    
    jump(x, y, parentX, parentY, goalX, goalY) {
        if (!this.isWalkable(x, y)) {
            return null;
        }
        
        if (x === goalX && y === goalY) {
            return { x, y };
        }
        
        const dx = Math.sign(x - parentX);
        const dy = Math.sign(y - parentY);
        
        if (dx !== 0 && dy !== 0) {
            // Diagonal jump
            return this.jumpDiagonal(x, y, dx, dy, goalX, goalY);
        } else if (dx !== 0) {
            // Horizontal jump
            return this.jumpHorizontal(x, y, dx, goalX, goalY);
        } else if (dy !== 0) {
            // Vertical jump
            return this.jumpVertical(x, y, dy, goalX, goalY);
        }
        
        return null;
    }
    
    jumpDiagonal(x, y, dx, dy, goalX, goalY) {
        // Check for forced neighbors
        if ((this.isWalkable(x - dx, y + dy) && !this.isWalkable(x - dx, y)) ||
            (this.isWalkable(x + dx, y - dy) && !this.isWalkable(x, y - dy))) {
            return { x, y };
        }
        
        // Check horizontal and vertical components
        if (this.jump(x + dx, y, x, y, goalX, goalY) ||
            this.jump(x, y + dy, x, y, goalX, goalY)) {
            return { x, y };
        }
        
        // Continue diagonal
        return this.jump(x + dx, y + dy, x, y, goalX, goalY);
    }
    
    jumpHorizontal(x, y, dx, goalX, goalY) {
        // Check for forced neighbors
        if ((this.isWalkable(x + dx, y + 1) && !this.isWalkable(x, y + 1)) ||
            (this.isWalkable(x + dx, y - 1) && !this.isWalkable(x, y - 1))) {
            return { x, y };
        }
        
        // Continue horizontal
        return this.jump(x + dx, y, x, y, goalX, goalY);
    }
    
    jumpVertical(x, y, dy, goalX, goalY) {
        // Check for forced neighbors
        if ((this.isWalkable(x + 1, y + dy) && !this.isWalkable(x + 1, y)) ||
            (this.isWalkable(x - 1, y + dy) && !this.isWalkable(x - 1, y))) {
            return { x, y };
        }
        
        // Continue vertical
        return this.jump(x, y + dy, x, y, goalX, goalY);
    }
    
    getAllNeighbors(x, y) {
        const neighbors = [];
        
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                
                const newX = x + dx;
                const newY = y + dy;
                
                if (this.isWalkable(newX, newY)) {
                    neighbors.push({ x: newX, y: newY });
                }
            }
        }
        
        return neighbors;
    }
    
    isWalkable(x, y) {
        return x >= 0 && x < GRID_WIDTH && 
               y >= 0 && y < GRID_HEIGHT && 
               !grid[y][x].isObstacle;
    }
    
    octileDistance(x1, y1, x2, y2) {
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        return Math.max(dx, dy) + (Math.sqrt(2) - 1) * Math.min(dx, dy);
    }
    
    reconstructPath(node) {
        const path = [];
        let current = node;
        
        while (current) {
            path.unshift({ x: current.x, y: current.y });
            current = current.parent;
        }
        
        return path;
    }
}
```

## Bidirectional A*

### Implementation
```javascript
class BidirectionalAStar {
    constructor() {
        this.forwardSearch = {
            openSet: new MinHeap(),
            closedSet: new Map(),
            gCosts: new Map()
        };
        
        this.backwardSearch = {
            openSet: new MinHeap(),
            closedSet: new Map(),
            gCosts: new Map()
        };
        
        this.meetingPoint = null;
        this.bestPathCost = Infinity;
    }
    
    findPath(startX, startY, goalX, goalY) {
        this.initializeSearch(startX, startY, goalX, goalY);
        
        while (!this.forwardSearch.openSet.isEmpty() && !this.backwardSearch.openSet.isEmpty()) {
            // Expand from the search with smaller f-cost
            const forwardTop = this.forwardSearch.openSet.peek();
            const backwardTop = this.backwardSearch.openSet.peek();
            
            if (forwardTop.fCost <= backwardTop.fCost) {
                if (this.expandNode(this.forwardSearch, this.backwardSearch, 'forward', goalX, goalY)) {
                    break;
                }
            } else {
                if (this.expandNode(this.backwardSearch, this.forwardSearch, 'backward', startX, startY)) {
                    break;
                }
            }
            
            // Check termination condition
            if (this.shouldTerminate()) {
                break;
            }
        }
        
        return this.reconstructBidirectionalPath();
    }
    
    initializeSearch(startX, startY, goalX, goalY) {
        // Initialize forward search
        const startNode = {
            x: startX,
            y: startY,
            gCost: 0,
            hCost: manhattanDistance({ x: startX, y: startY }, { x: goalX, y: goalY }),
            parent: null
        };
        startNode.fCost = startNode.gCost + startNode.hCost;
        
        this.forwardSearch.openSet.insert(startNode);
        this.forwardSearch.gCosts.set(`${startX}_${startY}`, 0);
        
        // Initialize backward search
        const goalNode = {
            x: goalX,
            y: goalY,
            gCost: 0,
            hCost: manhattanDistance({ x: goalX, y: goalY }, { x: startX, y: startY }),
            parent: null
        };
        goalNode.fCost = goalNode.gCost + goalNode.hCost;
        
        this.backwardSearch.openSet.insert(goalNode);
        this.backwardSearch.gCosts.set(`${goalX}_${goalY}`, 0);
    }
    
    expandNode(currentSearch, oppositeSearch, direction, targetX, targetY) {
        const currentNode = currentSearch.openSet.extractMin();
        const nodeKey = `${currentNode.x}_${currentNode.y}`;
        
        currentSearch.closedSet.set(nodeKey, currentNode);
        
        // Check if this node was reached by the opposite search
        if (oppositeSearch.closedSet.has(nodeKey) || oppositeSearch.gCosts.has(nodeKey)) {
            const pathCost = this.calculateMeetingCost(currentNode, oppositeSearch, nodeKey);
            
            if (pathCost < this.bestPathCost) {
                this.bestPathCost = pathCost;
                this.meetingPoint = {
                    node: currentNode,
                    direction: direction,
                    oppositeNode: oppositeSearch.closedSet.get(nodeKey) || 
                                 this.findNodeInOpenSet(oppositeSearch.openSet, currentNode.x, currentNode.y)
                };
            }
            
            return true; // Found meeting point
        }
        
        // Expand neighbors
        const neighbors = this.getNeighbors(currentNode.x, currentNode.y);
        
        for (const neighbor of neighbors) {
            const neighborKey = `${neighbor.x}_${neighbor.y}`;
            
            if (currentSearch.closedSet.has(neighborKey)) continue;
            
            const tentativeGCost = currentNode.gCost + this.getMovementCost(currentNode, neighbor);
            const existingGCost = currentSearch.gCosts.get(neighborKey);
            
            if (existingGCost === undefined || tentativeGCost < existingGCost) {
                const neighborNode = {
                    x: neighbor.x,
                    y: neighbor.y,
                    gCost: tentativeGCost,
                    hCost: direction === 'forward' 
                        ? manhattanDistance(neighbor, { x: targetX, y: targetY })
                        : manhattanDistance(neighbor, { x: targetX, y: targetY }),
                    parent: currentNode
                };
                neighborNode.fCost = neighborNode.gCost + neighborNode.hCost;
                
                currentSearch.openSet.insert(neighborNode);
                currentSearch.gCosts.set(neighborKey, tentativeGCost);
            }
        }
        
        return false;
    }
    
    calculateMeetingCost(currentNode, oppositeSearch, nodeKey) {
        const oppositeGCost = oppositeSearch.gCosts.get(nodeKey) || 
                             oppositeSearch.closedSet.get(nodeKey)?.gCost || 0;
        
        return currentNode.gCost + oppositeGCost;
    }
    
    shouldTerminate() {
        // Terminate if the minimum f-cost in both open sets exceeds the best path cost
        const forwardMinF = this.forwardSearch.openSet.isEmpty() ? Infinity : this.forwardSearch.openSet.peek().fCost;
        const backwardMinF = this.backwardSearch.openSet.isEmpty() ? Infinity : this.backwardSearch.openSet.peek().fCost;
        
        return Math.min(forwardMinF, backwardMinF) >= this.bestPathCost;
    }
    
    reconstructBidirectionalPath() {
        if (!this.meetingPoint) {
            return null;
        }
        
        const forwardPath = [];
        const backwardPath = [];
        
        // Reconstruct forward path
        let current = this.meetingPoint.direction === 'forward' 
            ? this.meetingPoint.node 
            : this.meetingPoint.oppositeNode;
        
        while (current) {
            forwardPath.unshift({ x: current.x, y: current.y });
            current = current.parent;
        }
        
        // Reconstruct backward path
        current = this.meetingPoint.direction === 'backward' 
            ? this.meetingPoint.node 
            : this.meetingPoint.oppositeNode;
        
        while (current && current.parent) { // Skip the meeting point to avoid duplication
            current = current.parent;
            backwardPath.push({ x: current.x, y: current.y });
        }
        
        return forwardPath.concat(backwardPath);
    }
    
    getNeighbors(x, y) {
        const neighbors = [];
        const directions = [
            { dx: 0, dy: -1 }, { dx: 1, dy: 0 },
            { dx: 0, dy: 1 }, { dx: -1, dy: 0 },
            { dx: 1, dy: -1 }, { dx: 1, dy: 1 },
            { dx: -1, dy: 1 }, { dx: -1, dy: -1 }
        ];
        
        for (const dir of directions) {
            const newX = x + dir.dx;
            const newY = y + dir.dy;
            
            if (newX >= 0 && newX < GRID_WIDTH &&
                newY >= 0 && newY < GRID_HEIGHT &&
                !grid[newY][newX].isObstacle) {
                
                neighbors.push({ x: newX, y: newY });
            }
        }
        
        return neighbors;
    }
    
    getMovementCost(from, to) {
        const dx = Math.abs(to.x - from.x);
        const dy = Math.abs(to.y - from.y);
        
        return (dx === 1 && dy === 1) ? Math.sqrt(2) : 1;
    }
    
    findNodeInOpenSet(openSet, x, y) {
        // This is a simplified implementation
        // In practice, you'd need to search through the heap
        return null;
    }
}
```

## Dynamic A* (D*)

### Concept for Dynamic Environments
```javascript
class DynamicAStar {
    constructor() {
        this.graph = new Map();
        this.rhs = new Map(); // Right-hand side values
        this.g = new Map();   // g-values
        this.openSet = new PriorityQueue();
        this.km = 0; // Key modifier
        this.lastStart = null;
    }
    
    initialize(startX, startY, goalX, goalY) {
        this.start = { x: startX, y: startY };
        this.goal = { x: goalX, y: goalY };
        this.lastStart = { ...this.start };
        
        // Initialize all nodes
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                const nodeKey = `${x}_${y}`;
                this.rhs.set(nodeKey, Infinity);
                this.g.set(nodeKey, Infinity);
            }
        }
        
        // Goal node
        const goalKey = `${goalX}_${goalY}`;
        this.rhs.set(goalKey, 0);
        this.openSet.insert(this.goal, this.calculateKey(this.goal));
    }
    
    calculateKey(node) {
        const nodeKey = `${node.x}_${node.y}`;
        const gVal = this.g.get(nodeKey);
        const rhsVal = this.rhs.get(nodeKey);
        
        const minVal = Math.min(gVal, rhsVal);
        
        return [
            minVal + this.heuristic(this.start, node) + this.km,
            minVal
        ];
    }
    
    heuristic(node1, node2) {
        return Math.abs(node1.x - node2.x) + Math.abs(node1.y - node2.y);
    }
    
    updateVertex(node) {
        const nodeKey = `${node.x}_${node.y}`;
        
        if (!this.isGoal(node)) {
            let minRhs = Infinity;
            const successors = this.getSuccessors(node);
            
            for (const successor of successors) {
                const successorKey = `${successor.x}_${successor.y}`;
                const cost = this.getEdgeCost(node, successor);
                const successorG = this.g.get(successorKey);
                
                minRhs = Math.min(minRhs, cost + successorG);
            }
            
            this.rhs.set(nodeKey, minRhs);
        }
        
        // Remove from open set if present
        this.openSet.remove(node);
        
        // Add to open set if locally inconsistent
        if (this.g.get(nodeKey) !== this.rhs.get(nodeKey)) {
            this.openSet.insert(node, this.calculateKey(node));
        }
    }
    
    computeShortestPath() {
        while (!this.openSet.isEmpty() && 
               (this.compareKeys(this.openSet.topKey(), this.calculateKey(this.start)) || 
                this.rhs.get(`${this.start.x}_${this.start.y}`) !== this.g.get(`${this.start.x}_${this.start.y}`))) {
            
            const current = this.openSet.pop();
            const currentKey = `${current.x}_${current.y}`;
            
            if (this.g.get(currentKey) > this.rhs.get(currentKey)) {
                // Overconsistent
                this.g.set(currentKey, this.rhs.get(currentKey));
                
                const predecessors = this.getPredecessors(current);
                for (const pred of predecessors) {
                    this.updateVertex(pred);
                }
            } else {
                // Underconsistent
                this.g.set(currentKey, Infinity);
                
                const predecessors = this.getPredecessors(current);
                for (const pred of predecessors) {
                    this.updateVertex(pred);
                }
                this.updateVertex(current);
            }
        }
    }
    
    replan() {
        this.km += this.heuristic(this.lastStart, this.start);
        this.lastStart = { ...this.start };
        this.computeShortestPath();
    }
    
    updateEdgeCosts(changedEdges) {
        for (const edge of changedEdges) {
            const { from, to, newCost } = edge;
            
            // Update edge cost in graph
            this.setEdgeCost(from, to, newCost);
            
            // Update affected vertices
            this.updateVertex(from);
            if (from.x !== to.x || from.y !== to.y) {
                this.updateVertex(to);
            }
        }
        
        this.replan();
    }
    
    getPath() {
        const path = [];
        let current = { ...this.start };
        
        while (!this.isGoal(current)) {
            path.push({ ...current });
            
            let nextNode = null;
            let minCost = Infinity;
            
            const successors = this.getSuccessors(current);
            for (const successor of successors) {
                const successorKey = `${successor.x}_${successor.y}`;
                const cost = this.getEdgeCost(current, successor) + this.g.get(successorKey);
                
                if (cost < minCost) {
                    minCost = cost;
                    nextNode = successor;
                }
            }
            
            if (!nextNode) break;
            current = nextNode;
        }
        
        path.push({ ...this.goal });
        return path;
    }
    
    // Helper methods
    isGoal(node) {
        return node.x === this.goal.x && node.y === this.goal.y;
    }
    
    compareKeys(key1, key2) {
        return key1[0] < key2[0] || (key1[0] === key2[0] && key1[1] < key2[1]);
    }
    
    getSuccessors(node) {
        return this.getNeighbors(node.x, node.y);
    }
    
    getPredecessors(node) {
        return this.getNeighbors(node.x, node.y);
    }
    
    getNeighbors(x, y) {
        const neighbors = [];
        const directions = [
            { dx: 0, dy: -1 }, { dx: 1, dy: 0 },
            { dx: 0, dy: 1 }, { dx: -1, dy: 0 }
        ];
        
        for (const dir of directions) {
            const newX = x + dir.dx;
            const newY = y + dir.dy;
            
            if (newX >= 0 && newX < GRID_WIDTH &&
                newY >= 0 && newY < GRID_HEIGHT) {
                neighbors.push({ x: newX, y: newY });
            }
        }
        
        return neighbors;
    }
    
    getEdgeCost(from, to) {
        if (grid[to.y][to.x].isObstacle) {
            return Infinity;
        }
        return 1; // Uniform cost
    }
    
    setEdgeCost(from, to, cost) {
        // Implementation depends on how you store edge costs
        // This is a simplified version
    }
}
```

## Multi-Agent Pathfinding

### Conflict-Based Search (CBS)
```javascript
class ConflictBasedSearch {
    constructor() {
        this.openSet = new PriorityQueue();
        this.agents = [];
    }
    
    findPaths(agents) {
        this.agents = agents;
        
        // Create root node with individual optimal paths
        const rootNode = {
            constraints: [],
            solution: {},
            cost: 0
        };
        
        // Find individual paths for each agent
        for (const agent of agents) {
            const path = this.findIndividualPath(agent, []);
            if (!path) {
                return null; // No solution exists
            }
            rootNode.solution[agent.id] = path;
            rootNode.cost += path.length;
        }
        
        // Check for conflicts
        const conflicts = this.findConflicts(rootNode.solution);
        if (conflicts.length === 0) {
            return rootNode.solution;
        }
        
        rootNode.conflicts = conflicts;
        this.openSet.insert(rootNode, rootNode.cost);
        
        while (!this.openSet.isEmpty()) {
            const currentNode = this.openSet.pop();
            
            // Pick the first conflict
            const conflict = currentNode.conflicts[0];
            
            // Create two child nodes with constraints
            const childNodes = this.createChildNodes(currentNode, conflict);
            
            for (const childNode of childNodes) {
                // Replan for the constrained agent
                const constrainedAgent = childNode.newConstraint.agent;
                const newPath = this.findIndividualPath(
                    this.agents.find(a => a.id === constrainedAgent),
                    childNode.constraints
                );
                
                if (!newPath) {
                    continue; // This branch is infeasible
                }
                
                childNode.solution[constrainedAgent] = newPath;
                childNode.cost = this.calculateSolutionCost(childNode.solution);
                
                // Check for conflicts
                const newConflicts = this.findConflicts(childNode.solution);
                
                if (newConflicts.length === 0) {
                    return childNode.solution; // Solution found!
                }
                
                childNode.conflicts = newConflicts;
                this.openSet.insert(childNode, childNode.cost);
            }
        }
        
        return null; // No solution found
    }
    
    findIndividualPath(agent, constraints) {
        // Use A* with constraints
        const openSet = new MinHeap();
        const closedSet = new Set();
        
        const startNode = {
            x: agent.start.x,
            y: agent.start.y,
            time: 0,
            gCost: 0,
            hCost: manhattanDistance(agent.start, agent.goal),
            parent: null
        };
        startNode.fCost = startNode.gCost + startNode.hCost;
        
        openSet.insert(startNode);
        
        while (!openSet.isEmpty()) {
            const currentNode = openSet.extractMin();
            const nodeKey = `${currentNode.x}_${currentNode.y}_${currentNode.time}`;
            
            if (closedSet.has(nodeKey)) continue;
            closedSet.add(nodeKey);
            
            if (currentNode.x === agent.goal.x && currentNode.y === agent.goal.y) {
                return this.reconstructTimedPath(currentNode);
            }
            
            // Generate successors (including wait action)
            const successors = this.getTimedSuccessors(currentNode, agent.id, constraints);
            
            for (const successor of successors) {
                const successorKey = `${successor.x}_${successor.y}_${successor.time}`;
                if (closedSet.has(successorKey)) continue;
                
                openSet.insert(successor);
            }
        }
        
        return null;
    }
    
    getTimedSuccessors(node, agentId, constraints) {
        const successors = [];
        const nextTime = node.time + 1;
        
        // Movement actions
        const directions = [
            { dx: 0, dy: -1 }, { dx: 1, dy: 0 },
            { dx: 0, dy: 1 }, { dx: -1, dy: 0 }
        ];
        
        for (const dir of directions) {
            const newX = node.x + dir.dx;
            const newY = node.y + dir.dy;
            
            if (this.isValidMove(newX, newY, nextTime, agentId, constraints)) {
                const successor = {
                    x: newX,
                    y: newY,
                    time: nextTime,
                    gCost: node.gCost + 1,
                    hCost: manhattanDistance({ x: newX, y: newY }, this.agents.find(a => a.id === agentId).goal),
                    parent: node
                };
                successor.fCost = successor.gCost + successor.hCost;
                successors.push(successor);
            }
        }
        
        // Wait action
        if (this.isValidMove(node.x, node.y, nextTime, agentId, constraints)) {
            const waitSuccessor = {
                x: node.x,
                y: node.y,
                time: nextTime,
                gCost: node.gCost + 1,
                hCost: node.hCost,
                parent: node
            };
            waitSuccessor.fCost = waitSuccessor.gCost + waitSuccessor.hCost;
            successors.push(waitSuccessor);
        }
        
        return successors;
    }
    
    isValidMove(x, y, time, agentId, constraints) {
        // Check grid bounds and obstacles
        if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT || 
            grid[y][x].isObstacle) {
            return false;
        }
        
        // Check constraints
        for (const constraint of constraints) {
            if (constraint.agent === agentId &&
                constraint.x === x &&
                constraint.y === y &&
                constraint.time === time) {
                return false;
            }
        }
        
        return true;
    }
    
    findConflicts(solution) {
        const conflicts = [];
        const agents = Object.keys(solution);
        
        for (let i = 0; i < agents.length; i++) {
            for (let j = i + 1; j < agents.length; j++) {
                const agentA = agents[i];
                const agentB = agents[j];
                const pathA = solution[agentA];
                const pathB = solution[agentB];
                
                // Check for vertex conflicts
                const maxTime = Math.max(pathA.length, pathB.length);
                for (let t = 0; t < maxTime; t++) {
                    const posA = t < pathA.length ? pathA[t] : pathA[pathA.length - 1];
                    const posB = t < pathB.length ? pathB[t] : pathB[pathB.length - 1];
                    
                    if (posA.x === posB.x && posA.y === posB.y) {
                        conflicts.push({
                            type: 'vertex',
                            agentA: agentA,
                            agentB: agentB,
                            x: posA.x,
                            y: posA.y,
                            time: t
                        });
                    }
                }
                
                // Check for edge conflicts
                for (let t = 0; t < Math.min(pathA.length - 1, pathB.length - 1); t++) {
                    const posA1 = pathA[t];
                    const posA2 = pathA[t + 1];
                    const posB1 = pathB[t];
                    const posB2 = pathB[t + 1];
                    
                    if (posA1.x === posB2.x && posA1.y === posB2.y &&
                        posA2.x === posB1.x && posA2.y === posB1.y) {
                        conflicts.push({
                            type: 'edge',
                            agentA: agentA,
                            agentB: agentB,
                            time: t
                        });
                    }
                }
            }
        }
        
        return conflicts;
    }
    
    createChildNodes(parentNode, conflict) {
        const childNodes = [];
        
        // Create constraint for agent A
        const constraintA = {
            agent: conflict.agentA,
            x: conflict.x,
            y: conflict.y,
            time: conflict.time
        };
        
        const childA = {
            constraints: [...parentNode.constraints, constraintA],
            solution: { ...parentNode.solution },
            newConstraint: constraintA
        };
        
        // Create constraint for agent B
        const constraintB = {
            agent: conflict.agentB,
            x: conflict.x,
            y: conflict.y,
            time: conflict.time
        };
        
        const childB = {
            constraints: [...parentNode.constraints, constraintB],
            solution: { ...parentNode.solution },
            newConstraint: constraintB
        };
        
        return [childA, childB];
    }
    
    calculateSolutionCost(solution) {
        let totalCost = 0;
        for (const path of Object.values(solution)) {
            totalCost += path.length;
        }
        return totalCost;
    }
    
    reconstructTimedPath(node) {
        const path = [];
        let current = node;
        
        while (current) {
            path.unshift({ x: current.x, y: current.y, time: current.time });
            current = current.parent;
        }
        
        return path;
    }
}
```

---
**Previous:** [Performance Analysis](13-performance.md)
**Next:** [Research Frontiers](15-research.md)

**Interactive:** [Try advanced algorithms](demo.html)