# Interactive Demo Guide

## Getting Started

### Opening the Demo
1. Open `demo.html` in your web browser
2. You'll see a grid-based visualization interface
3. The demo starts with a pre-configured maze

### Interface Overview
```
┌─────────────────────────────────────┐
│  A* Pathfinding Visualizer         │
├─────────────────────────────────────┤
│ [Start Search] [Reset] [Clear Path] │
├─────────────────────────────────────┤
│ Speed: [Slow] [Medium] [Fast]       │
├─────────────────────────────────────┤
│ Heuristic: [Manhattan] [Euclidean]  │
├─────────────────────────────────────┤
│                                     │
│        GRID VISUALIZATION           │
│                                     │
└─────────────────────────────────────┘
```

## Grid Elements

### Cell Types
- **🟢 Green**: Start position
- **🔴 Red**: Goal position  
- **⬛ Black**: Obstacles/walls
- **⬜ White**: Empty walkable cells
- **🟡 Yellow**: Open set (being considered)
- **🟠 Orange**: Closed set (already evaluated)
- **🔵 Blue**: Final path

### Interactive Controls
- **Left Click**: Place/remove obstacles
- **Right Click**: Set start position (green)
- **Ctrl + Click**: Set goal position (red)
- **Drag**: Paint multiple obstacles

## Step-by-Step Tutorial

### Tutorial 1: Basic Pathfinding
1. **Reset the grid** using the Reset button
2. **Set start point**: Right-click on any cell
3. **Set goal point**: Ctrl+Click on another cell
4. **Add some obstacles**: Left-click to create walls
5. **Start the search**: Click "Start Search"
6. **Observe**: Watch how the algorithm explores

### Tutorial 2: Understanding the Search Process
1. Set speed to "Slow" for detailed observation
2. Start the search and watch:
   - Yellow cells appear (open set)
   - Orange cells appear (closed set)
   - The algorithm expands outward from start
   - Blue path appears when goal is reached

### Tutorial 3: Heuristic Comparison
1. **Test Manhattan Distance**:
   - Set heuristic to "Manhattan"
   - Create a simple maze
   - Run the algorithm
   - Note the exploration pattern

2. **Test Euclidean Distance**:
   - Reset and use same maze
   - Set heuristic to "Euclidean"
   - Run the algorithm
   - Compare exploration patterns

### Tutorial 4: Complex Scenarios

#### Scenario A: No Solution
1. Create walls that completely surround the goal
2. Run the algorithm
3. Observe: Algorithm explores all reachable cells
4. Result: No path found (algorithm terminates)

#### Scenario B: Multiple Paths
1. Create a maze with multiple routes to goal
2. Run the algorithm
3. Observe: A* finds the optimal path
4. Note: Other paths are not fully explored

#### Scenario C: Narrow Passages
1. Create a maze with narrow corridors
2. Run the algorithm
3. Observe: How A* navigates tight spaces
4. Note: Efficiency in constrained environments

## Advanced Experiments

### Experiment 1: Heuristic Impact
```javascript
// Try these scenarios in the demo:

// Scenario 1: Open field (no obstacles)
// - Manhattan vs Euclidean should show similar performance
// - Both should explore minimal cells

// Scenario 2: Complex maze
// - Manhattan might explore more cells
// - Euclidean might be more direct

// Scenario 3: Diagonal movement
// - Euclidean should perform better
// - Manhattan might take longer paths
```

### Experiment 2: Obstacle Density
1. **Low Density (10% obstacles)**:
   - Fast pathfinding
   - Direct routes
   - Minimal exploration

2. **Medium Density (30% obstacles)**:
   - Moderate exploration
   - Some detours required
   - Good balance

3. **High Density (60% obstacles)**:
   - Extensive exploration
   - Complex paths
   - Longer computation time

### Experiment 3: Grid Size Impact
1. **Small Grid (20x20)**:
   - Fast visualization
   - Easy to follow
   - Good for learning

2. **Large Grid (50x50)**:
   - More realistic scenarios
   - Performance testing
   - Complex path planning

## Understanding the Visualization

### Color Progression
```
Start → Open Set → Closed Set → Path
 🟢   →    🟡    →     🟠     → 🔵
```

### Algorithm States
1. **Initialization**: Start and goal are set
2. **Exploration**: Yellow and orange cells appear
3. **Path Found**: Blue path is drawn
4. **Complete**: Algorithm terminates

### Performance Indicators
- **Cells Explored**: Count of orange cells
- **Path Length**: Number of blue cells
- **Execution Time**: Displayed in console
- **Optimality**: Shortest possible path

## Common Observations

### Expected Behaviors
- A* explores fewer cells than Dijkstra's algorithm
- Heuristic guides search toward goal
- Optimal path is always found (if one exists)
- Algorithm terminates when no path exists

### Interesting Patterns
- **Wavefront**: Exploration spreads like a wave
- **Directional Bias**: Search favors goal direction
- **Obstacle Avoidance**: Smart navigation around barriers
- **Tie Breaking**: Consistent behavior with equal f-costs

## Debugging and Analysis

### Console Information
Open browser developer tools to see:
```javascript
// Example console output:
"A* Search Started"
"Exploring node: (5, 3) with f-cost: 12"
"Path found! Length: 23 cells"
"Nodes explored: 156"
"Execution time: 45ms"
```

### Performance Metrics
- **Nodes Explored**: Lower is better
- **Path Length**: Should be optimal
- **Execution Time**: Depends on complexity
- **Memory Usage**: Tracked in advanced mode

### Troubleshooting

#### Problem: No Path Found
- **Check**: Start and goal are accessible
- **Verify**: No walls blocking all routes
- **Solution**: Clear some obstacles

#### Problem: Slow Performance
- **Cause**: Large grid or complex maze
- **Solution**: Reduce grid size or obstacles
- **Alternative**: Use faster speed setting

#### Problem: Unexpected Path
- **Check**: Heuristic function selection
- **Verify**: Diagonal movement settings
- **Note**: A* finds optimal path, not necessarily intuitive

## Educational Exercises

### Exercise 1: Heuristic Analysis
1. Create identical mazes
2. Test with different heuristics
3. Count explored cells for each
4. Analyze performance differences

### Exercise 2: Maze Design
1. Design mazes that favor different heuristics
2. Create scenarios where Manhattan is better
3. Create scenarios where Euclidean is better
4. Document your findings

### Exercise 3: Performance Testing
1. Measure execution time for different grid sizes
2. Test with varying obstacle densities
3. Compare different heuristic functions
4. Create performance charts

### Exercise 4: Algorithm Comparison
1. Implement BFS in the demo
2. Compare exploration patterns
3. Analyze optimality guarantees
4. Document trade-offs

## Advanced Features

### Custom Scenarios
```javascript
// You can modify visualization.js to add:

// 1. Different movement patterns
const MOVEMENT_PATTERNS = {
    CARDINAL: [[0,1], [1,0], [0,-1], [-1,0]],
    DIAGONAL: [[0,1], [1,0], [0,-1], [-1,0], [1,1], [1,-1], [-1,1], [-1,-1]],
    KNIGHT: [[2,1], [2,-1], [-2,1], [-2,-1], [1,2], [1,-2], [-1,2], [-1,-2]]
};

// 2. Different cost functions
function getMovementCost(from, to) {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    
    if (dx === 1 && dy === 1) return 1.414; // Diagonal
    return 1; // Cardinal
}

// 3. Dynamic obstacles
function addDynamicObstacles() {
    setInterval(() => {
        // Randomly add/remove obstacles
        const x = Math.floor(Math.random() * GRID_WIDTH);
        const y = Math.floor(Math.random() * GRID_HEIGHT);
        toggleObstacle(x, y);
    }, 1000);
}
```

### Data Export
```javascript
// Export pathfinding results
function exportResults() {
    const results = {
        gridSize: `${GRID_WIDTH}x${GRID_HEIGHT}`,
        pathLength: finalPath.length,
        nodesExplored: closedSet.size,
        executionTime: searchTime,
        heuristic: currentHeuristic,
        obstacles: obstaclePositions
    };
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'pathfinding-results.json';
    link.click();
}
```

## Tips for Learning

### Best Practices
1. **Start Simple**: Begin with small grids and few obstacles
2. **Observe Carefully**: Watch the exploration pattern
3. **Experiment**: Try different configurations
4. **Compare**: Test multiple scenarios
5. **Document**: Keep notes on observations

### Common Mistakes
1. **Ignoring Heuristic**: Not understanding its impact
2. **Complex Mazes**: Starting with overly difficult scenarios
3. **Speed Too Fast**: Missing important details
4. **No Comparison**: Not testing alternatives
5. **Passive Watching**: Not actively experimenting

### Learning Progression
1. **Beginner**: Understand basic pathfinding
2. **Intermediate**: Grasp heuristic functions
3. **Advanced**: Optimize for specific scenarios
4. **Expert**: Implement variations and improvements

---
**Previous:** [Optimization Techniques](09-optimizations.md)
**Next:** [Code Walkthrough](11-code-walkthrough.md)

**Interactive:** [Start exploring](demo.html)