const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());

let savedData = []; // In-memory storage
let idCounter = 1;

// POST: Add one or multiple data entries
app.post('/data', (req, res) => {
  const newData = req.body;

  const assignId = (entry) => ({
    id: idCounter++,
    ...entry,
  });

  if (Array.isArray(newData)) {
    const entriesWithIds = newData.map(assignId);
    savedData.push(...entriesWithIds);
    res.status(201).json({ message: 'Multiple data entries added', data: entriesWithIds });
  } else {
    const entryWithId = assignId(newData);
    savedData.push(entryWithId);
    res.status(201).json({ message: 'Single data entry added', data: entryWithId });
  }
});

// GET: View all data
app.get('/data', (req, res) => {
  res.json(savedData);
});

// PUT: Replace entry completely
app.put('/data/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = savedData.findIndex(item => item.id === id);

  if (index !== -1) {
    savedData[index] = { id, ...req.body };
    res.json({ message: 'Data replaced successfully', data: savedData[index] });
  } else {
    res.status(404).json({ message: 'Data not found' });
  }
});

// PATCH: Update entry partially
app.patch('/data/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = savedData.findIndex(item => item.id === id);

  if (index !== -1) {
    savedData[index] = { ...savedData[index], ...req.body };
    res.json({ message: 'Data updated successfully', data: savedData[index] });
  } else {
    res.status(404).json({ message: 'Data not found' });
  }
});

// DELETE: Remove entry
app.delete('/data/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = savedData.findIndex(item => item.id === id);

  if (index !== -1) {
    const deleted = savedData.splice(index, 1);
    res.json({ message: 'Data deleted successfully', data: deleted[0] });
  } else {
    res.status(404).json({ message: 'Data not found' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
