import { cva, type VariantProps } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center rounded-full font-medium text-primary-foreground',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        type: '',
      },
      size: {
        default: 'h-6 gap-2 pl-1 pr-5 text-xs',
        compact: 'h-6 gap-1 pl-1 pr-2 text-[10px]',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export type BadgeVariantProps = VariantProps<typeof badgeVariants>
