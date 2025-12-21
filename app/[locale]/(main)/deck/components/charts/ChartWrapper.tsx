'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { motion } from 'framer-motion';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Default dark theme options
const defaultOptions: ChartOptions<'line' | 'bar' | 'doughnut' | 'pie'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: 'rgba(255, 255, 255, 0.8)',
        font: {
          family: 'Noto Sans KR, sans-serif',
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleColor: 'white',
      bodyColor: 'rgba(255, 255, 255, 0.8)',
      borderColor: 'rgba(168, 85, 247, 0.5)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      titleFont: {
        family: 'Noto Sans KR, sans-serif',
        weight: 'bold',
      },
      bodyFont: {
        family: 'Noto Sans KR, sans-serif',
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: 'rgba(255, 255, 255, 0.6)',
        font: {
          family: 'Noto Sans KR, sans-serif',
        },
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
    },
    y: {
      ticks: {
        color: 'rgba(255, 255, 255, 0.6)',
        font: {
          family: 'Noto Sans KR, sans-serif',
        },
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
};

interface ChartWrapperProps {
  delay?: number;
  className?: string;
  children: React.ReactNode;
}

export function ChartWrapper({
  delay = 0,
  className = '',
  children,
}: ChartWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 + delay }}
      className={`relative ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Line Chart Component
export function LineChart({
  data,
  options,
  height = 300,
}: {
  data: ChartData<'line'>;
  options?: ChartOptions<'line'>;
  height?: number;
}) {
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...options?.plugins,
    },
  } as ChartOptions<'line'>;

  return (
    <div style={{ height }}>
      <Line data={data} options={mergedOptions} />
    </div>
  );
}

// Bar Chart Component
export function BarChart({
  data,
  options,
  height = 300,
}: {
  data: ChartData<'bar'>;
  options?: ChartOptions<'bar'>;
  height?: number;
}) {
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...options?.plugins,
    },
  } as ChartOptions<'bar'>;

  return (
    <div style={{ height }}>
      <Bar data={data} options={mergedOptions} />
    </div>
  );
}

// Doughnut Chart Component
export function DoughnutChart({
  data,
  options,
  height = 300,
}: {
  data: ChartData<'doughnut'>;
  options?: ChartOptions<'doughnut'>;
  height?: number;
}) {
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    scales: undefined, // Doughnut doesn't use scales
    plugins: {
      ...defaultOptions.plugins,
      ...options?.plugins,
    },
  } as ChartOptions<'doughnut'>;

  return (
    <div style={{ height }}>
      <Doughnut data={data} options={mergedOptions} />
    </div>
  );
}

// Pie Chart Component
export function PieChart({
  data,
  options,
  height = 300,
}: {
  data: ChartData<'pie'>;
  options?: ChartOptions<'pie'>;
  height?: number;
}) {
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    scales: undefined,
    plugins: {
      ...defaultOptions.plugins,
      ...options?.plugins,
    },
  } as ChartOptions<'pie'>;

  return (
    <div style={{ height }}>
      <Pie data={data} options={mergedOptions} />
    </div>
  );
}

// Color Palette for Charts
export const chartColors = {
  purple: {
    main: 'rgb(168, 85, 247)',
    light: 'rgba(168, 85, 247, 0.2)',
    gradient: ['rgba(168, 85, 247, 0.8)', 'rgba(168, 85, 247, 0.1)'],
  },
  blue: {
    main: 'rgb(59, 130, 246)',
    light: 'rgba(59, 130, 246, 0.2)',
    gradient: ['rgba(59, 130, 246, 0.8)', 'rgba(59, 130, 246, 0.1)'],
  },
  green: {
    main: 'rgb(34, 197, 94)',
    light: 'rgba(34, 197, 94, 0.2)',
    gradient: ['rgba(34, 197, 94, 0.8)', 'rgba(34, 197, 94, 0.1)'],
  },
  red: {
    main: 'rgb(239, 68, 68)',
    light: 'rgba(239, 68, 68, 0.2)',
    gradient: ['rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0.1)'],
  },
  yellow: {
    main: 'rgb(234, 179, 8)',
    light: 'rgba(234, 179, 8, 0.2)',
    gradient: ['rgba(234, 179, 8, 0.8)', 'rgba(234, 179, 8, 0.1)'],
  },
  pink: {
    main: 'rgb(236, 72, 153)',
    light: 'rgba(236, 72, 153, 0.2)',
    gradient: ['rgba(236, 72, 153, 0.8)', 'rgba(236, 72, 153, 0.1)'],
  },
};

// Five Elements Colors
export const elementColors = {
  wood: 'rgb(34, 197, 94)', // 목 - Green
  fire: 'rgb(239, 68, 68)', // 화 - Red
  earth: 'rgb(234, 179, 8)', // 토 - Yellow
  metal: 'rgb(248, 250, 252)', // 금 - White
  water: 'rgb(59, 130, 246)', // 수 - Blue
};
