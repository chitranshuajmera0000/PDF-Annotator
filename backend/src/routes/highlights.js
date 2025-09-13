import express from 'express';
import Highlight from '../models/Highlight.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
    const { pdfId, pageNumber, color, text, position } = req.body;
    const exists = await Highlight.findOne({
        user: req.user,
        pdfId,
        pageNumber,
        color,
        text,
        position
    });
    if (exists) {
        return res.status(409).json({ message: 'Duplicate highlight' });
    }
    try {
        const newHighlight = new Highlight({
            pdfId, pageNumber, text, color, position, user: req.user
        });
        await newHighlight.save();
        res.status(201).json({ message: 'Highlight created successfully', highlight: newHighlight });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
})


router.get('/:pdfId', authMiddleware, async (req, res) => {
    try {
        const highlights = await Highlight.find({ pdfId: req.params.pdfId, user: req.user });
        res.json(highlights);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
})

router.put('/:id', authMiddleware, async (req, res) => {
    try{
        const {note}  = req.body;
        const highlight = await Highlight.findOneAndUpdate(
            { _id: req.params.id, user: req.user },
            { note },
            { new: true }
        );
        if (!highlight) {
            return res.status(404).json({ message: 'Highlight not found' });
        }
        return res.status(200).json({ message: 'Highlight updated successfully', highlight });
    }catch(err){
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
})


router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const highlight = await Highlight.findOneAndDelete({ _id: req.params.id, user: req.user });

        if (!highlight) {
            return res.status(404).json({ message: 'Highlight not found' });
        }
        return res.status(200).json({ message: 'Highlight deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
})


export default router;