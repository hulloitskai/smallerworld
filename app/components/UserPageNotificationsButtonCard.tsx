import { Popover, Text } from "@mantine/core";

import {
  useFriendNotificationSettings,
  useFriendNotificationSettingsForm,
} from "~/helpers/friendNotificationSettings";
import { POST_TYPES } from "~/helpers/posts";
import { useWebPush } from "~/helpers/webPush";
import { type Friend, type FriendNotificationSettings } from "~/types";

import FriendNotificationSettingsForm, {
  FriendNotificationSettingsFormInputs,
} from "./FriendNotificationSettingsForm";
import { openNotificationsTroubleshootingModal } from "./NotificationsTroubleshootingModal";

export interface UserPageNotificationsButtonCardProps
  extends Pick<NotificationPopoverBodyProps, "currentFriend"> {}

const UserPageNotificationsButtonCard: FC<
  UserPageNotificationsButtonCardProps
> = ({ currentFriend }) => {
  // == Dropdown
  const [dropdownOpened, setDropdownOpened] = useState(false);

  // == Web push
  const {
    subscription,
    registration,
    subscribe,
    subscribing,
    supported,
    loading,
  } = useWebPush();

  // == Load notification settings
  const { notificationSettings } = useFriendNotificationSettings(
    currentFriend.access_token,
  );

  // == Notification settings form
  const [defaultNotificationSettings] = useState<FriendNotificationSettings>(
    () => ({ subscribed_post_types: POST_TYPES }),
  );
  const notificationSettingsForm = useFriendNotificationSettingsForm({
    friend: currentFriend,
    notificationSettings: notificationSettings ?? defaultNotificationSettings,
  });

  return (
    <>
      {subscription === undefined ? (
        <Button loading />
      ) : subscription === null || registration === null ? (
        <Card withBorder>
          <Stack>
            <FriendNotificationSettingsFormInputs
              form={notificationSettingsForm}
            />
            <Stack gap={4}>
              <Button
                variant="filled"
                loading={loading || subscribing}
                disabled={!supported}
                leftSection={<NotificationIcon />}
                onClick={() => {
                  if (notificationSettingsForm.isDirty()) {
                    notificationSettingsForm.submit();
                  }
                  void subscribe();
                }}
              >
                enable push notifications
              </Button>
              {/* TODO: Remove this after April 15, 2025 */}
              <Text size="xs" ta="center" maw={340} mx="auto">
                if you are seeing this button for the second time, I AM SORRY i
                fucked up and now you have to redo this step :(
              </Text>
            </Stack>
          </Stack>
          <LoadingOverlay visible={!notificationSettings} />
        </Card>
      ) : (
        <Popover
          width={300}
          shadow="md"
          opened={dropdownOpened}
          onChange={setDropdownOpened}
        >
          <Popover.Target>
            <Button
              leftSection={<NotificationIcon />}
              onClick={() => {
                setDropdownOpened(true);
              }}
            >
              notification settings
            </Button>
          </Popover.Target>
          <Popover.Dropdown pb={0}>
            <NotificationPopoverBody
              {...{ currentFriend, subscription, notificationSettings }}
              onClose={() => {
                setDropdownOpened(false);
              }}
            />
          </Popover.Dropdown>
        </Popover>
      )}
    </>
  );
};

export default UserPageNotificationsButtonCard;

interface NotificationPopoverBodyProps {
  currentFriend: Friend;
  subscription: PushSubscription;
  notificationSettings: FriendNotificationSettings | undefined;
  onClose: () => void;
}

const NotificationPopoverBody: FC<NotificationPopoverBodyProps> = ({
  currentFriend,
  subscription,
  notificationSettings,
  onClose,
}) => {
  return (
    <Stack gap={0}>
      {notificationSettings ? (
        <FriendNotificationSettingsForm
          friend={currentFriend}
          {...{ notificationSettings }}
        />
      ) : (
        <Skeleton h={100} />
      )}
      <Divider mt="md" mx="calc(-1 * var(--mantine-spacing-md))" />
      <Center py={8}>
        <SendTestNotificationButton
          {...{ currentFriend, subscription, onClose }}
        />
      </Center>
    </Stack>
  );
};

interface SendTestNotificationButtonProps {
  currentFriend: Friend;
  subscription: PushSubscription;
  onClose: () => void;
}

const SendTestNotificationButton: FC<SendTestNotificationButtonProps> = ({
  currentFriend,
  subscription,
  onClose,
}) => {
  const { trigger, mutating, data } = useRouteMutation<{}>(
    routes.pushSubscriptions.test,
    {
      descriptor: "send test notification",
      params: {
        query: {
          friend_token: currentFriend.access_token,
        },
      },
    },
  );

  return (
    <Stack gap={2}>
      <Button
        loading={mutating}
        variant="subtle"
        size="compact-sm"
        leftSection={<NotificationIcon />}
        onClick={() => {
          void trigger({
            push_subscription: {
              endpoint: subscription.endpoint,
            },
          });
        }}
      >
        send test notification
      </Button>
      {data && (
        <Anchor
          component="button"
          size="xs"
          ta="center"
          onClick={() => {
            onClose();
            openNotificationsTroubleshootingModal();
          }}
        >
          didn&apos;t get anything?
        </Anchor>
      )}
    </Stack>
  );
};
