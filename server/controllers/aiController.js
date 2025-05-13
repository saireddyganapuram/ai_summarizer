const { getAIResponse } = require('../services/aiServices');

const getResponse = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }
        const response = await getAIResponse(content);
        res.status(200).json({ response });
    } catch (error) {
        console.error('Error in getResponse:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getResponse };
