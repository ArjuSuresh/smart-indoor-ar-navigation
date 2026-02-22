const graphService = require('./graph');

class AStarService {
    // Heuristic: Euclidean distance
    heuristic(nodeA, nodeB) {
        if (!nodeA || !nodeB) return 0;
        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    findPath(startId, endId) {
        const startNode = graphService.getNode(startId);
        const endNode = graphService.getNode(endId);

        if (!startNode || !endNode) {
            throw new Error('Invalid start or end node');
        }

        const openSet = [{ node: startNode, f: 0, g: 0 }];
        const cameFrom = new Map();
        const gScore = new Map();
        gScore.set(startId, 0);

        const fScore = new Map();
        fScore.set(startId, this.heuristic(startNode, endNode));

        while (openSet.length > 0) {
            // Sort to get lowest f (Priority Queue)
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift().node;

            if (current.id === endId) {
                return this.reconstructPath(cameFrom, current);
            }

            const neighbors = graphService.getNeighbors(current.id);
            for (const neighborInfo of neighbors) {
                const neighbor = graphService.getNode(neighborInfo.id);
                const tentativeG = gScore.get(current.id) + neighborInfo.weight;

                if (tentativeG < (gScore.get(neighbor.id) || Infinity)) {
                    cameFrom.set(neighbor.id, current);
                    gScore.set(neighbor.id, tentativeG);
                    const f = tentativeG + this.heuristic(neighbor, endNode);
                    fScore.set(neighbor.id, f);

                    if (!openSet.some(item => item.node.id === neighbor.id)) {
                        openSet.push({ node: neighbor, f: f, g: tentativeG });
                    }
                }
            }
        }

        return null; // No path found
    }

    findNearestExit(startId) {
        // Dijkstra (A* with h=0) to find nearest 'isExit' node
        const startNode = graphService.getNode(startId);
        if (!startNode) throw new Error('Invalid start node');

        const openSet = [{ node: startNode, distance: 0 }];
        const cameFrom = new Map();
        const distances = new Map();
        distances.set(startId, 0);
        const visited = new Set();

        while (openSet.length > 0) {
            openSet.sort((a, b) => a.distance - b.distance);
            const current = openSet.shift().node;

            if (visited.has(current.id)) continue;
            visited.add(current.id);

            if (current.isExit) {
                return this.reconstructPath(cameFrom, current);
            }

            const neighbors = graphService.getNeighbors(current.id);
            for (const neighborInfo of neighbors) {
                const neighbor = graphService.getNode(neighborInfo.id);
                const newDist = distances.get(current.id) + neighborInfo.weight;

                if (newDist < (distances.get(neighbor.id) || Infinity)) {
                    distances.set(neighbor.id, newDist);
                    cameFrom.set(neighbor.id, current);
                    openSet.push({ node: neighbor, distance: newDist });
                }
            }
        }

        return null; // No exit found
    }

    reconstructPath(cameFrom, current) {
        const totalPath = [current];
        while (cameFrom.has(current.id)) {
            current = cameFrom.get(current.id);
            totalPath.unshift(current);
        }
        return totalPath;
    }
}

module.exports = new AStarService();
