export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
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
    // 1. Create subscriber in Kit
    const subscriberResponse = await fetch('https://api.kit.com/v4/subscribers', {
      method: 'POST',
      headers: {
        'X-Kit-Api-Key': process.env.KIT_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email_address: email,
        first_name: first_name || '',
        fields: {
          use_case: use_case || 'not_specified',
          source: 'free_templates_landing'
        }
      })
    });
    
    if (!subscriberResponse.ok) {
      const error = await subscriberResponse.text();
      console.error('Kit API error:', error);
      return res.status(500).json({ error: 'Failed to create subscriber' });
    }
    
    const subscriberData = await subscriberResponse.json();
    const subscriberId = subscriberData.subscriber?.id;
    
    // 2. Add to Free Templates form (ID: 7566910)
    await fetch('https://api.kit.com/v4/forms/7566910/subscribers', {
      method: 'POST',
      headers: {
        'X-Kit-Api-Key': process.env.KIT_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email_address: email })
    });
    
    // 3. Add "Free Templates Download" tag (ID: 7223753)
    await fetch('https://api.kit.com/v4/tags/7223753/subscribers', {
      method: 'POST',
      headers: {
        'X-Kit-Api-Key': process.env.KIT_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email_address: email })
    });
    
    console.log('Successfully subscribed:', email, 'Subscriber ID:', subscriberId);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Check your email for templates!',
      subscriber_id: subscriberId
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
