import { cva, type VariantProps } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex h-6 items-center rounded-full font-medium text-primary-foreground',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        type: '',
      },
      size: {
        default: 'gap-1 pl-1 pr-2 text-[10px]',
        compact: 'gap-1 pl-1 pr-2 text-[10px]',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export type BadgeVariantProps = VariantProps<typeof badgeVariants>
