import { cn } from '@/lib/utils';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

export function PrimaryButton({ children, onClick, className, fullWidth, type = 'button', disabled }: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-magnetic
      className={cn(
        'bg-red hover:bg-red-dark text-white font-medium text-[15px] rounded-pill px-7 py-3.5 min-h-[48px] transition-colors duration-200',
        'active:scale-[0.97]',
        'shadow-cta',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        fullWidth && 'w-full',
        className
      )}
    >
      {children}
    </button>
  );
}
