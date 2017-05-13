import React, {Component} from 'react';
import Ship from './Ship';
import Asteroid from './Asteroid';
import {randomNumBetweenExcluding} from './helpers';
import _ from 'lodash';
import './BattleFieldAutoplay.scss';

/*eslint-disable */
export default class BattleFieldAutoplay extends Component {
  constructor(props) {
    super(props);

    this.state = {
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1
      },
      context: null,
      keys: {
        left: 0,
        right: 0,
        up: 0,
        space: 0
      },
      asteroidCount: _.random(5, 7),
      inGame: false
    };
    this.ship = [];
    this.asteroids = [];
    this.bullets = [];
    this.particles = [];
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleWindowResize);

    const context = this.refs.canvas.getContext('2d');

    this.setState({context: context});
    this.startGame();
    requestAnimationFrame(() => {
      this.update()
    });

    this.initAutoplay();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
    clearInterval(this.autoplayIntervalId);
  }

  handleWindowResize = _.debounce(() => {
    this.setState({
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1,
      }
    });
  }, 300);

  initAutoplay = () => {
    this.fillAutoplayQueue();

    this.autoplayIntervalId = setInterval(() => {
      if (this.autoplayQueue.length === 0) {
        this.fillAutoplayQueue();
      }

      let commandName = this.autoplayQueue.pop();

      this.setState({
        keys: {
          [commandName]: true
        }
      });
    }, 20);
  };

  fillAutoplayQueue = () => {
    this.autoplayQueue = [];

    let commandNum = parseInt(_.random(0, 3));
    const COMMANDS = ['left', 'right', 'up', 'space'];
    let commandName = COMMANDS[commandNum];

    _.times(_.random(10, 40), () => {
      this.autoplayQueue.push(commandName);
    });
  };

  update() {
    const context = this.state.context;
    const ship = this.ship[0];

    context.save();
    context.scale(this.state.screen.ratio, this.state.screen.ratio);

    // Motion trail
    context.fillStyle = '#000';
    context.globalAlpha = 0.4;
    context.fillRect(0, 0, this.state.screen.width, this.state.screen.height);
    context.globalAlpha = 1;

    // Next set of asteroids
    if (this.asteroids.length < 5) {
      let count = _.random(5, 7);
      this.setState({asteroidCount: count});
      this.generateAsteroids(count);
    }

    // Check for colisions
    this.checkCollisionsWith(this.bullets, this.asteroids);
    this.checkCollisionsWith(this.ship, this.asteroids);

    // Remove or render
    this.updateObjects(this.particles, 'particles');
    this.updateObjects(this.asteroids, 'asteroids');
    this.updateObjects(this.bullets, 'bullets');
    this.updateObjects(this.ship, 'ship');

    context.restore();

    // Next frame
    requestAnimationFrame(() => {
      this.update()
    });
  }

  addScore(points) {
  }

  startGame() {
    this.setState({
      inGame: true
    });

    // Make ship
    let ship = new Ship({
      position: {
        x: this.state.screen.width / 2,
        y: this.state.screen.height / 2
      },
      create: this.createObject.bind(this)
    });
    this.createObject(ship, 'ship');

    // Make asteroids
    this.asteroids = [];
    this.generateAsteroids(this.state.asteroidCount)
  }

  generateAsteroids(howMany) {
    let asteroids = [];
    let ship = this.ship[0];

    for (let i = 0; i < howMany; i++) {
      let asteroid = new Asteroid({
        size: 50,
        position: {
          x: randomNumBetweenExcluding(0, this.state.screen.width, ship.position.x - 60, ship.position.x + 60),
          y: randomNumBetweenExcluding(0, this.state.screen.height, ship.position.y - 60, ship.position.y + 60)
        },
        create: this.createObject.bind(this),
        addScore: this.addScore.bind(this)
      });
      this.createObject(asteroid, 'asteroids');
    }
  }

  createObject(item, group) {
    this[group].push(item);
  }

  updateObjects(items, group) {
    let index = 0;
    for (let item of items) {
      if (item.delete) {
        this[group].splice(index, 1);
      } else {
        items[index].render(this.state);
      }
      index++;
    }
  }

  checkCollisionsWith(items1, items2) {
    let a = items1.length - 1;
    let b;
    let item1;
    let item2;

    for (a; a > -1; --a) {
      b = items2.length - 1;

      for (b; b > -1; --b) {
        item1 = items1[a];
        item2 = items2[b];

        if (this.checkCollision(item1, item2)) {
          item1.destroy();
          item2.destroy();
        }
      }
    }
  }

  checkCollision(obj1, obj2) {
    let vx = obj1.position.x - obj2.position.x;
    let vy = obj1.position.y - obj2.position.y;
    let length = Math.sqrt(vx * vx + vy * vy);

    return length < obj1.radius + obj2.radius;
  }

  render() {
    const {
      width,
      height,
      ratio
    } = this.state.screen;

    return (
      <div className="battle-field-autoplay">
        <canvas ref="canvas"
                width={width * ratio}
                height={height * ratio}
        />
      </div>
    );
  }
}
/*eslint-enable */