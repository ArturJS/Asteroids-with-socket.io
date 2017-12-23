class Ship {
  type = 'Ship';

  render(ctx, data) {
    const {
      position,
      rotation,
      number
    } = data;
    const rotationAngle = rotation * Math.PI / 180;

    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.rotate(rotationAngle);
    ctx.strokeStyle = '#FFFFFF';
    ctx.fillStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(10, 10);
    ctx.lineTo(5, 7);
    ctx.lineTo(-5, 7);
    ctx.lineTo(-10, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (typeof number === 'number') {
      ctx.rotate(-rotationAngle);
      ctx.font = '10px serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(number, -3, 3);
    }

    ctx.restore();
  }
}

export const ship = new Ship();
