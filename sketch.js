let nodes = [];
let noiseOffsets = []; // For smooth Perlin noise movement on x,y,z

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(HSB, 360, 100, 100, 100);
  background(220, 20, 20);

  // Initialize nodes with 3D positions and colors
  for (let i = 0; i < 40; i++) {
    nodes.push({
      pos: createVector(
        random(-width/2, width/2), 
        random(-height/2, height/2), 
        random(-300, 300)
      ),
      colorHue: random(140, 220),
      connections: []
    });
    noiseOffsets.push({
      x: random(1000),
      y: random(2000),
      z: random(3000)
    });
  }

  // Randomly connect nodes (non-hierarchical)
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
  background(220, 20, 20, 15);

  // Enable orbit control for interactive rotation
  orbitControl();

  // Use a fixed amplitude value for smooth movement and visuals
  const amplitude = 0.1;

  // Draw connections with blended colors; brightness fixed as no sound
  strokeWeight(1.5);
  nodes.forEach((node, i) => {
    node.connections.forEach(conn => {
      let hueBlend = lerp(node.colorHue, nodes[conn].colorHue, 0.5);
      stroke(hueBlend, 80, 80, 80);

      let p1 = node.pos;
      let p2 = nodes[conn].pos;
      line(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
    });
  });

  // Smooth Perlin noise movement in 3D per node
  nodes.forEach((node, i) => {
    let t = frameCount * 0.005;

    let noiseX = noise(noiseOffsets[i].x + t);
    let noiseY = noise(noiseOffsets[i].y + t);
    let noiseZ = noise(noiseOffsets[i].z + t);

    const amplitudeRange = map(amplitude, 0, 0.3, 1, 10, true);

    node.pos.x += map(noiseX, 0, 1, -amplitudeRange, amplitudeRange);
    node.pos.y += map(noiseY, 0, 1, -amplitudeRange, amplitudeRange);
    node.pos.z += map(noiseZ, 0, 1, -amplitudeRange, amplitudeRange);

    // Optional constraint inside a box volume
    node.pos.x = constrain(node.pos.x, -width/2, width/2);
    node.pos.y = constrain(node.pos.y, -height/2, height/2);
    node.pos.z = constrain(node.pos.z, -300, 300);
  });

  // Draw nodes as spheres with fixed brightness
  noStroke();
  nodes.forEach(node => {
    fill(node.colorHue, 90, 80, 100);
    push();
    translate(node.pos.x, node.pos.y, node.pos.z);
    sphere(8, 8, 8);
    pop();
  });
}

// Add new node where user clicks, mapping from 2D screen coords to WEBGL XY plane at Z=0
function mousePressed() {
  // Convert mouseX/Y from screen coords to p5 WEBGL relative coords
  let mouse3D = screenToWebGL(mouseX, mouseY);

  let newIdx = nodes.length;
  let newNode = {
    pos: createVector(mouse3D.x, mouse3D.y, random(-300, 300)),
    colorHue: random(140, 220),
    connections: []
  };

  nodes.push(newNode);
  noiseOffsets.push({
    x: random(1000),
    y: random(2000),
    z: random(3000)
  });

  // Connect new node randomly to existing nodes
  let connectCount = int(random(2, 6));
  for (let i = 0; i < connectCount; i++) {
    let target = int(random(nodes.length));
    if (target !== newIdx && !newNode.connections.includes(target)) {
      newNode.connections.push(target);
    }
    if (target !== newIdx && !nodes[target].connections.includes(newIdx)) {
      nodes[target].connections.push(newIdx);
    }
  }
}

// Helper to convert 2D screen coords to WEBGL relative coords in XY plane at Z=0
function screenToWebGL(sx, sy) {
  return {
    x: sx - width / 2,
    y: sy - height / 2
  };
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
