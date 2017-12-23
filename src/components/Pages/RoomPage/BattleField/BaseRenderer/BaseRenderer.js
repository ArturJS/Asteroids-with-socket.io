import _ from 'lodash';

import * as entities from './entities';

class BaseRenderer {
  constructor() {
    this._entitiesMap = new Map();
    this._liveObjects = [];
  }

  registerEntity(entity) {
    const {type} = entity;

    if (this._entitiesMap.get(type)) {
      console.error(`Entity with type "${type}" already exists!`);
      return;
    }

    this._entitiesMap.set(type, entity);
  }

  registerLiveObject(liveObject) { // live objects only have initial data
    this._liveObjects.push(liveObject);
  }

  renderAll(ctx, entitiesData) {
    this._renderAllEntities(ctx, entitiesData);
    this._renderAllLiveObjects(ctx);
  }

  _renderAllEntities(ctx, entitiesData) {
    entitiesData.forEach(({type, data}) => {
      const entity = this._entitiesMap.get(type);

      if (!entity) {
        console.error(`Entity with type "${type}" does not exists!`);
        return;
      }

      entity.render(ctx, data);
    });
  }

  _renderAllLiveObjects(ctx) {
    this._liveObjects.forEach(liveObject => liveObject.render(ctx));
    this._removeDeadObjects();
  }

  _removeDeadObjects() {
    _.remove(this._liveObjects, liveObject => liveObject.isDead);
  }
}

export const baseRenderer = new BaseRenderer();

// register entities
_.values(entities).forEach(entity => baseRenderer.registerEntity(entity));
