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
  const { data } = useRouteSWR<{
    timeline: Record<string, { emoji: string | null; streak: boolean }>;
  }>(routes.users.timeline, {
    descriptor: "load timeline",
    params: startDate
      ? {
          id: userId,
          query: {
            start_date: DateTime.fromISO(startDate).toLocal().toISO(),
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
