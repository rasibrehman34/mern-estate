import express from 'express'
import { createListing, uploadListingImage,deleteListing  } from '../controllers/listing.controller.js'
import { verifyToken } from '../utils/verifyUser.js'
import multer from 'multer'

const upload = multer({ storage: multer.memoryStorage() })

const router = express.Router()

router.post('/create', verifyToken, createListing)
router.post('/upload-image', verifyToken, upload.single('image'), uploadListingImage)
router.delete('/delete/:id', verifyToken, deleteListing)

export default router;