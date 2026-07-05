interface SectionHeaderProps {
  light?: string;
  bold: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeader({ light, bold, subtitle, centered = false, className = '' }: SectionHeaderProps) {
  return (
    <div className={`mb-10 ${centered ? 'text-center' : ''} ${className}`}>
      <h2 className="font-formular text-heading-md text-white">
        {light && <span className="font-light">{light} </span>}
        <span className="font-bold">{bold}</span>
      </h2>
      {subtitle && (
        <p className="mt-3 text-subheading font-light text-fog">{subtitle}</p>
      )}
    </div>
  );
}
