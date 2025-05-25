import { ComponentProps, memo } from "react"
import { cn } from "@/utils/css"

/**
 * A Simple Text displaying Component
 * @param value Text to be displayed
 */
const Text = memo(({
  value, className, ...props
}: {
  value?: string
} & ComponentProps<"p">) => (
  <p
    title={value}
    className={cn(
      "capitalize",
      "text-ellipsis whitespace-nowrap overflow-hidden",
      className
    )}
    {...props}
  >{value}</p>
))
Text.displayName = "Text"

export { Text }
