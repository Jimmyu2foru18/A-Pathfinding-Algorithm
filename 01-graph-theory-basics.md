# Graph Theory Basics

## What is a Graph?
A graph is a mathematical structure consisting of:
- **Vertices (Nodes)**: Points in space
- **Edges**: Connections between vertices
- **Weights**: Optional costs for traversing edges

## Grid-Based Graphs
In pathfinding, we often use grid-based representations:

```
┌─┬─┬─┬─┐
│S│ │ │ │  S = Start
├─┼─┼─┼─┤
│ │█│ │ │  █ = Obstacle
├─┼─┼─┼─┤
│ │ │ │E│  E = End
└─┴─┴─┴─┘
```

## Movement Types

### 4-Directional Movement
```
    ↑
  ← N →
    ↓
```
Cost: 1 unit per move

### 8-Directional Movement
```
  ↖ ↑ ↗
  ← N →
  ↙ ↓ ↘
```
Cost: 1 for cardinal, √2 for diagonal

## Key Properties
- **Connected**: Path exists between nodes
- **Weighted**: Edges have movement costs
- **Directed/Undirected**: Movement restrictions

## Real-World Examples
- Video game maps
- Robot navigation grids
- City street networks
- Circuit board routing

---
**Next:** [Search Algorithms Comparison](02-search-algorithms.md)

**Interactive:** [Try grid creation](demo.html)