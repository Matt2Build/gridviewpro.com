const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  
  const { email, first_name, use_case } = req.body || {};
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'GridView Pro <onboarding@resend.dev>',
        to: email,
        subject: 'Your Free Crypto Research Templates',
        html: `<h1>Welcome!</h1><p>Hi ${first_name || 'there'},</p><p>Your templates:</p><ul><li><a href='https://gridviewpro.com/free-templates/templates/token-due-diligence.json'>Token Due Diligence</a></li><li><a href='https://gridviewpro.com/free-templates/templates/price-monitoring.json'>Price Monitoring</a></li><li><a href='https://gridviewpro.com/free-templates/templates/scam-detection.json'>Scam Detection</a></li></ul>`
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Resend error:', result);
      return res.status(500).json({ error: 'Email failed', details: result });
    }
    
    return res.status(200).json({ success: true, message: 'Email sent!', id: result.id });
    
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
};
