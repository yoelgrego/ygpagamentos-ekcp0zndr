import React from 'react'
import { cn } from '@/lib/utils'

export const YgLabel = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <label
    className={cn('block text-[11px] font-bold text-yg-dark leading-tight mb-[2px]', className)}
  >
    {children}
  </label>
)

export const YgInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'h-[22px] px-1 text-[12px] text-black border border-gray-400 bg-white focus:outline-none focus:border-yg-royal focus:ring-1 focus:ring-yg-royal rounded-none',
      className,
    )}
    {...props}
  />
))
YgInput.displayName = 'YgInput'

export const YgButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'h-[22px] w-[22px] bg-yg-dark text-white font-bold flex items-center justify-center text-[12px] hover:bg-blue-800 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-yg-royal shrink-0',
      className,
    )}
    {...props}
  />
))
YgButton.displayName = 'YgButton'

export const YgFieldGroup = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => <div className={cn('flex flex-col', className)}>{children}</div>
