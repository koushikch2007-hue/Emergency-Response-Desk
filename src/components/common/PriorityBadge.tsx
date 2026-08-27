import React from 'react';
import { Siren, AlertOctagon, AlertTriangle, Info } from 'lucide-react';
import { PriorityLevel } from '../../types';
import { PRIORITY_CONFIG } from '../../lib/utils';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md', showIcon = true }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low;

  const renderIcon = () => {
    switch (priority) {
      case 'critical':
        return <Siren className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />;
      case 'high':
        return <AlertOctagon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />;
      case 'medium':
        return <AlertTriangle className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />;
      default:
        return <Info className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />;
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-bold gap-1',
    md: 'px-2.5 py-1 text-xs font-extrabold gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm font-black gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border uppercase tracking-wider shadow-sm ${config.colorClass} ${sizeClasses[size]}`}
      role="status"
      aria-label={config.ariaLabel}
      title={config.ariaLabel}
    >
      {showIcon && renderIcon()}
      <span>{config.label}</span>
    </span>
  );
};
