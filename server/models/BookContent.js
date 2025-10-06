import mongoose from 'mongoose';

const bookContentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  chunks: [{
    topic: { type: String, required: true },
    content: { type: String, required: true },
    keywords: [{ type: String }],
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    chunkIndex: { type: Number, required: true }
  }],
  processed: { type: Boolean, default: false },
  processedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const BookContent = mongoose.model('BookContent', bookContentSchema);
export default BookContent;