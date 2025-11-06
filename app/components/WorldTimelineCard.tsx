import { ScrollArea } from "@mantine/core";
import { MiniCalendar } from "@mantine/dates";

import { openNewPostModal } from "~/helpers/worldPage";

import classes from "./WorldTimelineCard.module.css";
import "@mantine/dates/styles.css";

export interface WorldTimelineCardProps extends BoxProps {
  date: string | null;
  onDateChange: (date: string | null) => void;
}

const WEEKS_TO_SHOW = 4;

const WorldTimelineCard: FC<WorldTimelineCardProps> = ({
  date,
  onDateChange,
  ...otherProps
}) => {
  const startDate = useWeeksAgo(WEEKS_TO_SHOW);
  const viewportRef = useRef<HTMLDivElement>(null);
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

  // == Load timeline
  const { data } = useRouteSWR<{
    timeline: Record<string, { emoji: string | null; streak: boolean }>;
    postStreak: number;
    postedToday: boolean;
  }>(routes.world.timeline, {
    descriptor: "load timeline",
    params: startDate
      ? {
          query: {
            start_date: DateTime.fromISO(startDate).toLocal().toISO(),
          },
        }
      : null,
    keepPreviousData: true,
  });
  const { timeline = {}, postStreak, postedToday } = data ?? {};

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
            numberOfDays={WEEKS_TO_SHOW * 7 + 1}
            defaultDate={startDate}
            getDayProps={date => {
              const activity = timeline[date];
              if (activity) {
                return {
                  ...(activity.emoji && {
                    "data-emoji": activity.emoji,
                  }),
                  ...(activity.streak && {
                    "data-streak": activity.streak,
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
      {!!postStreak && (
        <Badge
          size="xs"
          leftSection="🔥"
          variant={postedToday ? "default" : "filled"}
          className={classes.postStreakBadge}
          mod={{ clickable: !postedToday }}
          onClick={() => {
            if (!postedToday) {
              openNewPostModal({ postType: "journal_entry" });
            }
          }}
        >
          {!postedToday && <>continue your </>}
          {postStreak}-day {postedToday && <>writing </>}streak!
        </Badge>
      )}
    </Card>
  );
};

export default WorldTimelineCard;

const useWeeksAgo = (weeks: number): string | undefined => {
  const [today, setToday] = useState<string>();
  useEffect(() => {
    setToday(DateTime.now().minus({ weeks }).toISODate());
  }, [weeks]);
  return today;
};
