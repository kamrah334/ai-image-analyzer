const formidable = require('formidable');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Form parse error' });

    const file = files.image;
    const DEEP_AI_API_KEY = process.env.DEEP_AI_API_KEY;

    try {
      const data = fs.readFileSync(file.filepath);
      const fd = new FormData();
      fd.append('image', data, file.originalFilename);

      // Caption
      const titleRes = await axios.post(
        'https://api.deepai.org/api/image-captioning',
        fd,
        { headers: { 'Api-Key': DEEP_AI_API_KEY, ...fd.getHeaders() } }
      );
      const title = titleRes.data.output || 'No title generated';

      // Keywords
      const fd2 = new FormData();
      fd2.append('image', data, file.originalFilename);
      const tagsRes = await axios.post(
        'https://api.deepai.org/api/densecap',
        fd2,
        { headers: { 'Api-Key': DEEP_AI_API_KEY, ...fd2.getHeaders() } }
      );
      const keywords = tagsRes.data.output?.captions?.map(c => c.caption) || [];

      res.status(200).json({ title, keywords });
    } catch (e) {
      res.status(500).json({ error: 'DeepAI error', details: e.message });
    }
  });
};
