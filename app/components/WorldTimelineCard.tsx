import { ScrollArea } from "@mantine/core";
import { MiniCalendar } from "@mantine/dates";

import { confetti, particlePositionFor } from "~/helpers/particles";
import { useTimeZone } from "~/helpers/time";
import {
  TIMELINE_WEEKS_TO_SHOW,
  useTimelineStartDate,
} from "~/helpers/timeline";
import { type PostStreak } from "~/types";

import classes from "./WorldTimelineCard.module.css";
import "@mantine/dates/styles.layer.css";

export interface WorldTimelineCardProps extends BoxProps {
  date: string | null;
  onDateChange: (date: string | null) => void;
  worldId: string;
  friendAccessToken?: string;
  onContinueStreak?: () => void;
}

const WorldTimelineCard: FC<WorldTimelineCardProps> = ({
  date,
  onDateChange,
  worldId,
  friendAccessToken,
  onContinueStreak,
  ...otherProps
}) => {
  const startDate = useTimelineStartDate();
  const timeZone = useTimeZone();
  const { data } = useRouteSWR<{
    timeline: Record<string, { emoji: string | null }>;
    postStreak: PostStreak | null;
  }>(routes.worldTimelines.show, {
    descriptor: "load timeline",
    params:
      startDate && timeZone
        ? {
            world_id: worldId,
            query: {
              start_date: startDate,
              time_zone: timeZone,
              ...(friendAccessToken && {
                friend_token: friendAccessToken,
              }),
            },
          }
        : null,
    keepPreviousData: true,
  });
  const { timeline, postStreak } = data ?? {};
  const activities = timeline ?? {};
  const badgeRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const streakDates = useMemo(() => {
    if (!postStreak || postStreak.length === 0) {
      return;
    }
    const today = DateTime.local().startOf("day");
    const streakEnd = postStreak.posted_today
      ? today
      : today.minus({ days: 1 });
    const dates = Array.from({ length: postStreak.length }, (_, index) =>
      streakEnd.minus({ days: index }).toISODate(),
    );
    return new Set(dates);
  }, [postStreak]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    const observer = new ResizeObserver(() => {
      viewport.scrollTo({ left: viewport.scrollWidth });
    });
    observer.observe(viewport);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Card withBorder className={classes.card} {...otherProps}>
      <ScrollArea
        {...{ viewportRef }}
        type="hover"
        scrollbarSize={6}
        mih={44}
        className={classes.scrollArea}
      >
        {startDate && (
          <MiniCalendar
            size="xs"
            numberOfDays={TIMELINE_WEEKS_TO_SHOW * 7 + 1}
            defaultDate={startDate}
            getDayProps={calendarDate => {
              const activity = activities[calendarDate];
              if (activity) {
                const isStreakDay = streakDates?.has(calendarDate);
                return {
                  ...(!!activity.emoji && {
                    "data-emoji": activity.emoji,
                  }),
                  ...(isStreakDay && {
                    "data-streak": true,
                  }),
                };
              }
              return {
                disabled: true,
                style: {
                  opacity: 0.4,
                },
              };
            }}
            value={date}
            onChange={selectedDate => {
              if (selectedDate === date) {
                onDateChange(null);
              } else {
                onDateChange(selectedDate);
              }
            }}
            className={classes.calendar}
          />
        )}
      </ScrollArea>
      {postStreak && onContinueStreak && (
        <Badge
          ref={badgeRef}
          size="xs"
          leftSection="🔥"
          variant={postStreak.posted_today ? "default" : "filled"}
          className={classes.postStreakBadge}
          mod={{
            "posted-today": postStreak.posted_today,
          }}
          onClick={() => {
            if (!postStreak.posted_today) {
              onContinueStreak();
            } else {
              const badge = badgeRef.current;
              if (badge) {
                void confetti({
                  position: particlePositionFor(badge),
                  spread: 200,
                  ticks: 60,
                  gravity: 1,
                  startVelocity: 18,
                  count: 12,
                  scalar: 2,
                  shapes: ["emoji"],
                  shapeOptions: {
                    emoji: {
                      value: "🔥",
                    },
                  },
                });
              }
            }
          }}
        >
          <>
            {!postStreak.posted_today && <>continue your </>}
            {postStreak.length}-day {postStreak.posted_today && <>writing </>}
            streak!
          </>
        </Badge>
      )}
    </Card>
  );
};

export default WorldTimelineCard;
