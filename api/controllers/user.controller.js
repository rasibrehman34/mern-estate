import cloudinary from '../utils/cloudinary.js';
import { errorHandler } from '../utils/error.js';
import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js'

export const test = (req, res) => {
    res.json({ message: "this is contoller", })
}

// Upload new image to Cloudinary
export const uploadProfileImage = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        // Convert the multer buffer to Base64 to send to Cloudinary safely
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        const result = await cloudinary.uploader.upload(dataURI, {
            folder: "mern-estate/avatars",
            resource_type: "auto"
        });
        // console.log(result)

        // Return URL and public_id to frontend
        res.status(200).json({
            success: true,
            imageUrl: result.secure_url,
            public_id: result.public_id
        });
    } catch (error) {
        next(error);
    }
};

// Delete old image using public_id
export const deleteProfileImage = async (req, res, next) => {
    try {
        const { public_id } = req.body;
        if (!public_id) return res.status(400).json({ success: false, message: 'public_id is required' });

        await cloudinary.uploader.destroy(public_id);

        res.status(200).json({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    if (req.user.id !== req.params.id) return next(errorHandler(401, 'you can only update your own account!'))
            
    try {
        if (req.body.password) {
            req.body.password = bcryptjs.hashSync(req.body.password, 10)
        }
        
            const updateUser = await User.findByIdAndUpdate(req.params.id, {
                $set: {
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password,
                    avatar: req.body.avatar,

                },
            

            }, { new: true });

            const { password, ...rest } = updateUser._doc;
            res.status(200).json(rest);
        }
     catch (error) {
        next(error)
    }

 }
