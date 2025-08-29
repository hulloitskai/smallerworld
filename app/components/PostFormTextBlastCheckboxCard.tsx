import { alpha, Checkbox, type CheckboxCardProps, Text } from "@mantine/core";
import { map } from "lodash-es";

import { type WorldFriend } from "~/types";

import classes from "./PostFormTextBlastCheckboxCard.module.css";

export type PostFormTextBlastCheckboxCardProps = CheckboxCardProps;

const PostFormTextBlastCheckboxCard: FC<PostFormTextBlastCheckboxCardProps> = ({
  className,
  style,
  ...otherProps
}) => {
  const { data } = useRouteSWR<{
    friends: WorldFriend[];
    textSubscribersCount: number;
  }>(routes.worldFriends.textSubscribers, {
    descriptor: "load text subscribers",
  });
  const { textSubscribersCount = 0 } = data ?? {};
  const friendsDescriptor = useMemo(() => {
    if (!data) {
      return null;
    }
    const { friends, textSubscribersCount } = data;
    const friendNames = map(friends, "name");
    const remainingSubscribersCount = textSubscribersCount - friends.length;
    if (remainingSubscribersCount === 0) {
      const [firstFriendName, secondFriendName] = friendNames;
      if (firstFriendName && secondFriendName) {
        return (
          <>
            {boldFriendName(firstFriendName)} and{" "}
            {boldFriendName(secondFriendName)}
          </>
        );
      } else if (firstFriendName) {
        return boldFriendName(firstFriendName);
      }
      return null;
    }
    const [firstFriendName, secondFriendName] = friendNames;
    invariant(firstFriendName);
    invariant(secondFriendName);
    return (
      <>
        {boldFriendName(firstFriendName)}, {boldFriendName(secondFriendName)}
        {remainingSubscribersCount > 0 &&
          ` and ${remainingSubscribersCount} others`}
      </>
    );
  }, [data]);

  return (
    <Transition transition="pop" mounted={!!friendsDescriptor}>
      {transitionStyle => (
        <Checkbox.Card
          className={cn(
            "PostFormTextBlastCheckboxCard",
            classes.card,
            className,
          )}
          style={[style, transitionStyle]}
          {...otherProps}
        >
          <Group align="start" gap="xs">
            <Checkbox.Indicator size="xs" />
            <Box>
              <Text size="sm" ff="heading" fw={500} lh={1.2}>
                also send as a text blast
              </Text>
              {!!friendsDescriptor && (
                <Text size="xs" c="dimmed" lh={1.2}>
                  {friendsDescriptor}{" "}
                  {textSubscribersCount === 1 ? "doesn't" : "don't"} have your
                  world, but {textSubscribersCount === 1 ? "is" : "are"}{" "}
                  subscribed to sms updates
                </Text>
              )}
            </Box>
          </Group>
        </Checkbox.Card>
      )}
    </Transition>
  );
};

export default PostFormTextBlastCheckboxCard;

const boldFriendName = (friendName: string): ReactNode => (
  <span
    style={{ fontWeight: 500, color: alpha("var(--mantine-color-text)", 0.7) }}
  >
    {friendName}
  </span>
);
