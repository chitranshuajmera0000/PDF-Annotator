import mongoose from "mongoose";

const highlightSchema = new mongoose.Schema({
    pdfId: { type: String, required: true },
    pageNumber: { type: Number, required: true },
    position: { type: Object, required: true }, // { x1, y1, x2, y2 }
    color: { type: String, default: "yellow" },
    text: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    time: { type: Date, default: Date.now },
    note: { type: String, default: "" }
});
highlightSchema.index({ user: 1, pdfId: 1, pageNumber: 1, text: 1, position: 1 }, { unique: true });

const Highlight = mongoose.model('Highlight', highlightSchema);
export default Highlight;