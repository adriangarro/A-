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
    let network = sessionStorage.getItem("network");
    const astar = new AStar(network.g, network.c);
    astar.run(1, 6);

}

function loadGraph() {
    function onReaderLoad(event) {
        // save network
        let network = JSON.parse(event.target.result);
        console.log(network);
        sessionStorage.setItem("network", JSON.stringify(network));
        // set selects
        $("#startNodeSelect").empty();
        $("#endNodeSelect").empty();
        $.each(network.l, (key, value) => {
            let nodeOption = "<option value="
                + key
                + ">"
                + value
                + "</option>";
            $(nodeOption).appendTo("#startNodeSelect");
            $(nodeOption).appendTo("#endNodeSelect");
        });
        // show A* control
        $("#aStarControl").show();
        // draw graph
        drawGraph(network.l, network.g);
    }
    $("#graphJSON").change(function (event) {
        let reader = new FileReader();
        reader.onload = onReaderLoad;
        reader.readAsText(event.target.files[0]);
    });
}

function drawPath() {

}

jQuery(
    $(document).ready(function () {
        loadGraph()
    })
);
