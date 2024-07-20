let income = 0;
let spoiledApples = 0;
let maxSpoiled = 3;
let appleFrequency = 300;
let appleRange = 50;
let isGameOver = false;
let showGameOverText = false;
let gameOverFrame = 0;
let apples = [];
let worms = [];

let harvestSound, eatenSound, wormSound;
let treeImage;

function preload() {
  soundFormats('mp3');
  harvestSound = loadSound('harvest.mp3');
  eatenSound = loadSound('eaten.mp3');
  wormSound = loadSound('worm.mp3');
  treeImage = loadImage('tree.png'); // Load your tree image here
}

function setup() {
  createCanvas(800, 600);
  textFont('Arial', 16, true);
  apples.push(new Apple());
}

function draw() {
  background(255);
  image(treeImage, width/2 - treeImage.width/2, height/2 - treeImage.height/2);
  
  // Display income
  fill(255);
  textAlign(LEFT, TOP);
  text("Income: " + income, 10, 10);
  text("Spoiled Apples: " + spoiledApples, 10, 30);
  
  // Display apples
  for (let apple of apples) {
    apple.display();
    apple.update();
  }
  
  // Display worms
  for (let worm of worms) {
    worm.display();
    worm.update();
  }
  
  // Check game over condition
  if (spoiledApples >= maxSpoiled && !isGameOver) {
    isGameOver = true;
    gameOverFrame = frameCount;
    showGameOverText = true;
  }

  // Display game over text
  if (showGameOverText) {
    let elapsedFrames = frameCount - gameOverFrame;
    let progress = min(1.0, elapsedFrames / 60.0); // 60 frames = 1 second

    let gameOverY = int(lerp(-100, height/2, progress));
    
    fill(255, 0, 0, int(progress * 255));
    textAlign(CENTER, CENTER);
    textSize(32);
    text("Game Over", width/2, gameOverY);
    textSize(16);
    text("Click to restart", width/2, gameOverY + 40);
  }

  if (showGameOverText && frameCount - gameOverFrame > 60) {
    if (mouseIsPressed) {
      let elapsedFrames = frameCount - gameOverFrame;
      let progress = min(1.0, (elapsedFrames - 60) / 60.0); // 60 frames = 1 second
      let gameOverY = int(lerp(height/2, height + 100, progress));
      
      fill(255, 0, 0, int((1.0 - progress) * 255));
      textAlign(CENTER, CENTER);
      textSize(32);
      text("Game Over", width/2, gameOverY);
      textSize(16);
      text("Click to restart", width/2, gameOverY + 40);
      
      if (progress >= 1.0) {
        resetGame();
      }
    }
  }
  
  // Increase apple count and range over time
  if (frameCount % appleFrequency == 0 && !isGameOver) {
    apples.push(new Apple());
    if (appleFrequency > 50) appleFrequency -= 10; // Decrease interval for more frequent apples
    if (appleRange < min(width, height) / 2) appleRange += 10; // Increase range of apple appearance, but keep within screen bounds
  }
}

function mousePressed() {
  if (!isGameOver && !showGameOverText) {
    // Check if an apple is clicked
    for (let i = apples.length - 1; i >= 0; i--) {
      if (apples[i].isClicked(mouseX, mouseY)) {
        if (apples[i].isRipe) {
          income += 10 + apples[i].size; // Adjust income value as needed
          playSound(harvestSound, apples[i].x);
          apples.splice(i, 1);
        }
      }
    }
    
    // Check if a worm is clicked
    for (let i = worms.length - 1; i >= 0; i--) {
      if (worms[i].isClicked(mouseX, mouseY)) {
        worms.splice(i, 1);
      }
    }
  }
}

function resetGame() {
  income = 0;
  spoiledApples = 0;
  appleFrequency = 300;
  appleRange = 50;
  isGameOver = false;
  showGameOverText = false;
  apples = [];
  worms = [];
  apples.push(new Apple());
  loop();
}

function playSound(sound, x) {
  let pan = map(x, 0, width, -1.0, 1.0);
  sound.pan(pan);
  sound.play();
}

class Apple {
  constructor() {
    this.x = random(width/2 - appleRange, width/2 + appleRange);
    this.y = random(height/2 - appleRange, height/2 + appleRange);
    this.isRipe = false;
    this.isSpoiled = false;
    this.ripenTime = int(random(180, 360)); // Adjust time as needed
    this.size = 20; // Initial size of the apple
    this.growthStage = 0; // Growth stages of the apple
  }
  
  display() {
    if (this.isSpoiled) {
      fill(139, 69, 19); // Brown for spoiled apple
    } else if (this.isRipe) {
      fill(255, 0, 0); // Red for ripe apple
    } else {
      fill(0, 255, 0); // Green for unripe apple
    }
    ellipse(this.x, this.y, this.size, this.size);
  }
  
  update() {
    if (frameCount % this.ripenTime == 0) {
      this.isRipe = true;
    }
    if (this.isRipe && this.growthStage < 3) { // Apple grows in stages
      this.size += 5; // Growth increment
      this.growthStage++;
    }
    if (this.isRipe && random(1) < 0.01 && worms.length < 5) { // Adjust worm appearance rate as needed
      let newWorm = new Worm(this.x, this.y);
      worms.push(newWorm);
      playSound(wormSound, newWorm.spawnX); // Play sound at spawn position
    }
  }
  
  isClicked(mx, my) {
    return dist(mx, my, this.x, this.y) < this.size / 2;
  }
}

class Worm {
  constructor(targetX, targetY) {
    this.targetX = targetX;
    this.targetY = targetY;
    if (random(1) < 0.5) {
      this.x = random(width);
      this.y = random(1) < 0.5 ? 0 : height;
    } else {
      this.x = random(1) < 0.5 ? 0 : width;
      this.y = random(height);
    }
    this.spawnX = this.x; // Store initial spawn position
    this.spawnY = this.y;
    this.speed = 1;
    this.bodySize = 10; // Initial size of the worm body parts
  }
  
  display() {
    fill(0, 255, 0);
    // Draw head
    ellipse(this.x, this.y, this.bodySize, this.bodySize);
    // Draw eyes
    fill(0);
    ellipse(this.x - 2, this.y - 2, 2, 2);
    ellipse(this.x + 2, this.y - 2, 2, 2);
    fill(0, 255, 0);
    // Draw body
    ellipse(this.x - this.bodySize, this.y, this.bodySize, this.bodySize);
    ellipse(this.x - 2 * this.bodySize, this.y, this.bodySize, this.bodySize);
  }
  
  update() {
    if (dist(this.x, this.y, this.targetX, this.targetY) < 10) {
      for (let apple of apples) {
        if (apple.x == this.targetX && apple.y == this.targetY) {
          apple.isSpoiled = true;
          apple.isRipe = false;
          spoiledApples++;
          this.bodySize += 2; // Worm grows in size
          this.speed += 0.2; // Worm speed increases
          playSound(eatenSound, apple.x);
          this.findNewTarget(); // Find new target after eating an apple
          return;
        }
      }
    } else {
      let angle = atan2(this.targetY - this.y, this.targetX - this.x);
      this.x += cos(angle) * this.speed;
      this.y += sin(angle) * this.speed;
    }
    
    // Find new target if current target is no longer valid
    if (!this.isValidTarget()) {
      this.findNewTarget();
    }
  }
  
  isClicked(mx, my) {
    return dist(mx, my, this.x, this.y) < this.bodySize / 2 || dist(mx, my, this.x - this.bodySize, this.y) < this.bodySize / 2 || dist(mx, my, this.x - 2 * this.bodySize, this.y) < this.bodySize / 2;
  }
  
  isValidTarget() {
    for (let apple of apples) {
      if (apple.x == this.targetX && apple.y == this.targetY && apple.isRipe && !apple.isSpoiled) {
        return true;
      }
    }
    return false;
  }
  
  findNewTarget() {
    let minDist = Number.MAX_VALUE;
    for (let apple of apples) {
      if (apple.isRipe && !apple.isSpoiled) {
        let distToApple = dist(this.x, this.y, apple.x, apple.y);
        if (distToApple < minDist) {
          minDist = distToApple;
          this.targetX = apple.x;
          this.targetY = apple.y;
        }
      }
    }
    // If no valid target found, move off screen
    if (minDist == Number.MAX_VALUE) {
      this.targetX = random(width);
      this.targetY = random(height);
    }
  }
}
