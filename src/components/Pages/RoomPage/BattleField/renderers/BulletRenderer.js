export default function renderBullet(bullet, context) {
  const {
    position,
    rotation
  } = bullet;

  context.save();
  context.translate(position.x, position.y);
  context.rotate(rotation * Math.PI / 180);
  context.fillStyle = '#FFF';
  context.lineWidth = 0.5;
  context.beginPath();
  context.arc(0, 0, 2, 0, 2 * Math.PI);
  context.closePath();
  context.fill();
  context.restore();
}
