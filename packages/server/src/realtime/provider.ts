import { EventEmitter } from 'events';

export interface RealtimeProvider {
  publish(channel: string, event: string, data: unknown): void;
  subscribe(channel: string, handler: (event: string, data: unknown) => void): void;
  unsubscribe(channel: string): void;
}

export class DevRealtimeProvider implements RealtimeProvider {
  private emitter = new EventEmitter();

  publish(channel: string, event: string, data: unknown) {
    this.emitter.emit(channel, event, data);
  }

  subscribe(channel: string, handler: (event: string, data: unknown) => void) {
    this.emitter.on(channel, handler);
  }

  unsubscribe(channel: string) {
    this.emitter.removeAllListeners(channel);
  }
}

export class RedisRealtimeProvider implements RealtimeProvider {
  constructor(private redisUrl: string) {}

  publish(_channel: string, _event: string, _data: unknown) {
    // Redis pub/sub stub
  }

  subscribe(_channel: string, _handler: (event: string, data: unknown) => void) {
    // Redis subscribe stub
  }

  unsubscribe(_channel: string) {
    // Redis unsubscribe stub
  }
}
