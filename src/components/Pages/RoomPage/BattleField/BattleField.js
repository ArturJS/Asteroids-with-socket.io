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
      context: null
    };

    this.keys = {
      left: 0,
      right: 0,
      up: 0,
      space: 0
    };

    this.particles = [];

    this.handleKeyUp = this.handleKeys.bind(this, false);
    this.handleKeyDown = this.handleKeys.bind(this, true);
  }

  componentDidMount() {
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('keydown', this.handleKeyDown);

    const context = this.canvas.getContext('2d');
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

  update(battleFieldData) {
    const context = this.state.context;

    context.save();
    context.scale(this.state.screen.ratio, this.state.screen.ratio);

    // Motion trail
    context.fillStyle = '#000';
    context.globalAlpha = 0.4;
    context.fillRect(0, 0, this.state.screen.width, this.state.screen.height);
    context.globalAlpha = 1;

    this.updateParticles(battleFieldData);

    _.each(battleFieldData.explosions, explosion => this.createExplosion(explosion));

    this.renderObjects(battleFieldData);

    context.restore();

    this.setState({
      playerNames: battleFieldData.playerNames
    });
  }

  updateParticles({players}) {
    this.createParticles(players);

    _.each(this.particles, particle => particle.render(this.state));

    _.remove(this.particles, particle => particle.delete);
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

    return (
      <div className="battle-field">
        <div className="players">
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
          width={width * ratio}
          height={height * ratio}/>
      </div>
    );
  }
}
