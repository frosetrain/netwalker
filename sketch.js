let rows = 7;
let cols = 7;
let grid = [];
let netwalk = [];
let root;
let tips = [];
let empty = []; // an array of bools
const wrapAround = false; // note: wrap around mode is broken

class Tile {
    constructor(connections, isServer, isTerminal) {
        this.tconnections = connections; // an array of 4 bools, north east south west
        this.tisServer = isServer;
        this.tisTerminal = isTerminal;
    }
    get connections() {
        return this.tconnections;
    }
    get isServer() {
        return this.tisServer;
    }
    get isTerminal() {
        return this.tisTerminal;
    }
    set connections(e) {
        this.tconnections = e;
    }
    set isServer(e) {
        this.tisServer = e;
    }
    set isTerminal(e) {
        this.tisTerminal = e;
    }
}

function randint(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function updateNetwork() {
    let gridElement = document.getElementById("grid");
    for (let i = 0; i < gridElement.children.length; ++i) {
        bitmap = 0;
        if (grid[i].connections[0] === true) {
            bitmap += 1;
        }
        if (grid[i].connections[1] === true) {
            bitmap += 2;
        }
        if (grid[i].connections[2] === true) {
            bitmap += 4;
        }
        if (grid[i].connections[3] === true) {
            bitmap += 8;
        }
        xOffset = (bitmap - 1) * 48;
        yOffset = 0;
        if (grid[i].isServer) {
            yOffset = 48 * 2;
        }
        gridElement.children[
            i
        ].style.backgroundPosition = `-${xOffset}px -${yOffset}px`;
    }
}

function setup() {
    // createCanvas(7 * 48, 7 * 48);
    // background(200);
    // noCanvas();
    // frameRate(30);
    let gridElement = document.getElementById("grid");
    gridElement.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;

    for (let i = 0; i < rows * cols; ++i) {
        let tileBtn = document.createElement("p");
        let tileObj = new Tile([false, false, false, false], false, false);
        tileBtn.classList =
            "h-12 w-12 border-gray-500 border bg-gray-300 dark:bg-gray-800";
        tileBtn.style.backgroundImage = "url('all.png')";
        const rotate = function () {
            grid[i].connections.push(grid[i].connections.shift());
            updateNetwork();
        };
        tileBtn.addEventListener("click", rotate);
        xOffset = (tileObj.connections - 1) * 48;
        tileBtn.style.backgroundPosition = `-${xOffset}px 0px`;
        gridElement.append(tileBtn);
        grid.push(tileObj);
        empty.push(true);
    }

    // Choose the starting tile for the server
    rootX = randint(1, cols - 1);
    rootY = randint(1, rows - 1); // will not choose edge tiles
    root = rootY * cols + rootX;
    empty[root] = false;
    grid[root].isServer = true;
    grid[root].connections = [true, true, true, true];

    // CP algo
    tips.push(root + 1);
    grid[root + 1].connections[3] = true;
    tips.push(root + cols);
    grid[root + cols].connections[0] = true;
    tips.push(root - 1);
    grid[root - 1].connections[1] = true;
    tips.push(root - cols);
    grid[root - cols].connections[2] = true;
    for (t of tips) {
        empty[t] = false;
        // gridElement.children[t].classList.remove("bg-gray-300");
        // gridElement.children[t].classList.add("bg-green-500");
    }

    updateNetwork();

    while (tips.length > 0) {
        trytip = tips[randint(0, tips.length)];
        empty[trytip] = false;
        cc = 0;
        for (c of grid[trytip].connections) {
            if (c === true) cc++;
        }
        if (cc === 3) {
            // don't do 4-way junctions
            // console.log("Oh no CCCCC");
            tips.splice(tips.indexOf(trytip), 1);
            // gridElement.children[trytip].classList.remove("bg-green-500");
            // gridElement.children[trytip].classList.add("bg-purple-500");
            continue;
        }
        y = Math.floor(trytip / cols);
        x = trytip - y * cols;
        // console.log("try tip", trytip, x, y);
        direction = randint(0, 4);
        neighs = [];
        attempts = [];
        if (wrapAround) {
            if (x === 0) {
                // left most column
                attempts.push(trytip - 1 + cols);
                attempts.push(trytip + 1);
            } else if (x === cols - 1) {
                // right most column
                attempts.push(trytip - 1);
                attempts.push(trytip + 1 - cols);
            } else {
                attempts.push(trytip - 1);
                attempts.push(trytip + 1);
            }
            if (y === 0) {
                attempts.push(trytip + rows - 1);
                attempts.push(trytip + 1);
            } else if (y === rows - 1) {
                attempts.push(trytip - 1);
                attempts.push(trytip - rows + 1);
            } else {
                attempts.push(trytip + 1);
                attempts.push(trytip - 11);
            }
        } else {
            if (x >= 1) {
                attempts.push(trytip - 1);
            }
            if (x < cols - 1) {
                attempts.push(trytip + 1);
            }
            if (y >= 1) {
                attempts.push(trytip - cols);
            }
            if (y < rows - 1) {
                attempts.push(trytip + cols);
            }
        }
        for (a of attempts) {
            if (empty[a] === true) {
                neighs.push(a);
            }
        }
        if (neighs.length > 0) {
            extend = neighs[randint(0, neighs.length)];
            empty[extend] = false;
            // console.log("extending", extend);
            if (extend - trytip === 1) {
                grid[trytip].connections[1] = true;
                grid[extend].connections[3] = true;
            }
            if (trytip - extend === 1) {
                grid[trytip].connections[3] = true;
                grid[extend].connections[1] = true;
            }
            if (extend - trytip === cols) {
                grid[trytip].connections[2] = true;
                grid[extend].connections[0] = true;
            }
            if (trytip - extend === cols) {
                grid[trytip].connections[0] = true;
                grid[extend].connections[2] = true;
            }
            tips.push(extend);
            // gridElement.children[extend].classList.remove("bg-gray-300");
            // gridElement.children[extend].classList.add("bg-green-500");
        } else {
            tips.splice(tips.indexOf(trytip), 1);
            // gridElement.children[trytip].classList.remove("bg-green-500");
            // gridElement.children[trytip].classList.add("bg-purple-500");
        }

        // p5.js debugging
        // for (let i = 0; i < empty.length; ++i) {
        //     yy = Math.floor(i / cols);
        //     xx = i - yy * cols;
        //     fill(empty[i] === true ? "green" : "red");
        //     square(xx * 48, yy * 48, 48);
        //     fill("blue");
        //     if (tips.indexOf(i) > -1) {
        //         circle(xx * 48 + 24, yy * 48 + 24, 24);
        //     }
        // }
    }
    updateNetwork();
}

setup();
