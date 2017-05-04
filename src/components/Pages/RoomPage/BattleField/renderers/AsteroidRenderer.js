export default function renderAsteroid(asteroid, context) {
  let {
    vertices
  } = asteroid;

  context.save();
  context.strokeStyle = '#FFF';
  context.lineWidth = 2;
  context.beginPath();

  for (let i = 1; i < vertices.length; i++) {
    context.lineTo(vertices[i].x, vertices[i].y);
  }

  context.closePath();
  context.stroke();
  context.restore();
}
