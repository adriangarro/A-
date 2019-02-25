// Artificial Intelligence
// A* Search Algorithm
// Notes: Graph init node must start with 1, the next nodes must follow the sequence
// TODO: Check Data

class AStar {
    constructor(graph, coordinates) {
        this.graph = graph;
        this.coordinates = coordinates;
    }

    // not required
    fixGraph() {
        $.each(this.graph, (currentNode, destinityNodes) => {
            for (let node = 1; node <= Object.keys(this.graph).length; ++node) {
                if ( !(destinityNodes.hasOwnProperty(node)) ) {
                    if (node == currentNode) {
                        // the distance from a node to itself is 0 
                        destinityNodes[node] = 0;
                    }
                    else {
                        // the distance from a node to an unconnected node is infinity
                        destinityNodes[node] = "inf";
                    }
                }
            }
        });
    }

    consoleLogGraph() {
        console.log(this.graph);
    }

    euclideanDistance(pointA, pointB) {
        let a = pointA.x - pointB.x;
        let b = pointA.y - pointB.y;
        return Math.sqrt(a*a + b*b);
    }

    getNodeWithMinCost(arrayNodes) {
        let nodeIndex = -1;
        let f = Number.MAX_SAFE_INTEGER;
        for (let i = 0; i < arrayNodes.length; ++i) {
            if (arrayNodes[i].f < f) {
                f = arrayNodes[i].f;
                nodeIndex = i;
            }
        }
        return nodeIndex;
    }

    // expensive function :v
    nodeIsReachableBy(nodeID) {
        // no results found
        let result = -1;
        // check if node is reachable
        for (let node = 1; node <= Object.keys(this.graph).length; ++node) {
            if (node != nodeID) {
                $.each(this.graph[node], (neighbour, distance) => {
                    if (neighbour == nodeID) {
                        result = node;
                    }
                });
            }
        }
        return result;
    }

    getNode(uid, arrayNodes) {
        for (let i = 0; i < arrayNodes.length; ++i) {
            if (arrayNodes[i].uid == uid) {
                return arrayNodes[i];
            }
        }
    }

    getUID() {
        return Math.random().toString(36).substring(2, 15);
    }

    // f = g + h
    // f: total cost of node
    // g: distance between current node and start node
    // h: estimated distance from current node to end node (heuristics)
    run(startNodeID, endNodeID) {
        /* Main Logic: */
        let expanded = [];
        let notExpanded = [];
        // start node
        let startNodeUID = this.getUID();
        notExpanded.push({
            parent: null,
            id: startNodeID,
            uid: startNodeUID,
            f: 0
        });
        let currentNode = null;
        while (notExpanded.length > 0) {
            console.log("A* Loop");
            let currentNodeIndex = this.getNodeWithMinCost(notExpanded);
            currentNode = notExpanded[currentNodeIndex];
            console.log("Current Node:");
            console.log(currentNode);
            // check if current node is end node
            if (currentNode.id == endNodeID) break;
            // expand current node
            let neighboursWithDistance = this.graph[currentNode.id];
            let neighboursAsNodes = [];
            $.each(neighboursWithDistance, (neighbour, distance) => {
                neighboursAsNodes.push({
                    parent: currentNode.uid,
                    id: neighbour,
                    uid: this.getUID(),
                    f: currentNode.f + distance + this.euclideanDistance(
                        this.coordinates[currentNode.id], this.coordinates[endNodeID]
                    )
                });
            });
            // move current node to expanded arr
            notExpanded.splice(currentNodeIndex, 1);  // at position index, remove 1 item
            expanded.push(currentNode);
            // add neighbours to not expanded
            notExpanded = notExpanded.concat(neighboursAsNodes);
            console.log("Not Expanded:");
            console.log(notExpanded);
        }
        // build path
        let path = [];
        path.push(currentNode.id);
        while (currentNode.uid != startNodeUID) {
            currentNode = this.getNode(currentNode.parent, expanded);
            path.push(currentNode.id);
        }
        // print path
        console.log("Path:");
        for (let i = path.length - 1; i >= 0; --i) {
            console.log(path[i]);
            if (i != 0) console.log("->");
        }

    }
}

// not using coordinates (by the moment)
function drawGraph(labels, graph) {
    // create an array with nodes
    let nodesArr = [];
    $.each(labels, (key, value) => {
        nodesArr.push({id: key, label: value});
    });
    let nodes = new vis.DataSet(nodesArr);
    // create an array with edges
    let edgesArr = [];
    for (let node = 1; node <= Object.keys(graph).length; ++node) {
        $.each(graph[node], (neighbour, distance) => {
            edgesArr.push({
                from: node, 
                to: neighbour, 
                label: distance.toString(),
                font: {'face': 'Monospace', align: 'left'}
            });
        });
    }
    let edges = new vis.DataSet(edgesArr);
    // create a network
    let container = document.getElementById("network");
    // provide the data in the vis format
    let data = {
        nodes: nodes,
        edges: edges
    };
    let options = {
        edges: {
            font: {
                size: 15,
                color: "blue"
            }
        }
    };
    // initialize network!
    let network = new vis.Network(container, data, options);
}

function test() {
    let l = {
        1: "Paraíso",
        2: "Río Azul",
        3: "Desamparados",
        4: "Cartago",
        5: "Curridabat",
        6: "TEC San José",
        7: "Turrialba",
        8: "Tres Ríos",
        9: "Coronado",
        10: "Pavas",
        11: "Rancho Redondo"
    };

    let g = {
        1: {2: 20, 4: 40, 7: 10, 8: 21},
        2: {3: 10, 5: 3, 1: 2},
        3: {5: 13, 6: 7},
        4: {11: 15},
        5: {4: 1, 6: 8, 3: 1},
        6: {},
        7: {11: 12},
        8: {9: 3},
        9: {10: 9, 5: 12},
        10: {5: 11, 6: 14},
        11: {9: 5}
    };

    let c = {
        1 : {x: 9, y: 2}, 
        2 : {x: 10, y: 4}, 
        3 : {x: 10, y: 8}, 
        4 : {x: 6, y: 3},
        5 : {x: 5, y: 8},
        6 : {x: 6, y: 11},
        7 : {x: 3, y: 4},
        8 : {x: 4, y: 6},
        9 : {x: 2, y: 9},
        10 : {x: 4, y: 10},
        11 : {x: 1, y: 7}
    };

    drawGraph(l, g);
    
    const astar = new AStar(g, c);
    astar.run(1, 6);

}

jQuery(
    $(document).ready(function () {
        test()
    })
);
