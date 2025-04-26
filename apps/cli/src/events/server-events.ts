import EventEmitter from "node:events";

class ServerEvents extends EventEmitter {
  start() {
    this.emit("start-server");
  }
  stop() {
    this.emit("stop-server");
  }
}

export const serverEvent = new ServerEvents();