import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return undefined;
    }

    const socket = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", user.id);
    });

    socket.on("notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      toast(notification.title, { icon: "🔔" });
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const joinLeaderboard = (hackathonId) => {
    socketRef.current?.emit("joinLeaderboard", hackathonId);
  };

  const onLeaderboardUpdate = (callback) => {
    socketRef.current?.on("leaderboardUpdated", callback);
    return () => socketRef.current?.off("leaderboardUpdated", callback);
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, notifications, setNotifications, joinLeaderboard, onLeaderboardUpdate }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within a SocketProvider");
  return ctx;
};
