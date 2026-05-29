# Heuristic Mathematics

## What is a Heuristic?
A heuristic is an **educated guess** about the cost to reach the goal from any given node.

### Key Properties
1. **Admissible**: h(n) ≤ h*(n) (never overestimate)
2. **Consistent**: h(n) ≤ c(n,n') + h(n') (triangle inequality)
3. **Fast to compute**: O(1) time complexity

## Common Heuristics

### 1. Manhattan Distance (L1 Norm)
**Formula**: `h(n) = |x₁ - x₂| + |y₁ - y₂|`

```
Example: From (1,1) to (4,3)
h = |4-1| + |3-1| = 3 + 2 = 5

┌─┬─┬─┬─┬─┐
│ │ │ │G│ │  G = Goal (4,3)
├─┼─┼─┼─┼─┤
│ │ │2│1│ │  Numbers = Manhattan distance
├─┼─┼─┼─┼─┤
│ │S│3│2│1│  S = Start (1,1)
├─┼─┼─┼─┼─┤
│ │4│3│2│1│
└─┴─┴─┴─┴─┘
```

**Best for**: 4-directional movement (no diagonal)

### 2. Euclidean Distance (L2 Norm)
**Formula**: `h(n) = √[(x₁ - x₂)² + (y₁ - y₂)²]`

```
Example: From (1,1) to (4,3)
h = √[(4-1)² + (3-1)²] = √[9 + 4] = √13 ≈ 3.6

┌─┬─┬─┬─┬─┐
│ │ │ │G│ │  G = Goal (4,3)
├─┼─┼─┼─┼─┤
│ │ │2.2│1│ │  Numbers = Euclidean distance
├─┼─┼─┼─┼─┤
│ │S│2.8│2│1│  S = Start (1,1)
├─┼─┼─┼─┼─┤
│ │3.6│3.2│2.2│1│
└─┴─┴─┴─┴─┘
```

**Best for**: Any-direction movement

### 3. Chebyshev Distance (L∞ Norm)
**Formula**: `h(n) = max(|x₁ - x₂|, |y₁ - y₂|)`

```
Example: From (1,1) to (4,3)
h = max(|4-1|, |3-1|) = max(3, 2) = 3

┌─┬─┬─┬─┬─┐
│ │ │ │G│ │  G = Goal (4,3)
├─┼─┼─┼─┼─┤
│ │ │2│1│ │  Numbers = Chebyshev distance
├─┼─┼─┼─┼─┤
│ │S│2│2│1│  S = Start (1,1)
├─┼─┼─┼─┼─┤
│ │3│3│2│1│
└─┴─┴─┴─┴─┘
```

**Best for**: 8-directional movement (with diagonal)

## Heuristic Impact on Performance

### Perfect Heuristic (h = h*)
```
Nodes explored: Minimal (only optimal path)
┌─┬─┬─┬─┬─┐
│ │ │ │G│ │
├─┼─┼─┼─┼─┤
│ │ │ │*│ │
├─┼─┼─┼─┼─┤
│ │S│*│*│ │
└─┴─┴─┴─┴─┘
```

### Good Heuristic (h < h*, close)
```
Nodes explored: Few
┌─┬─┬─┬─┬─┐
│ │ │*│G│ │
├─┼─┼─┼─┼─┤
│ │*│*│*│ │
├─┼─┼─┼─┼─┤
│ │S│*│*│ │
└─┴─┴─┴─┴─┘
```

### Poor Heuristic (h << h*)
```
Nodes explored: Many (like Dijkstra)
┌─┬─┬─┬─┬─┐
│*│*│*│G│ │
├─┼─┼─┼─┼─┤
│*│*│*│*│ │
├─┼─┼─┼─┼─┤
│*│S│*│*│ │
└─┴─┴─┴─┴─┘
```

### Inadmissible Heuristic (h > h*)
```
Result: Suboptimal path found
┌─┬─┬─┬─┬─┐
│ │ │ │G│ │
├─┼─┼─┼─┼─┤
│ │ │ │X│ │  X = Suboptimal path
├─┼─┼─┼─┼─┤
│ │S│X│X│X│
└─┴─┴─┴─┴─┘
```

## Choosing the Right Heuristic

| Movement Type | Best Heuristic | Reason |
|---------------|----------------|--------|
| 4-directional | Manhattan | Matches actual movement |
| 8-directional | Chebyshev | Accounts for diagonal |
| Any direction | Euclidean | True geometric distance |
| Weighted edges | Custom | Domain-specific |

## Mathematical Proof: Admissibility

For A* to be optimal, the heuristic must be admissible:

**Theorem**: If h(n) ≤ h*(n) for all n, then A* finds optimal solution.

**Proof Sketch**:
1. Suppose A* returns suboptimal path with cost C
2. Optimal path has cost C* < C
3. Some node n on optimal path must be in open set
4. f(n) = g(n) + h(n) ≤ g(n) + h*(n) = C*
5. Since f(n) ≤ C* < C, node n would be expanded before suboptimal goal
6. Contradiction! ∎

## Implementation Tips

```javascript
// Manhattan distance for grid
function manhattanDistance(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// Euclidean distance
function euclideanDistance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// Chebyshev distance
function chebyshevDistance(a, b) {
    return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}
```

---
**Previous:** [Search Algorithms Comparison](02-search-algorithms.md)
**Next:** [Node Evaluation Process](04-node-evaluation.md)

**Interactive:** [Test different heuristics](demo.html)