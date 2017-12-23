export class Bullet {
  type = 'Bullet';

  render(ctx, data) {
    const {
      position,
      rotation
    } = data;

    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.fillStyle = '#FFFFFF';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

export const bullet = new Bullet();
