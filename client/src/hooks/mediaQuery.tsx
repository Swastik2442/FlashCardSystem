import { useState, useEffect } from "react";

/**
 * A Hook that maintains whether the given media query is matching or not
 * 
 * Ref: <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries>
 * @param query Media Query to be matched
 * @returns Whether the media query is matching or not
 */
export function useMediaQuery(query: string) {
  const [value, setValue] = useState(false);

  useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
    }

    const result = matchMedia(query);
    result.addEventListener("change", onChange);
    setValue(result.matches);

    return () => result.removeEventListener("change", onChange)
  }, [query]);

  return value;
}
