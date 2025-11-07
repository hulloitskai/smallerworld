import { useTimeZone } from "~/helpers/time";
import { useTimelineStartDate } from "~/helpers/timeline";

import TimelineCard from "./TimelineCard";

export interface UserTimelineCardProps extends BoxProps {
  userId: string;
  date: string | null;
  onDateChange: (date: string | null) => void;
}

const UserTimelineCard: FC<UserTimelineCardProps> = ({
  userId,
  date,
  onDateChange,
  ...otherProps
}) => {
  const startDate = useTimelineStartDate();
  const timeZone = useTimeZone();
  const { data } = useRouteSWR<{
    timeline: Record<string, { emoji: string | null }>;
  }>(routes.users.timeline, {
    descriptor: "load timeline",
    params:
      startDate && timeZone
        ? {
            id: userId,
            query: {
              start_date: startDate,
              time_zone: timeZone,
            },
          }
        : null,
  });
  const { timeline } = data ?? {};
  return (
    <TimelineCard
      {...{ date, onDateChange, startDate, timeline }}
      {...otherProps}
    />
  );
};

export default UserTimelineCard;
