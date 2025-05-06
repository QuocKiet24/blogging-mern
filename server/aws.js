import aws from "aws-sdk";

const s3 = new aws.S3({
  region: "ap-southeast-2",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export default s3;
