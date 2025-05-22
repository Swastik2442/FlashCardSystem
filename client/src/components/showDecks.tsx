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
      className={cn("flex flex-wrap gap-4", className)}
      {...props}
    >
      {decks.map((deck, idx) => (
        <Card className="min-w-72 flex-1 flex flex-col justify-between" key={idx}>
          <Link to={`/deck/${deck._id}`}>
            <CardHeader>
              <CardTitle>{deck.name}</CardTitle>
            </CardHeader>
          </Link>
          <CardFooter className="flex justify-between">
            <span className="text-sm font-light">{getFormattedDate(deck.dateUpdated)}</span>
            <span>{deck.isPrivate ? <Lock className="size-4" /> : ""}</span>
          </CardFooter>
        </Card>
      ))}
      {children}
    </motion.div>
  )
}

export default ShowDecks
