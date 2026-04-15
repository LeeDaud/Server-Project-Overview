import * as React from "react"
import { cn } from "../ui/utils"

interface PageShellProps extends React.ComponentProps<"div"> {
  maxWidth?: string
}

function PageShell({
  maxWidth,
  className,
  children,
  ...props
}: PageShellProps) {
  return (
    <div
      data-slot="page-shell"
      className={cn("min-h-screen bg-surface-page relative", className)}
      style={maxWidth ? { maxWidth } : undefined}
      {...props}
    >
      {children}
    </div>
  )
}

interface PageContentProps extends React.ComponentProps<"main"> {}

function PageContent({ className, children, ...props }: PageContentProps) {
  return (
    <main
      data-slot="page-content"
      className={cn("pb-24 space-y-6", className)}
      {...props}
    >
      {children}
    </main>
  )
}

export { PageShell, PageContent }
export type { PageShellProps, PageContentProps }
