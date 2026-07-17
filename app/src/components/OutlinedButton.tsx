import { cn } from '@/lib/utils';

interface OutlinedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
  type?: 'button' | 'submit';
}

export function OutlinedButton({ children, onClick, className, fullWidth, type = 'button' }: OutlinedButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      data-magnetic
      className={cn(
        'bg-transparent text-text-base font-medium text-[15px] rounded-pill px-7 py-3.5 min-h-[48px]',
        'border-[1.5px] border-line hover:border-text-base hover:bg-surface-2',
        'transition-colors duration-200',
        fullWidth && 'w-full',
        className
      )}
    >
      {children}
    </button>
  );
}
