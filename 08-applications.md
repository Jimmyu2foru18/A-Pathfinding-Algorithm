# Real-World Applications

## Game Development

### NPC Pathfinding
```javascript
class GameNPC {
    constructor(x, y, gameWorld) {
        this.x = x;
        this.y = y;
        this.world = gameWorld;
        this.pathfinder = new AStarPathfinder({
            allowDiagonal: true,
            heuristic: 'octile',
            weight: 1.1  // Slightly faster, still near-optimal
        });
        this.currentPath = [];
        this.pathIndex = 0;
    }
    
    moveToTarget(targetX, targetY) {
        const start = {x: this.x, y: this.y};
        const goal = {x: targetX, y: targetY};
        
        this.currentPath = this.pathfinder.findPath(
            this.world.grid, start, goal
        );
        
        if (this.currentPath) {
            this.pathIndex = 1; // Skip current position
            return true;
        }
        return false;
    }
    
    update(deltaTime) {
        if (this.currentPath && this.pathIndex < this.currentPath.length) {
            const target = this.currentPath[this.pathIndex];
            
            // Move towards next waypoint
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 0.1) {
                // Reached waypoint, move to next
                this.pathIndex++;
            } else {
                // Move towards waypoint
                const speed = 2.0; // units per second
                this.x += (dx / distance) * speed * deltaTime;
                this.y += (dy / distance) * speed * deltaTime;
            }
        }
    }
}
```

### Dynamic Obstacle Avoidance
```javascript
class DynamicPathfinder {
    constructor(gameWorld) {
        this.world = gameWorld;
        this.pathfinder = new AStarPathfinder({allowDiagonal: true});
        this.lastPathTime = 0;
        this.pathCacheTime = 500; // Recalculate every 500ms
    }
    
    findPathWithDynamicObstacles(start, goal, movingEntities) {
        // Create temporary grid with dynamic obstacles
        const tempGrid = this.cloneGrid(this.world.staticGrid);
        
        // Add moving entities as temporary obstacles
        for (const entity of movingEntities) {
            const x = Math.floor(entity.x);
            const y = Math.floor(entity.y);
            if (this.isValidCoordinate(tempGrid, x, y)) {
                tempGrid[y][x].isObstacle = true;
            }
        }
        
        return this.pathfinder.findPath(tempGrid, start, goal);
    }
    
    cloneGrid(grid) {
        return grid.map(row => 
            row.map(cell => ({...cell}))
        );
    }
}
```

## Robotics Navigation

### Robot Path Planning
```javascript
class RobotNavigator {
    constructor(mapData, robotSize) {
        this.mapData = mapData;
        this.robotSize = robotSize;
        this.pathfinder = new AStarPathfinder({
            heuristic: 'euclidean',
            allowDiagonal: true
        });
    }
    
    planPath(startPose, goalPose) {
        // Convert real-world coordinates to grid coordinates
        const startGrid = this.worldToGrid(startPose);
        const goalGrid = this.worldToGrid(goalPose);
        
        // Inflate obstacles by robot size
        const inflatedGrid = this.inflateObstacles(
            this.mapData, 
            this.robotSize
        );
        
        // Find path
        const gridPath = this.pathfinder.findPath(
            inflatedGrid, startGrid, goalGrid
        );
        
        if (!gridPath) return null;
        
        // Convert back to world coordinates
        const worldPath = gridPath.map(point => 
            this.gridToWorld(point)
        );
        
        // Smooth path for robot movement
        return this.smoothPathForRobot(worldPath);
    }
    
    worldToGrid(worldPos) {
        const resolution = 0.1; // 10cm per grid cell
        return {
            x: Math.floor(worldPos.x / resolution),
            y: Math.floor(worldPos.y / resolution)
        };
    }
    
    gridToWorld(gridPos) {
        const resolution = 0.1;
        return {
            x: (gridPos.x + 0.5) * resolution,
            y: (gridPos.y + 0.5) * resolution
        };
    }
    
    inflateObstacles(grid, robotRadius) {
        const inflatedGrid = this.cloneGrid(grid);
        const inflationCells = Math.ceil(robotRadius / 0.1);
        
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[0].length; x++) {
                if (grid[y][x].isObstacle) {
                    // Inflate around this obstacle
                    for (let dy = -inflationCells; dy <= inflationCells; dy++) {
                        for (let dx = -inflationCells; dx <= inflationCells; dx++) {
                            const nx = x + dx;
                            const ny = y + dy;
                            
                            if (this.isValidCoordinate(inflatedGrid, nx, ny)) {
                                const distance = Math.sqrt(dx*dx + dy*dy);
                                if (distance <= inflationCells) {
                                    inflatedGrid[ny][nx].isObstacle = true;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        return inflatedGrid;
    }
    
    smoothPathForRobot(path) {
        // Apply Bezier curve smoothing for robot movement
        const smoothed = [];
        
        for (let i = 0; i < path.length; i++) {
            if (i === 0 || i === path.length - 1) {
                smoothed.push(path[i]);
            } else {
                // Create smooth curve through three points
                const p0 = path[i - 1];
                const p1 = path[i];
                const p2 = path[i + 1];
                
                // Add intermediate points for smooth curve
                for (let t = 0; t <= 1; t += 0.2) {
                    const smoothPoint = this.bezierPoint(p0, p1, p2, t);
                    smoothed.push(smoothPoint);
                }
            }
        }
        
        return smoothed;
    }
    
    bezierPoint(p0, p1, p2, t) {
        const x = (1-t)*(1-t)*p0.x + 2*(1-t)*t*p1.x + t*t*p2.x;
        const y = (1-t)*(1-t)*p0.y + 2*(1-t)*t*p1.y + t*t*p2.y;
        return {x, y};
    }
}
```

## Logistics and Route Optimization

### Warehouse Robot Coordination
```javascript
class WarehouseManager {
    constructor(warehouseLayout) {
        this.layout = warehouseLayout;
        this.robots = new Map();
        this.reservedCells = new Map(); // Time-based reservations
        this.pathfinder = new AStarPathfinder({allowDiagonal: false});
    }
    
    assignTask(robotId, pickupLocation, dropoffLocation) {
        const robot = this.robots.get(robotId);
        if (!robot) return false;
        
        // Find path avoiding other robots' reserved paths
        const path = this.findConflictFreePath(
            robot.currentLocation,
            pickupLocation,
            robot.estimatedArrivalTime
        );
        
        if (path) {
            this.reservePath(robotId, path, robot.estimatedArrivalTime);
            robot.assignPath(path);
            return true;
        }
        
        return false;
    }
    
    findConflictFreePath(start, goal, startTime) {
        // Create dynamic grid that considers time-based reservations
        const timeSlots = 60; // Plan for next 60 seconds
        
        for (let timeOffset = 0; timeOffset < timeSlots; timeOffset++) {
            const currentTime = startTime + timeOffset;
            const tempGrid = this.createTemporaryGrid(currentTime);
            
            const path = this.pathfinder.findPath(tempGrid, start, goal);
            
            if (path && this.isPathFree(path, currentTime)) {
                return path;
            }
        }
        
        return null; // No conflict-free path found
    }
    
    createTemporaryGrid(time) {
        const grid = this.cloneGrid(this.layout);
        
        // Mark cells reserved by other robots at this time
        for (const [robotId, reservations] of this.reservedCells) {
            for (const reservation of reservations) {
                if (reservation.time === time) {
                    const {x, y} = reservation.cell;
                    if (this.isValidCoordinate(grid, x, y)) {
                        grid[y][x].isObstacle = true;
                    }
                }
            }
        }
        
        return grid;
    }
    
    reservePath(robotId, path, startTime) {
        const reservations = [];
        
        for (let i = 0; i < path.length; i++) {
            reservations.push({
                cell: path[i],
                time: startTime + i,
                robotId: robotId
            });
        }
        
        this.reservedCells.set(robotId, reservations);
    }
}
```

## Network Routing

### Internet Packet Routing
```javascript
class NetworkRouter {
    constructor(networkTopology) {
        this.topology = networkTopology;
        this.pathfinder = new AStarPathfinder({
            heuristic: 'custom'
        });
        
        // Override heuristic for network latency
        this.pathfinder.calculateHeuristic = (from, to) => {
            return this.estimateLatency(from, to);
        };
    }
    
    findOptimalRoute(sourceNode, destinationNode, packet) {
        // Create network graph with current congestion levels
        const networkGrid = this.createNetworkGrid();
        
        const path = this.pathfinder.findPath(
            networkGrid,
            {x: sourceNode.x, y: sourceNode.y},
            {x: destinationNode.x, y: destinationNode.y}
        );
        
        if (path) {
            return this.convertToNetworkPath(path);
        }
        
        return null;
    }
    
    createNetworkGrid() {
        // Convert network topology to grid representation
        const grid = [];
        
        for (let y = 0; y < this.topology.height; y++) {
            grid[y] = [];
            for (let x = 0; x < this.topology.width; x++) {
                const node = this.topology.getNode(x, y);
                grid[y][x] = {
                    isObstacle: !node || node.isDown,
                    latency: node ? node.currentLatency : Infinity,
                    bandwidth: node ? node.availableBandwidth : 0
                };
            }
        }
        
        return grid;
    }
    
    estimateLatency(from, to) {
        // Estimate network latency based on geographic distance
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Speed of light in fiber optic cable
        const fiberSpeedKmMs = 200; // km/ms
        const estimatedLatency = distance / fiberSpeedKmMs;
        
        return estimatedLatency;
    }
}
```

## Video Game AI

### RTS Unit Movement
```javascript
class RTSUnitManager {
    constructor(gameMap) {
        this.gameMap = gameMap;
        this.pathfinder = new AStarPathfinder({
            allowDiagonal: true,
            heuristic: 'octile'
        });
        this.unitFormations = new Map();
    }
    
    moveUnitsInFormation(units, destination) {
        const formationCenter = this.calculateFormationCenter(units);
        const leaderPath = this.pathfinder.findPath(
            this.gameMap,
            formationCenter,
            destination
        );
        
        if (!leaderPath) return false;
        
        // Calculate offset paths for each unit
        for (const unit of units) {
            const offset = {
                x: unit.x - formationCenter.x,
                y: unit.y - formationCenter.y
            };
            
            const unitPath = leaderPath.map(point => ({
                x: point.x + offset.x,
                y: point.y + offset.y
            }));
            
            // Validate and adjust path for obstacles
            const validPath = this.validateUnitPath(unitPath);
            unit.setPath(validPath);
        }
        
        return true;
    }
    
    calculateFormationCenter(units) {
        const totalX = units.reduce((sum, unit) => sum + unit.x, 0);
        const totalY = units.reduce((sum, unit) => sum + unit.y, 0);
        
        return {
            x: Math.floor(totalX / units.length),
            y: Math.floor(totalY / units.length)
        };
    }
    
    validateUnitPath(path) {
        const validPath = [];
        
        for (const point of path) {
            if (this.isValidPosition(point)) {
                validPath.push(point);
            } else {
                // Find nearest valid position
                const nearestValid = this.findNearestValidPosition(point);
                if (nearestValid) {
                    validPath.push(nearestValid);
                }
            }
        }
        
        return validPath;
    }
    
    findNearestValidPosition(target) {
        const searchRadius = 5;
        
        for (let radius = 1; radius <= searchRadius; radius++) {
            for (let angle = 0; angle < 360; angle += 45) {
                const radian = (angle * Math.PI) / 180;
                const x = Math.floor(target.x + radius * Math.cos(radian));
                const y = Math.floor(target.y + radius * Math.sin(radian));
                
                if (this.isValidPosition({x, y})) {
                    return {x, y};
                }
            }
        }
        
        return null;
    }
}
```

## Performance Considerations

### Hierarchical Pathfinding
```javascript
class HierarchicalPathfinder {
    constructor(detailedMap, clusterSize = 10) {
        this.detailedMap = detailedMap;
        this.clusterSize = clusterSize;
        this.abstractMap = this.createAbstractMap();
        
        this.detailedPathfinder = new AStarPathfinder({allowDiagonal: true});
        this.abstractPathfinder = new AStarPathfinder({allowDiagonal: true});
    }
    
    findHierarchicalPath(start, goal) {
        // 1. Find abstract path between clusters
        const startCluster = this.getCluster(start);
        const goalCluster = this.getCluster(goal);
        
        const abstractPath = this.abstractPathfinder.findPath(
            this.abstractMap,
            startCluster,
            goalCluster
        );
        
        if (!abstractPath) return null;
        
        // 2. Refine path within each cluster
        const detailedPath = [];
        
        for (let i = 0; i < abstractPath.length - 1; i++) {
            const clusterStart = i === 0 ? start : 
                this.getClusterEntrance(abstractPath[i]);
            const clusterGoal = i === abstractPath.length - 2 ? goal :
                this.getClusterExit(abstractPath[i], abstractPath[i + 1]);
            
            const clusterPath = this.detailedPathfinder.findPath(
                this.getClusterMap(abstractPath[i]),
                clusterStart,
                clusterGoal
            );
            
            if (clusterPath) {
                detailedPath.push(...clusterPath.slice(0, -1));
            }
        }
        
        detailedPath.push(goal);
        return detailedPath;
    }
    
    createAbstractMap() {
        const width = Math.ceil(this.detailedMap[0].length / this.clusterSize);
        const height = Math.ceil(this.detailedMap.length / this.clusterSize);
        
        const abstractMap = [];
        
        for (let y = 0; y < height; y++) {
            abstractMap[y] = [];
            for (let x = 0; x < width; x++) {
                abstractMap[y][x] = {
                    isObstacle: this.isClusterBlocked(x, y)
                };
            }
        }
        
        return abstractMap;
    }
    
    isClusterBlocked(clusterX, clusterY) {
        const startX = clusterX * this.clusterSize;
        const startY = clusterY * this.clusterSize;
        const endX = Math.min(startX + this.clusterSize, this.detailedMap[0].length);
        const endY = Math.min(startY + this.clusterSize, this.detailedMap.length);
        
        let passableCells = 0;
        let totalCells = 0;
        
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                totalCells++;
                if (!this.detailedMap[y][x].isObstacle) {
                    passableCells++;
                }
            }
        }
        
        // Cluster is blocked if less than 50% passable
        return (passableCells / totalCells) < 0.5;
    }
}
```

---
**Previous:** [Complete Implementation](07-complete-implementation.md)
**Next:** [Optimization Techniques](09-optimizations.md)

**Interactive:** [Explore applications](demo.html)