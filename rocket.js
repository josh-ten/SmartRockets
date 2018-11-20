class Rocket {
  constructor(x, y, steps) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);

    this.steps = steps;
    this.birthTime = frameCounter;
    this.finishAge;
    this.T1 = false;
    this.T2 = false;

    this.dead = false;
    this.won = false;
  }

  draw() {
    let dir = this.vel.heading();
    translate(this.pos.x, this.pos.y);
    rotate(dir);
    rectMode(CENTER);
    noStroke();
    imageMode(CENTER);
    image(rocketSprite, 0, 0, 60, 50);
    fill(255, 200, 100);
    if (this.T1) rect(-40, -10, 20, 10);
    if (this.T2) rect(-40, 10, 20, 10);
    rotate(-dir);
    translate(-this.pos.x, -this.pos.y);
  }

  update() {
    if (!this.dead && !this.won) {
      //WIN
      if (this.distFromTarget() < 30) this.win();

      //LOSE
      if (outOfBounds(this.pos.x, this.pos.y)) this.die();
      // if (this.pos.x < width/3 && this.pos.y > height/2) this.die();

      let stepIndex = this.getAge();
      let step = this.steps[stepIndex];
      this.T1 = step.T1;
      this.T2 = step.T2;
      this.thrust(step.T1, step.T2);
      this.kinematics();
    }
  }
  
  kinematics() {
    this.acc.y += GRAVITY;
    this.vel.limit(10);
    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.acc.mult(0);
  }

  thrust(T1, T2) {
    let mag = T1 + T2;
    let force;
    if (this.vel.mag() > 0) 
      force = this.vel.copy().normalize().mult(mag * ROCKET_SPEED);
    else 
      force = createVector(0, -ROCKET_SPEED);
    this.acc.add(force);
    let rotation = T1 - T2;
    rotation *= 0.3;
    this.vel.rotate(rotation);
  }

  getAge() {
    return frameCounter - this.birthTime;
  }

  fitness() {
    //Dead = 0
    if (this.dead) 
      return 0;

    //Won = 0.1 -> 1
    //0 < winAge < FRAMES_PER_SIM
    if (this.won)
      return (this.winAge / FRAMES_PER_SIM) * 0.9 + 0.1;

    //Close = 0 -> 0.1
    //distFromTarget will be > 30 as the rocket has not won
    return 3 / this.distFromTarget();
  }

  mutate() {
    this.steps.forEach(step => {
      if (random() < MUTATION_CHANCE)
        randomThrusters(step);
    });
  }

  die() {
    this.dead = true;
    this.finishAge = this.getAge();
  }

  win() {
    this.won = true;
    this.finishAge = this.getAge();
  }

  distFromTarget() {
    return this.pos.copy().sub(target).mag();
  }
}