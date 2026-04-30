import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { BASE_URL,SOCKET_BASE_URL } from '../api/auth';

// Single socket instance shared across the app
let socketInstance = null;

const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_BASE_URL, {
      transports: ['polling', 'websocket'],
      autoConnect: true,
    });
  }
  return socketInstance;
};

/**
 * useSocket — manages joining/leaving a room and receiving messages
 * @param {string|null} roomId   - active room _id
 * @param {function}    onMessage - callback(message) when a new message arrives
 */
export function useSocket(roomId, onMessage) {
  const socket = useRef(getSocket());
  const onMessageRef = useRef(onMessage);
  const currentRoomRef = useRef(null);

  // Keep callback ref fresh
  onMessageRef.current = onMessage;

  // Register the receive_message listener ONCE — never tear it down on room switch
  useEffect(() => {
    const s = socket.current;

    const handler = (msg) => {
      if (msg.room_id?.toString() === currentRoomRef.current?.toString()) {
        onMessageRef.current(msg);
      }
    };

    s.on('receive_message', handler);

    return () => {
      s.off('receive_message', handler);
    };
  }, []); // empty deps — runs once

  // Join/leave rooms separately
  useEffect(() => {
    if (!roomId) return;
    const s = socket.current;

    if (currentRoomRef.current && currentRoomRef.current !== roomId) {
      s.emit('leave_room', currentRoomRef.current);
    }

    currentRoomRef.current = roomId;
    s.emit('join_room', roomId);

    return () => {
      s.emit('leave_room', roomId);
      currentRoomRef.current = null;
    };
  }, [roomId]);

  const sendSocketMessage = useCallback(({ roomId, text, senderId, senderType }) => {
    socket.current.emit('send_message', { roomId, text, senderId, senderType });
  }, []);

  return { sendSocketMessage };
}