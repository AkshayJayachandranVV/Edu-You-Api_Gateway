import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import config from '../../../../config/config';

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
    '0.0.0.0:4001',
    grpc.credentials.createInsecure()
);

export { userClient };




// 'eduyou-user-service:40001'