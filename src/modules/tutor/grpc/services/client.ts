import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import config from '../../../../config/config';

const TUTOR_PROTO_PATH = path.resolve(__dirname, '../proto/tutor.proto');

const tutorPackageDefinition = protoLoader.loadSync(TUTOR_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const tutorProtoDescription = grpc.loadPackageDefinition(tutorPackageDefinition) as any;

const userProto = tutorProtoDescription.tutor;

const tutorClient = new userProto.TutorService(
    config.grpc_tutor_url,
    grpc.credentials.createInsecure()
);

export { tutorClient };
