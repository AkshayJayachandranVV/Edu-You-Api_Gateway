import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const ADMIN_PROTO_PATH = path.resolve(__dirname, '../proto/admin.proto');

const adminPackageDefinition = protoLoader.loadSync(ADMIN_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const adminProtoDescription = grpc.loadPackageDefinition(adminPackageDefinition) as any;

const adminProto = adminProtoDescription.admin;

const adminClient = new adminProto.AdminService(
    '0.0.0.0:4003',
    grpc.credentials.createInsecure()
);

export { adminClient };
