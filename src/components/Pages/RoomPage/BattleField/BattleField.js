import React, {Component, PropTypes} from 'react';
import _ from 'lodash';
import Ship from './entities/Ship';
import './BattleField.scss';

/*eslint-disable */
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
      context: null
    };

    this.keys = {
      left: 0,
      right: 0,
      up: 0,
      space: 0
    };

    this.ship = [];

    this.handleKeyUp = this.handleKeys.bind(this, false);
    this.handleKeyDown = this.handleKeys.bind(this, true);
  }

  componentDidMount() {
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('keydown', this.handleKeyDown);

    const context = this.canvas.getContext('2d');
    this.setState({context});

    this.startGame();

    this.props.socket.on('updateBattleField', ({position, rotation}) => {
      this.update({
        position,
        rotation,
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

    // Remove or render
    this.updateObjects(this.ship, 'ship', battleFieldData);

    context.restore();
  }

  startGame() {
    let ship = new Ship({
      position: {
        x: this.state.screen.width / 2,
        y: this.state.screen.height / 2
      },
      rotation: 0,
      context: this.state.context
    });
    this.createObject(ship, 'ship');
  }

  createObject(item, group) {
    this[group].push(item);
  }

  updateObjects(items, group, battleFieldData) {
    _.each(items, (item, index) => {
      if (item.delete) {
        this[group].splice(index, 1);
      }
      else {
        items[index].update(battleFieldData);
      }
    });
  }

  render() {
    const {width, height, ratio} = this.state.screen;

    return (
      <div className="battle-field">
        <canvas ref={node => {
          this.canvas = node;
        }}
                width={width * ratio}
                height={height * ratio}/>
      </div>
    );
  }
}
/*eslint-enable */
