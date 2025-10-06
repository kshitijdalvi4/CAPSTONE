import mongoose from 'mongoose';

const mcqQuestionSchema = new mongoose.Schema({
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String, required: true },
  category: { type: String, enum: ['data-structure', 'algorithm', 'approach'], required: true },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  createdAt: { type: Date, default: Date.now }
});

const MCQQuestion = mongoose.model('MCQQuestion', mcqQuestionSchema);
export default MCQQuestion;