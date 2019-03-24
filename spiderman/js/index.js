// Artificial Intelligence
// SPIDERMAN: A* Search Algorithm + Voice Processor
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

    manhattanDistance(pointA, pointB) {
        let a = Math.abs(pointA.x - pointB.x);
        let b = Math.abs(pointA.y - pointB.y);
        return a + b;
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

    // expensive function :v, O(n2)
    nodeIsReachableBy(nodeID) {
        // not results found
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
            if (loop == nodesQuant * 1000) {
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
                    f: currentNode.f + distance + this.manhattanDistance(
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

// New Code:

/* GRAPH BUILDER */

// Only for testing: 
// download(graph, "test.json", "text/plain");
function download(content, fileName, contentType) {
    let a = document.createElement("a");
    let file = new Blob([JSON.stringify(content)], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

function findGraphKeyByEntry(entries, i, j) {
    // not results found
    let result = -1;
    // search key
    $.each(entries, (currentNode, matEntry) => {
        if (matEntry.i == i && matEntry.j == j) {
            result = currentNode;
            // stop loop
            return false;
        }
    });
    return result.toString();
}

function createJSONGraph(m, n, d) {
    let graph = {};
    let entriesQuant = m * n;
    // set labels
    graph["l"] = {};
    for (let node = 1; node <= entriesQuant; ++node) {
        graph["l"][node.toString()] = node.toString();
    }
    // set matrix entries
    let entries = [];
    for (let mIndex = 1; mIndex <= m; ++mIndex) {
        for (let nIndex = 1; nIndex <= n; ++nIndex) {
            entries.push( {"i": mIndex, "j": nIndex} );
        }
    }
    graph["e"] = {};
    for (let node = 1; node <= entriesQuant; ++node) {
        graph["e"][node.toString()] = entries[node - 1];
    }
    // set graph relations (distance = 1)
    graph["g"] = {};
    for (let node = 1; node <= entriesQuant; ++node) {
        /*  Matrix Cases:

            c1  c2  c3
            c4  c5  c6
            c7  c8  c9
        */
        let currentNodeEntry = graph["e"][node.toString()];
        // c1
        if (currentNodeEntry.i == 1 && currentNodeEntry.j == 1) {
            // E
            let c1KeyE = findGraphKeyByEntry(graph["e"], currentNodeEntry.i, currentNodeEntry.j+1);
            // S
            let c1KeyS = findGraphKeyByEntry(graph["e"], currentNodeEntry.i+1, currentNodeEntry.j);
            graph["g"][node.toString()] = {
                [c1KeyE] : 1,
                [c1KeyS] : 1
            };
            // diagonals
            if (d == "true") {
                // SE
                let c1KeySE = findGraphKeyByEntry(graph["e"], currentNodeEntry.i+1, currentNodeEntry.j+1);
                graph["g"][node.toString()][c1KeySE] = 1;
            }
        }
        // c2
        if (currentNodeEntry.i == 1 && 1 < currentNodeEntry.j && currentNodeEntry.j < n) {
            // W
            let c2KeyW = findGraphKeyByEntry(graph["e"], currentNodeEntry.i, currentNodeEntry.j-1);
            // E
            let c2KeyE = findGraphKeyByEntry(graph["e"], currentNodeEntry.i, currentNodeEntry.j+1);
            // S
            let c2KeyS = findGraphKeyByEntry(graph["e"], currentNodeEntry.i+1, currentNodeEntry.j);
            graph["g"][node.toString()] = {
                [c2KeyW] : 1,
                [c2KeyE] : 1,
                [c2KeyS] : 1
            };
            // diagonals
            if (d == "true") {
                // SW
                let c2KeySW = findGraphKeyByEntry(graph["e"], currentNodeEntry.i+1, currentNodeEntry.j-1);
                graph["g"][node.toString()][c2KeySW] = 1;
                // SE
                let c2KeySE = findGraphKeyByEntry(graph["e"], currentNodeEntry.i+1, currentNodeEntry.j+1);
                graph["g"][node.toString()][c2KeySE] = 1;
            }
        }
        // c3
        if (currentNodeEntry.i == 1 && currentNodeEntry.j == n) {
            // W
            let c3KeyW = findGraphKeyByEntry(graph["e"], currentNodeEntry.i, currentNodeEntry.j-1);
            // S
            let c3KeyS = findGraphKeyByEntry(graph["e"], currentNodeEntry.i+1, currentNodeEntry.j);
            graph["g"][node.toString()] = {
                [c3KeyW] : 1,
                [c3KeyS] : 1
            };
            // diagonals
            if (d == "true") {
                // SW
                let c3KeySW = findGraphKeyByEntry(graph["e"], currentNodeEntry.i+1, currentNodeEntry.j-1);
                graph["g"][node.toString()][c3KeySW] = 1;
            }
        }
        // c4
        if (1 < currentNodeEntry.i && currentNodeEntry.i < m && currentNodeEntry.j == 1) {
            // N
            let c4KeyN = findGraphKeyByEntry(graph["e"], currentNodeEntry.i-1, currentNodeEntry.j);
            // E
            let c4KeyE = findGraphKeyByEntry(graph["e"], currentNodeEntry.i, currentNodeEntry.j+1);
            // S
            let c4KeyS = findGraphKeyByEntry(graph["e"], currentNodeEntry.i+1, currentNodeEntry.j);
            graph["g"][node.toString()] = {
                [c4KeyN] : 1,
                [c4KeyE] : 1,
                [c4KeyS] : 1
            };
            // diagonals
            if (d == "true") {
                // NE
                let c4KeyNE = findGraphKeyByEntry(graph["e"], currentNodeEntry.i-1, currentNodeEntry.j+1);
                graph["g"][node.toString()][c4KeyNE] = 1;
                // SE
                let c4KeySE = findGraphKeyByEntry(graph["e"], currentNodeEntry.i+1, currentNodeEntry.j+1);
                graph["g"][node.toString()][c4KeySE] = 1;
            }
        }
        // c5
        if (1 < currentNodeEntry.i && currentNodeEntry.i < m 
            && 1 < currentNodeEntry.j && currentNodeEntry.j < n) {
                // W
                let c5KeyW = findGraphKeyByEntry(graph["e"], currentNodeEntry.i, currentNodeEntry.j-1);
                // N
                let c5KeyN = findGraphKeyByEntry(graph["e"], currentNodeEntry.i-1, currentNodeEntry.j);
                // E
                let c5KeyE = findGraphKeyByEntry(graph["e"], currentNodeEntry.i, currentNodeEntry.j+1);
                // S
                let c5KeyS = findGraphKeyByEntry(graph["e"], currentNodeEntry.i+1, currentNodeEntry.j);
                graph["g"][node.toString()] = {
                    [c5KeyW] : 1,
                    [c5KeyN] : 1,
                    [c5KeyE] : 1,
                    [c5KeyS] : 1
                };
                // diagonals
                if (d == "true") {
                    // NW
                    let c5KeyNW = findGraphKeyByEntry(graph["e"], currentNodeEntry.i-1, currentNodeEntry.j-1);
                    graph["g"][node.toString()][c5KeyNW] = 1;
                    // NE
                    let c5KeyNE = findGraphKeyByEntry(graph["e"], currentNodeEntry.i-1, currentNodeEntry.j+1);
                    graph["g"][node.toString()][c5KeyNE] = 1;
                    // SE
                    let c5KeySE = findGraphKeyByEntry(graph["e"], currentNodeEntry.i+1, currentNodeEntry.j+1);
                    graph["g"][node.toString()][c5KeySE] = 1;
                    // SW
                    let c5KeySW = findGraphKeyByEntry(graph["e"], currentNodeEntry.i+1, currentNodeEntry.j-1);
                    graph["g"][node.toString()][c5KeySW] = 1;
                }
            }
        // c6
        if (1 < currentNodeEntry.i && currentNodeEntry.i < m && currentNodeEntry.j == n) {
            // N
            let c6KeyN = findGraphKeyByEntry(graph["e"], currentNodeEntry.i-1, currentNodeEntry.j);
            // W
            let c6KeyW = findGraphKeyByEntry(graph["e"], currentNodeEntry.i, currentNodeEntry.j-1);
            // S
            let c6KeyS = findGraphKeyByEntry(graph["e"], currentNodeEntry.i+1, currentNodeEntry.j);
            graph["g"][node.toString()] = {
                [c6KeyN] : 1,
                [c6KeyW] : 1,
                [c6KeyS] : 1
            };
            // diagonals
            if (d == "true") {
                // NW
                let c6KeyNW = findGraphKeyByEntry(graph["e"], currentNodeEntry.i-1, currentNodeEntry.j-1);
                graph["g"][node.toString()][c6KeyNW] = 1;
                // SW
                let c6KeySW = findGraphKeyByEntry(graph["e"], currentNodeEntry.i+1, currentNodeEntry.j-1);
                graph["g"][node.toString()][c6KeySW] = 1;
            }
        }
        // c7
        if (currentNodeEntry.i == m && currentNodeEntry.j == 1) {
            // N
            let c7KeyN = findGraphKeyByEntry(graph["e"], currentNodeEntry.i-1, currentNodeEntry.j);
            // E
            let c7KeyE = findGraphKeyByEntry(graph["e"], currentNodeEntry.i, currentNodeEntry.j+1);
            graph["g"][node.toString()] = {
                [c7KeyN] : 1,
                [c7KeyE] : 1
            };
            // diagonals
            if (d == "true") {
                // NE
                let c7KeyNE = findGraphKeyByEntry(graph["e"], currentNodeEntry.i-1, currentNodeEntry.j+1);
                graph["g"][node.toString()][c7KeyNE] = 1;
            }
        }
        // c8
        if (currentNodeEntry.i == m && 1 < currentNodeEntry.j && currentNodeEntry.j < n) {
            // W
            let c8KeyW = findGraphKeyByEntry(graph["e"], currentNodeEntry.i, currentNodeEntry.j-1);
            // N
            let c8KeyN = findGraphKeyByEntry(graph["e"], currentNodeEntry.i-1, currentNodeEntry.j);
            // E
            let c8KeyE = findGraphKeyByEntry(graph["e"], currentNodeEntry.i, currentNodeEntry.j+1);
            graph["g"][node.toString()] = {
                [c8KeyW] : 1,
                [c8KeyN] : 1,
                [c8KeyE] : 1
            };
            // diagonals
            if (d == "true") {
                // NW
                let c8KeyNW = findGraphKeyByEntry(graph["e"], currentNodeEntry.i-1, currentNodeEntry.j-1);
                graph["g"][node.toString()][c8KeyNW] = 1;
                // NE
                let c8KeyNE = findGraphKeyByEntry(graph["e"], currentNodeEntry.i-1, currentNodeEntry.j+1);
                graph["g"][node.toString()][c8KeyNE] = 1;
            }
        }
        // c9
        if (currentNodeEntry.i == m && currentNodeEntry.j == n) {
            // N
            let c9KeyN = findGraphKeyByEntry(graph["e"], currentNodeEntry.i-1, currentNodeEntry.j);
            // W
            let c9KeyW = findGraphKeyByEntry(graph["e"], currentNodeEntry.i, currentNodeEntry.j-1);
            graph["g"][node.toString()] = {
                [c9KeyN] : 1,
                [c9KeyW] : 1
            };
            // diagonals
            if (d == "true") {
                // NW
                let c9KeyNW = findGraphKeyByEntry(graph["e"], currentNodeEntry.i-1, currentNodeEntry.j-1);
                graph["g"][node.toString()][c9KeyNW] = 1;
            }
        }
    }
    // set cartesian coordinates
    let coordinates = [];
    let height = parseInt(m);
    for (let mIndex = 1; mIndex <= m; ++mIndex) {
        for (let nIndex = 1; nIndex <= n; ++nIndex) {
            coordinates.push( {"x": nIndex, "y": height} );
        }
        height = height - 1;
    }
    graph["c"] = {};
    for (let node = 1; node <= entriesQuant; ++node) {
        graph["c"][node.toString()] = coordinates[node - 1];
    }
    return graph;
}

/* VOICE HANDLER */

// stringHelpers

function removeAccents(strAccents) {
	strAccents = strAccents.split("");
	let strAccentsOut = new Array();
	let strAccentsLen = strAccents.length;
	let accents = "ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüŠšŸÿýŽž";
	let accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuSsYyyZz";
	for (let y = 0; y < strAccentsLen; y++) {
		if (accents.indexOf(strAccents[y]) !== -1) {
			strAccentsOut[y] = accentsOut.substr(accents.indexOf(strAccents[y]), 1);
		} else {
			strAccentsOut[y] = strAccents[y];
		}
	}
	strAccentsOut = strAccentsOut.join("");
	return strAccentsOut;
}

// removeAccents + toUpperCase
function fixMessage(input) {
	return removeAccents(
        input
    ).toUpperCase();
}

function isNormalInteger(str) {
    let n = Math.floor(Number(str));
    return n !== Infinity && String(n) === str && n > 0;
}

// Voice Processor (ONLY GOOGLE CHROME => 2019)

class VoiceProcessor {
    constructor() {
        this.recognition = null;
        try {
            let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
        }
        catch(e) {
            console.error(e);
            $(".no-browser-support").show();
            $(".app").hide();
        }
        // Configure voice recognition 
        if (this.recognition) {
            // If false, the recording will stop after a few seconds of silence.
            // When true, the silence period is longer (about 15 seconds),
            // allowing us to keep recording even when the user pauses. 
            this.recognition.continuous = true;
            // This block is called every time the Speech APi captures a line. 
            this.recognition.onresult = function(event) {
                // event is a SpeechRecognitionEvent object.
                // It holds all the lines we have captured so far. 
                // We only need the current one.
                let current = event.resultIndex;
                // Get a transcript of what was said.
                let transcript = event.results[current][0].transcript;
                sessionStorage.setItem("transcript", transcript);
                console.log(transcript);
            }
            this.recognition.onstart = function() { 
                console.log("Voice recognition activated.");
            }
            this.recognition.onspeechend = function() {
                console.log("Voice recognition turned off.");
            }
            this.recognition.onerror = function(event) {
                if (event.error == "no-speech") {
                    console.log("No speech was detected. Try again.");  
                }
            }
        }
    }

    startRecognition() {
        this.recognition.start();
    }

    stopRecognition() {
        this.recognition.stop();
    }

    readOutLoud(message) {
        let speech = new SpeechSynthesisUtterance();
        // set text and voice attributes
        speech.text = message;
        speech.volume = 1;
        speech.rate = 1;
        speech.pitch = 1;
        window.speechSynthesis.speak(speech);
    }
}

const voiceProcessor = new VoiceProcessor();
function controlRecognition() {
    $(document).on("keypress", function(e) {
        // if press 1
        if (e.which == 49) {
            voiceProcessor.startRecognition();
        }
        // if press 0
        else if (e.which == 48) {
            voiceProcessor.stopRecognition();
            // after stop recognition:
            setTimeout(function() {
                let transcript = sessionStorage.getItem("transcript");
                if (transcript) {
                    sessionStorage.removeItem("transcript");
                    let command = fixMessage(transcript).split(" ");
                    // CLEAR
                    if (command[0] == "LIMPIAR") {
                        sessionStorage.clear();
                        window.location = "index.html";
                    }
                    // M
                    else if (command[0] == "ALTURA" 
                        || command[0] == "DURA" 
                        || command[0] == "PINTURA") {
                            if (command[1] == "IGUAL" || command[1] == "IGUALA" || command[1] == "=") {
                                let value = 2;
                                if (command[value] == "A") value = 3;
                                if ( isNormalInteger(command[value]) ) {
                                    $("#m").val( "Altura (" + command[value] + ")" );
                                    sessionStorage.setItem("m", command[value]);
                                } else {
                                    voiceProcessor.readOutLoud("Valor inválido.");
                                }
                            } else {
                                voiceProcessor.readOutLoud("Comando no identificado.");
                            }
                    }
                    // N
                    else if (command[0] == "LARGO"
                        || command[0] == "CARGO" 
                        || command[0] == "MARCO" 
                        || command[0] == "PARTO" 
                        || command[0] == "HARTO" 
                        || command[0] == "ARGO") {
                            if (command[1] == "IGUAL" || command[1] == "IGUALA" || command[1] == "=") {
                                let value = 2;
                                if (command[value] == "A") value = 3;
                                if ( isNormalInteger(command[value]) ) {
                                    $("#n").val( "Largo (" + command[value] + ")" );
                                    sessionStorage.setItem("n", command[value]);
                                } else {
                                    voiceProcessor.readOutLoud("Valor inválido.");
                                }
                            } else {
                                voiceProcessor.readOutLoud("Comando no identificado.");
                            }
                    }
                    // A
                    else if (command[0] == "CUADRADO" 
                        || command[0] == "GRADO") {
                            if (command[1] == "IGUAL" || command[1] == "IGUALA" || command[1] == "=") {
                                let value = 2;
                                if (command[value] == "A") value = 3;
                                if ( isNormalInteger(command[value]) ) {
                                    $("#a").val( "Cuadrado (" + command[value] + ")" );
                                    sessionStorage.setItem("a", command[value]);
                                } else {
                                    voiceProcessor.readOutLoud("Valor inválido.");
                                }
                            } else {
                                voiceProcessor.readOutLoud("Comando no identificado.");
                            }
                    }
                    // D
                    else if (command[0] == "DIAGONAL"
                        || command[0] == "HERNAN") {
                            if (command[1] == "SI") {
                                $("#d").val( "Diagonal (SÍ)");
                                sessionStorage.setItem("d", "true");
                            } else if (command[1] == "NO") {
                                $("#d").val("Diagonal (NO)");
                                sessionStorage.setItem("d", "false");
                            } else {
                                voiceProcessor.readOutLoud("Valor inválido.");
                            }
                    } 
                    // CREATE
                    else if (command[0] == "CREAR") {
                        let m = sessionStorage.getItem("m");
                        let n = sessionStorage.getItem("n");
                        let a = sessionStorage.getItem("a");
                        let d = sessionStorage.getItem("d");
                        if (m && n && a && d) {
                            let network = createJSONGraph(m, n, d);
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

                        } else {
                            voiceProcessor.readOutLoud("No se han establecido todos los valores.");
                        }
                    } else {
                        voiceProcessor.readOutLoud("Comando no identificado.");
                    }
                } else {
                    voiceProcessor.readOutLoud("No se ha procesado niguna orden.");
                }
            }, 1000);
        }
    });
}

jQuery(
    $(document).ready(function () {
        drawPath(),
        controlRecognition()
    })
);
