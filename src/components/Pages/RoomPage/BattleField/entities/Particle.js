export default class Particle {
  constructor({
    position,
    velocity,
    size,
    lifeSpan
  }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = size;
    this.lifeSpan = lifeSpan;
    this.inertia = 0.98;
  }

  destroy() {
    this.delete = true;
  }

  render(state) {
    // Move
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.x *= this.inertia;
    this.velocity.y *= this.inertia;

    // Shrink
    this.radius -= 0.1;
    if (this.radius < 0.1) {
      this.radius = 0.1;
    }
    if (this.lifeSpan-- < 0) {
      this.destroy();
    }

    // Draw
    const context = state.context;
    context.save();
    context.translate(this.position.x, this.position.y);
    context.fillStyle = '#ffffff';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, -this.radius);
    context.arc(0, 0, this.radius, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
    context.restore();
  }
}
