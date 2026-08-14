import { cva, type VariantProps } from 'class-variance-authority'

export const toggleVariants = cva(
  'inline-flex touch-manipulation items-center justify-center gap-2 rounded-2xl font-medium transition-colors disabled:pointer-events-none disabled:opacity-45 data-[state=on]:border-primary data-[state=on]:bg-primary/8 data-[state=on]:text-primary',
  {
    variants: {
      variant: {
        default: 'border border-transparent bg-secondary hover:bg-[var(--action-secondary-hover)]',
        outline:
          'border border-border bg-card hover:border-[var(--border-interactive)] hover:bg-muted',
      },
      size: {
        default: 'h-12 px-3 text-xs',
        sm: 'h-9 px-3 text-xs',
      },
    },
    defaultVariants: { variant: 'outline', size: 'default' },
  },
)

export type ToggleVariantProps = VariantProps<typeof toggleVariants>
