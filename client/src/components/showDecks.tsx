import { Link } from "react-router-dom"
import { Lock } from "lucide-react"
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { getFormattedDate } from "@/utils/time"
import { cn } from "@/utils/css"
import { motion } from "framer-motion"

export function ShowDecks({
  decks,
  children,
  className,
  ...props
}: {
  decks: ILessDeck[],
  children?: React.ReactNode
  className?: string,
  props?: Omit<HTMLDivElement, "className">
}) {
  return (
    <motion.div
      initial={{ opacity: 0.0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
      className={cn(
        "grid gap-4",
        "grid-cols-[repeat(auto-fit,minmax(18rem,1fr))]",
        "sm:grid-cols-[repeat(auto-fit,minmax(36rem,1fr))]",
        className
      )}
      {...props}
    >
      {decks.map((deck, idx) => (
        <Card key={idx}>
          <Link to={`/deck/${deck._id}`}>
            <CardHeader>
              <CardTitle
                title={deck.name}
                className="text-ellipsis whitespace-nowrap overflow-hidden leading-[1.5]"
              >
                {deck.name}
              </CardTitle>
            </CardHeader>
          </Link>
          <CardFooter className="flex justify-between">
            <span title={"Last Modified: " + (new Date(deck.dateUpdated).toLocaleString())} className="text-sm font-light">
              {getFormattedDate(deck.dateUpdated)}
            </span>
            {deck.isPrivate && <span title="Private"><Lock className="size-4" /></span>}
          </CardFooter>
        </Card>
      ))}
      {children}
    </motion.div>
  )
}

export default ShowDecks
