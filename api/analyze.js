const formidable = require('formidable');
const fs = require('fs').promises; // Use promises for non-blocking IO
const axios = require('axios');
const FormData = require('form-data');

export const config = { api: { bodyParser: false } };

export default async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  console.log('API called');

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ error: 'Form parse error', details: err.message });
    }

    // Debugging: Log fields and files (do not log file data in production)
    console.log('Fields:', fields);
    console.log('Files:', files);

    if (!files.image) {
      console.error('No image uploaded');
      return res.status(400).json({ error: 'No image uploaded.' });
    }

    const file = files.image;

    // Simple file type/size check (customize as needed)
    if (!file.mimetype?.startsWith('image/')) {
      console.error('Uploaded file is not an image:', file.mimetype);
      return res.status(400).json({ error: 'Uploaded file is not an image.' });
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      console.error('Uploaded file too large:', file.size);
      return res.status(400).json({ error: 'Uploaded file too large. Max size is 5MB.' });
    }

    const DEEP_AI_API_KEY = process.env.DEEP_AI_API_KEY;
    if (!DEEP_AI_API_KEY) {
      console.error('Missing DeepAI API Key');
      return res.status(500).json({ error: 'Missing DeepAI API Key' });
    }

    try {
      // Use async file read
      const data = await fs.readFile(file.filepath);
      const fd = new FormData();
      fd.append('image', data, file.originalFilename);

      // Debug: Log request info
      console.log('Sending image to DeepAI: image-captioning');

      // DeepAI API call for caption
      const titleRes = await axios.post(
        'https://api.deepai.org/api/image-captioning',
        fd,
        { headers: { 'Api-Key': DEEP_AI_API_KEY, ...fd.getHeaders() } }
      );
      console.log('DeepAI caption response:', titleRes.data);

      const title = titleRes.data.output || 'No title generated';

      // Keywords (densecap)
      const fd2 = new FormData();
      fd2.append('image', data, file.originalFilename);

      console.log('Sending image to DeepAI: densecap');
      const tagsRes = await axios.post(
        'https://api.deepai.org/api/densecap',
        fd2,
        { headers: { 'Api-Key': DEEP_AI_API_KEY, ...fd2.getHeaders() } }
      );
      console.log('DeepAI densecap response:', tagsRes.data);

      const keywords = tagsRes.data.output?.captions?.map(c => c.caption) || [];

      res.status(200).json({ title, keywords });
    } catch (e) {
      // Improved error logging
      if (e.response) {
        // DeepAI API error
        console.error('DeepAI API error:', e.response.status, e.response.data);
        return res.status(502).json({
          error: 'DeepAI API error',
          status: e.response.status,
          details: e.response.data,
        });
      } else if (e.code === 'ENOENT') {
        // File read error
        console.error('File read error:', e.message);
        return res.status(500).json({ error: 'File read error', details: e.message });
      } else {
        // Other errors
        console.error('Unexpected error:', e.message);
        return res.status(500).json({ error: 'Unexpected error', details: e.message });
      }
    }
  });
  fetch('/api/analyze', { ... })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      console.error('API Error:', data.error, data.details);
    }
  });
};
