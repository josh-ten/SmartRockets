const ROCKET_SPEED = 0.1;
const GRAVITY = 0;
const ROCKET_COUNT = 100;
const FRAMES_PER_SIM = 250;
let SIM_SPEED = 1;
const MAX_MUTATION_CHANCE = 0.6;
const MIN_MUTATION_CHANCE = 0.0001;
let MUTATION_CHANCE = MAX_MUTATION_CHANCE;

let generation = 0;
let generationAge = 0;
let frameCounter = 0;
let rockets = [];
let obstacles = [];
let target;
let spawnPt;
let rocketSprite;
let bestOfGeneration;
let bestFitness;
let onlyTopRocket = false;
let simComplete = false;

function setup() {
  createCanvas(window.innerWidth-3, window.innerHeight-3);

  spawnPt = createVector(width/2, height);
  target = createVector(width/2, 30);
  rocketSprite = loadImage('./nightraiderfixed.png');
  
  for (let i = 0; i < ROCKET_COUNT; i++) {
    rockets.push(new Rocket(spawnPt.x, spawnPt.y, initSteps()));
  }

  // obstacles.push(new Obstacle(width*0.25, height*0.5, width*0.5, 100));
  obstacles.push(new Obstacle(0, height*0.8, width*0.5, 10));
  obstacles.push(new Obstacle(width*0.3, height*0.4, width, 10));
}

function draw() {
  for (let i = 0; i < SIM_SPEED; i++) {
    background(255);
    fill(0);
    textSize(50);
    text('Generation ' + generation, 10, 50);
    if (bestFitness) {
      textSize(30);
      text('Best fitness ' + bestFitness, 10, 90);
    }
    
    generationAge++;
    if (generationAge < FRAMES_PER_SIM) {
      rockets.forEach(r => r.update());
      if (rockets.every(r => r.dead == true)) nextGeneration();
    } else {
      nextGeneration();
    }
    if (!onlyTopRocket) 
      rockets.forEach(r => r.draw());
    if (bestOfGeneration) {
      if (onlyTopRocket) bestOfGeneration.draw();
      else {
        fill(0, 255, 100);
        ellipse(bestOfGeneration.pos.x, bestOfGeneration.pos.y, 10, 10);
      }
    }
    drawTarget();

    obstacles.forEach(o => o.draw());

    frameCounter++;
  }
}

function nextGeneration(seedRocket) {
  let topRocket;
  let newGeneration = [];
  if (seedRocket) {
    topRocket = seedRocket;
  } else {
    let bestFitness = 0;
    rockets.forEach(rocket => {
      if (rocket.fitness() > bestFitness) {
        bestFitness = rocket.fitness();
        topRocket = rocket;
      }
    });
  }
  //Reduce mutation chance so the behaviour spread decreases as the rocket is refined
  if (topRocket) {
    bestFitness = Math.round(topRocket.fitness() * 1000) / 1000;
    if (MUTATION_CHANCE > MIN_MUTATION_CHANCE) MUTATION_CHANCE -= topRocket.fitness() / 10;
    else MUTATION_CHANCE = MIN_MUTATION_CHANCE;
  } else MUTATION_CHANCE = MAX_MUTATION_CHANCE;
  for (let i = 0; i < ROCKET_COUNT; i++) {
    let newBoi;
    if (topRocket)
      newBoi = new Rocket(spawnPt.x, spawnPt.y, copyArray(topRocket.steps));
    else 
      //They all died, start fresh
      newBoi = new Rocket(spawnPt.x, spawnPt.y, initSteps());
    if (i > 0) newBoi.mutate();
    newGeneration.push(newBoi);
  }
  rockets = newGeneration;
  bestOfGeneration = rockets[0];
  generation++;
  generationAge = 0;
  simComplete = false;
}

function initSteps() {
  let steps = [];
  for (let i = 0; i < FRAMES_PER_SIM; i++) {
    let step = {};
    randomThrusters(step);
    steps.push(step);
  }
    // steps.push(p5.Vector.random2D().mult(ROCKET_SPEED));
  return steps;
}

function randomThrusters(step) {
  step.T1 = randomBool();
  step.T2 = randomBool();
}

function copyArray(a) {
  let newArray = [];
  a.forEach(el => newArray.push({'T1': el.T1, 'T2': el.T2}));
  return newArray;
}

function randomBool() {
  return random() < 0.5 ? true : false;
}

function mousePressed() {
  target = createVector(mouseX, mouseY);
}

function withinBounds(x, y, minx, maxx, miny, maxy) {
  return (x > minx && x < maxx && y > miny && y < maxy);
}
function outOfBounds(x, y) {
  return (x > width || x < 0 || y > height || y < 0);
}

function toggleSolo() {
  onlyTopRocket = !onlyTopRocket;
}

function drawTarget() {
  let targetSize = 30;
  fill(0, 255, 100);
  stroke(0);
  ellipse(target.x, target.y, targetSize, targetSize);
  line(target.x, target.y-targetSize*0.6, target.x, target.y+targetSize*0.6);
  line(target.x-targetSize*0.6, target.y, target.x+targetSize*0.6, target.y);
}