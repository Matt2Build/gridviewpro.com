export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { email, first_name, use_case } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }
  
  try {
    // 1. Send welcome email with templates via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'GridView Pro <onboarding@resend.dev>',
        to: email,
        subject: 'Your Free Crypto Research Templates 🎁',
        html: `
          <h1>Welcome to GridView Pro!</h1>
          <p>Hi ${first_name || 'there'},</p>
          <p>Thanks for downloading the free templates. Here's what you're getting:</p>
          <ul>
            <li>🔍 <strong>Token Due Diligence</strong> — DexScreener + Etherscan + RugCheck + Twitter</li>
            <li>📊 <strong>Price Monitoring</strong> — CoinGecko + CMC + TradingView + News</li>
            <li>🛡️ <strong>Scam Detection</strong> — RugCheck + Etherscan + Token Sniffer + BscScan</li>
          </ul>
          <h3>Download your templates:</h3>
          <p><a href="https://gridviewpro.com/free-templates/templates/token-due-diligence.json" download>Download Token Due Diligence</a></p>
          <p><a href="https://gridviewpro.com/free-templates/templates/price-monitoring.json" download>Download Price Monitoring</a></p>
          <p><a href="https://gridviewpro.com/free-templates/templates/scam-detection.json" download>Download Scam Detection</a></p>
          <h3>How to use:</h3>
          <ol>
            <li><a href="https://apps.apple.com/app/gridview-pro/id6758865330">Download GridView Pro</a> from Mac App Store</li>
            <li>Import templates (File → Import)</li>
            <li>Click any template to load instantly</li>
            <li>Try Smart Detection (Cmd+Shift+G on any crypto address)</li>
          </ol>
          <p>Questions? Reply to this email.</p>
          <p>Happy researching!<br>Matt<br>GridView Pro</p>
        `
      })
    });
    
    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error('Resend error:', error);
      // Don't fail the request, just log it
    } else {
      console.log('Email sent to:', email);
    }
    
    // 2. Store in simple JSON file (or database later)
    // For now, just log it
    console.log('New subscriber:', { email, first_name, use_case, timestamp: new Date().toISOString() });
    
    return res.status(200).json({ 
      success: true, 
      message: 'Check your email for templates!',
      email_sent: emailResponse.ok
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}
