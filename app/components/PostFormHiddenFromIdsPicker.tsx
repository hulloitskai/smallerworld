import { Chip, Popover, type PopoverProps } from "@mantine/core";
import { difference, map } from "lodash-es";

import { prettyName } from "~/helpers/friends";
import { useFriends } from "~/helpers/friends";
import { type WorldFriend } from "~/types";

import classes from "./PostFormHiddenFromIdsPicker.module.css";

export interface PostFormHiddenFromIdsPickerProps
  extends Omit<PopoverProps, "onChange"> {
  recentlyPausedFriendIds?: string[];
  value?: string[];
  onChange?: (hiddenFromIds: string[]) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const PostFormHiddenFromIdsPicker: FC<PostFormHiddenFromIdsPickerProps> = ({
  recentlyPausedFriendIds,
  value = [],
  onChange,
  onFocus,
  onBlur,
  children,
  ...otherProps
}) => {
  const vaulPortalTarget = useVaulPortalTarget();

  // == Load friends
  const { allFriends, notifiableFriends, unnotifiableFriends } = useFriends();
  const allFriendIds = useMemo(() => map(allFriends, "id"), [allFriends]);
  const invertedValue = useMemo(
    () => difference(allFriendIds, value),
    [allFriendIds, value],
  );
  const [initialValue] = useState(value);
  const orderedFriends = useMemo(() => {
    const hiddenFrom: WorldFriend[] = [];
    const recentlyHiddenFrom: WorldFriend[] = [];
    const visibleTo: WorldFriend[] = [];
    [...notifiableFriends, ...unnotifiableFriends].forEach(friend => {
      if (initialValue.includes(friend.id)) {
        hiddenFrom.push(friend);
      } else if (recentlyPausedFriendIds?.includes(friend.id)) {
        recentlyHiddenFrom.push(friend);
      } else {
        visibleTo.push(friend);
      }
    });
    return [...hiddenFrom, ...recentlyHiddenFrom, ...visibleTo];
  }, [
    initialValue,
    recentlyPausedFriendIds,
    notifiableFriends,
    unnotifiableFriends,
  ]);

  return (
    <Popover
      width={370}
      shadow="md"
      withArrow
      portalProps={{
        target: vaulPortalTarget,
      }}
      styles={{
        dropdown: {
          padding: 0,
        },
      }}
      onOpen={onFocus}
      onClose={onBlur}
      {...otherProps}
    >
      <Popover.Target>{children}</Popover.Target>
      <Popover.Dropdown>
        <Stack gap={8} className={classes.content}>
          <Title order={3} size="h5">
            choose which friends can see this post
          </Title>
          <Chip.Group
            multiple
            value={invertedValue}
            onChange={invertedValue => {
              if (!onChange) {
                return;
              }
              const value = difference(allFriendIds, invertedValue);
              onChange(value);
            }}
          >
            <Group gap={6} justify="center" wrap="wrap">
              {orderedFriends.map(friend => (
                <Chip
                  key={friend.id}
                  value={friend.id}
                  className={classes.chip}
                  mod={{ unnotifiable: !friend.notifiable }}
                >
                  {prettyName(friend)}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};

export default PostFormHiddenFromIdsPicker;
