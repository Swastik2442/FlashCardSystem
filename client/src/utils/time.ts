/**
 * Creates a Date String based on the time passed since the given date
 * @param date Date String to be formatted
 * @returns `HH:MM` if date within 24 hours, `Weekday HH:MM` if date within 7 days, else `MM/DD/YYYY`
 */
export function getFormattedDate(date: string): string {
  try {
    const jsDate = new Date(date);
    const now = new Date();
    const diff = now.getTime() - jsDate.getTime();
    if (0 <= diff && diff <= 604800000) // 7 Days
      return jsDate.toLocaleTimeString(undefined, {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    else
      return jsDate.toLocaleDateString();
  } catch (err) {
    console.error(err);
  }
  return "";
}

/**
 * Creates a Timer String based on the seconds passed
 * @param sec Number of seconds to be converted
 * @returns `HH:MM:SS` string
 */
export function secondsToString(sec: number): string {
  let isNegative = false;
  if (sec < 0) {
    sec = -sec;
    isNegative = true;
  }

  let hours = String(Math.floor(sec / 3600));
  if (hours.length < 2)
    hours = "0" + hours;

  let minutes = String(Math.floor((sec % 3600) / 60));
  if (minutes.length < 2)
    minutes = "0" + minutes;

  let seconds = String(sec % 60);
  if (seconds.length < 2)
    seconds = "0" + seconds;

  return `${isNegative ? "-" : ""}${hours}:${minutes}:${seconds}`;
}
