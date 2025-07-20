import { type EncouragementFriend, type Friend } from "~/types";

export const prettyName = (friend: Friend | EncouragementFriend): string => {
  const { emoji, name } = friend;
  return [emoji, name].filter(Boolean).join(" ");
};
