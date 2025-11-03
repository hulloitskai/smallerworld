import { ScrollArea } from "@mantine/core";
import { MiniCalendar } from "@mantine/dates";

import { useCurrentTimeZone } from "~/helpers/utils";

import classes from "./WorldTimelineCard.module.css";
import "@mantine/dates/styles.layer.css";

export interface WorldTimelineCardProps extends BoxProps {
  date: string | null;
  onDateChange: (date: string | null) => void;
}

const WorldTimelineCard: FC<WorldTimelineCardProps> = ({
  date,
  onDateChange,
  ...otherProps
}) => {
  const twoWeeksAgo = useTwoWeeksAgo();
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
  const timeZone = useCurrentTimeZone();
  const { data } = useRouteSWR<{
    timeline: Record<string, { emoji: string | null }>;
  }>(routes.world.timeline, {
    descriptor: "load timeline",
    params: timeZone
      ? {
          query: {
            time_zone: timeZone,
          },
        }
      : null,
  });
  const { timeline = {} } = data ?? {};

  return (
    <Card withBorder padding={0} shadow="lg" {...otherProps}>
      <ScrollArea
        {...{ viewportRef }}
        type="hover"
        className={classes.scrollArea}
        scrollbarSize={6}
      >
        {twoWeeksAgo && (
          <MiniCalendar
            size="xs"
            numberOfDays={14}
            defaultDate={twoWeeksAgo}
            getDayProps={date => {
              const activity = timeline[date];
              if (activity) {
                return {
                  ...(activity.emoji && {
                    "data-emoji": activity.emoji,
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
    </Card>
  );
};

export default WorldTimelineCard;

const useTwoWeeksAgo = (): string | undefined => {
  const [today, setToday] = useState<string>();
  useEffect(() => {
    setToday(DateTime.now().minus({ days: 13 }).toISODate());
  }, []);
  return today;
};
