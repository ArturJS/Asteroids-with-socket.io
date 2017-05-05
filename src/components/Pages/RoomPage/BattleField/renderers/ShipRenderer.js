export default function renderShip(ship, context, params) {
  const {
    position,
    rotation
  } = ship;

  const {
    number
  } = params;

  let rotateAngle = rotation * Math.PI / 180;

  context.save();
  context.translate(position.x, position.y);
  context.rotate(rotateAngle);
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

  if (number) {
    context.rotate(-rotateAngle);
    context.font = '10px serif';
    context.fillStyle = '#ffffff';
    context.fillText(number, -3, 3);
  }

  context.restore();
}
