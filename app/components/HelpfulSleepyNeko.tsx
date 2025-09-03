import ReportIcon from "~icons/heroicons/hand-raised-20-solid";
import FeedbackIcon from "~icons/heroicons/megaphone-20-solid";

import { readingTimeFor } from "~/helpers/utils";

import SingleDayFontHead from "./SingleDayFontHead";
import SleepyNeko, { type SleepyNekoProps } from "./SleepyNeko";

export interface HelpfulSleepyNekoProps
  extends Omit<SleepyNekoProps, "onClick"> {}

const LINES = [
  "it's me, neko, the feedback cat...",
  "tap on me to give feedback :)",
];

const HelpfulSleepyNeko: FC<HelpfulSleepyNekoProps> = ({
  style,
  ...otherProps
}) => {
  const [index, setIndex] = useState(-1);
  const line = LINES[index];
  useEffect(() => {
    const text = LINES[index];
    if (index === -1) {
      const timeout = setTimeout(() => {
        setIndex(0);
      }, 2000);
      return () => {
        clearTimeout(timeout);
      };
    } else if (text) {
      const readingTime = readingTimeFor(text, 100);
      const timeout = setTimeout(() => {
        setIndex(index + 1);
      }, readingTime);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [index]);
  return (
    <>
      <SingleDayFontHead />
      <Tooltip
        withArrow
        label={line}
        opened={!!line}
        disabled={!line}
        styles={{
          tooltip: {
            fontFamily: '"Single Day", Manrope, cursive',
          },
        }}
      >
        <SleepyNeko
          style={[{ cursor: "pointer", pointerEvents: "auto" }, style]}
          onClick={() => {
            const featureRequestsBoardToken = requireMeta(
              "canny-feature-requests-board-token",
            );
            const bugsBoardToken = requireMeta("canny-bugs-board-token");
            openModal({
              title: "give feedback <3",
              fullScreen: true,
              children: (
                <FeedbackModalBody
                  {...{ featureRequestsBoardToken, bugsBoardToken }}
                />
              ),
            });
          }}
          {...otherProps}
        />
      </Tooltip>
    </>
  );
};

export default HelpfulSleepyNeko;

interface FeedbackModalBodyProps {
  featureRequestsBoardToken: string;
  bugsBoardToken: string;
}

const FeedbackModalBody: FC<FeedbackModalBodyProps> = ({
  featureRequestsBoardToken,
  bugsBoardToken,
}) => {
  const currentFriend = useCurrentFriend();

  // == Canny SSO token
  const { data } = useRouteSWR<{ ssoToken: string }>(routes.canny.ssoToken, {
    params: {
      ...(currentFriend && {
        friend_token: currentFriend.access_token,
      }),
    },
    descriptor: "load Canny SSO token",
    revalidateIfStale: false,
  });
  const { ssoToken } = data ?? {};

  const [board, setBoard] = useState<"feature-requests" | "bugs" | null>(null);
  useEffect(() => {
    if (!board || !ssoToken) {
      return;
    }
    Canny("render", {
      boardToken:
        board === "feature-requests"
          ? featureRequestsBoardToken
          : bugsBoardToken,
      ssoToken,
    });
  }, [ssoToken, board, featureRequestsBoardToken, bugsBoardToken]);

  if (board) {
    return <div data-canny />;
  }
  return (
    <Stack gap="xs">
      <Button
        size="md"
        leftSection={<FeedbackIcon />}
        onClick={() => {
          setBoard("feature-requests");
        }}
      >
        i have a feature request
      </Button>
      <Button
        size="md"
        leftSection={<ReportIcon />}
        onClick={() => {
          setBoard("bugs");
        }}
      >
        i&apos;m reporting a bug
      </Button>
    </Stack>
  );
};
