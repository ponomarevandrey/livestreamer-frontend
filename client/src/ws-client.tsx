import React, { createContext } from "react";
import ReconnectingWebSocket, { CloseEvent } from "reconnecting-websocket";

import { WSMsgEvent, WSMsgPayload } from "./types";
import { WS_SERVER_URL } from "./config/env";

type Callback = React.Dispatch<React.SetStateAction<any>>;
interface IWebSocketClient {
  bindToServerEvents: (eventName: WSMsgEvent, callback: Callback) => this;
  unbindFromServerEvents: (eventName: WSMsgEvent, callback: Callback) => void;
}

class WebSocketClient implements IWebSocketClient {
  private socket?: ReconnectingWebSocket;
  private callbacks?: { [key in WSMsgEvent]: Callback[] };

  constructor(url: string) {
    this.connect(url);
  }

  private connect(url: string) {
    this.socket = new ReconnectingWebSocket(url);
    this.callbacks = {} as { [key in WSMsgEvent]: Callback[] };

    this.socket.onopen = this.onOpen.bind(this);
    this.socket.onmessage = this.onMessage.bind(this);
    this.socket.onclose = this.onClose.bind(this);
  }

  private onOpen() {
    console.log("WS: [onopen]");
  }

  private onMessage(event: MessageEvent) {
    const { event: eventName, data: eventData } = JSON.parse(event.data);

    this.dispatch([eventName, eventData]);
  }

  private onClose(event: CloseEvent) {
    if (event.wasClean) {
      const { code, reason } = event;
      console.log(
        `WS: [onclose] Connection closed cleanly, code ${code} reason=${reason}`
      );
    } else {
      console.error(`WS: [onclose] Connection died`);
    }
  }

  private dispatch([eventName, eventData]: [WSMsgEvent, WSMsgPayload]) {
    const callbacksChain = this.callbacks?.[eventName];

    if (callbacksChain === undefined) return;
    for (let i = 0; i < callbacksChain.length; i++) {
      // console.log("executes callback in chain...");
      callbacksChain[i](eventData);
    }
  }

  bindToServerEvents(eventName: WSMsgEvent, callback: any): this {
    if (this.callbacks) {
      this.callbacks[eventName] = this.callbacks[eventName] || [];
      this.callbacks[eventName].push(callback);
      console.log("[bindToServerEvents]", this.callbacks);
      // make chainable
    }
    return this;
  }

  unbindFromServerEvents(eventName: WSMsgEvent, callback: any) {
    if (this.callbacks && !this.callbacks[eventName]) {
      console.log(
        "[unbindFromServerEvents] Can't unbind function which was not bound"
      );
      return;
    }

    if (this.callbacks) {
      this.callbacks[eventName] = this.callbacks[eventName].filter((f) => {
        return f !== callback;
      });
    }
  }

  send(eventName: WSMsgEvent, eventData: WSMsgPayload) {
    const payload = JSON.stringify([eventName, eventData]);
    this.socket?.send(payload);
    return this;
  }
}

function WebSocketProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  let wsClient: WebSocketClient | undefined;

  if (!wsClient) {
    console.log("CREATES NEW WS CLIENT");
    wsClient = new WebSocketClient(WS_SERVER_URL);
  }

  return (
    <WebSocketContext.Provider value={wsClient}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Use Context to make WebSocket object available from any component
const WebSocketContext = createContext<WebSocketClient | null>(null);

export { WebSocketProvider, WebSocketContext, IWebSocketClient };
