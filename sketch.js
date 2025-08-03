let nodes = [];
let noiseOffsets = []; // Store noise offset per node for smooth movement
let audioInput;
let amplitude = 0;
let baseColorHue = 180; // Base hue for coloring in HSB mode

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  background(220, 20, 20); // dark background in HSB

  // Initialize nodes and noiseOffsets for Perlin noise movement
  for (let i = 0; i < 40; i++) {
    nodes.push({
      pos: createVector(random(width), random(height)),
      colorHue: random(140, 220), // cool hues around cyan-blue
      connections: []
    });
    noiseOffsets.push({
      x: random(1000),
      y: random(2000)
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

  // Setup audio input for microphone level detection
  audioInput = new p5.AudioIn();
  audioInput.start();  
}

function draw() {
  // Background with some transparency to create trail effect
  background(220, 20, 20, 15); 

  // Get amplitude from microphone input (scaled 0..1)
  amplitude = audioInput.getLevel();

  // Draw connections with color blending influenced by amplitude
  strokeWeight(1.5);
  nodes.forEach((node, i) => {
    node.connections.forEach(conn => {
      // Blend colors of connected nodes
      let hueBlend = lerp(node.colorHue, nodes[conn].colorHue, 0.5);
      // Brightness modulated by amplitude (higher sound = brighter lines)
      stroke(hueBlend, 80, map(amplitude, 0, 0.3, 40, 100, true), 80);
      line(node.pos.x, node.pos.y, nodes[conn].pos.x, nodes[conn].pos.y);
    });
  });

  // Update node positions with Perlin noise-based smooth movement scaled by amplitude
  nodes.forEach((node, i) => {
    let t = frameCount * 0.005; // time factor for noise travel

    // Update x and y positions using noise offsets + time
    let noiseX = noise(noiseOffsets[i].x + t);
    let noiseY = noise(noiseOffsets[i].y + t);

    // Map noise (0..1) to around -amplitudeRange..amplitudeRange
    const amplitudeRange = map(amplitude, 0, 0.3, 1, 10, true);

    node.pos.x += map(noiseX, 0, 1, -amplitudeRange, amplitudeRange);
    node.pos.y += map(noiseY, 0, 1, -amplitudeRange, amplitudeRange);

    // Constrain nodes inside canvas
    node.pos.x = constrain(node.pos.x, 0, width);
    node.pos.y = constrain(node.pos.y, 0, height);
  });

  // Draw nodes with color modulated by sound amplitude
  noStroke();
  nodes.forEach(node => {
    let brightness = map(amplitude, 0, 0.3, 60, 100, true);
    fill(node.colorHue, 90, brightness, 100);
    ellipse(node.pos.x, node.pos.y, 10, 10);
  });

  // Optional: Display microphone level for visual debugging (uncomment if needed)
  /*
  noStroke();
  fill(0, 0, 100);
  textSize(12);
  textAlign(RIGHT, BOTTOM);
  text("Mic level: " + amplitude.toFixed(3), width - 10, height - 10);
  */
}

// Interactive part: Add new node with Perlin noise offset and connections on mouse press
function mousePressed() {
  let newIdx = nodes.length;

  let newNode = {
    pos: createVector(mouseX, mouseY),
    colorHue: random(140, 220),
    connections: []
  };

  nodes.push(newNode);
  noiseOffsets.push({
    x: random(1000),
    y: random(2000)
  });

  // Connect new node to a few random existing nodes
  let connectCount = int(random(2, 6));
  for (let i = 0; i < connectCount; i++) {
    let target = int(random(nodes.length));
    if (target !== newIdx && !newNode.connections.includes(target)) {
      newNode.connections.push(target);
    }
    // Ensure mutual connection
    if (target !== newIdx && !nodes[target].connections.includes(newIdx)) {
      nodes[target].connections.push(newIdx);
    }
  }
}

// Optional: Resize canvas with window size change
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
