require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Debug: Show MongoDB URI (Optional – comment out in production)
// console.log("MONGO_URI from env:", process.env.MONGO_URI);

// MongoDB Connection
mongoose.connect('mongodb+srv://admin:admin@studentdata.edgjrm2.mongodb.net/?retryWrites=true&w=majority&appName=studentdata', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Schema and Model
const studentSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  name: String,
  class: Number,
  date: String
}, {
  toJSON: {
    transform(doc, ret) {
      delete ret._id;
      delete ret.__v;
    }
  }
});

const Student = mongoose.model('Student', studentSchema);

// Helper: Auto-increment ID
async function getNextId() {
  const last = await Student.findOne().sort({ id: -1 });
  return last ? last.id + 1 : 1;
}

// API Routes
app.get('/data', async (req, res) => {
  const students = await Student.find().sort({ id: 1 });
  res.json(students);
});

app.post('/data', async (req, res) => {
  let data = req.body;
  if (!Array.isArray(data)) data = [data];

  const studentsToSave = [];
  for (let entry of data) {
    const id = await getNextId();
    studentsToSave.push({ id, ...entry });
  }

  try {
    const saved = await Student.insertMany(studentsToSave);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/data/:id', async (req, res) => {
  try {
    const updated = await Student.findOneAndUpdate({ id: +req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/data/:id', async (req, res) => {
  try {
    await Student.findOneAndDelete({ id: +req.params.id });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
