const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const validatePayload = require('../utils/validate');

const dataPath = path.join(__dirname, '../data/payloads.json');

// Helper to load and save data
const loadData = () => fs.existsSync(dataPath) ? JSON.parse(fs.readFileSync(dataPath)) : [];
const saveData = (data) => fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

// POST: Save new payload
app.post('/data', (req, res) => {
    const newData = req.body;
  
    if (Array.isArray(newData)) {
      newData.forEach(item => {
        item.id = idCounter++;
        data.push(item);
      });
    } else {
      newData.id = idCounter++;
      data.push(newData);
    }
  
    res.status(201).json({ message: 'Data added successfully', data });
  });
  

// GET: View all payloads
router.get('/', (req, res) => {
  try {
    const payloads = loadData();
    res.status(200).json({ message: 'Payloads retrieved', data: payloads });
  } catch (error) {
    res.status(500).json({ message: 'Error reading data', error: error.message });
  }
});

// PUT: Replace entire payload by identification_number
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const newPayload = req.body;
  const valid = validatePayload(newPayload);
  if (!valid.success) return res.status(400).json({ message: valid.message });

  const data = loadData();
  const index = data.findIndex(p => p.identification_number == id);
  if (index === -1) return res.status(404).json({ message: 'Payload not found' });

  data[index] = newPayload;
  saveData(data);

  res.status(200).json({ message: 'Payload updated (PUT)', data: newPayload });
});

// PATCH: Update partial data by identification_number
router.patch('/:id', (req, res) => {
  const id = req.params.id;
  const updates = req.body;

  const data = loadData();
  const index = data.findIndex(p => p.identification_number == id);
  if (index === -1) return res.status(404).json({ message: 'Payload not found' });

  data[index] = { ...data[index], ...updates };
  saveData(data);

  res.status(200).json({ message: 'Payload updated (PATCH)', data: data[index] });
});

// DELETE: Remove payload by identification_number
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  const data = loadData();
  const filtered = data.filter(p => p.identification_number != id);

  if (filtered.length === data.length) {
    return res.status(404).json({ message: 'Payload not found' });
  }

  saveData(filtered);
  res.status(200).json({ message: 'Payload deleted' });
});

module.exports = router;
