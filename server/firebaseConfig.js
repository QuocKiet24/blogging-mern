import admin from "firebase-admin";
import fs from "fs";

// Đọc file JSON chứa thông tin service account
const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccountKey.json", "utf8")
);

// Khởi tạo Firebase Admin nếu chưa được khởi tạo
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
