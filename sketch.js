// Deleuzian Rhizome 3D without external models

let nodes = [];
let noiseOffsets = [];

let movementSpeedSlider, baseNodeSizeSlider;
let movementSpeed = 1.0;
let baseNodeSize = 15;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();
  background(220, 20, 20);

  // Create UI sliders and place them in the 'ui-controls' div (make sure you have this div in your HTML)
  movementSpeedSlider = createSlider(0.1, 5, 1, 0.05);
  movementSpeedSlider.parent('ui-controls');
  movementSpeedSlider.style('width', '220px');

  baseNodeSizeSlider = createSlider(5, 40, 15, 1);
  baseNodeSizeSlider.parent('ui-controls');
  baseNodeSizeSlider.style('width', '220px');

  // Initialize nodes
  for (let i = 0; i < 40; i++) {
    nodes.push({
      pos: createVector(
        random(-width / 2, width / 2),
        random(-height / 2, height / 2),
        random(-300, 300)
      ),
      baseHue: random(140, 220),
      baseSize: random(baseNodeSize * 0.5, baseNodeSize * 1.5),
      shapeType: floor(random(4)), // 0:sphere,1:box,2:torus,3:cone
      rotationSpeedX: random(0.005, 0.015),
      rotationSpeedY: random(0.007, 0.02),
      rotationSeed: random(TWO_PI),
      materialType: random() < 0.7 ? "specular" : "normal",
      connections: [],
      idx: i
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
  background(220, 20, 20, 20);
  orbitControl();

  movementSpeed = movementSpeedSlider.value();
  baseNodeSize = baseNodeSizeSlider.value();

  // Setup lighting
  ambientLight(50, 50, 70);
  directionalLight(255, 255, 255, -0.5, 1, -0.3);
  pointLight(200, 220, 255, mouseX - width / 2, mouseY - height / 2, 150);

  strokeWeight(1.3);

  let t = frameCount * 0.5;

  // Draw connections with color cycling
  stroke(180, 80, 90, 90);
  nodes.forEach((node, i) => {
    node.connections.forEach(conn => {
      let colorA = color((node.baseHue + t) % 360, 90, 90, 90);
      let colorB = color((nodes[conn].baseHue + t) % 360, 90, 90, 90);
      let blended = lerpColor(colorA, colorB, 0.5);
      stroke(blended);
      let p1 = node.pos;
      let p2 = nodes[conn].pos;
      line(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
    });
  });
  noStroke();

  // Update nodes position with Perlin noise
  nodes.forEach((node, i) => {
    let nt = frameCount * 0.005 * movementSpeed;
    let range = map(movementSpeed, 0.1, 5, 1, 20);
    node.pos.x += map(noise(noiseOffsets[i].x + nt), 0, 1, -range, range);
    node.pos.y += map(noise(noiseOffsets[i].y + nt), 0, 1, -range, range);
    node.pos.z += map(noise(noiseOffsets[i].z + nt), 0, 1, -range, range);

    node.pos.x = constrain(node.pos.x, -width / 2, width / 2);
    node.pos.y = constrain(node.pos.y, -height / 2, height / 2);
    node.pos.z = constrain(node.pos.z, -300, 300);
  });

  // Draw nodes with shape, color cycling, rotation and particle effects
  nodes.forEach(node => {
    let hueCycle = (node.baseHue + t) % 360;
    let oscillation = sin(frameCount * 0.04 + node.idx) * 0.3 + 1; // pulsing effect

    let currentSize = node.baseSize * oscillation;

    push();
    translate(node.pos.x, node.pos.y, node.pos.z);

    // Animate rotation
    rotateX(frameCount * node.rotationSpeedX + node.rotationSeed);
    rotateY(frameCount * node.rotationSpeedY + node.rotationSeed * 1.3);

    // Choose material
    if (node.materialType === "specular") {
      specularMaterial(hueCycle, 80, 80);
    } else {
      normalMaterial();
    }

    // Transparent glow around node
    push();
    noStroke();
    fill(hueCycle, 90, 80, 40);
    sphere(currentSize * 1.6);
    pop();

    // Orbiting small particle spheres
    for (let j = 0; j < 4; j++) {
      push();
      rotateY((TWO_PI * j / 4) + frameCount * 0.02);
      translate(currentSize * 1.8, 0, 0);
      fill(hueCycle, 100, 100, 90);
      sphere(currentSize * 0.12);
      pop();
    }

    // Draw main shape (built-in only)
    switch (node.shapeType) {
      case 0:
        sphere(currentSize);
        break;
      case 1:
        box(currentSize * 1.2);
        break;
      case 2:
        torus(currentSize * 0.7, currentSize * 0.18);
        break;
      case 3:
        cone(currentSize, currentSize * 1.5);
        break;
    }
    pop();
  });
}

// Add new node on mouse click (ignore clicks on UI area)
function mousePressed() {
  if (mouseY > 120) { 
    let mouse3D = screenToWebGL(mouseX, mouseY);
    let newIdx = nodes.length;

    let newNode = {
      pos: createVector(mouse3D.x, mouse3D.y, random(-300, 300)),
      baseHue: random(140, 220),
      baseSize: random(baseNodeSize * 0.5, baseNodeSize * 1.5),
      shapeType: floor(random(4)),
      rotationSpeedX: random(0.005, 0.015),
      rotationSpeedY: random(0.007, 0.02),
      rotationSeed: random(TWO_PI),
      materialType: random() < 0.7 ? "specular" : "normal",
      connections: [],
      idx: newIdx
    };

    nodes.push(newNode);
    noiseOffsets.push({
      x: random(1000),
      y: random(2000),
      z: random(3000)
    });

    // Random connections
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

// Helper: convert 2D mouse coords to WEBGL relative XY plane coords at Z=0
function screenToWebGL(sx, sy) {
  return {
    x: sx - width / 2,
    y: sy - height / 2
  };
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
