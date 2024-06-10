import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageService } from './services/message.service';

@WebSocketGateway({
  namespace: 'chats',
  cors: {
    origin: [
      process.env.CLIENT_URL,
      process.env.LOCAL_URL,
      process.env.BASE_URL,
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messageService: MessageService) {}

  handleConnection(socket: Socket) {
    console.log(`on connect called:${socket.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() dto: SendMessageDto) {
    const message = await this.messageService.saveMessage(dto);

    this.server.to(dto.chatId).emit('receiveMessage', message);
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    socket.join(data.chatId);
  }
}
