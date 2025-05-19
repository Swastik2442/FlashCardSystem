import { useRef } from "react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FlipCard, FlipCardBack, FlipCardFront } from "@/components/ui/flip-card";

/**
 * Component to render a Flash Card.
 * @param question - Question of the Flash Card
 * @param answer - Answer of the Flash Card
 * @param handleAnswerCheck - Check the Answer entered by the User
 * @param flipped - Whether the Card is Flipped or not
 * @param disabled - Whether the Input is Disabled or not
 */
export default function FlashCard({
  question,
  answer,
  handleAnswerCheck,
  flipped,
  disabled
}: {
  question: string,
  answer: string,
  handleAnswerCheck: (answer: string) => void,
  flipped: boolean,
  disabled: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <FlipCard flip={flipped}>
      <FlipCardFront>
        <div className="h-full rounded-lg bg-background text-foreground p-4 flex flex-col justify-between">
          <p className="mb-4">{question}</p>
          <div className="flex">
            <Input
              ref={inputRef}
              placeholder="Answer"
              className="border-r-transparent rounded-r-none"
              disabled={disabled}
            />
            <Button
              onClick={() => handleAnswerCheck(inputRef.current!.value)}
              type="submit"
              title="Submit Answer"
              variant="outline"
              size="icon"
              className="rounded-l-none"
              disabled={disabled}
            >
              <Check />
            </Button>
          </div>
        </div>
      </FlipCardFront>
      <FlipCardBack>
        <div className="h-full rounded-lg bg-gradient-to-t from-green-400 to-green-500 text-foreground dark:text-background p-4">
          <p>{answer}</p>
        </div>
      </FlipCardBack>
    </FlipCard>
  )
}
