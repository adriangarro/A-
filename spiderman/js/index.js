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

// Voice Processor (ONLY GOOGLE CHROME)

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
        if (e.which === 49) {
            voiceProcessor.startRecognition();
        }
        // if press 0
        else if (e.which === 48) {
            voiceProcessor.stopRecognition();
            setTimeout(function() {
                let transcript = sessionStorage.getItem("transcript");
                if (transcript) {
                    sessionStorage.removeItem("transcript");
                    let command = fixMessage(transcript).split(" ");
                    if (command[0] === "LIMPIAR") {
                        window.location = "index.html";
                    }
                    // M
                    else if (command[0] === "ALTURA") {
                        if (command[1] === "IGUAL" || command[1] === "=") {
                            if ( isNormalInteger(command[2]) ) {
                                $("#m").val( "Altura (" + command[2] + ")" );
                            } else {
                                voiceProcessor.readOutLoud("Valor inválido.");
                            }
                        }
                    }
                    // N
                    else if (command[0] === "LARGO") {
                        if (command[1] === "IGUAL" || command[1] === "=") {
                            if ( isNormalInteger(command[2]) ) {
                                $("#n").val( "Largo (" + command[2] + ")");
                            } else {
                                voiceProcessor.readOutLoud("Valor inválido.");
                            }
                        }
                    }
                    // A
                    else if (command[0] === "CUADRADO") {
                        if (command[1] === "IGUAL" || command[1] === "=") {
                            if ( isNormalInteger(command[2]) ) {
                                $("#a").val( "Cuadrado (" + command[2] + ")" );
                            } else {
                                voiceProcessor.readOutLoud("Valor inválido.");
                            }
                        }
                    }
                    // D
                    else if (command[0] === "DIAGONAL") {
                        if (command[1] === "IGUAL" || command[1] === "=") {
                            if ( isNormalInteger(command[2]) ) {
                                $("#d").val( "Diagonal (" + command[2] + ")");
                            } else {
                                voiceProcessor.readOutLoud("Valor inválido.");
                            }
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
        loadGraph(),
        drawPath(),
        controlRecognition()
    })
);
