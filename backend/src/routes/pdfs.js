import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import PDF from '../models/PDF.js';
import authMiddleware from '../middleware/authMiddleware.js';
import path from 'path';
import fs from 'fs';


const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}


const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
    }
})

const upload = multer({ storage });


router.post('/', authMiddleware, upload.single('pdfFile'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const newPDF = new PDF({
            uuid: uuidv4(),
            originalName: file.originalname,
            storedName: file.filename,
            user: req.user,
            uploadDate: new Date()
        });
        await newPDF.save();
        res.status(201).json({ message: 'File uploaded successfully', pdfId: newPDF.uuid });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
})


router.get('/', authMiddleware, async (req, res) => {
    try {
        const pdfs = await PDF.find({ user: req.user }).select('uuid originalName storedName');
        res.json(pdfs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
})

router.get('/:uuid', authMiddleware, async (req, res) => {
    try {
        const pdf = await PDF.findOne({ uuid: req.params.uuid, user: req.user });
        if (!pdf) {
            return res.status(404).json({ message: 'PDF not found' });
        }
        const filePath = path.join(process.cwd(), 'uploads', pdf.storedName);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${pdf.originalName}"`);
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
})


router.delete('/:uuid', authMiddleware, async (req, res) => {
    try {
        const pdf = await PDF.findOneAndDelete({ uuid: req.params.uuid, user: req.user });
        if (!pdf) {
            return res.status(404).json({ message: 'PDF not found' });
        }
        const pathToFile = path.join(process.cwd(), 'uploads', pdf.storedName);
        await fs.promises.unlink(pathToFile).catch(err => {
            console.error('Error deleting file from filesystem:', err);
        });
        res.status(200).json({ message: 'PDF and associated data deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
})


router.put('/:uuid', authMiddleware, async (req, res) => {
    try {
        const { uuid } = req.params;
        const { newName } = req.body;
        const pdf = await PDF.findOne({ uuid, user: req.user });
        if (!pdf) {
            return res.status(404).json({ message: 'PDF not found' });
        }
        pdf.originalName = newName;
        await pdf.save();
        res.status(200).json({ message: 'PDF renamed successfully', pdfId: pdf.uuid });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
})


export default router;