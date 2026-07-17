import { cn } from '@/lib/utils';

interface DarkActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
}

export function DarkActionButton({ children, onClick, className, fullWidth }: DarkActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'bg-surface-2 text-text-base text-sm font-medium rounded-button px-4 py-2.5',
        'border border-line hover:border-text-muted hover:bg-line',
        'transition-all duration-200',
        fullWidth && 'w-full',
        className
      )}
    >
      {children}
    </button>
  );
}
