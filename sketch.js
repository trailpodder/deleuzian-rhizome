let nodes = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(30);
  // Initialize a set of nodes at random locations
  for (let i = 0; i < 40; i++) {
    nodes.push({
      pos: createVector(random(width), random(height)),
      connections: []
    });
  }
  // Randomly connect nodes (rhizomatic mesh)
  nodes.forEach((node, i) => {
    let numConnections = int(random(2, 7));
    for (let j = 0; j < numConnections; j++) {
      let target = int(random(nodes.length));
      if (target !== i && !node.connections.includes(target)) {
        node.connections.push(target);
      }
    }
  });
}

function draw() {
  // Fade trails for a dynamic feel
  noStroke();
  fill(30, 30, 30, 10);
  rect(0, 0, width, height);

  // Draw connections (edges)
  stroke(120, 220, 220, 120);
  nodes.forEach((node, i) => {
    node.connections.forEach(conn => {
      line(node.pos.x, node.pos.y, nodes[conn].pos.x, nodes[conn].pos.y);
    });
  });

  // Animate node movement (constant becoming)
  nodes.forEach(node => {
    node.pos.x += random(-1, 1);
    node.pos.y += random(-1, 1);
  });

  // Draw nodes
  noStroke();
  fill(250, 250, 250, 200);
  nodes.forEach(node => {
    ellipse(node.pos.x, node.pos.y, 6, 6);
  });
}
