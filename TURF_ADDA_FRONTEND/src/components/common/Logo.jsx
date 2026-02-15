
export default function Logo({ isOwner = false, className = "" }) {
  return (
    <div className={`text-2xl font-bold tracking-tight flex items-center ${className}`}>
      <span style={{ color: 'var(--color-primary)' }}>Turf</span>
      <span style={{ color: 'var(--color-primary-dark)' }}>adda</span>
      {isOwner && (
        <span className="ml-2.5 text-xs font-medium opacity-60 tracking-normal">
          Owner
        </span>
      )}
    </div>
  );
}