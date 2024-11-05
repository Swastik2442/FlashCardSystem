import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

/**
 * Component for the Home page
 */
export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="relative flex flex-col  h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900  text-slate-950 transition-bg">
      <div className="absolute inset-0 overflow-hidden">
        <div className={`
          [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
          [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
          [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)]
          [background-image:var(--white-gradient),var(--aurora)]
          dark:[background-image:var(--dark-gradient),var(--aurora)]
          [background-size:300%,_200%]
          [background-position:50%_50%,50%_50%]
          filter blur-[10px] invert dark:invert-0
          after:content-[""] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] 
          after:dark:[background-image:var(--dark-gradient),var(--aurora)]
          after:[background-size:200%,_100%] 
          after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
          pointer-events-none
          absolute -inset-[10px] opacity-50 will-change-transform
          [mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
        }></div>
      </div>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
        className="relative flex flex-col gap-2 items-center justify-center px-4 select-none"
      >
        <div className="text-3xl md:text-7xl font-bold dark:text-white text-center">
          Revise with Flash Cards
        </div>
        <div className="font-extralight text-base md:text-xl dark:text-neutral-200 py-4">
          Maybe, even Learn 🙂
        </div>
        <Button type="button" title="Get ready to see mediocre UI" onClick={() => navigate("/dashboard")} className="rounded-full">
          Try Now
        </Button>
        <div className="text-[0.5rem] text-foreground/30">
          Yeah, this is copied from Aceternity UI
        </div>
      </motion.div>
      </div>
  );
}
