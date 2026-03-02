# Discord Webhook Setup Guide

Discord webhooks are the easiest way to receive evaluation submissions in real-time.

## Step 1: Create Discord Server & Channel

1. **Create a Discord Server:**
   - Open Discord
   - Click "+" to create server
   - Choose "Create My Own" → "For me and my friends"
   - Name it "Chart Evaluations"

2. **Create a Channel:**
   - Right-click in your server
   - "Create Channel" → "Text Channel"
   - Name it "evaluation-submissions"

## Step 2: Create Webhook

1. **Go to Channel Settings:**
   - Right-click on your "evaluation-submissions" channel
   - Click "Edit Channel"

2. **Create Webhook:**
   - Go to "Integrations" tab
   - Click "Create Webhook"
   - Name it "Evaluation Bot"
   - Copy the Webhook URL

## Step 3: Add to Netlify

1. **Open Netlify Dashboard:**
   - Go to your site
   - Site settings → Environment variables

2. **Add Environment Variable:**
   - Key: `DISCORD_WEBHOOK_URL`
   - Value: Your webhook URL (paste the copied URL)
   - Click "Save"

3. **Redeploy:**
   - Go to Deploys tab
   - Click "Trigger deploy" → "Deploy site"

## Step 4: Test

1. **Submit an evaluation** on your live site
2. **Check Discord channel** - you should see a message with the evaluation data

## Example Discord Message

```
New evaluation submitted:
{
  "pairId": "pair_123",
  "evaluation": {
    "chartA": {
      "readable": { "yes": true, "no": false },
      "precision": { "yes": false, "no": true }
    },
    "chartB": {
      "readable": { "yes": true, "no": false },
      "precision": { "yes": true, "no": false }
    },
    "overallPreference": "Chart B"
  },
  "timestamp": "2026-03-02T10:30:00.000Z",
  "sessionId": "session_1709374200_abc123"
}
```

## Advanced: Webhook Customization

Edit `netlify/functions/submit-evaluation.js` to customize the Discord message:

```javascript
// Custom Discord message format
const discordMessage = {
  embeds: [{
    title: "📊 New Chart Evaluation",
    color: 0x00ff00, // Green color
    fields: [
      {
        name: "Pair ID",
        value: data.pairId,
        inline: true
      },
      {
        name: "Overall Preference",
        value: data.evaluation.overallPreference || "Not specified",
        inline: true
      },
      {
        name: "Chart A - Readable",
        value: data.evaluation.chartA.readable.yes ? "✅ Yes" : "❌ No",
        inline: true
      },
      {
        name: "Chart A - Precise",
        value: data.evaluation.chartA.precision.yes ? "✅ Yes" : "❌ No",
        inline: true
      },
      {
        name: "Chart B - Readable",
        value: data.evaluation.chartB.readable.yes ? "✅ Yes" : "❌ No",
        inline: true
      },
      {
        name: "Chart B - Precise",
        value: data.evaluation.chartB.precision.yes ? "✅ Yes" : "❌ No",
        inline: true
      }
    ],
    timestamp: new Date().toISOString()
  }]
};

await hook.send(discordMessage);
```

This will create a nicely formatted embed instead of plain text.