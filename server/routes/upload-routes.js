import express from "express";
import { nanoid } from "nanoid";
import s3 from "../aws.js";

const router = express.Router();

const generateUploadURL = async () => {
  const date = new Date();
  const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

  return await s3.getSignedUrlPromise("putObject", {
    Bucket: "blog-website-mern-24",
    Key: imageName,
    Expires: 1000,
    ContentType: "image/jpeg",
  });
};

router.get("/get-upload-url", (req, res) => {
  generateUploadURL()
    .then((url) => {
      res.status(200).json({ uploadURL: url });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

export default router;
