import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Input({
  label,
  error,
  helperText,
  className,
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <input
        className={cn(
          'w-full px-3 py-2 rounded border border-border bg-input text-foreground',
          'placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
          'disabled:bg-secondary disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus:ring-destructive',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-destructive">{error}</span>}
      {helperText && !error && (
        <span className="text-xs text-muted-foreground">{helperText}</span>
      )}
    </div>
  )
}
