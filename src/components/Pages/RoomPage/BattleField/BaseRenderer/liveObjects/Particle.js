export class Particle { // self controlled entity
  constructor({
    position,
    velocity,
    size,
    lifeSpan
  }) {
    this.position = {
      x: position.x,
      y: position.y
    };
    this.velocity = {
      x: velocity.x,
      y: velocity.y
    };
    this.radius = size;
    this.lifeSpan = lifeSpan;
    this.inertia = 0.98;
    this.isDead = false;
  }

  destroy() {
    this.isDead = true;
  }

  _updateInternalState() {
    this._move();
    this._shrink();
  }

  _move() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.x *= this.inertia;
    this.velocity.y *= this.inertia;
  }

  _shrink() {
    this.radius -= 0.1;

    if (this.radius < 0.1) {
      this.radius = 0.1;
    }

    if (this.lifeSpan-- < 0) {
      this.destroy();
    }
  }

  render(ctx) {
    this._updateInternalState();

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -this.radius);
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
