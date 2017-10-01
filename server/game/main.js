// @flow
import type {IAsteroid} from '../interfaces/IAsteroid';
import type {IBattleFieldData} from '../interfaces/IBattleFieldData';
import type {IBullet} from '../interfaces/IBullet';
import type {IExplosion} from '../interfaces/IExplosion';
import type {IKeys} from '../interfaces/IKeys';
import type {IPlayer} from '../interfaces/IPlayer';
import type {IPoint} from '../interfaces/IPoint';
import type {IShip} from '../interfaces/IShip';
import type {IStorageData} from '../interfaces/IStorageData';

const events = require('events');
const _ = require('lodash');
const calcEngine = require('./calcEngine');
const gameStorage = require('./storage');

module.exports = {
  runGameCircle,
  updateKeys,
  addShip,
  removeShip,
  getBattleFieldSnapshot
};

///

function runGameCircle() {
  const eventEmitter = new events.EventEmitter();

  setInterval((): void => {
    _.flow(
      gameStorage.getStorageData,
      calcEngine.calcNextScene,
      gameStorage.setStorageData
    )();

    let gameStorageData: IStorageData = gameStorage.getStorageData();

    let roomIds = Array.from(gameStorageData.keys());

    _.each(roomIds, (roomId: string) => {
      eventEmitter.emit('updateBattleField', _mapBattleFieldData(gameStorageData, roomId), roomId);
    });

  }, 1000 / 60);

  return eventEmitter;
}

function updateKeys(roomId: string, playerId: string, keys: IKeys): void {
  gameStorage.updateKeys(roomId, playerId, keys);
}

function addShip({playerId, login}:{playerId: string, login: string}, roomId: string): void {
  gameStorage.addShip({playerId, login}, roomId);
}

function removeShip(playerId: string, roomId: string): void {
  gameStorage.removeShip(playerId, roomId);
}

function getBattleFieldSnapshot(roomId: string) {
  return _mapBattleFieldData(gameStorage.getStorageData(), roomId);
}

/// private methods

function _mapBattleFieldData(roomBattleMap: IStorageData, roomId: string): IBattleFieldData {
  const room = roomBattleMap.get(roomId);
  if (!room) {
    return {
      players: [],
      asteroids: [],
      explosions: []
    };
  }

  let {
    players,
    asteroids,
    explosions
  }:{players: Map<string, IPlayer>, asteroids: IAsteroid[], explosions: IExplosion[]} = room;

  let playersList: IPlayer[] = Array.from(players.values());

  return {
    players: playersList.map(({id, login, ship, bullets, score, keys}) => {
      return {
        id,
        login,
        ship: {
          playerId: ship.playerId,
          position: ship.position,
          rotation: ship.rotation,
          velocity: ship.velocity
        },
        keys: {
          left: keys.left,
          right: keys.right,
          up: keys.up,
          space: keys.space
        },
        score: score,
        bullets: bullets.map((bullet: IBullet) => ({
          playerId: id,
          position: bullet.position,
          rotation: bullet.rotation,
          velocity: bullet.velocity,
          isDeleted: bullet.isDeleted,
          date: bullet.date
        }))
      };
    }),
    asteroids: asteroids
      .map((asteroid: IAsteroid): {vertices: IPoint[]} => ({
        vertices: asteroid.vertices.map((v: IPoint): IPoint => ({x: v.x, y: v.y}))
      })),
    explosions: explosions.map((explosion: IExplosion) => ({
      position: explosion.position,
      radius: explosion.radius
    }))
  };
}
