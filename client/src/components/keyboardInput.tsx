import {
  ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { KeyPressConfig } from "@/features/keyboard/types"

const modifierKeys = ["Alt", "Control", "Shift", "Meta"]

export function KeyboardInput({ cancelEditing, setValue }: {
  cancelEditing: () => void
  setValue: (v: Nullable<KeyPressConfig>) => void
}) {
  const inputRef = useRef<HTMLDivElement>(null)
  const [tempValue, setTempValue] = useState<KeyPressConfig>({ key: "" })
  // Prevents Cancelling Edit when clicking to edit
  const [started, setStarted] = useState(false)

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
    <div className="flex">
      <div className="border rounded-l-md w-full" ref={inputRef}>
        <ShowKeyboardKeys config={tempValue} />
      </div>
      <Button
        type="button"
        title="Reset"
        variant="outline"
        size="sm"
        className="border-l-0 rounded-l-none"
        onClick={() => setValue(tempValue)}
      >
        <Check/>
      </Button>
    </div>
  )
}

export function ShowKeyboardKeys({
  config, ...props
}: { config: KeyPressConfig } & Omit<ComponentProps<"div">, "className">) {
  const keys = useMemo(() => (
    Object.entries(config).filter(
      ([key, value]) => key != "code" && value === true
    ).map(([key]) => key.slice(0, -3))
  ), [config])

  return (
    <div className="capitalize" {...props}>
      {keys.length > 0 && keys.map((key, idx) => (
        <span key={idx}>
          <span className="border rounded-sm p-1">{key}</span>
          <span> + </span>
        </span>
      ))}
      <span className="border rounded-sm p-1">{config.key}</span>
    </div>
  )
}

export default KeyboardInput
