import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const USER_PROTO_PATH = path.resolve(__dirname, '../proto/user.proto');

const userPackageDefinition = protoLoader.loadSync(USER_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const userProtoDescription = grpc.loadPackageDefinition(userPackageDefinition) as any;

const userProto = userProtoDescription.user;

const userClient = new userProto.UserService(
    'eduyou-user-service:40001',
    grpc.credentials.createInsecure()
);

export { userClient };
