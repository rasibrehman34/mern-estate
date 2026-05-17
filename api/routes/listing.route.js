import express from 'express'
import { createListing, uploadListingImage,deleteListing, updateListing, getListing, getListings  } from '../controllers/listing.controller.js'
import { verifyToken } from '../utils/verifyUser.js'
import multer from 'multer'

const upload = multer({ storage: multer.memoryStorage() })

const router = express.Router()

router.post('/create', verifyToken, createListing)
router.post('/upload-image', verifyToken, upload.single('image'), uploadListingImage)
router.delete('/delete/:id', verifyToken, deleteListing)
router.post('/update/:id', verifyToken, updateListing)
router.get('/get/:id', getListing);
router.get('/get', getListings)

export default router;