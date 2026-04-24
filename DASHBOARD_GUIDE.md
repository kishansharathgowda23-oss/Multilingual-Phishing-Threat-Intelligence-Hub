# Dashboard Analytics Guide

## Overview

The PhishGuard AI Dashboard now includes comprehensive **analytics, graphs, comparisons, and performance metrics**. It provides visual insights into phishing detection patterns, model performance, and security trends.

## Dashboard Features

### 1. **Summary Statistics Cards**
Displays 6 key metrics at the top:
- **Total Analyzed**: Total number of items analyzed
- **Safe**: Count of safe items with percentage
- **Suspicious**: Count of suspicious items
- **Spam**: Count of spam items
- **Avg Confidence**: Average confidence score across all analyses
- **High Risk**: Count of high-risk detections

### 2. **Status Distribution (Pie Chart)**
Visual breakdown showing:
- Safe items (Green)
- Suspicious items (Yellow)
- Spam items (Red)

Shows the proportion of each detection type in your analysis history.

### 3. **Risk Level Distribution (Bar Chart)**
Compares the count of items across risk levels:
- **Low Risk** (Green)
- **Medium Risk** (Yellow)  
- **High Risk** (Red)

Helps identify your overall risk exposure.

### 4. **Performance Over Time (Line Chart)**
Tracks performance metrics over time including:
- **Average Confidence %**: How confident the models are
- **Safe Count**: Number of safe items detected
- **Risky Count**: Number of risky items detected

Shows trends to identify if detection accuracy is improving.

### 5. **Risk vs Confidence (Scatter Plot)**
Displays the relationship between:
- **X-axis**: Confidence % (how certain the model is)
- **Y-axis**: Risk Level (Low/Medium/High)
- **Color**: Detection status (Safe/Suspicious/Spam)

Helps identify if high-confidence predictions match risk levels.

### 6. **Model Performance Comparison (Bar Chart)**
Compares different ML models by:
- **Detection Rate %**: Accuracy of threat detection
- **Average Confidence %**: Average confidence score

Shows which models perform best.

### 7. **Detection Rate (Progress Bars)**
Shows overall statistics:
- **Safe Detection Rate**: % of items detected as safe
- **Threat Detection Rate**: % of items detected as risky
- **Total Items**: Total analyzed

### 8. **Analysis Methods Summary (Table)**
Lists all models/methods used with:
- **Method Name**: Type of detector used
- **Count**: How many items used this method
- **Accuracy**: Detection accuracy percentage

## Tab Navigation

### Analytics Tab
Shows all graphs and visualizations:
- Pie charts for distribution
- Bar charts for comparison
- Line charts for trends
- Scatter plots for relationships
- Summary tables

### Table Tab
Traditional data view showing:
- Content preview
- Status (Safe/Suspicious/Spam)
- Risk level
- Confidence percentage
- Timestamp

## How to Use the Dashboard

### Viewing Analytics
1. Go to the **Dashboard** section
2. Click the **Analytics & Graphs** tab
3. Scroll through all visualizations
4. Hover over charts to see detailed values

### Analyzing Trends
1. Check **Performance Over Time** to see if accuracy is improving
2. Review **Risk vs Confidence** to validate model predictions
3. Compare **Model Performance** to identify best detectors

### Identifying Patterns
1. Use **Status Distribution** to see what threats are most common
2. Check **Risk Level Distribution** for risk exposure
3. Review **Detection Rate** to measure overall safety

### Monitoring Performance
1. Track **Average Confidence** over time
2. Compare different **Model Accuracies**
3. Review **Detection Rates** for completeness

## Charts Explained

### Pie Chart (Status Distribution)
```
Safe: 60% (Green slice)
Suspicious: 25% (Yellow slice)  
Spam: 15% (Red slice)
```
**Use for**: Understanding threat composition

### Bar Chart (Risk Distribution)
```
Low Risk: 50 items
Medium Risk: 30 items
High Risk: 20 items
```
**Use for**: Risk assessment and exposure

### Line Chart (Performance)
```
Shows 3 lines over time:
- Blue line: Average confidence %
- Green line: Safe detections
- Red line: Risky detections
```
**Use for**: Trend analysis and improvement tracking

### Scatter Plot (Risk vs Confidence)
```
Each dot = one analysis
X = Confidence score (0-100%)
Y = Risk level (Low/Medium/High)
Color = Detection status
```
**Use for**: Validating model predictions

### Model Comparison Chart
```
Blue bars: Detection accuracy %
Purple bars: Average confidence %
Compares different ML models
```
**Use for**: Model selection and optimization

## Key Metrics Explained

### Confidence Score
- **Meaning**: How certain the model is (0-100%)
- **High (>75%)**: Very confident prediction
- **Medium (40-75%)**: Moderately confident
- **Low (<40%)**: Low certainty

### Risk Level
- **High**: Strong indicators of phishing/spam
- **Medium**: Some suspicious patterns detected
- **Low**: Minimal threat indicators

### Detection Rate
- **Safe Rate**: Correctly identified safe items
- **Threat Rate**: Detected suspicious/spam items

## Performance Interpretation

### Good Performance Signs
- ✅ High confidence on high-risk items
- ✅ Low confidence on safe items
- ✅ Models showing >85% accuracy
- ✅ Increasing detection rate over time
- ✅ Consistent trends

### Warning Signs
- ⚠️ Low confidence on high-risk items
- ⚠️ High confidence on safe items  
- ⚠️ Models showing <70% accuracy
- ⚠️ Declining detection rates
- ⚠️ Inconsistent predictions

## Data Refresh

### Automatic Updates
- Dashboard **automatically fetches** latest history on load
- Click **🔄 Refresh** button to manually update
- Data comes from **last 100 analyses**

### Data Sources
- Historical analysis results
- ML model predictions
- Risk assessments
- Confidence scores
- Detection methods used

## Customization Tips

### Change Time Range
Modify `DashboardAnalytics.jsx` to adjust:
```javascript
// Currently shows last 20 items
const performanceData = history.slice(-20)

// Change to last 50:
const performanceData = history.slice(-50)
```

### Adjust Chart Colors
Edit colors in `DashboardAnalytics.jsx`:
```javascript
const COLORS = {
  Safe: '#10b981',      // Green
  Suspicious: '#f59e0b', // Yellow
  Spam: '#ef4444',      // Red
}
```

### Add New Charts
1. Import chart components from Recharts
2. Prepare data from history array
3. Add component to JSX
4. Style with Tailwind classes

## Performance Tips

### For Large Datasets
1. Limit history to **last 100 items** (default)
2. Use **table view** for raw data inspection
3. Filter by **date range** (can be added)
4. Use browser developer tools to check load time

### Optimize Charts
1. Charts use **ResponsiveContainer** for mobile
2. Debounced updates prevent re-rendering
3. Charts render only when data changes
4. Lazy load analytics tab (on click)

## Troubleshooting

### Charts Not Showing
1. Check if history data is loading
2. Verify data has required fields (status, risk, confidence)
3. Look for console errors in DevTools
4. Try refreshing the page

### Missing Data
1. Ensure analyses have been performed
2. Check if data is saved to localStorage/Firebase
3. Verify timestamp format is correct
4. Check if API is returning data

### Slow Performance
1. Reduce history limit (50 instead of 100)
2. Clear browser cache
3. Check for large dataset rendering
4. Profile with DevTools Performance tab

## Analytics API

The dashboard uses this data structure:

```javascript
{
  id: 'unique_id',
  content: 'analyzed text',
  status: 'Safe|Suspicious|Spam',
  risk: 'Low|Medium|High',
  confidence: 85, // 0-100
  timestamp: '2024-01-01T12:00:00Z',
  mlAnalysis: {
    models: ['DistilBERT', 'ELECTRA'],
    phishing: { confidence: 0.85 },
    spam: { confidence: 0.15 }
  }
}
```

## Advanced Features

### Export Data
Can be implemented to export as:
- CSV for spreadsheet analysis
- JSON for API integration
- PDF reports

### Filtered Views
Can add filters for:
- Date range selection
- Status type filtering
- Risk level filtering
- Model selection

### Alerts & Notifications
Can add to notify when:
- High-risk content detected
- Detection rate drops
- Models show low confidence
- Pattern anomalies detected

## Next Steps

1. ✅ **View dashboards** with your analysis history
2. ✅ **Monitor trends** over time
3. ✅ **Compare models** to identify best performers
4. ✅ **Validate predictions** with scatter plot
5. ✅ **Optimize settings** based on insights

## Resources

- [Recharts Documentation](https://recharts.org/)
- [React Performance Tips](https://react.dev/learn/render-and-commit)
- [Data Visualization Best Practices](https://www.interaction-design.org/literature/topics/data-visualization)

## Support

For dashboard issues:
1. Check browser console for errors
2. Verify data is being loaded
3. Test with sample data
4. Review component props in React DevTools
5. Check Recharts chart requirements
