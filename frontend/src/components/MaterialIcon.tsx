interface MaterialIconProps {
  icon: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function MaterialIcon({ icon, className = '', style }: MaterialIconProps) {
  return (
    <span className={`material-symbols-outlined ${className}`} style={style}>
      {icon}
    </span>
  );
}
