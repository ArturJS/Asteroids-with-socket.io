import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {inject} from 'mobx-react';
import {
  pure,
  withState,
  withHandlers
} from 'recompose';

import {rotatePoint} from './helpers';
import {Particle} from './BaseRenderer/liveObjects';
import {baseRenderer} from './BaseRenderer';
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

const SCREEN = {
  width: 1800,
  height: 1200
};

const SCREEN_PIXEL_RATIO = window.devicePixelRatio || 1;

@withState('screen', 'updateCanvasSize', {
  width: window.innerWidth,
  height: window.innerHeight - 40
})
@withState('playerNames', 'updatePlayerNames', [])
@withHandlers({
  handleResize: ({updateCanvasSize}) => _.throttle(() => {
    updateCanvasSize({
      width: window.innerWidth,
      height: window.innerHeight - 40
    });
  }, 300)
})
@inject('userStore')
@pure
export default class BattleField extends Component {
  static propTypes = {
    socket: PropTypes.object.isRequired,
    screen: PropTypes.object.isRequired,
    userStore: PropTypes.object.isRequired,
    updatePlayerNames: PropTypes.func.isRequired,
    handleResize: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.ctx = null;

    this.particles = [];

    this.scale = 1;
    this.shipPos = {x: 0, y: 0};
    this.keys = {
      left: false,
      right: false,
      up: false,
      space: false
    };
  }

  componentDidMount() {
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('resize', this.props.handleResize);

    const ctx = this.canvas.getContext('2d');
    this.ctx = ctx;

    _trackTransforms(ctx);

    this.props.handleResize();

    this.props.socket.on('updateBattleField', ({players, asteroids, explosions}) => {
      const playerNames = players.map(({login, score, id}) => {
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
        })
      });
    });
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('resize', this.props.handleResize);
  }

  handleKeyUp = (e) => {
    this.handleKeys(false, e);
  };

  handleKeyDown = (e) => {
    this.handleKeys(true, e);
  };

  handleKeys(isPressed, e) {
    const {keys} = this;
    const {keyCode} = e;

    if (keyCode === KEY.LEFT || keyCode === KEY.A) keys.left = isPressed;
    if (keyCode === KEY.RIGHT || keyCode === KEY.D) keys.right = isPressed;
    if (keyCode === KEY.UP || keyCode === KEY.W) keys.up = isPressed;
    if (keyCode === KEY.SPACE) keys.space = isPressed;

    this.props.socket.emit('keyUpdate', keys);
  }

  handleZoom = ({nativeEvent: e}) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.wheelDelta / 80;
    this.zoomShip(delta);
  };

  // count of pixels in canvas from left top corner to (clientWidth / 2, clientHeight / 2) on canvas
  getBoundaryPoint = () => {
    const {ctx} = this;
    const {clientWidth, clientHeight} = this.canvas;
    const areaCenter = ctx.transformedPoint(clientWidth / 2, clientHeight / 2);
    const leftTopPoint = ctx.transformedPoint(0, 0);

    return {
      x: areaCenter.x - leftTopPoint.x,
      y: areaCenter.y - leftTopPoint.y
    };
  };

  zoomShip = (delta) => {
    const {scale, shipPos} = this;
    const {ctx} = this;

    const {clientWidth, clientHeight} = this.canvas;
    const areaCenter = ctx.transformedPoint(clientWidth / 2, clientHeight / 2);

    let pt;

    if (delta > 0) {
      pt = {
        x: 2 * shipPos.x - areaCenter.x,
        y: 2 * shipPos.y - areaCenter.y
      };
    }
    else {
      pt = shipPos;
    }

    ctx.translate(pt.x, pt.y);

    const boundaryPoint = this.getBoundaryPoint();
    const isOutOfBoundaries = boundaryPoint.x * 2 > SCREEN.width || boundaryPoint.y * 2 > SCREEN.height;

    if (delta !== 0 && !(scale > 4 && delta > 0 || (scale < 0.5 || isOutOfBoundaries) && delta < 0)) {
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
    const {ctx} = this;
    const {clientWidth, clientHeight} = this.canvas;
    const areaCenter = ctx.transformedPoint(clientWidth / 2, clientHeight / 2);
    const boundaryPoint = this.getBoundaryPoint();
    const {width, height} = SCREEN;
    const {shipPos} = this;

    if (shipPos.x < boundaryPoint.x) {
      shipPos.x = boundaryPoint.x;
    }
    else if (shipPos.x > width - boundaryPoint.x) {
      shipPos.x = width - boundaryPoint.x;
    }

    if (shipPos.y < boundaryPoint.y) {
      shipPos.y = boundaryPoint.y;
    }
    else if (shipPos.y > height - boundaryPoint.y) {
      shipPos.y = height - boundaryPoint.y;
    }

    const pt = {
      x: areaCenter.x - shipPos.x,
      y: areaCenter.y - shipPos.y
    };

    ctx.translate(pt.x, pt.y);
    ctx.save();
    ctx.restore();
  };

  clearArea() {
    const {screen} = this.props;
    const {ctx} = this;
    ctx.save();
    ctx.scale(screen.ratio, screen.ratio);
    ctx.clear();
  }

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
      baseRenderer.registerLiveObject(
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
    this.clearArea();

    // this.updateParticles(battleFieldData);

    _.each(battleFieldData.explosions, explosion => this.createExplosion(explosion));

    this.renderObjects(battleFieldData);

    this.centerShip();

    this.props.updatePlayerNames(battleFieldData.playerNames);

    const {login} = this.props.userStore.getUserData();
    this.shipPos = _.find(battleFieldData.players, player => player.login === login).ship.position;
  }

  updateParticles({players}) {
    this.createParticles(players);

    _.each(this.particles, particle => particle.render(this.ctx));

    _.remove(this.particles, particle => particle.delete);
  }

  resetScale = () => { // TODO: move to baseRenderer
    this.scale = 1;
    const {ctx} = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0); // it's necessary to properly reset transforms
    ctx.save();
    ctx.restore();
    this.canvas.focus();
  };

  mapPlayersToEntities(players) { // TODO: move entities mapping on server side
    const bulletEntities = [];

    const playerEntities = players.map(({
                                          number,
                                          ship,
                                          bullets
                                        }) => {
      bulletEntities.push(
        ...bullets.map(bullet => ({
          type: 'Bullet',
          data: bullet
        }))
      );

      return {
        type: 'Ship',
        data: {
          number,
          ...ship
        }
      };
    });

    return [...bulletEntities, ...playerEntities];
  }

  mapAsteroidsToEntities(asteroids) {
    return asteroids.map(asteroid => ({
      type: 'Asteroid',
      data: asteroid
    }));
  }

  renderObjects({players, asteroids}) {
    const {ctx} = this;
    const entitiesData = [
      ...this.mapPlayersToEntities(players),
      ...this.mapAsteroidsToEntities(asteroids)
    ];

    baseRenderer.renderAll(ctx, entitiesData);
  }

  render() {
    const {
      screen,
      playerNames
    } = this.props;
    const {width, height} = screen;

    return (
      <div className="battle-field">
        <div className="players">
          <button
            type="button"
            className="btn btn-primary"
            onClick={this.resetScale}>
            Reset scale
          </button>
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
          tabIndex="0"
          onWheel={this.handleZoom}
          width={width * SCREEN_PIXEL_RATIO}
          height={height * SCREEN_PIXEL_RATIO}/>
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
