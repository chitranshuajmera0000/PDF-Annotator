import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema({
    uuid: { type: String, required: true, unique: true, index: true },
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploadDate: { type: Date, default: Date.now }
});

const PDF = mongoose.model('PDF', pdfSchema);
export default PDF;