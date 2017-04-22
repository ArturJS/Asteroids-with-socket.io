export default function renderShip(ship, context) {
  const {
    position,
    rotation
  } = ship;

  context.save();
  context.translate(position.x, position.y);
  context.rotate(rotation * Math.PI / 180);
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
