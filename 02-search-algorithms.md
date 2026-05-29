# Search Algorithms Comparison

## Uninformed vs Informed Search

### Uninformed Search (Blind Search)
Algorithms that explore without knowledge of the goal location.

#### Breadth-First Search (BFS)
```
Exploration Pattern:
┌─┬─┬─┬─┬─┐
│1│2│3│4│5│
├─┼─┼─┼─┼─┤
│2│3│4│5│6│
├─┼─┼─┼─┼─┤
│3│4│5│6│7│
└─┴─┴─┴─┴─┘
```
- **Guarantees**: Shortest path
- **Time**: O(b^d)
- **Space**: O(b^d)
- **Problem**: Explores everywhere equally

#### Depth-First Search (DFS)
```
Exploration Pattern:
┌─┬─┬─┬─┬─┐
│1│ │ │ │ │
├─┼─┼─┼─┼─┤
│2│ │ │ │ │
├─┼─┼─┼─┼─┤
│3│4│5│6│7│
└─┴─┴─┴─┴─┘
```
- **Guarantees**: None
- **Time**: O(b^m)
- **Space**: O(bm)
- **Problem**: May find suboptimal paths

### Informed Search (Heuristic Search)
Algorithms that use domain knowledge to guide exploration.

#### Greedy Best-First Search
```
Exploration Pattern (toward goal):
┌─┬─┬─┬─┬─┐
│ │ │ │ │G│
├─┼─┼─┼─┼─┤
│ │ │ │4│3│
├─┼─┼─┼─┼─┤
│S│1│2│ │ │
└─┴─┴─┴─┴─┘
```
- **Guarantees**: None
- **Time**: O(b^m)
- **Space**: O(b^m)
- **Problem**: Can get trapped by local optima

#### Dijkstra's Algorithm
```
Exploration Pattern (uniform cost):
┌─┬─┬─┬─┬─┐
│4│3│4│5│6│
├─┼─┼─┼─┼─┤
│3│2│3│4│5│
├─┼─┼─┼─┼─┤
│2│1│2│3│4│
├─┼─┼─┼─┼─┤
│1│S│1│2│3│
└─┴─┴─┴─┴─┘
```
- **Guarantees**: Optimal path
- **Time**: O((V + E) log V)
- **Space**: O(V)
- **Problem**: Explores in all directions equally

## A* Algorithm: The Best of Both Worlds

### Formula: f(n) = g(n) + h(n)
- **g(n)**: Actual cost from start
- **h(n)**: Heuristic estimate to goal
- **f(n)**: Total estimated cost

```
A* Exploration Pattern:
┌─┬─┬─┬─┬─┐
│ │ │ │ │G│
├─┼─┼─┼─┼─┤
│ │ │3│2│1│
├─┼─┼─┼─┼─┤
│ │4│3│2│ │
├─┼─┼─┼─┼─┤
│S│1│2│ │ │
└─┴─┴─┴─┴─┘
```

### Why A* is Optimal
1. **Admissible Heuristic**: Never overestimates
2. **Consistent**: Satisfies triangle inequality
3. **Complete**: Always finds solution if exists
4. **Optimal**: Finds shortest path

## Performance Comparison

| Algorithm | Optimal | Complete | Time | Space |
|-----------|---------|----------|------|-------|
| BFS | ✓ | ✓ | O(b^d) | O(b^d) |
| DFS | ✗ | ✗ | O(b^m) | O(bm) |
| Greedy | ✗ | ✗ | O(b^m) | O(b^m) |
| Dijkstra | ✓ | ✓ | O((V+E)logV) | O(V) |
| A* | ✓ | ✓ | O(b^d) | O(b^d) |

**Key Advantage**: A* typically explores fewer nodes than other optimal algorithms.

---
**Previous:** [Graph Theory Basics](01-graph-theory-basics.md)
**Next:** [Heuristic Mathematics](03-heuristic-mathematics.md)

**Interactive:** [Compare algorithms](demo.html)