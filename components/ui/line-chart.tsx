'use client';

import { useState, useMemo } from 'react';

interface DataPoint {
  label: string;
  shortLabel: string;
  clicks: number;
  timestamp: number;
  _id: string;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  showDots?: boolean;
  animate?: boolean;
  period: string;
}

export function LineChart({
  data,
  height = 300,
  showDots = true,
  animate = true,
  period,
}: LineChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const chartConfig = useMemo(() => {
    if (!data || data.length === 0) return null;

    const maxClicks = Math.max(...data.map((d) => d.clicks), 1);
    const minClicks = 0; // Always start from 0 for better visualization
    const padding = { top: 20, right: 40, bottom: 60, left: 60 };
    const chartWidth = Math.max(
      800,
      data.length * (period === '24h' ? 30 : period === '7d' ? 100 : 40)
    );
    const chartHeight = height;

    // Calculate points for the line
    const points = data.map((point, index) => {
      const x =
        padding.left +
        (index * (chartWidth - padding.left - padding.right)) /
          Math.max(data.length - 1, 1);
      const y =
        chartHeight -
        padding.bottom -
        ((point.clicks - minClicks) / (maxClicks - minClicks)) *
          (chartHeight - padding.top - padding.bottom);
      return { x, y, ...point };
    });

    // Create path for the line
    const pathData = points.reduce((path, point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${path} ${command} ${point.x} ${point.y}`;
    }, '');

    // Create area path for gradient fill
    const areaPath = `${pathData} L ${points[points.length - 1].x} ${
      chartHeight - padding.bottom
    } L ${points[0].x} ${chartHeight - padding.bottom} Z`;

    return {
      points,
      pathData,
      areaPath,
      maxClicks,
      minClicks,
      padding,
      chartWidth,
      chartHeight,
    };
  }, [data, height, period]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No data available for this period
      </div>
    );
  }

  if (!chartConfig) return null;

  const {
    points,
    pathData,
    areaPath,
    maxClicks,
    minClicks,
    padding,
    chartWidth,
    chartHeight,
  } = chartConfig;

  // Calculate how many labels to show based on period and screen size
  const getLabelInterval = () => {
    if (period === '24h') return Math.max(1, Math.floor(data.length / 12)); // Show ~12 labels max
    if (period === '7d') return 1; // Show all 7 days
    if (period === '30d') return Math.max(1, Math.floor(data.length / 10)); // Show ~10 labels max
    if (period === '90d') return Math.max(1, Math.floor(data.length / 15)); // Show ~15 labels max
    return 1;
  };

  const labelInterval = getLabelInterval();

  return (
    <div className="w-full overflow-x-auto">
      <svg
        width={chartWidth}
        height={chartHeight}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-full min-w-full"
        style={{ minWidth: `${chartWidth}px` }}
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.4" />
            <stop
              offset="50%"
              stopColor="rgb(59, 130, 246)"
              stopOpacity="0.2"
            />
            <stop
              offset="100%"
              stopColor="rgb(59, 130, 246)"
              stopOpacity="0.05"
            />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" />
            <stop offset="50%" stopColor="rgb(99, 102, 241)" />
            <stop offset="100%" stopColor="rgb(139, 92, 246)" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y =
            chartHeight -
            padding.bottom -
            ratio * (chartHeight - padding.top - padding.bottom);
          const value = Math.round(minClicks + ratio * (maxClicks - minClicks));
          return (
            <g key={index}>
              <line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.1"
                strokeWidth="1"
                strokeDasharray={ratio === 0 ? 'none' : '2,2'}
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-muted-foreground font-medium"
              >
                {value.toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* Vertical grid lines */}
        {points.map((point, index) => {
          if (index % labelInterval !== 0) return null;
          return (
            <line
              key={index}
              x1={point.x}
              y1={padding.top}
              x2={point.x}
              y2={chartHeight - padding.bottom}
              stroke="currentColor"
              strokeOpacity="0.05"
              strokeWidth="1"
            />
          );
        })}

        {/* Area fill */}
        <path
          d={areaPath}
          fill="url(#areaGradient)"
          className={animate ? 'animate-pulse' : ''}
        />

        {/* Main line */}
        <path
          d={pathData}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-sm"
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.2))',
          }}
        />

        {/* Data points */}
        {showDots &&
          points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r={hoveredPoint === index ? 8 : 5}
                fill="white"
                stroke="rgb(59, 130, 246)"
                strokeWidth="3"
                className="cursor-pointer transition-all duration-200 hover:stroke-width-4"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                }}
              />
              {hoveredPoint === index && (
                <g>
                  <rect
                    x={point.x - 40}
                    y={point.y - 45}
                    width="80"
                    height="30"
                    rx="6"
                    fill="rgb(15, 23, 42)"
                    stroke="rgb(59, 130, 246)"
                    strokeWidth="1"
                    style={{
                      filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
                    }}
                  />
                  <text
                    x={point.x}
                    y={point.y - 32}
                    textAnchor="middle"
                    className="text-xs fill-white font-bold"
                  >
                    {point.clicks.toLocaleString()}
                  </text>
                  <text
                    x={point.x}
                    y={point.y - 20}
                    textAnchor="middle"
                    className="text-xs fill-gray-300"
                  >
                    {point.label}
                  </text>
                </g>
              )}
            </g>
          ))}

        {/* X-axis labels */}
        {points.map((point, index) => {
          if (index % labelInterval !== 0) return null;
          return (
            <g key={index}>
              <text
                x={point.x}
                y={chartHeight - padding.bottom + 20}
                textAnchor="middle"
                className="text-xs fill-muted-foreground font-medium"
              >
                {point.shortLabel}
              </text>
              <text
                x={point.x}
                y={chartHeight - padding.bottom + 35}
                textAnchor="middle"
                className="text-xs fill-muted-foreground"
              >
                {period === '24h' ? '' : point.label.split(' ')[0]}
              </text>
            </g>
          );
        })}

        {/* Chart title */}
        <text
          x={chartWidth / 2}
          y={20}
          textAnchor="middle"
          className="text-sm fill-foreground font-semibold"
        >
          Click Trends - {period.toUpperCase()}
        </text>

        {/* Y-axis label */}
        <text
          x={20}
          y={chartHeight / 2}
          textAnchor="middle"
          className="text-xs fill-muted-foreground font-medium"
          transform={`rotate(-90, 20, ${chartHeight / 2})`}
        >
          Clicks
        </text>
      </svg>
    </div>
  );
}
