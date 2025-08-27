import { type Friend } from "~/types";

export const prettyFriendName = (
  friend: Pick<Friend, "emoji" | "name">,
): string => {
  const { emoji, name } = friend;
  return [emoji, name].filter(Boolean).join(" ");
};
