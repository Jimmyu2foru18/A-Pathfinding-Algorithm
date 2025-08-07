/**
 * A* Algorithm Interactive Visualizer
 * Complete implementation with step-by-step visualization
 */

class AStarVisualizer {
    constructor() {
        this.canvas = document.getElementById('gridCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 20;
        this.cols = Math.floor(this.canvas.width / this.cellSize);
        this.rows = Math.floor(this.canvas.height / this.cellSize);
        
        // Grid state
        this.grid = [];
        this.startNode = null;
        this.endNode = null;
        this.openSet = [];
        this.closedSet = [];
        this.path = [];
        
        // Animation state
        this.isRunning = false;
        this.isPaused = false;
        this.animationSpeed = 50;
        this.currentStep = 0;
        this.animationId = null;
        
        // Statistics
        this.stats = {
            nodesExplored: 0,
            pathLength: 0,
            executionTime: 0,
            startTime: 0
        };
        
        // Mouse state
        this.isMouseDown = false;
        this.mouseButton = 0;
        this.currentMode = 'start'; // 'start', 'end', 'obstacle'
        
        this.initializeGrid();
        this.setupEventListeners();
        this.draw();
    }
    
    initializeGrid() {
        this.grid = [];
        for (let i = 0; i < this.cols; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.rows; j++) {
                this.grid[i][j] = new Node(i, j);
            }
        }
    }
    
    setupEventListeners() {
        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Button events
        document.getElementById('startBtn').addEventListener('click', () => this.startSearch());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseSearch());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGrid());
        document.getElementById('clearPathBtn').addEventListener('click', () => this.clearPath());
        document.getElementById('generateMazeBtn').addEventListener('click', () => this.generateMaze());
        
        // Speed control
        const speedSlider = document.getElementById('speedSlider');
        speedSlider.addEventListener('input', (e) => {
            this.animationSpeed = 101 - parseInt(e.target.value);
            document.getElementById('speedValue').textContent = this.animationSpeed + 'ms';
        });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    if (this.isRunning) {
                        this.pauseSearch();
                    } else {
                        this.startSearch();
                    }
                    break;
                case 'KeyR':
                    this.resetGrid();
                    break;
            }
        });
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.cellSize);
        const y = Math.floor((e.clientY - rect.top) / this.cellSize);
        return { x, y };
    }
    
    handleMouseDown(e) {
        this.isMouseDown = true;
        this.mouseButton = e.button;
        const pos = this.getMousePos(e);
        
        if (pos.x >= 0 && pos.x < this.cols && pos.y >= 0 && pos.y < this.rows) {
            this.handleCellClick(pos.x, pos.y, e.button);
        }
    }
    
    handleMouseMove(e) {
        if (!this.isMouseDown) return;
        
        const pos = this.getMousePos(e);
        if (pos.x >= 0 && pos.x < this.cols && pos.y >= 0 && pos.y < this.rows) {
            if (this.mouseButton === 0) { // Left mouse button
                const node = this.grid[pos.x][pos.y];
                if (node !== this.startNode && node !== this.endNode) {
                    node.isObstacle = true;
                    this.draw();
                }
            } else if (this.mouseButton === 2) { // Right mouse button
                const node = this.grid[pos.x][pos.y];
                if (node !== this.startNode && node !== this.endNode) {
                    node.isObstacle = false;
                    this.draw();
                }
            }
        }
    }
    
    handleMouseUp() {
        this.isMouseDown = false;
    }
    
    handleCellClick(x, y, button) {
        const node = this.grid[x][y];
        
        if (button === 0) { // Left click
            if (!this.startNode && !node.isObstacle) {
                this.startNode = node;
                this.currentMode = 'end';
                this.updateStepDescription('Start point set! Now click to set the end point.');
            } else if (!this.endNode && node !== this.startNode && !node.isObstacle) {
                this.endNode = node;
                this.currentMode = 'obstacle';
                this.updateStepDescription('End point set! You can now add obstacles or start the search.');
            } else if (node !== this.startNode && node !== this.endNode) {
                node.isObstacle = !node.isObstacle;
            }
        } else if (button === 2) { // Right click
            if (node === this.startNode) {
                this.startNode = null;
                this.currentMode = 'start';
                this.updateStepDescription('Start point removed. Click to set a new start point.');
            } else if (node === this.endNode) {
                this.endNode = null;
                this.currentMode = this.startNode ? 'end' : 'start';
                this.updateStepDescription('End point removed. Click to set a new end point.');
            } else {
                node.isObstacle = false;
            }
        }
        
        this.draw();
    }
    
    async startSearch() {
        if (!this.startNode || !this.endNode) {
            this.updateStepDescription('Please set both start and end points before starting the search.');
            return;
        }
        
        if (this.isPaused) {
            this.isPaused = false;
            this.isRunning = true;
            this.updateButtons();
            this.continueAnimation();
            return;
        }
        
        this.resetSearch();
        this.isRunning = true;
        this.stats.startTime = performance.now();
        this.updateButtons();
        this.updateAlgorithmStatus('Running');
        
        // Initialize A* algorithm
        this.openSet = [this.startNode];
        this.startNode.gCost = 0;
        this.startNode.hCost = this.heuristic(this.startNode, this.endNode);
        this.startNode.fCost = this.startNode.gCost + this.startNode.hCost;
        
        this.updateStepDescription('A* search started! Exploring nodes...');
        this.animateSearch();
    }
    
    pauseSearch() {
        this.isPaused = true;
        this.isRunning = false;
        this.updateButtons();
        this.updateAlgorithmStatus('Paused');
        if (this.animationId) {
            clearTimeout(this.animationId);
        }
    }
    
    async animateSearch() {
        if (!this.isRunning || this.isPaused) return;
        
        if (this.openSet.length === 0) {
            this.finishSearch(false, 'No path found!');
            return;
        }
        
        // Find node with lowest f cost
        let current = this.openSet[0];
        for (let i = 1; i < this.openSet.length; i++) {
            if (this.openSet[i].fCost < current.fCost || 
                (this.openSet[i].fCost === current.fCost && this.openSet[i].hCost < current.hCost)) {
                current = this.openSet[i];
            }
        }
        
        // Remove current from open set and add to closed set
        this.openSet = this.openSet.filter(node => node !== current);
        this.closedSet.push(current);
        this.stats.nodesExplored++;
        
        // Check if we reached the goal
        if (current === this.endNode) {
            this.reconstructPath(current);
            this.finishSearch(true, `Path found! Length: ${this.path.length}`);
            return;
        }
        
        // Explore neighbors
        const neighbors = this.getNeighbors(current);
        for (const neighbor of neighbors) {
            if (neighbor.isObstacle || this.closedSet.includes(neighbor)) {
                continue;
            }
            
            const tentativeGCost = current.gCost + this.getDistance(current, neighbor);
            
            if (!this.openSet.includes(neighbor)) {
                this.openSet.push(neighbor);
            } else if (tentativeGCost >= neighbor.gCost) {
                continue;
            }
            
            neighbor.parent = current;
            neighbor.gCost = tentativeGCost;
            neighbor.hCost = this.heuristic(neighbor, this.endNode);
            neighbor.fCost = neighbor.gCost + neighbor.hCost;
        }
        
        this.updateStats();
        this.draw();
        
        // Continue animation
        this.animationId = setTimeout(() => this.animateSearch(), this.animationSpeed);
    }
    
    continueAnimation() {
        this.animateSearch();
    }
    
    finishSearch(success, message) {
        this.isRunning = false;
        this.isPaused = false;
        this.stats.executionTime = performance.now() - this.stats.startTime;
        this.updateButtons();
        this.updateAlgorithmStatus(success ? 'Path Found' : 'No Path');
        this.updateStepDescription(message);
        this.updateStats();
        this.draw();
    }
    
    reconstructPath(endNode) {
        this.path = [];
        let current = endNode;
        while (current) {
            this.path.unshift(current);
            current = current.parent;
        }
        this.stats.pathLength = this.path.length;
    }
    
    getNeighbors(node) {
        const neighbors = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (const [dx, dy] of directions) {
            const x = node.x + dx;
            const y = node.y + dy;
            
            if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
                neighbors.push(this.grid[x][y]);
            }
        }
        
        return neighbors;
    }
    
    getDistance(nodeA, nodeB) {
        const dx = Math.abs(nodeA.x - nodeB.x);
        const dy = Math.abs(nodeA.y - nodeB.y);
        
        // Diagonal movement costs more
        if (dx === 1 && dy === 1) {
            return Math.sqrt(2); // ~1.414
        }
        return 1;
    }
    
    heuristic(nodeA, nodeB) {
        const heuristicType = document.getElementById('heuristicSelect').value;
        const dx = Math.abs(nodeA.x - nodeB.x);
        const dy = Math.abs(nodeA.y - nodeB.y);
        
        switch (heuristicType) {
            case 'manhattan':
                return dx + dy;
            case 'euclidean':
                return Math.sqrt(dx * dx + dy * dy);
            case 'diagonal':
                return Math.max(dx, dy) + (Math.sqrt(2) - 1) * Math.min(dx, dy);
            case 'dijkstra':
                return 0;
            default:
                return dx + dy;
        }
    }
    
    resetGrid() {
        this.isRunning = false;
        this.isPaused = false;
        if (this.animationId) {
            clearTimeout(this.animationId);
        }
        
        this.initializeGrid();
        this.startNode = null;
        this.endNode = null;
        this.currentMode = 'start';
        this.resetSearch();
        this.resetStats();
        this.updateButtons();
        this.updateAlgorithmStatus('Ready');
        this.updateStepDescription('Click on the grid to set start and end points, then click Start to begin the A* search.');
        this.draw();
    }
    
    clearPath() {
        this.resetSearch();
        this.resetStats();
        this.updateAlgorithmStatus('Ready');
        this.updateStepDescription('Path cleared. Click Start to search again.');
        this.draw();
    }
    
    resetSearch() {
        this.openSet = [];
        this.closedSet = [];
        this.path = [];
        
        // Reset all node states except obstacles and start/end
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                const node = this.grid[i][j];
                node.gCost = Infinity;
                node.hCost = 0;
                node.fCost = Infinity;
                node.parent = null;
            }
        }
    }
    
    generateMaze() {
        this.resetGrid();
        
        // Simple maze generation using random obstacles
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                if (Math.random() < 0.3) {
                    this.grid[i][j].isObstacle = true;
                }
            }
        }
        
        this.updateStepDescription('Random maze generated! Set start and end points to begin.');
        this.draw();
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                const node = this.grid[i][j];
                const x = i * this.cellSize;
                const y = j * this.cellSize;
                
                // Determine cell color
                let color = '#ffffff'; // Default white
                
                if (node.isObstacle) {
                    color = '#34495e'; // Dark gray for obstacles
                } else if (node === this.startNode) {
                    color = '#2ecc71'; // Green for start
                } else if (node === this.endNode) {
                    color = '#e74c3c'; // Red for end
                } else if (this.path.includes(node)) {
                    color = '#f1c40f'; // Yellow for path
                } else if (this.closedSet.includes(node)) {
                    color = '#9b59b6'; // Purple for closed set
                } else if (this.openSet.includes(node)) {
                    color = '#3498db'; // Blue for open set
                }
                
                // Draw cell
                this.ctx.fillStyle = color;
                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                
                // Draw border
                this.ctx.strokeStyle = '#bdc3c7';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
                
                // Draw f, g, h costs for debugging (small text)
                if (this.isRunning && (this.openSet.includes(node) || this.closedSet.includes(node))) {
                    this.ctx.fillStyle = '#2c3e50';
                    this.ctx.font = '8px Arial';
                    this.ctx.textAlign = 'center';
                    
                    if (node.fCost !== Infinity) {
                        this.ctx.fillText(Math.round(node.fCost), x + this.cellSize/2, y + 8);
                        this.ctx.fillText(Math.round(node.gCost), x + 6, y + this.cellSize - 2);
                        this.ctx.fillText(Math.round(node.hCost), x + this.cellSize - 6, y + this.cellSize - 2);
                    }
                }
            }
        }
    }
    
    updateButtons() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        
        if (this.isRunning) {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
        } else {
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        }
    }
    
    updateStats() {
        document.getElementById('nodesExplored').textContent = this.stats.nodesExplored;
        document.getElementById('pathLength').textContent = this.stats.pathLength;
        document.getElementById('executionTime').textContent = Math.round(this.stats.executionTime) + 'ms';
    }
    
    resetStats() {
        this.stats = {
            nodesExplored: 0,
            pathLength: 0,
            executionTime: 0,
            startTime: 0
        };
        this.updateStats();
    }
    
    updateAlgorithmStatus(status) {
        document.getElementById('algorithmStatus').textContent = status;
    }
    
    updateStepDescription(description) {
        document.getElementById('stepDescription').textContent = description;
    }
}

// Node class for the grid
class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.isObstacle = false;
        this.gCost = Infinity; // Cost from start
        this.hCost = 0;        // Heuristic cost to end
        this.fCost = Infinity; // Total cost (g + h)
        this.parent = null;    // For path reconstruction
    }
}

// Initialize the visualizer when the page loads
let visualizer;
document.addEventListener('DOMContentLoaded', () => {
    visualizer = new AStarVisualizer();
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AStarVisualizer, Node };
}