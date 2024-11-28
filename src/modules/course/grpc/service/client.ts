import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import config from '../../../../config/config';

const COURSE_PROTO_PATH = path.resolve(__dirname, '../proto/course.proto');

const coursePackageDefinition = protoLoader.loadSync(COURSE_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const courseProtoDescription = grpc.loadPackageDefinition(coursePackageDefinition) as any;

const courseProto = courseProtoDescription.course;

const courseClient = new courseProto.CourseService(
    config.grpc_course_url,
    grpc.credentials.createInsecure()
);

export { courseClient };
