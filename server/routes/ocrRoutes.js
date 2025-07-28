const express = require('express');
const axios = require('axios');
const multer = require('multer');
const router = express.Router();

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });
const FormData = require('form-data');

// Route to send image to Python service
router.post('/extract', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('image', req.file.buffer, req.file.originalname);
    if (req.body.prompt) {
      formData.append('prompt', req.body.prompt);
    }

    // Send request to Python service
    const response = await axios.post('http://localhost:5001/extract', formData, {
      headers: formData.getHeaders(),
    });

    // Return response from Python service
    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

module.exports = router;