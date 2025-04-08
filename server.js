const express = require('express');
const app = express();
const estimateRoutes = require('./routes/estimate');

app.use(express.json());
app.use('/estimate', estimateRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
