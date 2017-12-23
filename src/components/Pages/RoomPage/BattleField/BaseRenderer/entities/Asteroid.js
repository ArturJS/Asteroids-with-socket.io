export class Asteroid {
  type = 'Asteroid';

  render(ctx, data) {
    const {
      vertices
    } = data;

    ctx.save();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let point of vertices) {
      ctx.lineTo(point.x, point.y);
    }

    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

export const asteroid = new Asteroid();
