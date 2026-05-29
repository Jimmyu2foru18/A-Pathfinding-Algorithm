# Open/Closed Set Management

## The Two Essential Data Structures

### Open Set (Frontier)
**Purpose**: Nodes discovered but not yet explored
**Operations**: Add, Remove minimum f-cost, Check membership
**Implementation**: Priority Queue (Min-Heap)

### Closed Set (Explored)
**Purpose**: Nodes already explored
**Operations**: Add, Check membership
**Implementation**: Hash Set

## Visual Representation

```
Search Progress:
┌─┬─┬─┬─┬─┐
│ │ │ │G│ │  Legend:
├─┼─┼─┼─┼─┤  S = Start
│ │O│█│C│ │  G = Goal
├─┼─┼─┼─┼─┤  O = Open Set
│O│C│C│O│ │  C = Closed Set
├─┼─┼─┼─┼─┤  █ = Obstacle
│ │S│O│ │ │  (blank) = Unexplored
└─┴─┴─┴─┴─┘
```

## Algorithm Flow

### Step-by-Step Process

1. **Initialize**
   ```
   openSet = {start}
   closedSet = {}
   start.gCost = 0
   ```

2. **Main Loop**
   ```
   while openSet is not empty:
       current = node in openSet with lowest f-cost
       remove current from openSet
       add current to closedSet
       
       if current == goal:
           return reconstructPath(current)
       
       for each neighbor of current:
           if neighbor in closedSet:
               continue  // Skip already explored
           
           if neighbor not in openSet:
               add neighbor to openSet
           
           tentativeG = current.gCost + distance(current, neighbor)
           if tentativeG >= neighbor.gCost:
               continue  // Not a better path
           
           neighbor.parent = current
           neighbor.gCost = tentativeG
           neighbor.hCost = heuristic(neighbor, goal)
   ```

## Data Structure Analysis

### Priority Queue Implementation

#### Option 1: Binary Heap
```javascript
class MinHeap {
    constructor() {
        this.heap = [];
    }
    
    insert(node) {
        this.heap.push(node);
        this.bubbleUp(this.heap.length - 1);
    }
    
    extractMin() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();
        
        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        return min;
    }
    
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex].fCost <= this.heap[index].fCost) break;
            
            [this.heap[parentIndex], this.heap[index]] = 
            [this.heap[index], this.heap[parentIndex]];
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
            
            [this.heap[index], this.heap[minIndex]] = 
            [this.heap[minIndex], this.heap[index]];
            index = minIndex;
        }
    }
}
```

**Time Complexity**:
- Insert: O(log n)
- Extract Min: O(log n)
- Peek: O(1)

#### Option 2: Simple Array (for small grids)
```javascript
class SimpleOpenSet {
    constructor() {
        this.nodes = [];
    }
    
    add(node) {
        if (!this.contains(node)) {
            this.nodes.push(node);
        }
    }
    
    getLowestFCost() {
        return this.nodes.reduce((best, node) => 
            node.fCost < best.fCost ? node : best
        );
    }
    
    remove(node) {
        const index = this.nodes.indexOf(node);
        if (index > -1) {
            this.nodes.splice(index, 1);
        }
    }
    
    contains(node) {
        return this.nodes.includes(node);
    }
    
    isEmpty() {
        return this.nodes.length === 0;
    }
}
```

**Time Complexity**:
- Insert: O(1)
- Extract Min: O(n)
- Contains: O(n)

### Hash Set for Closed Set

```javascript
class ClosedSet {
    constructor() {
        this.set = new Set();
    }
    
    add(node) {
        this.set.add(this.getKey(node));
    }
    
    contains(node) {
        return this.set.has(this.getKey(node));
    }
    
    getKey(node) {
        return `${node.x},${node.y}`;
    }
}
```

**Time Complexity**:
- Insert: O(1)
- Contains: O(1)

## Performance Comparison

| Grid Size | Simple Array | Binary Heap | Fibonacci Heap |
|-----------|--------------|-------------|----------------|
| 10×10 | Fast | Overkill | Overkill |
| 100×100 | Slow | Good | Good |
| 1000×1000 | Very Slow | Good | Better |

## Memory Optimization

### Node Pooling
```javascript
class NodePool {
    constructor() {
        this.pool = [];
        this.used = new Set();
    }
    
    getNode(x, y) {
        const key = `${x},${y}`;
        if (this.used.has(key)) {
            return this.used.get(key);
        }
        
        let node = this.pool.pop() || new Node();
        node.reset(x, y);
        this.used.set(key, node);
        return node;
    }
    
    releaseAll() {
        for (let node of this.used.values()) {
            this.pool.push(node);
        }
        this.used.clear();
    }
}
```

### Coordinate Hashing
```javascript
// Instead of storing full node objects
function coordToIndex(x, y, width) {
    return y * width + x;
}

function indexToCoord(index, width) {
    return {
        x: index % width,
        y: Math.floor(index / width)
    };
}
```

## Common Pitfalls

### 1. Duplicate Nodes in Open Set
```javascript
// WRONG: Adding without checking
openSet.add(neighbor);

// CORRECT: Check and update if better
if (!openSet.contains(neighbor)) {
    openSet.add(neighbor);
} else if (tentativeG < neighbor.gCost) {
    neighbor.updateCosts(current, goal);
    // Note: Some implementations need to re-heapify here
}
```

### 2. Not Updating Priority Queue
```javascript
// PROBLEM: Heap doesn't know about cost changes
neighbor.gCost = newGCost;
// Heap order is now invalid!

// SOLUTION: Remove and re-add, or use decrease-key operation
openSet.remove(neighbor);
neighbor.gCost = newGCost;
openSet.add(neighbor);
```

### 3. Memory Leaks
```javascript
// WRONG: Keeping references
node.parent = parentNode;  // Creates reference chain

// BETTER: Store coordinates only
node.parentX = parentNode.x;
node.parentY = parentNode.y;
```

## Visualization States

```
Iteration 1:           Iteration 2:           Iteration 3:
┌─┬─┬─┬─┐             ┌─┬─┬─┬─┐             ┌─┬─┬─┬─┐
│ │ │ │G│             │ │O│ │G│             │ │C│O│G│
├─┼─┼─┼─┤             ├─┼─┼─┼─┤             ├─┼─┼─┼─┤
│ │O│ │ │             │O│C│O│ │             │O│C│C│O│
├─┼─┼─┼─┤             ├─┼─┼─┼─┤             ├─┼─┼─┼─┤
│S│ │ │ │             │C│ │ │ │             │C│ │ │ │
└─┴─┴─┴─┘             └─┴─┴─┴─┘             └─┴─┴─┴─┘
Open: {(0,1)}          Open: {(1,1),(0,0)}   Open: {(1,1),(0,0),(2,0)}
Closed: {(0,2)}        Closed: {(0,2),(1,2)} Closed: {(0,2),(1,2),(2,1)}
```

---
**Previous:** [Node Evaluation Process](04-node-evaluation.md)
**Next:** [Path Reconstruction](06-path-reconstruction.md)

**Interactive:** [Visualize set operations](demo.html)