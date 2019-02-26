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
        // no hay results found
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
        let loop = 1;
        let nodesQuant = Object.keys(this.graph).length;
        while (notExpanded.length > 0) {
            console.log("A* Loop:");
            console.log(loop);
            if (loop == nodesQuant * 2) {
                alert("No hay manera de resolver este problema.");
                return [startNodeID];
            }
            loop = loop + 1;
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
            path.unshift(currentNode.id);
        }
        // print path
        console.log("Path:");
        for (let i = 0; i < path.length; ++i) {
            console.log(path[i]);
            if (i != path.length - 1) console.log("->");
        }
        return path;
    }
}

// not using coordinates (by the moment)
function drawGraph(labels, graph, path) {
    // create an array with nodes
    let nodesArr = [];
    $.each(labels, (key, value) => {
        if (path) {
            if (path.includes(key)) {
                nodesArr.push({
                    id: key, 
                    label: value,
                    font: {strokeWidth: 2, strokeColor : "#00ff00"}
                });
            } else {
                nodesArr.push({
                    id: key, 
                    label: value
                });
            }
        } else {
            nodesArr.push({
                id: key, 
                label: value
            });
        }
    });
    let nodes = new vis.DataSet(nodesArr);
    // trick to paint path
    let edgesPainted = {};
    if (path) {
        for (let i = 0; i < path.length - 1; ++i) {
            edgesPainted[path[i]] = path[i+1];
        }
    }
    // create an array with edges
    let edgesArr = [];
    for (let node = 1; node <= Object.keys(graph).length; ++node) {
        $.each(graph[node], (neighbour, distance) => {
            if (edgesPainted[node] == neighbour) {
                edgesArr.push({
                    from: node, 
                    to: neighbour, 
                    label: distance.toString(),
                    arrows: "to",
                    font: {strokeWidth: 2, strokeColor : "#00ff00"}
                });
            } else {
                edgesArr.push({
                    from: node,
                    to: neighbour,
                    label: distance.toString(),
                    arrows: "to"
                });
            }
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
    let options = {};
    // initialize network!
    let network = new vis.Network(container, data, options);
}

function loadGraph() {
    function onReaderLoad(event) {
        // save network
        let network = JSON.parse(event.target.result);
        console.log("Network:")
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
        drawGraph(network.l, network.g, null);
    }
    $("#graphJSON").change(function (event) {
        let reader = new FileReader();
        reader.onload = onReaderLoad;
        reader.readAsText(event.target.files[0]);
    });
}

function drawPath() {
    $("#calc").click(function () {
        let network =  JSON.parse(sessionStorage.getItem("network"));
        const astar = new AStar(network.g, network.c);
        let path = astar.run(
            $("#startNodeSelect").val(), 
            $("#endNodeSelect").val()
        );
        drawGraph(network.l, network.g, path);
    });
}

jQuery(
    $(document).ready(function () {
        loadGraph(),
        drawPath()
    })
);
