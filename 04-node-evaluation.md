# Node Evaluation Process

## The Core Formula: f(n) = g(n) + h(n)

### Components Breakdown
- **g(n)**: Actual cost from start to node n
- **h(n)**: Heuristic estimate from node n to goal
- **f(n)**: Total estimated cost of path through n

## Step-by-Step Evaluation

### Example Setup
```
Grid with costs:
┌─┬─┬─┬─┬─┐
│ │ │ │G│ │  S = Start (0,2)
├─┼─┼─┼─┼─┤  G = Goal (3,0)
│ │ │█│ │ │  █ = Obstacle
├─┼─┼─┼─┼─┤  Numbers = step order
│S│1│2│3│ │
└─┴─┴─┴─┴─┘
```

### Step 1: Initialize Start Node
```
Node S (0,2):
g(S) = 0           (distance from start)
h(S) = 5           (Manhattan to goal: |3-0| + |0-2|)
f(S) = 0 + 5 = 5   (total estimated cost)
```

### Step 2: Evaluate Neighbors

#### Node 1 (1,2)
```
g(1) = g(S) + 1 = 0 + 1 = 1    (cost to reach)
h(1) = |3-1| + |0-2| = 4       (heuristic to goal)
f(1) = 1 + 4 = 5               (total estimate)
parent(1) = S                   (for path reconstruction)
```

#### Node Up (0,1)
```
g(up) = g(S) + 1 = 1
h(up) = |3-0| + |0-1| = 4
f(up) = 1 + 4 = 5
parent(up) = S
```

#### Node Down (0,3) - Out of bounds, skip

### Step 3: Select Best Node
```
Open Set: {Node1(f=5), NodeUp(f=5)}
Both have same f-cost, choose Node1 (arbitrary tie-breaking)
Current = Node1
Move Node1 from Open to Closed set
```

### Step 4: Expand Node 1

#### Node 2 (2,2)
```
g(2) = g(1) + 1 = 2
h(2) = |3-2| + |0-2| = 3
f(2) = 2 + 3 = 5
parent(2) = Node1
```

#### Node (1,1)
```
g(1,1) = g(1) + 1 = 2
h(1,1) = |3-1| + |0-1| = 3
f(1,1) = 2 + 3 = 5
parent(1,1) = Node1
```

## Complete Evaluation Table

| Node | g(n) | h(n) | f(n) | Parent | Status |
|------|------|------|------|--------|---------|
| S(0,2) | 0 | 5 | 5 | null | Closed |
| (1,2) | 1 | 4 | 5 | S | Closed |
| (0,1) | 1 | 4 | 5 | S | Open |
| (2,2) | 2 | 3 | 5 | (1,2) | Open |
| (1,1) | 2 | 3 | 5 | (1,2) | Open |
| (3,2) | 3 | 2 | 5 | (2,2) | Open |
| (2,1) | 3 | 2 | 5 | (1,1) | Open |
| (3,1) | 4 | 1 | 5 | (3,2) | Open |
| (3,0) | 5 | 0 | 5 | (3,1) | **GOAL** |

## Key Insights

### 1. Consistent f-values
Notice all nodes have f(n) = 5, indicating optimal heuristic!

### 2. Path Reconstruction
```
Goal(3,0) ← (3,1) ← (3,2) ← (2,2) ← (1,2) ← Start(0,2)
Final path: S → 1 → 2 → 3 → G
Total cost: 5 (matches our estimate!)
```

### 3. Tie-Breaking Strategies
When f-values are equal:
- **Prefer lower h-value**: Closer to goal
- **Prefer higher g-value**: Further from start
- **LIFO**: Last In, First Out
- **Coordinate-based**: Consistent ordering

## Implementation Details

```javascript
class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.gCost = Infinity;
        this.hCost = 0;
        this.parent = null;
    }
    
    get fCost() {
        return this.gCost + this.hCost;
    }
    
    calculateHeuristic(goal) {
        // Manhattan distance
        this.hCost = Math.abs(this.x - goal.x) + Math.abs(this.y - goal.y);
    }
    
    updateCosts(parent, goal) {
        this.gCost = parent.gCost + this.getMoveCost(parent);
        this.calculateHeuristic(goal);
        this.parent = parent;
    }
    
    getMoveCost(parent) {
        // Diagonal movement costs √2, cardinal costs 1
        const dx = Math.abs(this.x - parent.x);
        const dy = Math.abs(this.y - parent.y);
        return (dx === 1 && dy === 1) ? Math.sqrt(2) : 1;
    }
}
```

## Common Mistakes

### 1. Forgetting to Update g-cost
```javascript
// WRONG: Only checking if node is in closed set
if (!closedSet.has(neighbor)) {
    openSet.add(neighbor);
}

// CORRECT: Check if new path is better
const tentativeG = current.gCost + moveCost;
if (tentativeG < neighbor.gCost) {
    neighbor.updateCosts(current, goal);
    openSet.add(neighbor);
}
```

### 2. Incorrect Heuristic Calculation
```javascript
// WRONG: Using Euclidean for 4-directional movement
h = Math.sqrt(dx*dx + dy*dy);

// CORRECT: Using Manhattan for 4-directional
h = Math.abs(dx) + Math.abs(dy);
```

### 3. Not Handling Ties
```javascript
// WRONG: Arbitrary selection
let current = openSet.values().next().value;

// BETTER: Consistent tie-breaking
let current = Array.from(openSet).reduce((best, node) => {
    if (node.fCost < best.fCost) return node;
    if (node.fCost === best.fCost && node.hCost < best.hCost) return node;
    return best;
});
```

---
**Previous:** [Heuristic Mathematics](03-heuristic-mathematics.md)
**Next:** [Open/Closed Set Management](05-set-management.md)

**Interactive:** [Step through evaluation](demo.html)