// Full advanced Deleuzian Rhizome 3D sketch with shapes, animation, models, lighting, UI sliders

let nodes = [];
let noiseOffsets = [];

let movementSpeedSlider, baseNodeSizeSlider;
let movementSpeed = 1.0;
let baseNodeSize = 15;

// 3D Models placeholders
let astronautModel, monkeyModel, otherModel; 
// For demo purposes, you can add more models here and load in preload()

function preload() {
  astronautModel = loadModel('models/nasa_astro.obj', true);
  monkeyModel = loadModel('models/monkey.obj', true);
  // Add more model loads similarly and assign them to variables
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();
  background(220, 20, 20);

  // Create UI Sliders and attach to #ui-controls div (in your HTML)
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
      baseSize: random(baseNodeSize*0.5, baseNodeSize*1.5),
      shapeType: floor(random(7)), // 0:sphere,1:box,2:torus,3:cone,4:astronaut,5:monkey,6:otherModel
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

  // Lighting
  ambientLight(50, 50, 70);
  directionalLight(255, 255, 255, -0.5, 1, -0.3);
  pointLight(200, 220, 255, mouseX - width / 2, mouseY - height / 2, 150);

  strokeWeight(1.3);

  let t = frameCount * 0.5;

  // Draw connections
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

  // Draw nodes with shapes, colors, animations, lighting
  nodes.forEach(node => {
    let hueCycle = (node.baseHue + t) % 360;
    let oscillation = sin(frameCount * 0.04 + node.idx) * 0.3 + 1; // pulse

    let currentSize = node.baseSize * oscillation;

    push();
    translate(node.pos.x, node.pos.y, node.pos.z);

    // Rotation animation
    rotateX(frameCount * node.rotationSpeedX + node.rotationSeed);
    rotateY(frameCount * node.rotationSpeedY + node.rotationSeed * 1.3);

    // Material selection
    if (node.materialType === "specular") {
      specularMaterial(hueCycle, 80, 80);
    } else {
      normalMaterial();
    }

    // Layer transparent glow (large, semi-transparent)
    push();
    noStroke();
    fill(hueCycle, 90, 80, 40);
    sphere(currentSize * 1.6);
    pop();

    // Draw orbiting small particles
    for (let j = 0; j < 4; j++) {
      push();
      rotateY((TWO_PI * j / 4) + frameCount * 0.02);
      translate(currentSize * 1.8, 0, 0);
      fill(hueCycle, 100, 100, 90);
      sphere(currentSize * 0.12);
      pop();
    }

    // Draw main shape according to shapeType
    switch (node.shapeType) {
      case 0: // sphere
        sphere(currentSize);
        break;
      case 1: // box
        box(currentSize * 1.2);
        break;
      case 2: // torus
        torus(currentSize * 0.7, currentSize * 0.18);
        break;
      case 3: // cone
        cone(currentSize, currentSize * 1.5);
        break;
      case 4: // astronaut model
        if (astronautModel) {
          scale(currentSize / 80);
          model(astronautModel);
        }
        break;
      case 5: // monkey model
        if (monkeyModel) {
          scale(currentSize / 80);
          model(monkeyModel);
        }
        break;
      case 6: // fallback shape example (complex composite)
        push();
        rotateZ(frameCount * 0.01);
        box(currentSize * 0.8, currentSize * 1.4, currentSize * 0.8);
        pop();
        push();
        rotateX(frameCount * 0.015);
        torus(currentSize * 0.6, currentSize * 0.12);
        pop();
        break;
      default:
        sphere(currentSize); // Default fallback
    }
    pop();
  });
}

// Add new node on mouse clicks, prevent UI area overlap
function mousePressed() {
  if (mouseY > 120) { // Prevent clicks interfering with UI controls area
    let mouse3D = screenToWebGL(mouseX, mouseY);
    let newIdx = nodes.length;

    let newNode = {
      pos: createVector(mouse3D.x, mouse3D.y, random(-300, 300)),
      baseHue: random(140, 220),
      baseSize: random(baseNodeSize * 0.5, baseNodeSize * 1.5),
      shapeType: floor(random(7)),
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
}

// Helper: Convert 2D mouse coords to WEBGL relative coords in XY plane at Z=0
function screenToWebGL(sx, sy) {
  return {
    x: sx - width / 2,
    y: sy - height / 2
  };
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
