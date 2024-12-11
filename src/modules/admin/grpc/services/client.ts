import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import config from '../../../../config/config';

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
    config.grpc_admin_url,
    grpc.credentials.createInsecure()
);

export { adminClient };




 ""