const { Webhook } = require('discord-webhook-node');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const data = JSON.parse(event.body);
    
    // Log the submission
    console.log('Evaluation submission received:', JSON.stringify(data, null, 2));
    
    // Optional: Send to Discord webhook (replace with your webhook URL)
    if (process.env.DISCORD_WEBHOOK_URL) {
      const hook = new Webhook(process.env.DISCORD_WEBHOOK_URL);
      await hook.send(`New evaluation submitted:\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``);
    }
    
    // Optional: Send email via EmailJS or similar service
    // You can add email sending logic here
    
    // Store in a simple database (you can use FaunaDB, Airtable, or Google Sheets)
    // Example with webhook to external service:
    if (process.env.WEBHOOK_URL) {
      await fetch(process.env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          data: data
        })
      });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Evaluation submitted successfully',
        timestamp: new Date().toISOString()
      }),
    };

  } catch (error) {
    console.error('Error processing submission:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to process submission',
        details: error.message 
      }),
    };
  }
};