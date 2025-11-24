import { DateTime } from "luxon";
import { useEffect, useState } from "react";

export const isTodayIsh = (parsedDate: DateTime): boolean => {
  const now = DateTime.now();
  if (parsedDate.hasSame(now, "day")) {
    return true;
  }
  if (now.hour < 5) {
    return parsedDate.hasSame(now.minus({ day: 1 }), "day");
  }
  return false;
};

export const useTimeZone = (): string | undefined => {
  const [zoneName, setZoneName] = useState<string | undefined>();
  useEffect(() => {
    const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
    setZoneName(timeZone);
  }, []);
  return zoneName;
};

export const currentTimeZone = (): string => {
  const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
  return timeZone;
};
