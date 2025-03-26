import { Popover, Switch } from "@mantine/core";
import { pluralize } from "inflection";

import { POST_TYPE_TO_LABEL, POST_TYPES } from "~/helpers/posts";
import { useWebPush } from "~/helpers/webPush";
import { type Friend, type FriendNotificationSettings } from "~/types";

import { openNotificationsTroubleshootingModal } from "./NotificationsTroubleshootingModal";

export interface UserPageNotificationsButtonProps
  extends Pick<NotificationPopoverBodyProps, "currentFriend"> {}

const UserPageNotificationsButton: FC<UserPageNotificationsButtonProps> = ({
  currentFriend,
}) => {
  const {
    subscription,
    registration,
    subscribe,
    subscribing,
    supported,
    loading,
  } = useWebPush();
  useDidUpdate(
    () => {
      if (supported && registration === null) {
        void subscribe();
      }
    },
    [supported, registration], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const [dropdownOpened, setDropdownOpened] = useState(false);
  return (
    <>
      {subscription === undefined ? (
        <Button color="gray" loading />
      ) : registration === null || subscription === null ? (
        <Button
          variant="filled"
          loading={loading || subscribing}
          disabled={!supported}
          leftSection={<NotificationIcon />}
          onClick={() => {
            void subscribe();
          }}
        >
          enable push notifications
        </Button>
      ) : (
        <Popover
          width={270}
          opened={dropdownOpened}
          onChange={setDropdownOpened}
        >
          <Popover.Target>
            <Button
              color="gray"
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
              {...{ currentFriend, subscription }}
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

export default UserPageNotificationsButton;

interface NotificationPopoverBodyProps {
  currentFriend: Friend;
  subscription: PushSubscription;
  onClose: () => void;
}

const NotificationPopoverBody: FC<NotificationPopoverBodyProps> = ({
  currentFriend,
  subscription,
  onClose,
}) => {
  // == Load notification settings
  const { data } = useRouteSWR<{
    notificationSettings: FriendNotificationSettings;
  }>(routes.friendNotificationSettings.show, {
    descriptor: "load notification settings",
    params: {
      query: {
        friend_token: currentFriend.access_token,
      },
    },
  });
  const { notificationSettings } = data ?? {};

  return (
    <Stack gap={0}>
      {notificationSettings ? (
        <NotificationSettingsForm
          {...{ currentFriend, notificationSettings }}
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

interface NotificationSettingsFormProps {
  currentFriend: Friend;
  notificationSettings: FriendNotificationSettings;
}

const NotificationSettingsForm: FC<NotificationSettingsFormProps> = ({
  currentFriend,
  notificationSettings,
}) => {
  const initialValues = useMemo(
    () => ({
      subscribed_post_types: notificationSettings.subscribed_post_types,
    }),
    [notificationSettings.subscribed_post_types],
  );
  const {
    submit,
    reset,
    setInitialValues,
    getInputProps,
    isDirty,
    submitting,
  } = useForm({
    action: routes.friendNotificationSettings.update,
    params: {
      query: {
        friend_token: currentFriend.access_token,
      },
    },
    descriptor: "update notification preferences",
    initialValues,
    transformValues: values => ({ notification_settings: values }),
    onSuccess: () => {
      toast.success("notification preferences updated");
      void mutateRoute(routes.friendNotificationSettings.show, {
        query: {
          friend_token: currentFriend.access_token,
        },
      });
    },
  });
  useDidUpdate(() => {
    setInitialValues(initialValues);
    reset();
  }, [initialValues]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form onSubmit={submit}>
      <Stack gap="xs">
        <Switch.Group
          {...getInputProps("subscribed_post_types")}
          label="i want to be notified about:"
          styles={{
            root: {
              display: "flex",
              flexDirection: "column",
              rowGap: rem(6),
            },
            label: {
              fontFamily: "var(--mantine-font-family-headings)",
              textAlign: "center",
            },
          }}
        >
          <Stack gap={4}>
            {POST_TYPES.map(postType => (
              <Switch
                key={postType}
                label={pluralize(POST_TYPE_TO_LABEL[postType])}
                value={postType}
              />
            ))}
          </Stack>
        </Switch.Group>
        <Transition transition="fade" mounted={isDirty()}>
          {style => (
            <Button
              type="submit"
              size="compact-sm"
              leftSection={<SaveIcon />}
              loading={submitting}
              disabled={!isDirty()}
              style={[style, { alignSelf: "center" }]}
            >
              save preferences
            </Button>
          )}
        </Transition>
      </Stack>
    </form>
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
