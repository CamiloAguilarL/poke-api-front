import { cva, type VariantProps } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center rounded-full font-semibold text-primary-foreground shadow-sm',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        type: '',
      },
      size: {
        default: 'gap-2 px-3 py-1.5 text-xs',
        compact: 'gap-1 px-2 py-1 text-[10px]',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export type BadgeVariantProps = VariantProps<typeof badgeVariants>
