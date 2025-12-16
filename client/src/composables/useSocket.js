import { ref, onUnmounted } from "vue";
import { io } from "socket.io-client";

/**
 * Composable for Socket.IO connection management
 * @returns {Object} Socket instance and connection state
 */
export function useSocket() {
  const socket = ref(null);
  const isConnected = ref(false);

  /**
   * Initialize socket connection
   */
  function connect() {
    if (socket.value) return; // Already connected

    socket.value = io();

    socket.value.on("connect", () => {
      isConnected.value = true;
      console.log("Socket connected");
    });

    socket.value.on("disconnect", () => {
      isConnected.value = false;
      console.log("Socket disconnected");
    });
  }

  /**
   * Emit a socket event
   * @param {string} event - Event name
   * @param {*} data - Data to send (optional)
   */
  function emit(event, data) {
    if (socket.value && socket.value.connected) {
      socket.value.emit(event, data);
    } else {
      console.warn(`Cannot emit "${event}": socket not connected`);
    }
  }

  /**
   * Disconnect socket
   */
  function disconnect() {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
      isConnected.value = false;
    }
  }

  /**
   * Listen to a socket event
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  function on(event, handler) {
    if (socket.value) {
      socket.value.on(event, handler);
    }
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  function off(event, handler) {
    if (socket.value) {
      socket.value.off(event, handler);
    }
  }

  // Auto-cleanup on component unmount
  onUnmounted(() => {
    disconnect();
  });

  return {
    socket,
    isConnected,
    connect,
    disconnect,
    on,
    off,
    emit,
  };
}
