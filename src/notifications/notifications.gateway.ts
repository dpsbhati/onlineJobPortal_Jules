import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:4200',
      'https://onlinejobportal.microlent.com',
      'https://navilands.vns360.gr',
    ], // add your actual frontend origin(s) here
    methods: ['GET', 'POST'],
    credentials: true, // allow credentials if your frontend sends them
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly userSockets = new Map<string, Set<string>>();

  emitNotificationToUsers(
    userIds: string[],
    eventName: string,
    data: any,
  ): void {
    userIds.forEach((userId) => {
      const socketIds = this.userSockets.get(userId);
      if (socketIds) {
        socketIds.forEach((socketId) => {
          this.server.to(socketId).emit(eventName, data);
        });
      }
    });
  }

  handleConnection(client: Socket, ...args: any[]) {
    const userId = client.handshake.query.userId as string;
    if (!userId) return;

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(client.id);
    console.log('client connected', client.id, 'userId:', userId);
  }

  handleDisconnect(client: Socket) {
    const userIdEntry = [...this.userSockets.entries()].find(([_, socketIds]) =>
      socketIds.has(client.id),
    );
    if (!userIdEntry) return;

    const [userId, socketIds] = userIdEntry;
    socketIds.delete(client.id);
    if (socketIds.size === 0) {
      this.userSockets.delete(userId);
    }
    console.log('client disconnected', client.id, 'userId:', userId);
  }
}
