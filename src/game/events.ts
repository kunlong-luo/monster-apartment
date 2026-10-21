import * as Phaser from 'phaser';
import type ApartmentScene from './apartment-scene';

type ApartmentEventMap = {
  'room-picked': (index: number) => void;
  'scene-ready': (scene: ApartmentScene) => void;
};

/**
 * Phaser scenes are plain classes, so React talks to them through this typed bus
 * instead of touching scene internals. Keeps the canvas component a thin adapter.
 */
class ApartmentEventBus {
  private readonly emitter = new Phaser.Events.EventEmitter();

  on<K extends keyof ApartmentEventMap>(event: K, handler: ApartmentEventMap[K]): void {
    this.emitter.on(event, handler);
  }

  off<K extends keyof ApartmentEventMap>(event: K, handler: ApartmentEventMap[K]): void {
    this.emitter.off(event, handler);
  }

  emit<K extends keyof ApartmentEventMap>(event: K, ...args: Parameters<ApartmentEventMap[K]>): void {
    this.emitter.emit(event, ...args);
  }
}

export const apartmentEvents = new ApartmentEventBus();
