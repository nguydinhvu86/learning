import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // user_id -> socket_id

  handleConnection(client: Socket) {
    const token = client.handshake.query.token as string | undefined;
    if (token) {
      try {
        const decodedStr = Buffer.from(token, 'base64').toString('utf-8');
        const payload = JSON.parse(decodedStr);
        if (payload && payload.sub) {
          this.connectedUsers.set(payload.sub, client.id);
        } else {
          client.disconnect();
        }
      } catch (e) {
        client.disconnect();
      }
    } else {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
     for (const [userId, socketId] of this.connectedUsers.entries()) {
       if (socketId === client.id) {
         this.connectedUsers.delete(userId);
         break;
       }
     }
  }

  notifyUser(userId: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
       this.server.to(socketId).emit('newNotification', data);
    }
  }
}
