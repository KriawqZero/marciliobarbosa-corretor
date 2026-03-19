import Link from 'next/link'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'whatsapp' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonBaseProps {
  variant?: Variant
  size?: Size
  className?: string
  children?: React.ReactNode
}

type ButtonAsButton = ButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
    href?: undefined
  }

type ButtonAsLink = ButtonBaseProps & {
  href: string
  target?: string
  rel?: string
}

type ButtonProps = ButtonAsButton | ButtonAsLink

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-azul-escuro text-white hover:bg-azul-medio',
  secondary:
    'border-2 border-azul-escuro text-azul-escuro hover:bg-azul-escuro hover:text-white',
  whatsapp:
    'bg-whatsapp text-white hover:brightness-110',
  ghost:
    'text-azul-escuro hover:bg-azul-escuro/5',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors cursor-pointer',
    variantStyles[variant],
    sizeStyles[size],
    className,
  )

  if ('href' in props && props.href) {
    const { href, target, rel, ...rest } = props as ButtonAsLink
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        className={classes}
        {...rest}
      >
        {children}
      </Link>
    )
  }

  const buttonProps = props as ButtonAsButton
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  )
}
