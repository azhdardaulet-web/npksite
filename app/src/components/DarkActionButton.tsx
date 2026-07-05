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
        'bg-ash text-white text-sm font-medium rounded-button px-4 py-2.5',
        'border border-white/[0.12] hover:border-white/30 hover:bg-[#2a2a2a]',
        'transition-all duration-200',
        fullWidth && 'w-full',
        className
      )}
    >
      {children}
    </button>
  );
}
