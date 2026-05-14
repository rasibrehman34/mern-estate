import Listing from "../models/listing.model.js"
import cloudinary from '../utils/cloudinary.js';
import { errorHandler } from "../utils/error.js";

export const createListing = async (req, res, next) => {
    try {
        const listing = await Listing.create(req.body)
        return res.status(200).json(listing);

    } catch (error) {
        next(error)
    }

}

export const uploadListingImage = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        const result = await cloudinary.uploader.upload(dataURI, {
            folder: "mern-estate/listings",
            resource_type: "auto"
        });

        res.status(200).json({
            success: true,
            imageUrl: result.secure_url,
            public_id: result.public_id
        });
    } catch (error) {
        next(error);
    }
};

export const deleteListing = async (req, res ,next) => {
    const listing = await Listing.findById(req.params.id );
    if(!listing) return next(errorHandler(404, "Listing not found!"));

    if(req.user.id !== listing.userRef){
        return next(errorHandler(401, 'ou can only delete your own listings!'))
    }

    try {
        await Listing.findByIdAndDelete(req.params.id)
        res.status(200).json('listing has been deleted!')
        
    } catch (error) {
        next(error)
        
    }
  
}

