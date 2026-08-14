import { cva, type VariantProps } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl font-semibold transition-colors disabled:pointer-events-none disabled:opacity-45',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-sm hover:bg-[var(--action-primary-hover)] active:bg-[var(--action-primary-pressed)]',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-[var(--action-secondary-hover)] active:bg-[var(--action-secondary-pressed)]',
        tertiary:
          'bg-transparent text-[var(--navigation-active)] hover:bg-primary/8 active:bg-primary/14',
        icon: 'bg-transparent text-foreground hover:bg-foreground/5 active:bg-foreground/10',
        danger:
          'bg-destructive text-primary-foreground hover:bg-[var(--danger-hover)] active:bg-[var(--danger-pressed)]',
      },
      size: {
        default: 'h-12 px-6 text-sm',
        sm: 'h-9 px-4 text-xs',
        'icon-sm': 'size-8 p-0',
        icon: 'size-11 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
)

export type ButtonVariantProps = VariantProps<typeof buttonVariants>
