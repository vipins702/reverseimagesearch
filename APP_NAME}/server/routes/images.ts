import { Router } from 'express';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Here you would typically process the image and return results
    // For demo purposes, we return a mock response
    const mockResponse = {
        success: true,
        message: 'Image uploaded successfully.',
        data: {
            filename: req.file.filename,
            originalname: req.file.originalname,
            size: req.file.size,
        },
    };

    res.json(mockResponse);
});

export default router;