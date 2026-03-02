# Example JSON Submission Data

When a user submits an evaluation, the system now captures and sends comprehensive information including the actual image paths that were displayed. Here's an example of the JSON data structure:

```json
{
  "pairId": "table_1_variant_abc_vs_def",
  "evaluation": {
    "pairId": "table_1_variant_abc_vs_def",
    "metadata": {
      "dataset": "FIFA 18 Data",
      "table": "1"
    },
    "chartA": {
      "precision": {
        "yes": false,
        "no": true
      },
      "readable": {
        "yes": true,
        "no": false
      },
      "imagePath": "https://yourusername.github.io/chart-evaluation/run2_variants_parallel_organized/1/chart_variant_abc.png"
    },
    "chartB": {
      "precision": {
        "yes": true,
        "no": false
      },
      "readable": {
        "yes": true,
        "no": false
      },
      "imagePath": "https://yourusername.github.io/chart-evaluation/run2_variants_parallel_organized/1/chart_variant_def.png"
    },
    "overallPreference": "Chart B",
    "completed": true,
    "timestamp": "2026-03-02T10:45:00.000Z",
    "submittedAt": "2026-03-02T10:45:15.000Z",
    "displayedImages": {
      "chartA": "https://yourusername.github.io/chart-evaluation/run2_variants_parallel_organized/1/chart_variant_abc.png",
      "chartB": "https://yourusername.github.io/chart-evaluation/run2_variants_parallel_organized/1/chart_variant_def.png"
    }
  },
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "timestamp": "2026-03-02T10:45:15.000Z",
  "sessionId": "session_1709374500_xyz789",
  "url": "https://yourusername.github.io/chart-evaluation/evaluation.html",
  "imageInfo": {
    "chartA": {
      "src": "https://yourusername.github.io/chart-evaluation/run2_variants_parallel_organized/1/chart_variant_abc.png",
      "filename": "chart_variant_abc.png"
    },
    "chartB": {
      "src": "https://yourusername.github.io/chart-evaluation/run2_variants_parallel_organized/1/chart_variant_def.png", 
      "filename": "chart_variant_def.png"
    },
    "baseUrl": "https://yourusername.github.io/chart-evaluation"
  }
}
```

## Key Components:

### Image Tracking
- **`chartA.imagePath`** & **`chartB.imagePath`**: Full URLs of displayed images
- **`displayedImages`**: Backup copy of image URLs for compatibility
- **`imageInfo`**: Detailed breakdown with filenames and base URL

### Evaluation Data
- **Precision & Readability**: Yes/No responses for both charts
- **Overall Preference**: Final choice (Chart A, Chart B, or Both similar)
- **Timestamps**: When evaluation was started and submitted

### Session Information
- **`sessionId`**: Unique identifier per user session
- **`userAgent`**: Browser/device information
- **`url`**: Page URL where evaluation was completed

### Metadata
- **`pairId`**: Unique identifier for this specific chart comparison
- **`metadata`**: Dataset and table information
- **`completed`**: Whether evaluation was fully submitted

## Discord Notification Example:

When submitted, Discord will receive a formatted message like:

```
📊 New Chart Evaluation Submitted

Pair ID: table_1_variant_abc_vs_def
Overall Preference: Chart B
Session ID: session_1709374500_xyz789

Chart A Image: chart_variant_abc.png
Chart B Image: chart_variant_def.png

Chart A Readable: ✅ Yes
Chart A Precise: ❌ No
Chart B Readable: ✅ Yes  
Chart B Precise: ✅ Yes

From: https://yourusername.github.io/chart-evaluation/evaluation.html
```

## Data Analysis Usage:

With this comprehensive data, you can analyze:

1. **Image Performance**: Which specific chart variants perform better
2. **User Patterns**: How users interact with different chart types
3. **Quality Metrics**: Readability vs precision trade-offs
4. **Session Analytics**: User engagement and completion rates
5. **Technical Debugging**: Track specific image load issues

## File Tracking:

The system now captures the exact files shown to users, enabling you to:
- Correlate responses with specific chart designs
- Identify problematic chart variants
- Track which images are most/least effective
- Reproduce exact user experiences for debugging