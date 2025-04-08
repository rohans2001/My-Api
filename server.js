const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

let data = [];
let idCounter = 1;

app.post('/data', (req, res) => {
  const newEntry = req.body;

  if (!newEntry.name || !newEntry.class || !newEntry.date) {
      return res.status(400).json({ message: 'Name, class, and date are required.' });
  }

  const student = {
      id: idCounter++,
      name: newEntry.name,
      class: newEntry.class,
      date: newEntry.date,
  };

  data.push(student);
  res.status(201).json(student);
});


// GET: View all students
app.get('/data', (req, res) => {
  res.json(data);
});

// PUT: Replace student data by ID
app.put('/data/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, class: studentClass } = req.body;
  const index = data.findIndex((student) => student.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }

  data[index] = { id, name, class: studentClass };
  res.json({ message: 'Student updated', student: data[index] });
});

// PATCH: Partially update student data
app.patch('/data/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const student = data.find((s) => s.id === id);

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  Object.assign(student, req.body);
  res.json({ message: 'Student partially updated', student });
});

// DELETE: Remove student by ID
app.delete('/data/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = data.findIndex((student) => student.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const deleted = data.splice(index, 1);
  res.json({ message: 'Student deleted', student: deleted[0] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
