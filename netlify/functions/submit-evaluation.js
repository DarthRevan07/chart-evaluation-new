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
    
    // Store in Google Sheets
    if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
      try {
        await fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            pairId: data.pairId,
            sessionId: data.sessionId,
            overallPreference: data.evaluation?.overallPreference,
            chartA_readable: data.evaluation?.chartA?.readable?.yes ? 'Yes' : 'No',
            chartA_precise: data.evaluation?.chartA?.precision?.yes ? 'Yes' : 'No',
            chartB_readable: data.evaluation?.chartB?.readable?.yes ? 'Yes' : 'No',
            chartB_precise: data.evaluation?.chartB?.precision?.yes ? 'Yes' : 'No',
            chartA_image: data.imageInfo?.chartA?.filename,
            chartB_image: data.imageInfo?.chartB?.filename,
            full_data: JSON.stringify(data)
          })
        });
        console.log('Data sent to Google Sheets');
      } catch (error) {
        console.error('Failed to send to Google Sheets:', error);
      }
    }

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

    // Store in Airtable database
    if (process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID) {
      try {
        await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Evaluations`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: {
              'Timestamp': new Date().toISOString(),
              'Pair ID': data.pairId,
              'Session ID': data.sessionId,
              'Overall Preference': data.evaluation?.overallPreference,
              'Chart A Readable': data.evaluation?.chartA?.readable?.yes ? 'Yes' : 'No',
              'Chart A Precise': data.evaluation?.chartA?.precision?.yes ? 'Yes' : 'No',
              'Chart B Readable': data.evaluation?.chartB?.readable?.yes ? 'Yes' : 'No',
              'Chart B Precise': data.evaluation?.chartB?.precision?.yes ? 'Yes' : 'No',
              'Chart A Image': data.imageInfo?.chartA?.filename,
              'Chart B Image': data.imageInfo?.chartB?.filename,
              'Full JSON': JSON.stringify(data, null, 2)
            }
          })
        });
        console.log('Data sent to Airtable');
      } catch (error) {
        console.error('Failed to send to Airtable:', error);
      }
    }

    // Email the JSON data (using EmailJS or similar)
    if (process.env.EMAIL_WEBHOOK_URL) {
      try {
        await fetch(process.env.EMAIL_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: process.env.NOTIFICATION_EMAIL || 'your@email.com',
            subject: `New Chart Evaluation: ${data.pairId}`,
            text: JSON.stringify(data, null, 2)
          })
        });
        console.log('Evaluation emailed');
      } catch (error) {
        console.error('Failed to email evaluation:', error);
      }
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