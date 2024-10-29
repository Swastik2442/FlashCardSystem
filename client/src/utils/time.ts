export function getFormattedDate(date: string): string {
  try {
      const jsDate = new Date(date);
      const now = new Date();
      const diff = now.getTime() - jsDate.getTime();
      if (diff <= 86400000)       // 24 hours
          return jsDate.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
          });
      else if (diff <= 604800000) // 7 Days
          return jsDate.toLocaleTimeString(undefined, {
              weekday: "short",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
          });
      else return jsDate.toLocaleDateString();
  } catch (err) {
      console.error(err);
  }
  return "";
}
