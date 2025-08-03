// Deleuzian 3D Rhizome with Shape Variations, Color Cycling, and UI Controls

let nodes = [];
let noiseOffsets = [];
let movementSpeedSlider, nodeSizeSlider;
let movementSpeed = 1;
let nodeSize = 8;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(HSB, 360, 100, 100, 100);
  background(220, 20, 20);

  // Create UI sliders
  createP('Movement Speed');
  movementSpeedSlider = createSlider(0.1, 5, 1, 0.1);
  movementSpeedSlider.style('width', '200px');

  createP('Node Size');
  nodeSizeSlider = createSlider(3, 20, 8, 1);
  nodeSizeSlider.style('width', '200px');

  // Initialize nodes
  for (let i = 0; i < 40; i++) {
    nodes.push({
      pos: createVector(
        random(-width/2, width/2),
        random(-height/2, height/2),
        random(-300, 300)
      ),
      baseHue: random(140, 220),
      shapeType: floor(random(4)), // 0:sphere, 1:box, 2:torus, 3:cone
      connections: []
    });
    noiseOffsets.push({
      x: random(1000),
      y: random(2000),
      z: random(3000)
    });
  }

  // Randomly connect nodes
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
  orbitControl();

  // Update controls
  movementSpeed = movementSpeedSlider.value();
  nodeSize = nodeSizeSlider.value();

  strokeWeight(1.5);

  // Time for color cycling
  let t = frameCount * 0.5;

  // Draw connections
  nodes.forEach((node, i) => {
    node.connections.forEach(conn => {
      let color1 = color((node.baseHue + t) % 360, 80, 80, 80);
      let color2 = color((nodes[conn].baseHue + t) % 360, 80, 80, 80);
      let blended = lerpColor(color1, color2, 0.5);
      stroke(blended);
      let p1 = node.pos;
      let p2 = nodes[conn].pos;
      line(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
    });
  });

  // Perlin noise smooth movement
  nodes.forEach((node, i) => {
    let nt = frameCount * 0.005 * movementSpeed;
    let noiseX = noise(noiseOffsets[i].x + nt);
    let noiseY = noise(noiseOffsets[i].y + nt);
    let noiseZ = noise(noiseOffsets[i].z + nt);
    let range = map(movementSpeed, 0.1, 5, 1, 20);
    node.pos.x += map(noiseX, 0, 1, -range, range);
    node.pos.y += map(noiseY, 0, 1, -range, range);
    node.pos.z += map(noiseZ, 0, 1, -range, range);
    node.pos.x = constrain(node.pos.x, -width/2, width/2);
    node.pos.y = constrain(node.pos.y, -height/2, height/2);
    node.pos.z = constrain(node.pos.z, -300, 300);
  });

  // Draw nodes with shape and color cycling
  noStroke();
  nodes.forEach(node => {
    let hueCycle = (node.baseHue + t) % 360;
    fill(hueCycle, 90, 80, 100);
    push();
    translate(node.pos.x, node.pos.y, node.pos.z);
    switch(node.shapeType) {
      case 0: // sphere
        sphere(nodeSize);
        break;
      case 1: // box
        box(nodeSize * 1.2);
        break;
      case 2: // torus
        torus(nodeSize * 0.7, nodeSize * 0.2);
        break;
      case 3: // cone
        cone(nodeSize, nodeSize * 1.5);
        break;
    }
    pop();
  });
}

// Mouse interaction to add new node
function mousePressed() {
  if (mouseY > 100) { // ignore clicks on UI area
    let mouse3D = screenToWebGL(mouseX, mouseY);
    let newIdx = nodes.length;
    let newNode = {
      pos: createVector(mouse3D.x, mouse3D.y, random(-300, 300)),
      baseHue: random(140, 220),
      shapeType: floor(random(4)),
      connections: []
    };
    nodes.push(newNode);
    noiseOffsets.push({
      x: random(1000),
      y: random(2000),
      z: random(3000)
    });

    // Connect new node randomly
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
}

// Convert screen 2D coords to WebGL relative coords in XY plane Z=0
function screenToWebGL(sx, sy) {
  return {
    x: sx - width / 2,
    y: sy - height / 2
  };
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
