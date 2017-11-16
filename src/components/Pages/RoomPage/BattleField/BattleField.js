import React, {Component, PropTypes} from 'react';
import _ from 'lodash';
import {rotatePoint} from './helpers';
import renderAsteroid from './renderers/AsteroidRenderer';
import renderBullet from './renderers/BulletRenderer';
import renderShip from './renderers/ShipRenderer';
import Particle from './entities/Particle';
import './BattleField.scss';

const KEY = {
  LEFT: 37,
  RIGHT: 39,
  UP: 38,
  A: 65,
  D: 68,
  W: 87,
  SPACE: 32
};

export default class BattleField extends Component {
  static propTypes = {
    socket: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      screen: {
        width: 900,
        height: 600,
        ratio: window.devicePixelRatio || 1
      },
      playerNames: [],
      ship: {x: 0, y: 0},
      context: null
    };

    this.keys = {
      left: 0,
      right: 0,
      up: 0,
      space: 0
    };

    this.particles = [];

    this.scale = 1;

    this.handleKeyUp = this.handleKeys.bind(this, false);
    this.handleKeyDown = this.handleKeys.bind(this, true);
  }

  componentDidMount() {
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('keydown', this.handleKeyDown);

    const context = this.canvas.getContext('2d');
    _trackTransforms(context);
    this.setState({context});

    this.props.socket.on('updateBattleField', ({players, asteroids, explosions}) => {
      let playerNames = players.map(({login, score, id}) => {
        return {
          id,
          value: login,
          score
        };
      });

      this.update({
        asteroids: asteroids.map(asteroid => ({
          vertices: asteroid.vertices.map(v => ({x: v.x, y: v.y}))
        })),
        explosions: explosions.map(explosion => ({
          position: {
            x: explosion.position.x,
            y: explosion.position.y
          },
          radius: explosion.radius
        })),
        playerNames,
        players: players.map(({login, ship, bullets, keys, id}) => {
          return {
            login,
            number: _.findIndex(playerNames, p => p.value === login) + 1,
            ship: {
              userId: id,
              position: {
                x: ship.position.x,
                y: ship.position.y
              },
              rotation: ship.rotation
            },
            keys: {
              left: keys.left,
              right: keys.right,
              up: keys.up,
              space: keys.space
            },
            bullets: bullets.map(bullet => {
              return {
                position: {
                  x: bullet.position.x,
                  y: bullet.position.y
                },
                rotation: bullet.rotation
              };
            })
          };
        }),
        context
      });
    });
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeys(value, e) {
    let {keys} = this;
    if (e.keyCode === KEY.LEFT || e.keyCode === KEY.A) keys.left = value;
    if (e.keyCode === KEY.RIGHT || e.keyCode === KEY.D) keys.right = value;
    if (e.keyCode === KEY.UP || e.keyCode === KEY.W) keys.up = value;
    if (e.keyCode === KEY.SPACE) keys.space = value;

    this.props.socket.emit('keyUpdate', keys);
  }

  handleZoom = ({nativeEvent: e}) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.wheelDelta / 80;
    this.zoomShip(delta);
  };

  setScale = (scale) => {
    // const initialScale = this.scale;
    // const targetScale = scale / initialScale;
    this.scale = scale;
    const ctx = this.state.context;
    // ctx.scale(targetScale, targetScale);
    ctx.setTransform(1, 0, 0, 1, 0, 0); // it's necessary to properly reset transforms
    ctx.save();
    ctx.restore();
  };

  zoomShip = (delta = 0) => {
    const {scale} = this;
    const ctx = this.state.context;

    const {clientWidth, clientHeight} = this.canvas;
    const areaCenter = ctx.transformedPoint(clientWidth / 2, clientHeight / 2);
    const shipPos = this.state.ship;

    let pt;

    if (delta >= 0) {
      pt = {
        x: 2 * shipPos.x - areaCenter.x,
        y: 2 * shipPos.y - areaCenter.y
      };
    }
    else {
      pt = shipPos;
    }

    ctx.translate(pt.x, pt.y);

    if (delta !== 0 && !(scale > 4 && delta > 0 || scale < 0.5 && delta < 0)) {
      const scaleFactor = 1.1;
      const factor = Math.pow(scaleFactor, delta);
      ctx.scale(factor, factor);
      this.scale *= factor;
    }

    ctx.translate(-pt.x, -pt.y);
    ctx.save();
    ctx.restore();
  };

  centerShip = () => {
    const ctx = this.state.context;
    const {clientWidth, clientHeight} = this.canvas;
    const areaCenter = ctx.transformedPoint(clientWidth / 2, clientHeight / 2);
    const shipPos = this.state.ship;
    const pt = {
      x: areaCenter.x - shipPos.x,
      y: areaCenter.y - shipPos.y
    };

    ctx.translate(pt.x, pt.y);
    ctx.save();
    ctx.restore();
  };

  createParticles(players) {
    players.forEach(({ship, keys}) => {
      if (keys.up) {
        let posDelta = rotatePoint({x: 0, y: -10}, {x: 0, y: 0}, (ship.rotation - 180) * Math.PI / 180);

        this.particles.push(
          new Particle({
            position: {
              x: ship.position.x + posDelta.x + _.random(-2, 2),
              y: ship.position.y + posDelta.y + _.random(-2, 2)
            },
            velocity: {
              x: posDelta.x / _.random(3, 5),
              y: posDelta.y / _.random(3, 5)
            },
            size: _.random(1, 3),
            lifeSpan: _.random(30, 50)
          })
        );
      }
    });
  }

  createExplosion({position, radius}) {
    _.times(radius, () => {
      this.particles.push(
        new Particle({
          lifeSpan: _.random(60, 100),
          size: _.random(1, 3),
          position: {
            x: position.x + _.random(-radius / 4, radius / 4),
            y: position.y + _.random(-radius / 4, radius / 4)
          },
          velocity: {
            x: _.random(-1.5, 1.5),
            y: _.random(-1.5, 1.5)
          }
        })
      );
    });
  }

  update(battleFieldData) {
    const context = this.state.context;

    context.save();
    context.scale(this.state.screen.ratio, this.state.screen.ratio);
    context.clear();

    this.updateParticles(battleFieldData);

    _.each(battleFieldData.explosions, explosion => this.createExplosion(explosion));

    this.renderObjects(battleFieldData);

    context.restore();

    this.centerShip();

    this.setState({
      playerNames: battleFieldData.playerNames,
      ship: battleFieldData.players[0].ship.position
    });
  }

  updateParticles({players}) {
    this.createParticles(players);

    _.each(this.particles, particle => particle.render(this.state));

    _.remove(this.particles, particle => particle.delete);
  }

  resetScale = () => {
    this.setScale(1);
  };

  renderObjects({players, asteroids}) {
    const {context} = this.state;

    players.forEach(({number, ship, bullets}) => {
      renderShip(ship, context, {number});
      _.each(bullets, bullet => renderBullet(bullet, context));
    });

    _.each(asteroids, asteroid => renderAsteroid(asteroid, context));
  }

  render() {
    const {screen, playerNames} = this.state;
    const {width, height, ratio} = screen;
    const {x, y} = this.state.ship;

    return (
      <div className="battle-field">
        <div className="players">
          <button
            type="button"
            className="btn btn-primary"
            onClick={this.resetScale}>
            Reset scale
          </button>
          <div>
            x: {x.toFixed(0)} y: {y.toFixed(0)}
          </div>
          <div className="players-heading">
            Players:
          </div>
          <ol className="players-list">
            {playerNames.map(({id, value, score}) => (
              <li className="players-list__item" key={id}>
                {value} : {score}
              </li>
            ))}
          </ol>
        </div>
        <canvas
          ref={node => {
            this.canvas = node;
          }}
          onWheel={this.handleZoom}
          width={width * ratio}
          height={height * ratio}/>
      </div>
    );
  }
}


// Adds ctx.getTransform() - returns an SVGMatrix
// Adds ctx.transformedPoint(x,y) - returns an SVGPoint
function _trackTransforms(ctx) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  let xform = svg.createSVGMatrix();
  ctx.getTransform = () => xform;

  const savedTransforms = [];
  const save = ctx.save;
  ctx.save = () => {
    savedTransforms.push(xform.translate(0, 0));
    return save.call(ctx);
  };

  const restore = ctx.restore;
  ctx.restore = () => {
    xform = savedTransforms.pop();
    return restore.call(ctx);
  };

  const scale = ctx.scale;
  ctx.scale = (sx, sy) => {
    xform = xform.scaleNonUniform(sx, sy);
    return scale.call(ctx, sx, sy);
  };

  const rotate = ctx.rotate;
  ctx.rotate = radians => {
    xform = xform.rotate(radians * 180 / Math.PI);
    return rotate.call(ctx, radians);
  };

  const translate = ctx.translate;
  ctx.translate = (dx, dy) => {
    xform = xform.translate(dx, dy);
    return translate.call(ctx, dx, dy);
  };

  const transform = ctx.transform;
  ctx.transform = (a, b, c, d, e, f) => {
    const m2 = svg.createSVGMatrix();
    m2.a = a;
    m2.b = b;
    m2.c = c;
    m2.d = d;
    m2.e = e;
    m2.f = f;
    xform = xform.multiply(m2);
    return transform.call(ctx, a, b, c, d, e, f);
  };

  const setTransform = ctx.setTransform;
  ctx.setTransform = (a, b, c, d, e, f) => {
    xform.a = a;
    xform.b = b;
    xform.c = c;
    xform.d = d;
    xform.e = e;
    xform.f = f;
    return setTransform.call(ctx, a, b, c, d, e, f);
  };

  const pt = svg.createSVGPoint(); // convert mouse pos on the screen to pos on canvas
  ctx.transformedPoint = (x, y) => {
    pt.x = x;
    pt.y = y;
    return pt.matrixTransform(xform.inverse());
  };

  ctx.clear = (preserveTransform = true) => {
    if (preserveTransform) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (preserveTransform) {
      ctx.restore();
    }
  };
}

