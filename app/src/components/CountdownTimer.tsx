import { useCountdown } from '@/hooks/useCountdown';
import { ELECTION_DATE } from '@/lib/data';

export function CountdownTimer() {
  const { days, hours, minutes, seconds } = useCountdown(ELECTION_DATE);

  const blocks = [
    { value: days, label: 'ДНИ' },
    { value: hours, label: 'ЧАСОВ' },
    { value: minutes, label: 'МИНУТ' },
    { value: seconds, label: 'СЕКУНД' },
  ];

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {blocks.map((block, index) => (
        <div key={block.label} className="flex items-center gap-2 sm:gap-3">
          <div className="bg-ash rounded-countdown px-3 sm:px-5 py-3 sm:py-4 text-center min-w-[60px] sm:min-w-[80px]">
            <div className="text-[28px] sm:text-display-sm font-bold text-red tabular-nums leading-none">
              {String(block.value).padStart(2, '0')}
            </div>
            <div className="text-caption font-medium text-steel uppercase tracking-[0.08em] mt-1.5">
              {block.label}
            </div>
          </div>
          {index < blocks.length - 1 && (
            <span className="text-[24px] sm:text-[32px] font-light text-red/50 animate-blink hidden sm:block">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
