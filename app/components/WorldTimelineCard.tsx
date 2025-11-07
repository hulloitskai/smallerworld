import { useTimeZone } from "~/helpers/time";
import { useTimelineStartDate } from "~/helpers/timeline";
import { openNewPostModal } from "~/helpers/worldPage";
import { type PostStreak } from "~/types";

import TimelineCard from "./TimelineCard";

export interface WorldTimelineCardProps extends BoxProps {
  date: string | null;
  onDateChange: (date: string | null) => void;
}

const WorldTimelineCard: FC<WorldTimelineCardProps> = ({
  date,
  onDateChange,
  ...otherProps
}) => {
  const startDate = useTimelineStartDate();
  const timeZone = useTimeZone();
  const { data } = useRouteSWR<{
    timeline: Record<string, { emoji: string | null; streak: boolean }>;
    postStreak: PostStreak | null;
  }>(routes.world.timeline, {
    descriptor: "load timeline",
    params:
      startDate && timeZone
        ? {
            query: {
              start_date: startDate,
              time_zone: timeZone,
            },
          }
        : null,
    keepPreviousData: true,
  });
  const { timeline, postStreak } = data ?? {};
  return (
    <TimelineCard
      {...{ date, onDateChange, startDate, timeline, postStreak }}
      onContinueStreak={() => {
        openNewPostModal({ postType: "journal_entry" });
      }}
      {...otherProps}
    />
  );
};

export default WorldTimelineCard;
