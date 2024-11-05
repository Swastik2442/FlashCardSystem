import { forwardRef, HTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/css";

export const FlipCard = forwardRef<
HTMLDivElement,
HTMLAttributes<HTMLDivElement> & { flip?: boolean }
>(({ className, flip = false, ...props }, ref) => (
  <motion.div
    ref={ref}
    initial={{ opacity: 0.0, y: -30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
    className="bg-transparent h-[32rem] w-96 perspective-1000"
  >
    <div style={{ transition: 'transform ' + 0.8 + 's' }} className={cn(
      "relative size-full text-center transform-style-3d shadow-lg",
      flip && "rotate-y-180",
      className
    )} {...props}>
    </div>
  </motion.div>
));
FlipCard.displayName = "FlipCard";

export const FlipCardFront = forwardRef<
HTMLDivElement,
HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(
    "absolute size-full backface-hidden rounded-xl bg-secondary-foreground p-2",
    className
  )} {...props} />
));
FlipCardFront.displayName = "FlipCardFront";

export const FlipCardBack = forwardRef<
HTMLDivElement,
HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(
    "absolute size-full backface-hidden rounded-xl rotate-y-180 bg-secondary-foreground p-2",
    className
  )} {...props} />
));
FlipCardBack.displayName = "FlipCardBack";
