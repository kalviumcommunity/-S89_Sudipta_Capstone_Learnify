import React, { useState } from 'react';

const PerformanceChart = ({ testHistory }) => {
  const [chartType, setChartType] = useState('accuracy');
  const [timeRange, setTimeRange] = useState('week');

  if (!testHistory || testHistory.length === 0) {
    return (
      <div className="performance-chart">
        <div className="chart-header">
          <h3>Performance Trends</h3>
        </div>
        <div className="no-data">
          <p>No test data available</p>
          <p>Take some tests to see your performance trends!</p>
        </div>
      </div>
    );
  }

  // Filter data based on time range
  const filterDataByTimeRange = (data) => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeRange) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      default:
        return data;
    }
    
    return data.filter(test => new Date(test.testDate) >= cutoffDate);
  };

  const filteredData = filterDataByTimeRange(testHistory);
  
  // Prepare chart data
  const chartData = filteredData.map((test, index) => ({
    index: index + 1,
    date: new Date(test.testDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    accuracy: test.accuracy,
    score: test.score,
    timeTaken: Math.round(test.timeTaken / 60), // Convert to minutes
    testType: test.testType
  }));

  // Calculate statistics
  const stats = {
    averageAccuracy: chartData.reduce((sum, test) => sum + test.accuracy, 0) / chartData.length,
    averageScore: chartData.reduce((sum, test) => sum + test.score, 0) / chartData.length,
    averageTime: chartData.reduce((sum, test) => sum + test.timeTaken, 0) / chartData.length,
    totalTests: chartData.length,
    mockTests: chartData.filter(test => test.testType === 'mocktest').length,
    dsaTests: chartData.filter(test => test.testType === 'dsa').length
  };

  // Simple bar chart component
  const BarChart = ({ data, dataKey, color, maxValue }) => {
    return (
      <div className="bar-chart">
        <div className="chart-bars">
          {data.map((item, index) => {
            const height = (item[dataKey] / maxValue) * 100;
            return (
              <div key={index} className="bar-container">
                <div 
                  className="bar" 
                  style={{ 
                    height: `${height}%`, 
                    backgroundColor: color,
                    minHeight: '2px'
                  }}
                  title={`${item.date}: ${item[dataKey]}${dataKey === 'accuracy' ? '%' : dataKey === 'timeTaken' ? 'm' : ''}`}
                ></div>
                <div className="bar-label">{item.date}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Line chart component (simplified)
  const LineChart = ({ data, dataKey, color }) => {
    const maxValue = Math.max(...data.map(item => item[dataKey]));
    const minValue = Math.min(...data.map(item => item[dataKey]));
    const range = maxValue - minValue || 1;

    return (
      <div className="line-chart">
        <svg width="100%" height="200" viewBox="0 0 400 200">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line 
              key={y} 
              x1="0" 
              y1={y * 2} 
              x2="400" 
              y2={y * 2} 
              stroke="#e0e0e0" 
              strokeWidth="1"
            />
          ))}
          
          {/* Data line */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            points={data.map((item, index) => {
              const x = (index / (data.length - 1)) * 380 + 10;
              const y = 180 - ((item[dataKey] - minValue) / range) * 160;
              return `${x},${y}`;
            }).join(' ')}
          />
          
          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 380 + 10;
            const y = 180 - ((item[dataKey] - minValue) / range) * 160;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={color}
                title={`${item.date}: ${item[dataKey]}`}
              />
            );
          })}
        </svg>
        
        <div className="chart-labels">
          {data.map((item, index) => (
            <span key={index} className="chart-label">
              {item.date}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const getChartColor = (type) => {
    switch (type) {
      case 'accuracy': return '#4CAF50';
      case 'score': return '#2196F3';
      case 'timeTaken': return '#FF9800';
      default: return '#9C27B0';
    }
  };

  const getMaxValue = (dataKey) => {
    switch (dataKey) {
      case 'accuracy': return 100;
      case 'score': return Math.max(...chartData.map(item => item.score));
      case 'timeTaken': return Math.max(...chartData.map(item => item.timeTaken));
      default: return 100;
    }
  };

  return (
    <div className="performance-chart">
      <div className="chart-header">
        <h3>Performance Trends</h3>

        <div className="chart-controls">
          <div className="control-group">
            <label>Metric</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="chart-select"
            >
              <option value="accuracy">Accuracy %</option>
              <option value="score">Score</option>
              <option value="timeTaken">Time Taken (min)</option>
            </select>
          </div>

          <div className="control-group">
            <label>Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="chart-select"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last 3 Months</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      <div className="chart-stats">
        <div className="stat-item">
          <span className="stat-label">Average Accuracy:</span>
          <span className="stat-value">{Math.round(stats.averageAccuracy)}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Average Score:</span>
          <span className="stat-value">{Math.round(stats.averageScore)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Average Time:</span>
          <span className="stat-value">{Math.round(stats.averageTime)}m</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Tests:</span>
          <span className="stat-value">{stats.totalTests}</span>
        </div>
      </div>

      <div className="chart-container">
        {chartData.length > 1 ? (
          <LineChart 
            data={chartData} 
            dataKey={chartType} 
            color={getChartColor(chartType)}
          />
        ) : (
          <BarChart 
            data={chartData} 
            dataKey={chartType} 
            color={getChartColor(chartType)}
            maxValue={getMaxValue(chartType)}
          />
        )}
      </div>

      <div className="chart-insights">
        <h4>Insights</h4>
        <div className="insights-list">
          {stats.averageAccuracy > 80 && (
            <div className="insight positive">
              Excellent accuracy! You're performing very well.
            </div>
          )}
          {stats.averageAccuracy < 50 && (
            <div className="insight warning">
              Consider reviewing topics where you're struggling.
            </div>
          )}
          {stats.mockTests > stats.dsaTests && (
            <div className="insight info">
              Try more DSA problems to balance your practice.
            </div>
          )}
          {stats.dsaTests > stats.mockTests && (
            <div className="insight info">
              Consider taking more mock tests for exam preparation.
            </div>
          )}
          {stats.averageTime < 30 && (
            <div className="insight positive">
              Great time management! You're solving problems efficiently.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
