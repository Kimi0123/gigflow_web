import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { verifyToken } from "./middlewares/auth.middleware";
import { sendMessage, verifyContractParty } from "./services/message.service";

let io: Server;

export const initSocketIO = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3005",
      credentials: true,
    },
  });

  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const payload = verifyToken(token);
      socket.data.userId = payload.sub;
      next();
    } catch (error) {
      next(new Error("Invalid or expired authentication token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId as string;

    socket.on(
      "join_contract",
      async (
        payload: { contractId: string },
        ack?: (response: { ok: boolean; error?: string }) => void
      ) => {
        try {
          const { contractId } = payload || {};
          await verifyContractParty(userId, contractId);
          socket.join(`contract:${contractId}`);
          if (typeof ack === "function") {
            ack({ ok: true });
          }
        } catch (err: any) {
          const message =
            err.message || "You are not a party to this contract";
          socket.emit("error", { message });
          if (typeof ack === "function") {
            ack({ ok: false, error: message });
          }
        }
      }
    );

    socket.on(
      "send_message",
      async (payload: { contractId: string; content: string }) => {
        try {
          const { contractId, content } = payload || {};
          const message = await sendMessage(userId, contractId, { content });
          io.to(`contract:${contractId}`).emit("new_message", message);
        } catch (err: any) {
          socket.emit("error", {
            message: err.message || "Failed to send message",
          });
        }
      }
    );
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }
  return io;
};
