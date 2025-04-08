const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

let savedData = []; // In-memory storage

// Create
// POST: Add one or more data entries
app.post('/data', (req, res) => {
    const newData = req.body;
  
    if (Array.isArray(newData)) {
      // If multiple objects sent
      data.push(...newData);
    } else {
      // If single object sent
      data.push(newData);
    }
  
    res.status(201).json({ message: 'Data added successfully', data });
  });
  

// Read all
app.get('/estimate', (req, res) => {
  res.json(savedData);
});

// Update whole entry
app.put('/estimate/:index', (req, res) => {
  const index = parseInt(req.params.index);
  if (index >= 0 && index < savedData.length) {
    savedData[index] = req.body;
    res.json({ message: 'Data replaced successfully!' });
  } else {
    res.status(404).json({ message: 'Data not found' });
  }
});

// Partial update
app.patch('/estimate/:index', (req, res) => {
  const index = parseInt(req.params.index);
  if (index >= 0 && index < savedData.length) {
    savedData[index] = { ...savedData[index], ...req.body };
    res.json({ message: 'Data updated successfully!' });
  } else {
    res.status(404).json({ message: 'Data not found' });
  }
});

// Delete
app.delete('/estimate/:index', (req, res) => {
  const index = parseInt(req.params.index);
  if (index >= 0 && index < savedData.length) {
    savedData.splice(index, 1);
    res.json({ message: 'Data deleted successfully!' });
  } else {
    res.status(404).json({ message: 'Data not found' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
