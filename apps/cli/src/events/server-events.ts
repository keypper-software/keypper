import EventEmitter from "node:events";

class ServerEvents extends EventEmitter {
  start() {
    this.emit("start-server");
  }
  stop(token: string) {
    this.emit("stop-server", token);
  }
}

export const serverEvent = new ServerEvents();
