import { useLocalStorage } from "@mantine/hooks";
import { type SVGProps } from "react";

import TelegramIcon from "~icons/basil/telegram-solid";
import WhatsappIcon from "~icons/basil/whatsapp-outline";
import SMSIcon from "~icons/heroicons/chat-bubble-bottom-center-text-20-solid";

type MessagingPlatform = "sms" | "telegram" | "whatsapp";

export const MESSAGING_PLATFORMS: MessagingPlatform[] = [
  "sms",
  "telegram",
  "whatsapp",
];

export const MESSAGING_PLATFORM_TO_LABEL: Record<MessagingPlatform, string> = {
  sms: "sms",
  telegram: "telegram",
  whatsapp: "whatsapp",
};

export const MESSAGING_PLATFORM_TO_ICON: Record<
  MessagingPlatform,
  FC<SVGProps<SVGSVGElement>>
> = {
  sms: SMSIcon,
  telegram: TelegramIcon,
  whatsapp: WhatsappIcon,
};

export const usePreferredMessagingPlatform = (userId: string) =>
  useLocalStorage<MessagingPlatform | undefined>({
    key: `preferred_messaging_platform:${userId}`,
  });
