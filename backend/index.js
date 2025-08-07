const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

const DEEP_AI_API_KEY = process.env.DEEP_AI_API_KEY;

// Image Analysis Endpoint
app.post('/api/analyze', upload.single('image'), async (req, res) => {
    const imagePath = req.file.path;

    try {
        const formData = new FormData();
        formData.append('image', fs.createReadStream(imagePath));
        // DeepAI Image Captioning
        const titleRes = await axios.post(
            'https://api.deepai.org/api/image-captioning',
            formData,
            {
                headers: {
                    'Api-Key': DEEP_AI_API_KEY,
                    ...formData.getHeaders(),
                },
            }
        );
        const title = titleRes.data.output || 'No title generated';

        // DeepAI DenseCap for keywords
        const tagsRes = await axios.post(
            'https://api.deepai.org/api/densecap',
            formData,
            {
                headers: {
                    'Api-Key': DEEP_AI_API_KEY,
                    ...formData.getHeaders(),
                },
            }
        );
        const keywords = tagsRes.data.output?.captions?.map(c => c.caption) || [];

        fs.unlinkSync(imagePath);
        res.json({ title, keywords });
    } catch (err) {
        fs.unlinkSync(imagePath);
        res.status(500).json({ error: 'Error analyzing image', details: err.message });
    }
});

// CSV Download Endpoint
app.post('/api/csv', (req, res) => {
    const { title, keywords } = req.body;
    const csv = `Title,Keywords\n"${title}","${keywords.join(', ')}"\n`;

    const filename = `result_${Date.now()}.csv`;
    const filepath = path.join(__dirname, filename);

    fs.writeFileSync(filepath, csv);

    res.download(filepath, filename, () => {
        fs.unlinkSync(filepath);
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
