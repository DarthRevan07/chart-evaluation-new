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
    
    // Log the submission with image information
    console.log('Evaluation submission received:', {
      pairId: data.pairId,
      timestamp: data.timestamp,
      sessionId: data.sessionId,
      overallPreference: data.evaluation?.overallPreference,
      imageInfo: data.imageInfo
    });
    
    // Optional: Send to Discord webhook (replace with your webhook URL)
    if (process.env.DISCORD_WEBHOOK_URL) {
      const hook = new Webhook(process.env.DISCORD_WEBHOOK_URL);
      
      const discordMessage = {
        embeds: [{
          title: "📊 New Chart Evaluation Submitted",
          color: 0x00ff00,
          fields: [
            {
              name: "Pair ID",
              value: data.pairId || "Not specified",
              inline: true
            },
            {
              name: "Overall Preference", 
              value: data.evaluation?.overallPreference || "Not specified",
              inline: true
            },
            {
              name: "Session ID",
              value: data.sessionId || "Unknown",
              inline: true
            },
            {
              name: "Chart A Image",
              value: data.imageInfo?.chartA?.filename || "Unknown",
              inline: true
            },
            {
              name: "Chart B Image", 
              value: data.imageInfo?.chartB?.filename || "Unknown",
              inline: true
            },
            {
              name: "Chart A Readable",
              value: data.evaluation?.chartA?.readable?.yes ? "✅ Yes" : "❌ No",
              inline: true
            },
            {
              name: "Chart A Precise",
              value: data.evaluation?.chartA?.precision?.yes ? "✅ Yes" : "❌ No", 
              inline: true
            },
            {
              name: "Chart B Readable",
              value: data.evaluation?.chartB?.readable?.yes ? "✅ Yes" : "❌ No",
              inline: true
            },
            {
              name: "Chart B Precise",
              value: data.evaluation?.chartB?.precision?.yes ? "✅ Yes" : "❌ No",
              inline: true
            }
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: `From: ${data.url || 'Unknown URL'}`
          }
        }]
      };
      
      await hook.send(discordMessage);
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