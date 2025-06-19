import { useDocumentVisibility } from "@mantine/hooks";
import { type ConfettiOptions } from "@tsparticles/confetti";
import { DateTime } from "luxon";

import { confetti } from "~/helpers/particles";
import { type Friend, type User } from "~/types";

import classes from "./WelcomeBackToast.module.css";

export interface WelcomeBackToastProps {
  subject: User | Friend;
}

const WelcomeBackToast: FC<WelcomeBackToastProps> = ({ subject }) => {
  const visibility = useDocumentVisibility();
  useEffect(() => {
    if (visibility === "hidden") {
      return;
    }
    if (import.meta.env.RAILS_ENV === "production" && wasShownInLast12Hours()) {
      return;
    }
    let name = subject.name;
    if ("emoji" in subject && !!subject.emoji) {
      name = `${subject.emoji} ${name}`;
    }
    const timeout = setTimeout(() => {
      toast(`welcome back, ${name}!`, {
        icon: "😍",
        className: classes.toast,
        closeButton: false,
        duration: 2400,
        position: "top-center",
      });
      const friendEmoji = "emoji" in subject ? subject.emoji : null;
      void shootWelcomeConfetti(friendEmoji);
      updateLastShownAt();
    }, 1000);
    return () => {
      clearTimeout(timeout);
    };
  }, [visibility]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
};

export default WelcomeBackToast;

const LAST_SHOWN_AT_KEY = "welcome_back_last_shown_at";

const getLastShownAt = (): DateTime | null => {
  const timestamp = localStorage.getItem(LAST_SHOWN_AT_KEY);
  return timestamp ? DateTime.fromISO(timestamp) : null;
};

const wasShownInLast12Hours = (): boolean => {
  const lastShownAt = getLastShownAt();
  return lastShownAt ? lastShownAt.diffNow().hours < 12 : false;
};

const updateLastShownAt = () => {
  localStorage.setItem(LAST_SHOWN_AT_KEY, DateTime.now().toISO());
};

const CONFETTI_DEFAULTS: ConfettiOptions = {
  position: {
    x: 50,
    y: 0,
  },
  angle: -90,
  spread: 200,
  ticks: 60,
  gravity: 1,
  startVelocity: 30,
};

const shootWelcomeConfetti = async (
  friendEmoji: string | null,
): Promise<void> => {
  const emojis = ["❤️"];
  if (friendEmoji && friendEmoji !== "❤️") {
    emojis.push(friendEmoji);
  }
  await Promise.all([
    confetti({
      ...CONFETTI_DEFAULTS,
      particleCount: 30,
      scalar: 1.2,
      shapes: ["circle", "square", "star"],
      colors: ["#a864fd", "#29cdff", "#78ff44", "#fdff6a"],
    }),
    confetti({
      ...CONFETTI_DEFAULTS,
      particleCount: 12,
      scalar: 2,
      shapes: ["emoji"],
      shapeOptions: {
        emoji: {
          value: emojis,
        },
      },
    }),
  ]);
};
