export default class Ship {
  constructor({position, rotation, context}) {
    this.update({
      position,
      rotation,
      context
    });
  }

  update({
    position,
    rotation,
    context
  }) {
    this.position = position;
    this.rotation = rotation;
    this.context = context;

    this.render();
  }

  render() {
    const {context} = this;
    if (!context) return;
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate(this.rotation * Math.PI / 180);
    context.strokeStyle = '#ffffff';
    context.fillStyle = '#000000';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, -15);
    context.lineTo(10, 10);
    context.lineTo(5, 7);
    context.lineTo(-5, 7);
    context.lineTo(-10, 10);
    context.closePath();
    context.fill();
    context.stroke();
    context.restore();
  }
}
