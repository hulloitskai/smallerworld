import { useEffect, useState } from "react";

export const TIMELINE_WEEKS_TO_SHOW = 4;

export const useTimelineStartDate = (): string | undefined => {
  const [startDate, setStartDate] = useState<string>();
  useEffect(() => {
    setStartDate(
      DateTime.local().minus({ weeks: TIMELINE_WEEKS_TO_SHOW }).toISODate(),
    );
  }, []);
  return startDate;
};
