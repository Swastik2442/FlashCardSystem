import {
  ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"
import { toast } from "sonner"
import { Check, RotateCcw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { KeyPressConfig } from "@/features/keyboard/types"
import { cn } from "@/utils/css"

// Make sure to edit the one in @/features/keyboard/types.d.ts to match the configuration
const modifierKeys = ["Alt", "Control", "Shift", "Meta"]

/**
 * Component for taking a set of Keyboard Keys as Input
 * @param value Initial Value of the Keyboard Keys
 * @param setValue Sets the final input value for the Keyboard Keys
 * @param cancelEditing Cancels the Input
 */
export function KeyboardInput({ value, setValue, cancelEditing }: {
  value: Nullable<KeyPressConfig>,
  setValue: (v: Nullable<KeyPressConfig>) => void
  cancelEditing: () => void
}) {
  const inputRef = useRef<HTMLDivElement>(null)
  const [tempValue, setTempValue] = useState<KeyPressConfig>(value ?? { key: "" })
  // Prevents Cancelling Edit when clicking to edit
  const [started, setStarted] = useState(false)

  const handleConfirm = () => {
    if (tempValue.key == "") {
      toast.error("Press some Keys first")
      return
    }
    setValue(tempValue)
  }

  const handleMouseClick = useCallback((e: MouseEvent) => {
    if (!started) {
      setStarted(true)
      return;
    }
    if (started && !inputRef.current!.contains(e.target as Node))
      cancelEditing()
  }, [started, cancelEditing]) as EventListener

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    const { key, ctrlKey, altKey, shiftKey, metaKey } = e
    if (key == "Escape")
      cancelEditing()
    if (!modifierKeys.includes(key))
      setTempValue({ key, ctrlKey, altKey, shiftKey, metaKey })
  }, [cancelEditing]) as EventListener

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress)
    document.addEventListener("click", handleMouseClick)
    return () => {
      document.removeEventListener("keydown", handleKeyPress)
      document.removeEventListener("click", handleMouseClick)
    }
  }, [handleKeyPress, handleMouseClick])

  return (
    <div className="flex" ref={inputRef}>
      <ShowKeyboardKeys config={tempValue} className="w-full" />
      <Button
        type="button"
        title="Confirm"
        variant="outline"
        size="sm"
        className="border-l-0 rounded-none"
        onClick={handleConfirm}
      ><Check/></Button>
      <Button
        type="button"
        title="Cancel"
        variant="outline"
        size="sm"
        className="border-l-0 rounded-none"
        onClick={cancelEditing}
      ><X/></Button>
      <Button
        type="button"
        title="Reset"
        variant="outline"
        size="sm"
        className="border-l-0 rounded-l-none"
        onClick={() => setValue(null)}
      ><RotateCcw/></Button>
    </div>
  )
}

/**
 * Component for showcasing a set of Keyboard Keys
 * @param config KeyPressConfig for the Keyboard Keys
 *
 * Add `border-background` to className to remove border
 */
export function ShowKeyboardKeys({
  config, className, ...props
}: {
  config: KeyPressConfig,
  className?: string
} & Omit<ComponentProps<"div">, "className">) {
  const keys = useMemo(() => (
    Object.entries(config).filter(
      ([key, value]) => key != "code" && value === true
    ).map(([key]) => key.slice(0, -3))
  ), [config])

  return (
    <div className={cn("capitalize min-h-8 flex items-center border rounded-l-md", className)} {...props}>
      {keys.length > 0 && keys.map((key, idx) => (
        <span key={idx} className="flex items-center">
          <span className="border rounded-sm shadow-sm p-1">{key}</span>
          <span>&nbsp;+&nbsp;</span>
        </span>
      ))}
      {config.key != "" && <span className="border rounded-sm shadow-sm p-1">{config.key}</span>}
    </div>
  )
}

export default KeyboardInput
