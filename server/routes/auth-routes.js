import express from "express";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import { getAuth } from "firebase-admin/auth";

import User from "../Schema/User.js";

const router = express.Router();
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

const formatDataToSend = (user) => {
  const access_token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  return {
    access_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
  };
};

const generateUsername = async (email) => {
  let username = email.split("@")[0];
  let isUsernameNotUnique = await User.exists({
    "personal_info.username": username,
  }).then((result) => result);

  isUsernameNotUnique ? (username += nanoid().substring(0, 5)) : "";

  return username;
};

router.post("/signup", async (req, res) => {
  try {
    let { fullname, email, password } = req.body;
    if (fullname.length < 3) {
      return res
        .status(403)
        .json({ error: "Fullname must be at least 3 letters long" });
    }
    if (!email.length) {
      return res.status(403).json({ error: "Email is required!" });
    }
    if (!emailRegex.test(email)) {
      return res.status(403).json({ error: "Email is invalid" });
    }
    if (!passwordRegex.test(password)) {
      return res.status(403).json({
        error:
          "Password should be 6 to 20 chacracters long with a numeric, 1 lowercase and 1 uppercase letters",
      });
    }
    const hashed_password = await bcrypt.hash(password, 10);
    const username = await generateUsername(email);
    const user = new User({
      personal_info: {
        fullname,
        email,
        password: hashed_password,
        username,
      },
    });
    const savedUser = await user.save();
    return res.status(200).json(formatDataToSend(savedUser));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "Email already exists" });
    }
    console.error(error.message);

    return res.status(500).json({ error: error.message });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ "personal_info.email": email });
    if (!user) {
      return res.status(403).json({ error: "Email not found" });
    }

    if (user.google_auth) {
      return res.status(403).json({
        error: "Account was created using google. Try logging with google",
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      user.personal_info.password
    );

    if (!isPasswordMatch) {
      return res.status(403).json({ error: "Incorrect email or password" });
    }

    return res.status(200).json(formatDataToSend(user));
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: error.message });
  }
});

router.post("/google-auth", async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token) {
      return res.status(400).json({ error: "Access token is required." });
    }

    const decodedUser = await getAuth().verifyIdToken(access_token);
    const { email, name, picture } = decodedUser;

    const profileImg = picture.replace("s96-c", "s384-c");

    let user = await User.findOne({ "personal_info.email": email }).select(
      "personal_info.fullname personal_info.username personal_info.profile_img google_auth"
    );

    if (user && !user.google_auth) {
      return res.status(403).json({
        error:
          "This email was registered without Google. Please use password login.",
      });
    }

    if (!user) {
      const username = await generateUsername(email);
      user = new User({
        personal_info: {
          fullname: name,
          email,
          username,
          profile_img: profileImg,
        },
        google_auth: true,
      });

      await user.save();
    }

    return res.status(200).json(formatDataToSend(user));
  } catch (error) {
    console.error("[Google Auth Error]:", error.message);
    return res
      .status(500)
      .json({ error: "Failed to authenticate with Google." });
  }
});

export default router;
