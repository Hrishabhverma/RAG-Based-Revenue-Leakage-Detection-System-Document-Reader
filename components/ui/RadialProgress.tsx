import React from 'react';

interface RadialProgressProps {
  score: number;
}

export const RadialProgress: React.FC<RadialProgressProps> = ({ score }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 85) return '#2dd4bf'; // teal-400
    if (s >= 70) return '#38bdf8'; // lightBlue-400
    return '#f87171'; // red-400
  };

  const color = getColor(score);

  return (
    <div className="relative flex items-center justify-center h-24 w-24">
      <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 120 120">
        <circle
          className="text-slate-700"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <circle
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke={color}
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      <span className="absolute text-2xl font-bold" style={{ color: color }}>
        {score}
      </span>
    </div>
  );
};