
const canvas = document.getElementById('signal-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let nodes = [];
let signals = [];

// CONFIG
const NODE_COUNT = 40; // Low count for sparse, schematic feel
const CONNECTION_DIST = 200;
const SIGNAL_CHANCE = 0.02; // Chance to spawn a signal per frame

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initNodes();
}

class Node {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.2; // Very slow drift
        this.vy = (Math.random() - 0.5) * 0.2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw() {
        ctx.fillStyle = 'rgba(150, 150, 150, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Signal {
    constructor(startNode, endNode) {
        this.startNode = startNode;
        this.endNode = endNode;
        this.progress = 0;
        this.speed = 0.02 + Math.random() * 0.02; // Slow speed
        this.alive = true;
    }

    update() {
        this.progress += this.speed;
        if (this.progress >= 1) {
            this.alive = false;
        }
    }

    draw() {
        const x = this.startNode.x + (this.endNode.x - this.startNode.x) * this.progress;
        const y = this.startNode.y + (this.endNode.y - this.startNode.y) * this.progress;

        ctx.fillStyle = '#4CAF50'; // Signal Green
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#4CAF50';
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2); // Slight pulse size
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

function initNodes() {
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push(new Node());
    }
}

function drawConnections() {
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.15)'; // Very faint lines
    ctx.lineWidth = 1;

    for (let i = 0; i < nodes.length; i++) {
        let nodeA = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
            let nodeB = nodes[j];
            let dx = nodeA.x - nodeB.x;
            let dy = nodeA.y - nodeB.y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < CONNECTION_DIST) {
                ctx.beginPath();
                ctx.moveTo(nodeA.x, nodeA.y);
                ctx.lineTo(nodeB.x, nodeB.y);
                ctx.stroke();

                // Chance to spawn signal on this connection
                if (Math.random() < 0.001) { // Very rare random spawn
                    // logic handled in update loop for better control
                }
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update and Draw Nodes
    nodes.forEach(node => {
        node.update();
        node.draw();
    });

    // Draw Connections & Spawn Signals
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.15)';
    ctx.lineWidth = 1;

    // Check connections
    for (let i = 0; i < nodes.length; i++) {
        let nodeA = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
            let nodeB = nodes[j];
            let dist = Math.hypot(nodeA.x - nodeB.x, nodeA.y - nodeB.y);

            if (dist < CONNECTION_DIST) {
                // Draw Line
                ctx.beginPath();
                ctx.moveTo(nodeA.x, nodeA.y);
                ctx.lineTo(nodeB.x, nodeB.y);
                ctx.stroke();

                // Spawn Signal logic
                // Only if no signal exists on this path (optional, but keeps it clean)
                // Randomly spawn
                if (Math.random() < 0.0005) { // tuned for "Quiet Drift"
                    signals.push(new Signal(nodeA, nodeB));
                }
            }
        }
    }

    // Update and Draw Signals
    for (let i = signals.length - 1; i >= 0; i--) {
        let s = signals[i];
        s.update();
        s.draw();
        if (!s.alive) {
            signals.splice(i, 1);
        }
    }

    requestAnimationFrame(animate);
}

// Init
window.addEventListener('resize', resize);
resize();
animate();

// Smooth Scroll for Anchors
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
