import express from "express";
import {
  test,
  uploadProfileImage,
  deleteProfileImage,
  updateUser,
  deleteUser,
  getUserListings,
  getUser,
} from "../controllers/user.controller.js";
import multer from "multer";
import { verifyToken } from "../utils/verifyUser.js";

// Use memory storage to process image buffer without saving to local disk
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.get("/test", test);

// Map new upload and delete routes
router.post("/upload-image", upload.single("image"), uploadProfileImage);
router.delete("/delete-image", deleteProfileImage);

router.post("/update/:id", verifyToken, updateUser);
router.delete("/delete/:id", verifyToken, deleteUser);
router.get("/listings/:id", verifyToken, getUserListings);
router.get("/:id", verifyToken, getUser);

export default router;
