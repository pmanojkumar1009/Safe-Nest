import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, trend, subtitle }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'from-green-500 to-green-600 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    yellow: 'from-yellow-500 to-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    red: 'from-red-500 to-red-600 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    purple: 'from-purple-500 to-purple-600 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    indigo: 'from-indigo-500 to-indigo-600 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
  };

  const [gradientColor, bgColor] = colorClasses[color as keyof typeof colorClasses].split(' ');

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-12 h-12 bg-gradient-to-r ${gradientColor} rounded-xl flex items-center justify-center shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
              {trend && (
                <div className="flex items-center mt-1">
                  <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500 ml-1">vs last month</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;