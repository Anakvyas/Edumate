import mongoose from "mongoose"

const AnswerOptionSchema = new mongoose.Schema({
  option: { type: String, required: true },  
  label: { type: String, required: true }    
}, { _id: false });

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  answers: {
    type: [AnswerOptionSchema],
    required: true,
  },
  correctAnswer: { type: String, required: false},
  choosenAnswer:{type:String,required:false},
  explanation: { type: String, default: "" }
}, { _id: true }); 


const QuizSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  s3PdfKey: { type: String, required: false }, 
  questions: {
    type: [QuestionSchema], 
    required: false,
  }
}, { timestamps: true });

const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema);
export default Quiz;