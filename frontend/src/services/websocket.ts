// src/services/Websocket.ts

type MessageCallback = (data: any) => void;

class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private url: string = '';
  private messageListeners: MessageCallback[] = [];

  private constructor() {}

  // Singleton instance getter
  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  // Connect to the WebSocket server
  public connect(url: string): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket is already connected or connecting.');
      return;
    }

    this.url = url;
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log('✅ WebSocket Connected');
    };

    this.socket.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        console.log('📩 Received:', parsedData);
        // Notify all registered listeners (e.g., HomeScreen)
        this.messageListeners.forEach((listener) => listener(parsedData));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onerror = (error) => {
      console.error('❌ WebSocket Error:', error.message);
    };

    this.socket.onclose = (e) => {
      console.log('🔌 WebSocket Disconnected:', e.code, e.reason);
      this.socket = null;
    };
  }

  // Send a message to the server
  // Matches your backend expectation: { "type": "enqueue", "path": "..." }
  public sendMessage(type: string, payload: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, ...payload });
      this.socket.send(message);
    } else {
      console.warn('Cannot send message. WebSocket is not open.');
    }
  }

  // Register a callback to update UI when a message arrives
  public addListener(callback: MessageCallback): void {
    this.messageListeners.push(callback);
  }

  // Remove a callback
  public removeListener(callback: MessageCallback): void {
    this.messageListeners = this.messageListeners.filter((cb) => cb !== callback);
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export default WebSocketService.getInstance();