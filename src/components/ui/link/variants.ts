import { cva, type VariantProps } from 'class-variance-authority'

export const linkVariants = cva(
  'rounded-2xl transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/35',
  {
    variants: {
      variant: {
        default: 'text-primary underline-offset-4 hover:underline',
        navigation:
          'group flex min-w-[72px] flex-col items-center gap-1 px-2 py-1.5 text-[10px] font-medium text-[var(--text-tertiary)] hover:bg-foreground/4 lg:w-full lg:py-3',
        card: 'flex min-w-0 flex-1 items-center gap-3 p-3 pr-1',
        compactCard:
          'flex w-[132px] shrink-0 flex-col items-center border border-border bg-card p-3 text-center hover:border-primary',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export type LinkVariantProps = VariantProps<typeof linkVariants>
