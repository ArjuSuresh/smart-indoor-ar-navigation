const Node = require('../models/Node');
const Edge = require('../models/Edge');
const Crowd = require('../models/Crowd');

class GraphService {
    constructor() {
        this.nodes = new Map(); // id -> Node
        this.adjacencyList = new Map(); // id -> [{ targetId, weight }]
        this.crowdPenalties = new Map(); // nodeId -> penalty
        this.isInitialized = false;
    }

    async initialize() {
        console.log('Initializing Graph...');
        const nodes = await Node.find({});
        const edges = await Edge.find({});
        const crowds = await Crowd.find({});

        this.nodes.clear();
        this.adjacencyList.clear();
        this.crowdPenalties.clear();

        nodes.forEach(node => {
            this.nodes.set(node.id, node);
            this.adjacencyList.set(node.id, []);
        });

        edges.forEach(edge => {
            if (this.adjacencyList.has(edge.sourceId)) {
                this.adjacencyList.get(edge.sourceId).push({
                    targetId: edge.targetId,
                    baseWeight: edge.weight,
                    currentWeight: edge.weight // Will be updated with crowd data
                });
            }
            // Assuming undirected graph for walking, but edges are directed in DB.
            // If edges are directed, we only add one way. If bidirectional, DB should have both or we add both.
            // Let's assume the DB has explicit edges for both directions if needed, or we treat them as undirected?
            // "Edge.js" has source/target. Usually directed.
            // Let's stick to directed as per schema.
        });

        crowds.forEach(crowd => {
            this.updateCrowdDensity(crowd.nodeId, crowd.densityLevel);
        });

        this.isInitialized = true;
        console.log(`Graph initialized: ${this.nodes.size} nodes, ${edges.length} edges.`);
    }

    updateCrowdDensity(nodeId, level) {
        let penalty = 0;
        if (level === 'Medium') penalty = 5; // e.g., +5m equivalent
        if (level === 'High') penalty = 20;  // e.g., +20m equivalent

        this.crowdPenalties.set(nodeId, penalty);

        // Update incoming edges to this node
        // This is O(E) if we iterate all. Optimization: store reverse edges or just iterate.
        // For now, iterate all since graph isn't huge.
        // Better: In adjacencyList, we store outgoing. 
        // We affect costs of entering the node.

        // Actually, A* calculates cost(current, neighbor).
        // We can just compute weight dynamically in getNeighbors.
    }

    getNeighbors(nodeId) {
        const neighbors = this.adjacencyList.get(nodeId) || [];
        return neighbors.map(edge => {
            const penalty = this.crowdPenalties.get(edge.targetId) || 0;
            return {
                id: edge.targetId,
                weight: edge.baseWeight + penalty
            };
        });
    }

    getNode(id) {
        return this.nodes.get(id);
    }

    getAllNodes() {
        return Array.from(this.nodes.values());
    }
}

module.exports = new GraphService();
