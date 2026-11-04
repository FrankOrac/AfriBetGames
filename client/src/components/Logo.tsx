interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export default function Logo({ size = 'medium', showText = true }: LogoProps) {
  const sizes = {
    small: { mark: 'h-8 w-8 text-xs', name: 'text-base', label: 'text-[9px]' },
    medium: { mark: 'h-9 w-9 text-sm', name: 'text-xl', label: 'text-[10px]' },
    large: { mark: 'h-12 w-12 text-base', name: 'text-2xl', label: 'text-xs' },
  };

  const currentSize = sizes[size];

  return (
    <div className="flex select-none items-center gap-2">
      <div className={`flex shrink-0 items-center justify-center rounded-md bg-primary font-bold tracking-tight text-primary-foreground ${currentSize.mark}`}>
        AB
      </div>
      {showText && (
        <div className="leading-none">
          <div className={`font-bold tracking-tight text-foreground ${currentSize.name}`}>AfriBet</div>
          <div className={`mt-1 font-medium uppercase tracking-[0.16em] text-muted-foreground ${currentSize.label}`}>Games</div>
        </div>
      )}
    </div>
  );
}
