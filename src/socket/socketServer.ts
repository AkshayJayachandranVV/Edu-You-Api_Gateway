import { Server as SocketIOServer } from "socket.io";
import chatRabbitMqClient from "../modules/chat/rabbitMQ/client";
import userRabbitMqClient from "../modules/user/rabbitMQ/client";
import courseRabbitMqClient from "../modules/course/rabbitMQ/client";
import http from "http";
import { getS3SignedUrl } from "../s3SignedUrl/grtS3SignedUrl";

const rooms: { [key: string]: string[] } = {};
let roomId = ""
let userId = ""


export const initializeSocket = (server: http.Server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    console.log(socket.handshake.query.userId,"handshake")

    if (typeof socket.handshake.query.userId === 'string') {
      socket.data.userId = socket.handshake.query.userId;
    } else {
      socket.data.userId = ''; // Assign a fallback if needed
    }



    console.log("-------------------userId",userId)
    // console.log("-------------------roomId",roomId)

    socket.on("joinRoom", (roomId: string) => {
      socket.join(roomId);
      roomId = roomId
      if (!rooms[roomId]) rooms[roomId] = [];
      if (!rooms[roomId].includes(socket.id)) rooms[roomId].push(socket.id);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    });

    socket.on(
      "sendMessage",
      async ({
        roomId,
        senderId,
        content,
      }: {
        roomId: string;
        senderId: string;
        content: string;
      }) => {
        console.log(
          `Message received on server. RoomId: ${roomId}, SenderId: ${senderId}, Content: ${content}`
        );

        try {
          const operation = "save-message";
          const message = { roomId, senderId, content };
          const response = await chatRabbitMqClient.produce(message, operation);

          interface ResponseType {
            _id: string;
            isRead: boolean;
          }

          console.log((response as ResponseType)._id);

          const responseId = (response as ResponseType)._id;

          const isRead = (response as ResponseType).isRead;

          // console.log(response, "-------------------nokiye response----------------------------------", response._id);

          const operation2 = "fetch-sender-data";
          const data = { senderId };
          const response2 = (await userRabbitMqClient.produce(
            data,
            operation2
          )) as any; // Type assertion here

          // console.log(response2,"--------responsie usre 99999")

          const operation3 = "notify-course-data";

          const response3 = (await courseRabbitMqClient.produce(
            { roomId },
            operation3
          )) as any; // Type assertion here

          // console.log(response3,"--------responsie usre 99999")

          const operation4 = "store-notification";
          const response4 = (await chatRabbitMqClient.produce(
            {
              message,
              username: response2.userData.username,
              coursename: response3.courseName,
              thumbnail: response3.thumbnail,
            },
            operation4
          )) as any; // Type assertion here

          // console.log(response4,"--------responsie stiring notification")

          if (response2.success) {
            // Get the S3 URL for profile_picture
            const profilePictureS3Key = response2.userData.profile_picture;

            if (profilePictureS3Key) {
              // Generate signed URL if profile_picture exists
              try {
                const signedProfilePictureUrl = await getS3SignedUrl(
                  profilePictureS3Key
                );
                // Update userData with the signed URL
                response2.userData.profile_picture = signedProfilePictureUrl;
              } catch (error) {
                console.error("Error generating signed URL:", error);
              }
            } else {
              // Handle cases where profile_picture is missing, e.g., set a default placeholder image
              response2.userData.profile_picture = "";
            }
          }

          // Check if the content needs to be converted to an S3 URL
          let finalContent = content;
          if (content.startsWith("uploads/")) {
            const signedUrl = await getS3SignedUrl(content);
            finalContent = signedUrl ?? content;
          }

          // Emit the message along with userData
          socket.to(roomId).emit("receiveMessage", {
            isRead: isRead,
            messageId: responseId,
            content: finalContent,
            userData: response2.userData,
          });

          socket.emit("messageRead", {
            isRead: isRead,
            messageId: responseId,
          });

          // Emit a notification to all members in the room (excluding the sender)
          socket.to("notifications").emit("receiveNotification", {
            senderId,
            notification: `${response2.userData.username} sent a new message in group ${response3.courseName}`,
          });
        } catch (error) {
          console.error("Error saving message:", error);
        }
      }
    );

    // New event to handle media sending
    socket.on(
      "sendMedia",
      async ({ roomId, senderId, mediaUrl, s3Key, mediaType }) => {
        console.log("Media sent:", {
          roomId,
          senderId,
          mediaUrl,
          s3Key,
          mediaType,
        });

        try {
          const operation = "save-media";
          // Include mediaType and s3Key in the mediaMessage to save in the database
          const mediaMessage = { roomId, senderId, mediaUrl, s3Key, mediaType };
          const response = await chatRabbitMqClient.produce(
            mediaMessage,
            operation
          );

          // Fetch the sender's data (username and profile picture) using RabbitMQ
          const operation2 = "fetch-sender-data";
          const data = { senderId };
          const response2 = (await userRabbitMqClient.produce(
            data,
            operation2
          )) as any; // Type assertion

          console.log(response2, "--------response user 99999");

          if (response2.success) {
            // Get the S3 URL for profile_picture
            const profilePictureS3Key = response2.userData.profile_picture;
            const signedProfilePictureUrl = await getS3SignedUrl(
              profilePictureS3Key
            );

            // Update userData with the signed URL
            response2.userData.profile_picture = signedProfilePictureUrl;
          }

          // Emit the media message along with userData
          socket.to(roomId).emit("receiveMedia", {
            mediaUrl,
            s3Key,
            mediaType,
            userData: response2.userData,
          });

          socket.to(roomId).emit("receiveNotification", {
            roomId,
            senderId,
            notification: `${response2.userData.username} sent a new message`,
          });
        } catch (error) {
          console.error("Error sending media:", error);
        }
      }
    );



    socket.on("readMessages", (roomId) => {
      try {
        console.log("Entered readMessages, broadcasting to room:", roomId);
        // Broadcast to other clients in the room that messages were read
        socket.broadcast.to(roomId).emit("messagesRead");
      } catch (error) {
        console.error("Error updating read status:", error);
      }
    });
    



    socket.on("typingStatus", ({ isTyping, username, roomId }) => {
      try {
        // Emit typing status with both isTyping and username to the room
        socket.to(roomId).emit("typingStatus", { isTyping, username });
      } catch (error) {
        console.error("Error sending typing status:", error);
      }
    });
    

    socket.on("readDisconnect", async (data) => {
      try {
          console.log(data,"kittinindoooooo")
      } catch (error) {
        console.error("Error updating read status:", error);
      }
    });



    socket.on("disconnect", async () => {
      console.log(`Client disconnected: ${socket.id}, UserId: ${socket.data.userId}`);

      try {
        const operation = "update-read-users";
        const result: any = await chatRabbitMqClient.produce({ userId: socket.data.userId }, operation);
        console.log("Result of update-read-users operation:", result);
      } catch (error) {
        console.error("Error in update-read-users operation:", error);
      }

      // Remove socket ID from rooms
      for (const roomId in rooms) {
        rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
        if (rooms[roomId].length === 0) {
          delete rooms[roomId];
        }
      }
    });
  });
};