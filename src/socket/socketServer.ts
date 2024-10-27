import { Server as SocketIOServer } from 'socket.io';
import chatRabbitMqClient from '../modules/chat/rabbitMQ/client'; 
import http from 'http';
import { getS3SignedUrl } from '../s3SignedUrl/grtS3SignedUrl';

const rooms: { [key: string]: string[] } = {}; 

export const initializeSocket = (server: http.Server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on('joinRoom', (roomId: string) => {
      socket.join(roomId);
      if (!rooms[roomId]) rooms[roomId] = [];
      if (!rooms[roomId].includes(socket.id)) rooms[roomId].push(socket.id);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    });

    socket.on('sendMessage', async ({ roomId, senderId, content }: { roomId: string, senderId: string, content: string }) => {
      console.log(`Message received on server. RoomId: ${roomId}, SenderId: ${senderId}, Content: ${content}`);

      try {
        const operation = 'save-message';
        const message = { roomId, senderId, content };
        const response = await chatRabbitMqClient.produce(message, operation);

        let finalContent = content;
        if (content.startsWith('uploads/')) {
          const signedUrl = await getS3SignedUrl(content);
          finalContent = signedUrl ?? content;
        }

        socket.to(roomId).emit('receiveMessage', finalContent);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    // New event to handle media sending
    socket.on('sendMedia', async({ roomId, senderId, mediaUrl, s3Key, mediaType }) => {
      console.log('Media sent:', { roomId, senderId, mediaUrl, s3Key, mediaType });


      const operation = 'save-media';
        // Include mediaType and s3Key in the mediaMessage to save in the database
        const mediaMessage = { roomId, senderId, mediaUrl, s3Key, mediaType };
        const response = await chatRabbitMqClient.produce(mediaMessage, operation); // Pass s3Key and mediaType to RabbitMQ
  
      
      // Emit to the specific room to send the media to all users in that room
      socket.to(roomId).emit('receiveMedia', { mediaUrl, s3Key, mediaType });
    });
    
    
    

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      for (const roomId in rooms) {
        rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
        if (rooms[roomId].length === 0) {
          delete rooms[roomId];
        }
      }
    });
  });
};
