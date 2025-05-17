const express = require('express');
const router = express.Router();
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fetch = require('node-fetch');
const multer = require('multer');
const { getResponse } = require('../controllers/aiController');
const { getAIResponse } = require('../services/aiServices');
const tutorService = require('../services/tutorService');
// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  // Removed file size limit to allow files of any size
  fileFilter: (_, file, cb) => {
    // Check accepted file types
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      // Accept file
      cb(null, true);
    } else {
      // Reject file
      cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
    }
  }
});

router.post('/response', getResponse);

// Middleware to handle multer errors
const handleMulterErrors = (err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    // Note: We've removed the file size limit, but keeping this check for future reference
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File upload error: The file is too large for the server to process.'
      });
    }
    return res.status(400).json({
      error: `Upload error: ${err.message}`
    });
  } else if (err) {
    // An unknown error occurred
    return res.status(400).json({
      error: err.message
    });
  }
  // No error occurred, continue
  next();
};

router.post("/upload", upload.single("file"), handleMulterErrors, async (req, res) => {
    console.log("Received file upload request");
    console.log("Request headers:", req.headers);
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    console.log("Request files:", req.files);

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
        let extractedData = '';
        const file = req.file;

        switch (file.mimetype) {
            case 'text/plain':
                extractedData = file.buffer.toString('utf-8');
                break;
            case 'application/pdf':
                const pdfData = await pdfParse(file.buffer);
                extractedData = pdfData.text;
                break;
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                const result = await mammoth.extractRawText({ buffer: file.buffer });
                extractedData = result.value;
                break;
            case 'application/vnd.ms-powerpoint':
            case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                // PowerPoint files are not currently supported
                return res.status(400).json({
                    error: 'PowerPoint files are not currently supported.'
                });
            case 'image/jpeg':
            case 'image/png':
                // For now, just use a placeholder text for images
                extractedData = `Image file: ${file.originalname}. This is a placeholder for image content.`;
                break;
            default:
                return res.status(400).json({
                    error: 'Unsupported file type.',
                    supportedTypes: [
                        'text/plain',
                        'application/pdf',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'application/vnd.ms-powerpoint',
                        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                        'image/jpeg',
                        'image/png'
                    ]
                });
        }

        if (!extractedData) {
            return res.status(400).json({ error: 'Failed to extract content from file.' });
        }

        const response = await getAIResponse(extractedData);
        res.json({ response });

    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({
            error: 'Failed to process the file and call the AI',
            details: error.message
        });
    }
});

router.post('/link', async (req, res) => {
    const { link } = req.body;
    console.log("Received link request with body:", req.body);

    if (!link) {
        return res.status(400).json({ error: 'Please provide a link in the request body.' });
    }

    try {
        const response = await fetch(link);

        if (!response.ok) {
            return res.status(response.status).json({
                error: `Failed to fetch content from the link: ${response.statusText}`
            });
        }

        const contentType = response.headers.get('content-type');
        let fetchedContent = '';

        if (contentType && contentType.includes('text/plain')) {
            fetchedContent = await response.text();
        } else if (contentType && contentType.includes('text/html')) {
            const htmlContent = await response.text();
            // Add HTML content processing if needed
            fetchedContent = htmlContent;
        } else {
            return res.status(400).json({
                error: 'Unsupported content type. Only plain text and HTML are supported.'
            });
        }

        if (!fetchedContent) {
            return res.status(200).json({
                message: 'No text content found at the provided link.'
            });
        }

        const linkResponse = await getAIResponse(fetchedContent);
        res.json({ response: linkResponse });

    } catch (error) {
        console.error('Error processing link:', error);
        res.status(500).json({
            error: 'Failed to process the link and call the AI.',
            details: error.message
        });
    }
});

// AI tutoring route for answering questions


router.post('/ask', async (req, res) => {
  try {
    const { question, aiContent } = req.body;
    if (!question || !aiContent) {
      return res.status(400).json({ error: 'Question and AI content are required.' });
    }

    const answer = await tutorService.generateAnswer(question, aiContent);
    res.json({ answer });
  } catch (error) {
    console.error('Error in /ask endpoint:', error);
    res.status(500).json({ error: 'Failed to process the request.' });
  }
});


module.exports = router;