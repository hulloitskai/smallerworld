import { useComputedColorScheme } from "@mantine/core";
import { useModals } from "@mantine/modals";

import ChatIcon from "~icons/heroicons/chat-bubble-left-right-20-solid";
import ReportIcon from "~icons/heroicons/hand-raised-20-solid";
import HeartIcon from "~icons/heroicons/heart-20-solid";
import FeedbackIcon from "~icons/heroicons/megaphone-20-solid";

import { useContact } from "~/helpers/contact";
import { usePageDialogOpened } from "~/helpers/pageDialog";
import { readingTimeFor } from "~/helpers/utils";

import SleepyNeko, { type SleepyNekoProps } from "./SleepyNeko";

import classes from "./FeedbackNeko.module.css";

export interface FeedbackNekoProps extends Omit<SleepyNekoProps, "onClick"> {}

const LINES = ["give me your feedback!!", "...or your money 💸😻"];
const SUPPORTER_LINES = [
  "give me your feedback!!",
  "...and thanks for supporting us ❤️",
];

const FeedbackNeko: FC<FeedbackNekoProps> = ({ style, ...otherProps }) => {
  const pageDialogOpened = usePageDialogOpened();
  const { modals } = useModals();
  const [index, setIndex] = useState(-1);
  const currentUser = useCurrentUser();
  const lines = currentUser?.membership_tier ? SUPPORTER_LINES : LINES;
  const line = lines[index];
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
      const readingTime = readingTimeFor(text, 125);
      const timeout = setTimeout(() => {
        setIndex(index + 1);
      }, readingTime);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [index]);
  return (
    <Tooltip
      label={line}
      opened={!!line}
      disabled={!line || !isEmpty(modals) || pageDialogOpened}
      className={classes.tooltip}
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
  );
};

export default FeedbackNeko;

interface FeedbackModalBodyProps {
  featureRequestsBoardToken: string;
  bugsBoardToken: string;
}

const FeedbackModalBody: FC<FeedbackModalBodyProps> = ({
  featureRequestsBoardToken,
  bugsBoardToken,
}) => {
  const currentUser = useCurrentUser();
  const currentFriend = useCurrentFriend();

  // == Canny SSO token
  const { data } = useRouteSWR<{ ssoToken: string }>(routes.canny.ssoToken, {
    params:
      currentFriend || currentUser
        ? {
            ...(currentFriend && {
              query: {
                friend_token: currentFriend.access_token,
              },
            }),
          }
        : null,
    descriptor: "load Canny SSO token",
    revalidateIfStale: false,
  });
  const { ssoToken } = data ?? {};

  // == Contact
  const [contact, { loading: contacting }] = useContact({
    type: "sms",
    body: "about smaller world: ",
  });

  // == Render Canny board
  const [board, setBoard] = useState<"feature-requests" | "bugs" | null>(null);
  const colorScheme = useComputedColorScheme();
  useEffect(() => {
    if (!board) {
      return;
    }
    Canny("render", {
      boardToken:
        board === "feature-requests"
          ? featureRequestsBoardToken
          : bugsBoardToken,
      ssoToken,
      theme: colorScheme,
    });
  }, [ssoToken, board, featureRequestsBoardToken, bugsBoardToken, colorScheme]);

  if (board) {
    return <div data-canny className={classes.cannyContainer} />;
  }
  return (
    <Stack gap="xs">
      <Button
        size="md"
        variant="default"
        leftSection={<FeedbackIcon />}
        className={classes.button}
        onClick={() => {
          setBoard("feature-requests");
        }}
      >
        i have a feature request
      </Button>
      <Button
        size="md"
        variant="default"
        leftSection={<ReportIcon />}
        className={classes.button}
        onClick={() => {
          setBoard("bugs");
        }}
      >
        i&apos;m reporting a bug
      </Button>
      <Divider label="or" />
      <Button
        size="md"
        leftSection={<ChatIcon />}
        loading={contacting}
        className={classes.button}
        onClick={() => {
          contact();
        }}
      >
        contact the developer
      </Button>
      <Divider label="love smaller world?" />
      <Button
        component="a"
        href={routes.support.redirect.path()}
        size="xl"
        leftSection={<HeartIcon />}
        variant="gradient"
        gradient={{ from: "var(--gradient-from)", to: "var(--gradient-to)" }}
        className={cn(classes.button, classes.supportButton)}
      >
        support smaller world
      </Button>
    </Stack>
  );
};
