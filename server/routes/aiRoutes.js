const express = require('express');
const router = express.Router();
const pdfParse = require('pdf-parse'); 
const mammoth = require('mammoth'); 
const fetch = require('node-fetch');
const multer = require('multer');
const { getResponse } = require('../controllers/aiController');
const { getAIResponse } = require('../services/aiServices');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/response', getResponse);

router.post("/upload", upload.single("file"), async (req, res) => {
    
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
                // Add PowerPoint handling
                extractedData = await handlePowerPoint(file.buffer);
                break;
            case 'image/jpeg':
            case 'image/png':
                // Add image handling (OCR)
                extractedData = await handleImage(file.buffer);
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
            fetchedContent = await response.text();
        } else {
            return res.status(400).json({ 
                error: 'Unsupported content type. Only plain text and basic HTML are currently supported.' 
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


module.exports = router; 