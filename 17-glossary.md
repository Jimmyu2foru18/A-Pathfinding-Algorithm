# Glossary

## A

**A* Algorithm**
A graph traversal and pathfinding algorithm that finds the shortest path between nodes by using a heuristic to guide its search. It combines the benefits of Dijkstra's algorithm (guaranteed shortest path) with the efficiency of greedy best-first search.

**Admissible Heuristic**
A heuristic function that never overestimates the actual cost to reach the goal. This property ensures that A* will always find the optimal path. Mathematically: h(n) ≤ h*(n) where h*(n) is the true cost from node n to the goal.

**Algorithm Complexity**
A measure of how the algorithm's performance (time and space requirements) scales with input size. Expressed using Big O notation (e.g., O(n log n)).

**Asymptotic Behavior**
How an algorithm's performance characteristics change as the input size approaches infinity. Important for understanding scalability.

## B

**Backtracking**
The process of reconstructing the optimal path by following parent pointers from the goal node back to the start node.

**Best-First Search**
A search algorithm that explores nodes in order of their estimated promise, using a heuristic function to determine which node to examine next.

**Bidirectional Search**
A pathfinding technique that simultaneously searches from both the start and goal nodes, potentially reducing the search space significantly.

**Branching Factor**
The average number of successor nodes for each node in the search tree. In grid-based pathfinding, this is typically 4 (cardinal directions) or 8 (including diagonals).

## C

**Closed Set**
A data structure (typically a hash set) that stores nodes that have already been evaluated by the A* algorithm. Prevents re-evaluation of nodes.

**Consistent Heuristic (Monotonic)**
A heuristic that satisfies the triangle inequality: h(n) ≤ c(n,n') + h(n') for every node n and successor n'. Ensures optimal pathfinding with A*.

**Cost Function**
A function that assigns a numerical cost to moving from one node to another. In simple grids, this is often uniform (cost = 1), but can vary based on terrain type.

**Chebyshev Distance**
A distance metric that measures the maximum difference between coordinates. Formula: max(|x₁-x₂|, |y₁-y₂|). Useful for 8-directional movement.

## D

**Dijkstra's Algorithm**
A graph search algorithm that finds the shortest path between nodes by exploring all nodes in order of their distance from the start. Guarantees optimal paths but can be slower than A*.

**Dynamic Programming**
A method for solving complex problems by breaking them down into simpler subproblems and storing the results to avoid redundant calculations.

**Diagonal Movement**
Movement that allows transitions between diagonally adjacent cells in a grid, typically with a cost of √2 ≈ 1.414 compared to 1.0 for cardinal directions.

## E

**Euclidean Distance**
The straight-line distance between two points. Formula: √[(x₁-x₂)² + (y₁-y₂)²]. Often used as a heuristic for pathfinding.

**Exploration**
The process of examining nodes during the search. A* explores nodes in order of their f-cost (f = g + h).

**Edge**
A connection between two nodes in a graph, representing a possible move or transition. In grid pathfinding, edges connect adjacent cells.

## F

**F-Cost (F-Score)**
The total estimated cost of a path through a node, calculated as f(n) = g(n) + h(n), where g(n) is the actual cost from start to n, and h(n) is the heuristic estimate from n to goal.

**Frontier**
Another term for the open set - the collection of nodes that have been discovered but not yet evaluated.

**Fringe**
Synonymous with frontier or open set in pathfinding terminology.

## G

**G-Cost (G-Score)**
The actual cost of the path from the start node to the current node. This represents the "distance traveled so far."

**Graph**
A mathematical structure consisting of nodes (vertices) connected by edges. Pathfinding algorithms operate on graphs.

**Grid-Based Pathfinding**
Pathfinding performed on a regular grid where each cell can be either passable or blocked (obstacle).

**Greedy Best-First Search**
A search algorithm that always chooses the node that appears closest to the goal according to the heuristic function, without considering the cost to reach that node.

## H

**H-Cost (H-Score)**
The heuristic estimate of the cost from the current node to the goal node. This is the "estimated distance remaining."

**Heuristic Function**
A function that estimates the cost from a given node to the goal. Good heuristics are admissible and help guide the search efficiently.

**Heap**
A tree-based data structure that satisfies the heap property. Min-heaps are commonly used to implement priority queues in A*.

**Hierarchical Pathfinding**
A technique that uses multiple levels of abstraction to find paths more efficiently in large environments.

## I

**Inadmissible Heuristic**
A heuristic that may overestimate the actual cost to the goal. While this can make A* faster, it may not find the optimal path.

**Informed Search**
Search algorithms that use domain-specific knowledge (heuristics) to guide the search process more efficiently than uninformed search.

**Iterative Deepening**
A search strategy that combines the space efficiency of depth-first search with the optimality of breadth-first search.

## J

**Jump Point Search (JPS)**
An optimization technique for A* on uniform-cost grids that reduces the number of nodes explored by "jumping" over certain nodes.

## L

**Landmark**
A pre-computed reference point used in some pathfinding optimizations to improve heuristic estimates.

**Lexicographic Ordering**
A method for breaking ties when multiple nodes have the same f-cost, often by comparing g-costs or coordinates.

## M

**Manhattan Distance**
The distance between two points measured along axes at right angles. Formula: |x₁-x₂| + |y₁-y₂|. Also called taxicab distance.

**Min-Heap**
A binary heap where the parent node is always smaller than its children. Used to efficiently retrieve the node with minimum f-cost in A*.

**Monotonic Heuristic**
See Consistent Heuristic. A property ensuring that the heuristic estimate decreases appropriately as you move closer to the goal.

## N

**Node**
A point in the search space, representing a position or state. In grid pathfinding, each cell is a node.

**Neighbor**
A node that can be reached directly from the current node in a single step.

**Non-Admissible Heuristic**
A heuristic that may overestimate the true cost, potentially leading to suboptimal paths but faster search.

## O

**Obstacle**
A blocked cell or impassable area in the pathfinding environment.

**Open Set**
A priority queue containing nodes that have been discovered but not yet evaluated. Nodes are ordered by their f-cost.

**Optimal Path**
The shortest possible path between two points, considering the cost function and constraints of the environment.

**Octile Distance**
A distance metric for 8-directional movement that accounts for the different costs of diagonal vs. cardinal moves.

## P

**Parent Pointer**
A reference stored in each node pointing to the node from which it was reached, used for path reconstruction.

**Path**
A sequence of connected nodes from a start point to a goal point.

**Path Reconstruction**
The process of building the final path by following parent pointers from the goal back to the start.

**Priority Queue**
A data structure where elements are served in order of their priority rather than their insertion order. Essential for A* implementation.

## Q

**Queue**
A first-in-first-out (FIFO) data structure. Used in breadth-first search but not directly in A*.

## R

**Relaxation**
The process of updating a node's g-cost and parent when a better path to that node is found.

**Real-Time Search**
Pathfinding algorithms designed to work within strict time constraints, often used in video games.

## S

**Search Space**
The set of all possible states or positions that can be explored during pathfinding.

**Stack**
A last-in-first-out (LIFO) data structure used in depth-first search algorithms.

**State Space**
The set of all possible configurations or states in a problem domain.

**Suboptimal**
A solution that is not the best possible, but may be acceptable for practical purposes.

## T

**Tie-Breaking**
Methods for choosing between nodes with equal f-costs, such as preferring nodes with higher g-costs or using coordinate-based ordering.

**Time Complexity**
A measure of how the algorithm's execution time scales with input size.

**Traversal**
The process of visiting nodes in a graph or tree structure.

## U

**Uninformed Search**
Search algorithms that don't use domain-specific knowledge, such as breadth-first search or depth-first search.

**Uniform Cost Search**
A search algorithm that explores nodes in order of their path cost from the start node.

## V

**Vertex**
Another term for a node in graph theory.

**Visited Set**
Synonymous with closed set - nodes that have been fully processed.

## W

**Weighted A***
A variant of A* that uses a weighted heuristic (h' = w × h where w > 1) to trade optimality for speed.

**Waypoint**
An intermediate target point in a path, often used in hierarchical pathfinding.

---

## Mathematical Notation

**f(n) = g(n) + h(n)**
The fundamental equation of A*, where:
- f(n) = estimated total cost of path through node n
- g(n) = actual cost from start to node n  
- h(n) = heuristic estimate from node n to goal

**O(b^d)**
Time complexity notation where b is branching factor and d is depth of solution.

**h(n) ≤ h*(n)**
Admissibility condition where h*(n) is the true optimal cost from n to goal.

**h(n) ≤ c(n,n') + h(n')**
Consistency condition for heuristic functions.

---

## Algorithm Variants

**A* Variants:**
- **Weighted A***: Uses w×h(n) for faster but potentially suboptimal results
- **Bidirectional A***: Searches from both start and goal simultaneously
- **Hierarchical A***: Uses multiple abstraction levels
- **Real-Time A***: Designed for time-constrained environments
- **Incremental A***: Handles dynamic environments efficiently

**Related Algorithms:**
- **Dijkstra's**: A* with h(n) = 0
- **Greedy Best-First**: Uses only h(n), ignoring g(n)
- **Jump Point Search**: Grid optimization for A*
- **D* (Dynamic A*)**: Handles changing environments
- **Theta***: Any-angle pathfinding variant

---

## Data Structures

**Priority Queue Implementations:**
- **Binary Heap**: O(log n) insert/extract
- **Fibonacci Heap**: O(1) amortized insert, O(log n) extract
- **Pairing Heap**: Good practical performance

**Set Implementations:**
- **Hash Set**: O(1) average insert/lookup
- **Tree Set**: O(log n) insert/lookup, ordered
- **Bit Set**: Memory-efficient for dense coordinate spaces

---

## Performance Metrics

**Time Complexity:**
- **Best Case**: O(d) where d is depth of solution
- **Average Case**: O(b^d) where b is effective branching factor
- **Worst Case**: O(b^d) for complete search

**Space Complexity:**
- **Memory Usage**: O(b^d) for storing open and closed sets
- **Path Storage**: O(d) for storing the solution path

**Quality Metrics:**
- **Optimality**: Whether the algorithm finds the shortest path
- **Completeness**: Whether the algorithm always finds a solution if one exists
- **Admissibility**: Whether the heuristic never overestimates

---

## Common Pitfalls

**Implementation Issues:**
- **Inconsistent Heuristic**: Can lead to suboptimal paths
- **Incorrect Tie-Breaking**: May cause unnecessary exploration
- **Memory Leaks**: Improper cleanup of data structures
- **Floating Point Errors**: Precision issues with diagonal movement

**Design Issues:**
- **Poor Heuristic Choice**: Inefficient search or suboptimal paths
- **Inadequate Data Structures**: Performance bottlenecks
- **Missing Edge Cases**: Crashes or incorrect behavior

---

## Practical Applications

**Video Games:**
- **NPC Movement**: Character pathfinding
- **RTS Unit Control**: Multiple unit coordination
- **Level Design**: Ensuring connectivity

**Robotics:**
- **Navigation**: Mobile robot path planning
- **Manipulation**: Robot arm motion planning
- **Swarm Robotics**: Multi-agent coordination

**Transportation:**
- **GPS Navigation**: Route planning
- **Traffic Management**: Optimal flow control
- **Logistics**: Delivery route optimization

**Network Routing:**
- **Internet Protocols**: Packet routing
- **Telecommunications**: Call routing
- **Social Networks**: Connection finding

---

**Previous:** [Contributing Guide](16-contributing.md)
**Next:** [References](18-references.md)

**Interactive:** [Explore concepts in practice](demo.html)