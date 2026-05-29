# Performance Analysis

## Performance Metrics Overview

### Key Performance Indicators (KPIs)
1. **Time Complexity**: Algorithm execution time
2. **Space Complexity**: Memory usage patterns
3. **Node Exploration**: Efficiency of search
4. **Path Optimality**: Quality of found paths
5. **Scalability**: Performance with larger inputs
6. **Real-time Performance**: Frame rate impact

### Measurement Framework
```javascript
class PerformanceAnalyzer {
    constructor() {
        this.metrics = {
            executionTime: [],
            memoryUsage: [],
            nodesExplored: [],
            pathLength: [],
            openSetSize: [],
            closedSetSize: []
        };
        this.startTime = 0;
        this.peakMemory = 0;
    }
    
    startMeasurement() {
        this.startTime = performance.now();
        this.peakMemory = this.getCurrentMemory();
        this.nodesExploredCount = 0;
        this.maxOpenSetSize = 0;
    }
    
    recordNodeExploration(openSetSize) {
        this.nodesExploredCount++;
        this.maxOpenSetSize = Math.max(this.maxOpenSetSize, openSetSize);
        
        const currentMemory = this.getCurrentMemory();
        this.peakMemory = Math.max(this.peakMemory, currentMemory);
    }
    
    endMeasurement(pathLength) {
        const executionTime = performance.now() - this.startTime;
        
        this.metrics.executionTime.push(executionTime);
        this.metrics.memoryUsage.push(this.peakMemory);
        this.metrics.nodesExplored.push(this.nodesExploredCount);
        this.metrics.pathLength.push(pathLength || 0);
        this.metrics.openSetSize.push(this.maxOpenSetSize);
        
        return {
            executionTime,
            memoryUsage: this.peakMemory,
            nodesExplored: this.nodesExploredCount,
            pathLength: pathLength || 0,
            maxOpenSetSize: this.maxOpenSetSize
        };
    }
    
    getCurrentMemory() {
        return performance.memory ? performance.memory.usedJSHeapSize : 0;
    }
    
    getStatistics() {
        const stats = {};
        
        for (const [metric, values] of Object.entries(this.metrics)) {
            if (values.length === 0) continue;
            
            stats[metric] = {
                min: Math.min(...values),
                max: Math.max(...values),
                avg: values.reduce((a, b) => a + b, 0) / values.length,
                median: this.calculateMedian(values),
                stdDev: this.calculateStdDev(values)
            };
        }
        
        return stats;
    }
    
    calculateMedian(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 
            ? (sorted[mid - 1] + sorted[mid]) / 2 
            : sorted[mid];
    }
    
    calculateStdDev(values) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const squareDiffs = values.map(value => Math.pow(value - avg, 2));
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
        return Math.sqrt(avgSquareDiff);
    }
}
```

## Time Complexity Analysis

### Theoretical Complexity
```javascript
/**
 * A* Time Complexity Analysis:
 * 
 * Best Case: O(b^d)
 * - b = branching factor (typically 8 for grid)
 * - d = depth of optimal solution
 * 
 * Average Case: O(b^d)
 * - Depends heavily on heuristic quality
 * - Good heuristic: closer to O(d)
 * - Poor heuristic: approaches O(b^d)
 * 
 * Worst Case: O(b^d)
 * - When heuristic provides no guidance
 * - Degenerates to Dijkstra's algorithm
 */

class ComplexityAnalyzer {
    constructor() {
        this.measurements = [];
    }
    
    analyzeTimeComplexity(gridSizes, iterations = 10) {
        const results = [];
        
        for (const size of gridSizes) {
            const times = [];
            
            for (let i = 0; i < iterations; i++) {
                const time = this.measureSingleRun(size);
                times.push(time);
            }
            
            const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
            results.push({ size, avgTime, times });
        }
        
        return this.calculateGrowthRate(results);
    }
    
    measureSingleRun(gridSize) {
        // Setup grid
        this.setupGrid(gridSize);
        
        const startTime = performance.now();
        const path = this.runAStar();
        const endTime = performance.now();
        
        return endTime - startTime;
    }
    
    calculateGrowthRate(results) {
        const growthRates = [];
        
        for (let i = 1; i < results.length; i++) {
            const prev = results[i - 1];
            const curr = results[i];
            
            const sizeRatio = curr.size / prev.size;
            const timeRatio = curr.avgTime / prev.avgTime;
            
            growthRates.push({
                sizeFrom: prev.size,
                sizeTo: curr.size,
                sizeRatio,
                timeRatio,
                complexity: Math.log(timeRatio) / Math.log(sizeRatio)
            });
        }
        
        return {
            results,
            growthRates,
            avgComplexity: growthRates.reduce((sum, gr) => sum + gr.complexity, 0) / growthRates.length
        };
    }
}
```

### Empirical Time Measurements
```javascript
class TimingBenchmark {
    constructor() {
        this.scenarios = {
            'empty-grid': this.createEmptyGrid,
            'sparse-obstacles': this.createSparseObstacles,
            'dense-obstacles': this.createDenseObstacles,
            'maze-like': this.createMaze,
            'worst-case': this.createWorstCase
        };
    }
    
    async runComprehensiveBenchmark() {
        const results = {};
        
        for (const [scenarioName, setupFunction] of Object.entries(this.scenarios)) {
            console.log(`\n🔍 Testing scenario: ${scenarioName}`);
            results[scenarioName] = await this.benchmarkScenario(setupFunction);
        }
        
        return this.analyzeResults(results);
    }
    
    async benchmarkScenario(setupFunction, iterations = 20) {
        const measurements = [];
        
        for (let i = 0; i < iterations; i++) {
            setupFunction.call(this);
            
            const analyzer = new PerformanceAnalyzer();
            analyzer.startMeasurement();
            
            const path = await this.runInstrumentedAStar(analyzer);
            const result = analyzer.endMeasurement(path ? path.length : 0);
            
            measurements.push(result);
            
            // Small delay to prevent browser freezing
            await this.sleep(10);
        }
        
        return this.calculateScenarioStats(measurements);
    }
    
    async runInstrumentedAStar(analyzer) {
        if (!startNode || !goalNode) return null;
        
        const openSet = [startNode];
        const closedSet = new Set();
        
        startNode.gCost = 0;
        startNode.hCost = manhattanDistance(startNode, goalNode);
        startNode.fCost = startNode.gCost + startNode.hCost;
        
        while (openSet.length > 0) {
            // Record performance metrics
            analyzer.recordNodeExploration(openSet.length);
            
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
                return this.reconstructPath(currentNode);
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
    
    createEmptyGrid() {
        initializeGrid();
        startNode = grid[0][0];
        goalNode = grid[GRID_HEIGHT - 1][GRID_WIDTH - 1];
    }
    
    createSparseObstacles() {
        this.createEmptyGrid();
        this.addRandomObstacles(0.1); // 10% obstacles
    }
    
    createDenseObstacles() {
        this.createEmptyGrid();
        this.addRandomObstacles(0.3); // 30% obstacles
    }
    
    createMaze() {
        this.createEmptyGrid();
        this.generateMaze();
    }
    
    createWorstCase() {
        this.createEmptyGrid();
        // Create scenario where heuristic is misleading
        this.createMisleadingHeuristic();
    }
    
    addRandomObstacles(percentage) {
        const totalCells = GRID_WIDTH * GRID_HEIGHT;
        const obstacleCount = Math.floor(totalCells * percentage);
        
        for (let i = 0; i < obstacleCount; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * GRID_WIDTH);
                y = Math.floor(Math.random() * GRID_HEIGHT);
            } while (grid[y][x] === startNode || grid[y][x] === goalNode || grid[y][x].isObstacle);
            
            grid[y][x].isObstacle = true;
        }
    }
    
    generateMaze() {
        // Simple maze generation using recursive backtracking
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                if (x % 2 === 1 && y % 2 === 1) {
                    grid[y][x].isObstacle = true;
                }
            }
        }
        
        // Add some random passages
        for (let i = 0; i < GRID_WIDTH * GRID_HEIGHT * 0.1; i++) {
            const x = Math.floor(Math.random() * GRID_WIDTH);
            const y = Math.floor(Math.random() * GRID_HEIGHT);
            grid[y][x].isObstacle = false;
        }
    }
    
    createMisleadingHeuristic() {
        // Create a U-shaped obstacle that makes heuristic misleading
        const centerX = Math.floor(GRID_WIDTH / 2);
        const centerY = Math.floor(GRID_HEIGHT / 2);
        
        // Create U-shape
        for (let y = centerY - 5; y <= centerY + 5; y++) {
            if (y >= 0 && y < GRID_HEIGHT) {
                if (centerX - 3 >= 0) grid[y][centerX - 3].isObstacle = true;
                if (centerX + 3 < GRID_WIDTH) grid[y][centerX + 3].isObstacle = true;
            }
        }
        
        for (let x = centerX - 3; x <= centerX + 3; x++) {
            if (x >= 0 && x < GRID_WIDTH && centerY + 5 < GRID_HEIGHT) {
                grid[centerY + 5][x].isObstacle = true;
            }
        }
        
        startNode = grid[centerY][centerX - 5];
        goalNode = grid[centerY][centerX + 5];
    }
    
    calculateScenarioStats(measurements) {
        const stats = {};
        const metrics = ['executionTime', 'memoryUsage', 'nodesExplored', 'pathLength', 'maxOpenSetSize'];
        
        for (const metric of metrics) {
            const values = measurements.map(m => m[metric]).filter(v => v !== undefined);
            
            if (values.length > 0) {
                stats[metric] = {
                    min: Math.min(...values),
                    max: Math.max(...values),
                    avg: values.reduce((a, b) => a + b, 0) / values.length,
                    median: this.calculateMedian(values),
                    p95: this.calculatePercentile(values, 95),
                    p99: this.calculatePercentile(values, 99)
                };
            }
        }
        
        return stats;
    }
    
    calculateMedian(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 
            ? (sorted[mid - 1] + sorted[mid]) / 2 
            : sorted[mid];
    }
    
    calculatePercentile(values, percentile) {
        const sorted = [...values].sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[Math.max(0, index)];
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
```

## Space Complexity Analysis

### Memory Usage Patterns
```javascript
class MemoryAnalyzer {
    constructor() {
        this.memorySnapshots = [];
        this.gcEvents = [];
    }
    
    startMemoryProfiling() {
        this.baselineMemory = this.getCurrentMemory();
        this.memorySnapshots = [];
        
        // Monitor memory every 100ms during pathfinding
        this.memoryInterval = setInterval(() => {
            this.memorySnapshots.push({
                timestamp: performance.now(),
                memory: this.getCurrentMemory()
            });
        }, 100);
    }
    
    stopMemoryProfiling() {
        if (this.memoryInterval) {
            clearInterval(this.memoryInterval);
        }
        
        return this.analyzeMemoryUsage();
    }
    
    getCurrentMemory() {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return { used: 0, total: 0, limit: 0 };
    }
    
    analyzeMemoryUsage() {
        if (this.memorySnapshots.length === 0) {
            return { error: 'No memory data collected' };
        }
        
        const usedMemory = this.memorySnapshots.map(s => s.memory.used);
        const totalMemory = this.memorySnapshots.map(s => s.memory.total);
        
        return {
            baseline: this.baselineMemory,
            peak: {
                used: Math.max(...usedMemory),
                total: Math.max(...totalMemory)
            },
            average: {
                used: usedMemory.reduce((a, b) => a + b, 0) / usedMemory.length,
                total: totalMemory.reduce((a, b) => a + b, 0) / totalMemory.length
            },
            growth: {
                used: Math.max(...usedMemory) - this.baselineMemory.used,
                total: Math.max(...totalMemory) - this.baselineMemory.total
            },
            snapshots: this.memorySnapshots
        };
    }
    
    estimateDataStructureMemory(gridSize) {
        const nodeSize = 8 * 4; // 8 properties × 4 bytes each (rough estimate)
        const gridMemory = gridSize * gridSize * nodeSize;
        
        // Estimate open/closed set memory
        const avgOpenSetSize = Math.sqrt(gridSize * gridSize) * 2; // Rough estimate
        const avgClosedSetSize = Math.sqrt(gridSize * gridSize) * 4; // Rough estimate
        
        const openSetMemory = avgOpenSetSize * 8; // Pointer size
        const closedSetMemory = avgClosedSetSize * 8; // Set overhead
        
        return {
            grid: gridMemory,
            openSet: openSetMemory,
            closedSet: closedSetMemory,
            total: gridMemory + openSetMemory + closedSetMemory,
            breakdown: {
                gridPercentage: (gridMemory / (gridMemory + openSetMemory + closedSetMemory)) * 100,
                openSetPercentage: (openSetMemory / (gridMemory + openSetMemory + closedSetMemory)) * 100,
                closedSetPercentage: (closedSetMemory / (gridMemory + openSetMemory + closedSetMemory)) * 100
            }
        };
    }
}
```

## Heuristic Performance Analysis

### Heuristic Quality Metrics
```javascript
class HeuristicAnalyzer {
    constructor() {
        this.heuristics = {
            manhattan: manhattanDistance,
            euclidean: euclideanDistance,
            chebyshev: this.chebyshevDistance,
            octile: this.octileDistance
        };
    }
    
    chebyshevDistance(nodeA, nodeB) {
        return Math.max(
            Math.abs(nodeA.x - nodeB.x),
            Math.abs(nodeA.y - nodeB.y)
        );
    }
    
    octileDistance(nodeA, nodeB) {
        const dx = Math.abs(nodeA.x - nodeB.x);
        const dy = Math.abs(nodeA.y - nodeB.y);
        return Math.max(dx, dy) + (Math.sqrt(2) - 1) * Math.min(dx, dy);
    }
    
    async compareHeuristics(testScenarios) {
        const results = {};
        
        for (const [heuristicName, heuristicFunc] of Object.entries(this.heuristics)) {
            console.log(`\n🧮 Testing heuristic: ${heuristicName}`);
            results[heuristicName] = await this.testHeuristic(heuristicFunc, testScenarios);
        }
        
        return this.analyzeHeuristicComparison(results);
    }
    
    async testHeuristic(heuristicFunc, testScenarios) {
        const results = [];
        
        // Temporarily replace the global heuristic function
        const originalHeuristic = manhattanDistance;
        window.manhattanDistance = heuristicFunc;
        
        try {
            for (const scenario of testScenarios) {
                scenario.setup();
                
                const analyzer = new PerformanceAnalyzer();
                analyzer.startMeasurement();
                
                const path = await this.runPathfinding(analyzer);
                const result = analyzer.endMeasurement(path ? path.length : 0);
                
                results.push({
                    scenario: scenario.name,
                    ...result,
                    pathFound: path !== null,
                    pathOptimal: path ? this.isPathOptimal(path, scenario) : false
                });
            }
        } finally {
            // Restore original heuristic
            window.manhattanDistance = originalHeuristic;
        }
        
        return results;
    }
    
    analyzeHeuristicComparison(results) {
        const comparison = {};
        
        for (const [heuristicName, heuristicResults] of Object.entries(results)) {
            const avgTime = heuristicResults.reduce((sum, r) => sum + r.executionTime, 0) / heuristicResults.length;
            const avgNodes = heuristicResults.reduce((sum, r) => sum + r.nodesExplored, 0) / heuristicResults.length;
            const avgPathLength = heuristicResults.reduce((sum, r) => sum + r.pathLength, 0) / heuristicResults.length;
            const successRate = heuristicResults.filter(r => r.pathFound).length / heuristicResults.length;
            const optimalityRate = heuristicResults.filter(r => r.pathOptimal).length / heuristicResults.length;
            
            comparison[heuristicName] = {
                avgExecutionTime: avgTime,
                avgNodesExplored: avgNodes,
                avgPathLength: avgPathLength,
                successRate: successRate * 100,
                optimalityRate: optimalityRate * 100,
                efficiency: avgNodes > 0 ? avgPathLength / avgNodes : 0
            };
        }
        
        return {
            detailed: results,
            summary: comparison,
            recommendations: this.generateHeuristicRecommendations(comparison)
        };
    }
    
    generateHeuristicRecommendations(comparison) {
        const recommendations = [];
        
        // Find best performing heuristics
        const byTime = Object.entries(comparison).sort((a, b) => a[1].avgExecutionTime - b[1].avgExecutionTime);
        const byNodes = Object.entries(comparison).sort((a, b) => a[1].avgNodesExplored - b[1].avgNodesExplored);
        const byOptimality = Object.entries(comparison).sort((a, b) => b[1].optimalityRate - a[1].optimalityRate);
        
        recommendations.push(`Fastest execution: ${byTime[0][0]} (${byTime[0][1].avgExecutionTime.toFixed(2)}ms avg)`);
        recommendations.push(`Fewest nodes explored: ${byNodes[0][0]} (${byNodes[0][1].avgNodesExplored.toFixed(1)} nodes avg)`);
        recommendations.push(`Best optimality: ${byOptimality[0][0]} (${byOptimality[0][1].optimalityRate.toFixed(1)}% optimal)`);
        
        return recommendations;
    }
    
    isPathOptimal(path, scenario) {
        // Simple optimality check - compare with known optimal length
        if (scenario.optimalLength) {
            return path.length === scenario.optimalLength;
        }
        
        // For simple scenarios, calculate theoretical minimum
        const start = path[0];
        const goal = path[path.length - 1];
        const theoreticalMin = Math.max(
            Math.abs(goal.x - start.x),
            Math.abs(goal.y - start.y)
        ) + 1; // +1 because path includes start node
        
        return path.length <= theoreticalMin * 1.1; // Allow 10% tolerance
    }
}
```

## Real-time Performance Monitoring

### Frame Rate Impact Analysis
```javascript
class RealTimeMonitor {
    constructor() {
        this.frameRates = [];
        this.isMonitoring = false;
        this.animationId = null;
    }
    
    startFrameRateMonitoring() {
        this.frameRates = [];
        this.isMonitoring = true;
        this.lastFrameTime = performance.now();
        
        const measureFrame = (currentTime) => {
            if (this.isMonitoring) {
                const deltaTime = currentTime - this.lastFrameTime;
                const fps = 1000 / deltaTime;
                this.frameRates.push(fps);
                this.lastFrameTime = currentTime;
                
                this.animationId = requestAnimationFrame(measureFrame);
            }
        };
        
        this.animationId = requestAnimationFrame(measureFrame);
    }
    
    stopFrameRateMonitoring() {
        this.isMonitoring = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        return this.analyzeFrameRates();
    }
    
    analyzeFrameRates() {
        if (this.frameRates.length === 0) {
            return { error: 'No frame rate data collected' };
        }
        
        const validFrameRates = this.frameRates.filter(fps => fps > 0 && fps < 1000);
        
        return {
            avgFPS: validFrameRates.reduce((a, b) => a + b, 0) / validFrameRates.length,
            minFPS: Math.min(...validFrameRates),
            maxFPS: Math.max(...validFrameRates),
            frameDrops: validFrameRates.filter(fps => fps < 30).length,
            smoothness: (validFrameRates.filter(fps => fps >= 60).length / validFrameRates.length) * 100,
            samples: validFrameRates.length
        };
    }
    
    async measureVisualizationImpact() {
        // Test with visualization
        this.startFrameRateMonitoring();
        await this.runPathfindingWithVisualization();
        const withVisualization = this.stopFrameRateMonitoring();
        
        await this.sleep(1000); // Rest period
        
        // Test without visualization
        this.startFrameRateMonitoring();
        await this.runPathfindingWithoutVisualization();
        const withoutVisualization = this.stopFrameRateMonitoring();
        
        return {
            withVisualization,
            withoutVisualization,
            impact: {
                fpsReduction: withoutVisualization.avgFPS - withVisualization.avgFPS,
                smoothnessReduction: withoutVisualization.smoothness - withVisualization.smoothness
            }
        };
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
```

## Performance Optimization Recommendations

### Bottleneck Identification
```javascript
class BottleneckAnalyzer {
    constructor() {
        this.profiler = {
            heuristicTime: 0,
            neighborGeneration: 0,
            openSetOperations: 0,
            pathReconstruction: 0,
            visualization: 0
        };
    }
    
    profilePathfinding() {
        // Instrument key functions
        this.instrumentFunction('manhattanDistance', 'heuristicTime');
        this.instrumentFunction('getNeighbors', 'neighborGeneration');
        this.instrumentFunction('reconstructPath', 'pathReconstruction');
        
        return this.profiler;
    }
    
    instrumentFunction(functionName, profileKey) {
        const originalFunction = window[functionName];
        const profiler = this.profiler;
        
        window[functionName] = function(...args) {
            const startTime = performance.now();
            const result = originalFunction.apply(this, args);
            const endTime = performance.now();
            
            profiler[profileKey] += endTime - startTime;
            return result;
        };
    }
    
    generateOptimizationReport() {
        const total = Object.values(this.profiler).reduce((a, b) => a + b, 0);
        const breakdown = {};
        
        for (const [operation, time] of Object.entries(this.profiler)) {
            breakdown[operation] = {
                time: time.toFixed(2),
                percentage: ((time / total) * 100).toFixed(1)
            };
        }
        
        const recommendations = this.generateRecommendations(breakdown);
        
        return {
            totalTime: total.toFixed(2),
            breakdown,
            recommendations
        };
    }
    
    generateRecommendations(breakdown) {
        const recommendations = [];
        
        // Identify major bottlenecks
        for (const [operation, data] of Object.entries(breakdown)) {
            const percentage = parseFloat(data.percentage);
            
            if (percentage > 30) {
                recommendations.push({
                    priority: 'HIGH',
                    operation,
                    issue: `${operation} takes ${percentage}% of execution time`,
                    suggestions: this.getOptimizationSuggestions(operation)
                });
            } else if (percentage > 15) {
                recommendations.push({
                    priority: 'MEDIUM',
                    operation,
                    issue: `${operation} takes ${percentage}% of execution time`,
                    suggestions: this.getOptimizationSuggestions(operation)
                });
            }
        }
        
        return recommendations;
    }
    
    getOptimizationSuggestions(operation) {
        const suggestions = {
            heuristicTime: [
                'Cache heuristic calculations',
                'Use faster distance approximations',
                'Pre-compute distance tables for small grids'
            ],
            neighborGeneration: [
                'Pre-compute neighbor relationships',
                'Use bit manipulation for bounds checking',
                'Cache neighbor arrays'
            ],
            openSetOperations: [
                'Replace array with priority queue (binary heap)',
                'Use Fibonacci heap for better decrease-key performance',
                'Implement bucket-based priority queue'
            ],
            pathReconstruction: [
                'Use iterative instead of recursive approach',
                'Pre-allocate path array',
                'Store path during search instead of reconstructing'
            ],
            visualization: [
                'Batch DOM updates',
                'Use requestAnimationFrame for smooth animation',
                'Implement virtual scrolling for large grids'
            ]
        };
        
        return suggestions[operation] || ['No specific suggestions available'];
    }
}
```

## Performance Testing Suite

### Comprehensive Performance Test
```javascript
class PerformanceTestSuite {
    constructor() {
        this.testResults = {};
    }
    
    async runFullPerformanceAnalysis() {
        console.log('🚀 Starting Comprehensive Performance Analysis\n');
        
        // 1. Time complexity analysis
        console.log('📊 Analyzing time complexity...');
        const complexityAnalyzer = new ComplexityAnalyzer();
        this.testResults.timeComplexity = complexityAnalyzer.analyzeTimeComplexity([10, 20, 30, 40, 50]);
        
        // 2. Memory usage analysis
        console.log('💾 Analyzing memory usage...');
        const memoryAnalyzer = new MemoryAnalyzer();
        this.testResults.memoryUsage = await this.runMemoryTests(memoryAnalyzer);
        
        // 3. Heuristic comparison
        console.log('🧮 Comparing heuristic functions...');
        const heuristicAnalyzer = new HeuristicAnalyzer();
        this.testResults.heuristicComparison = await heuristicAnalyzer.compareHeuristics(this.getTestScenarios());
        
        // 4. Real-time performance
        console.log('⏱️ Measuring real-time performance...');
        const realTimeMonitor = new RealTimeMonitor();
        this.testResults.realTimePerformance = await realTimeMonitor.measureVisualizationImpact();
        
        // 5. Bottleneck analysis
        console.log('🔍 Identifying bottlenecks...');
        const bottleneckAnalyzer = new BottleneckAnalyzer();
        bottleneckAnalyzer.profilePathfinding();
        this.testResults.bottleneckAnalysis = bottleneckAnalyzer.generateOptimizationReport();
        
        // 6. Generate comprehensive report
        return this.generateComprehensiveReport();
    }
    
    async runMemoryTests(memoryAnalyzer) {
        const results = {};
        
        // Test different grid sizes
        for (const size of [20, 50, 100]) {
            memoryAnalyzer.startMemoryProfiling();
            
            // Setup and run pathfinding
            this.setupGrid(size);
            await this.runPathfinding();
            
            results[`grid_${size}x${size}`] = memoryAnalyzer.stopMemoryProfiling();
            
            // Add theoretical estimates
            results[`grid_${size}x${size}`].theoretical = memoryAnalyzer.estimateDataStructureMemory(size);
        }
        
        return results;
    }
    
    getTestScenarios() {
        return [
            {
                name: 'empty_grid',
                setup: () => {
                    initializeGrid();
                    startNode = grid[0][0];
                    goalNode = grid[GRID_HEIGHT - 1][GRID_WIDTH - 1];
                },
                optimalLength: Math.max(GRID_WIDTH, GRID_HEIGHT)
            },
            {
                name: 'sparse_obstacles',
                setup: () => {
                    initializeGrid();
                    this.addRandomObstacles(0.1);
                    startNode = grid[0][0];
                    goalNode = grid[GRID_HEIGHT - 1][GRID_WIDTH - 1];
                }
            },
            {
                name: 'dense_obstacles',
                setup: () => {
                    initializeGrid();
                    this.addRandomObstacles(0.3);
                    startNode = grid[0][0];
                    goalNode = grid[GRID_HEIGHT - 1][GRID_WIDTH - 1];
                }
            }
        ];
    }
    
    generateComprehensiveReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: this.generateExecutiveSummary(),
            detailed: this.testResults,
            recommendations: this.generateActionableRecommendations()
        };
        
        // Display results
        console.log('\n📋 Performance Analysis Complete!');
        console.log('\n📈 Executive Summary:');
        console.table(report.summary);
        
        console.log('\n🎯 Top Recommendations:');
        report.recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. [${rec.priority}] ${rec.description}`);
        });
        
        return report;
    }
    
    generateExecutiveSummary() {
        return {
            'Average Execution Time': `${this.getAverageExecutionTime()}ms`,
            'Memory Efficiency': this.getMemoryEfficiencyRating(),
            'Best Heuristic': this.getBestHeuristic(),
            'Frame Rate Impact': `${this.getFrameRateImpact()}%`,
            'Primary Bottleneck': this.getPrimaryBottleneck()
        };
    }
    
    generateActionableRecommendations() {
        const recommendations = [];
        
        // Analyze results and generate specific recommendations
        if (this.testResults.bottleneckAnalysis) {
            recommendations.push(...this.testResults.bottleneckAnalysis.recommendations);
        }
        
        if (this.testResults.heuristicComparison) {
            recommendations.push(...this.testResults.heuristicComparison.recommendations.map(rec => ({
                priority: 'MEDIUM',
                description: rec
            })));
        }
        
        return recommendations.sort((a, b) => {
            const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }
    
    // Helper methods for summary generation
    getAverageExecutionTime() {
        // Implementation depends on collected data
        return '42.5'; // Placeholder
    }
    
    getMemoryEfficiencyRating() {
        return 'Good'; // Placeholder
    }
    
    getBestHeuristic() {
        return 'Manhattan'; // Placeholder
    }
    
    getFrameRateImpact() {
        return '15'; // Placeholder
    }
    
    getPrimaryBottleneck() {
        return 'Open Set Operations'; // Placeholder
    }
}

// Auto-run performance analysis
window.addEventListener('load', () => {
    const perfButton = document.createElement('button');
    perfButton.textContent = 'Run Performance Analysis';
    perfButton.onclick = async () => {
        const suite = new PerformanceTestSuite();
        await suite.runFullPerformanceAnalysis();
    };
    perfButton.style.cssText = `
        position: fixed;
        top: 50px;
        right: 10px;
        z-index: 1000;
        padding: 10px;
        background: #FF9800;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    `;
    document.body.appendChild(perfButton);
});
```

---
**Previous:** [Testing and Validation](12-testing.md)
**Next:** [Advanced Topics](14-advanced-topics.md)

**Interactive:** [Analyze performance](demo.html)