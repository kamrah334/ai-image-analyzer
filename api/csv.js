export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { title, keywords } = req.body;
  const csv = `Title,Keywords\n"${title}","${keywords.join(', ')}"\n`;

  res.setHeader('Content-Disposition', 'attachment; filename=results.csv');
  res.setHeader('Content-Type', 'text/csv');
  res.status(200).send(csv);
}
