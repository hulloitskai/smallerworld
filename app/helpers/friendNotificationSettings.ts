import {
  type Friend,
  type FriendNotificationSettings,
  type PostType,
} from "~/types";

import { type FormHelper, type FormParams } from "./form";

export const useFriendNotificationSettings = (friendAccessToken: string) => {
  const { data, ...swrResponse } = useRouteSWR<{
    notificationSettings: FriendNotificationSettings;
  }>(routes.friendNotificationSettings.show, {
    descriptor: "load notification settings",
    params: {
      query: {
        friend_token: friendAccessToken,
      },
    },
  });
  const { notificationSettings } = data ?? {};
  return { notificationSettings, ...swrResponse };
};

export interface FriendNotificationSettingsFormValues {
  subscribed_post_types: PostType[];
}

export interface FriendNotificationSettingsFormSubmission {
  notification_settings: FriendNotificationSettingsFormValues;
}

export interface FriendNotificationSettingsFormParams
  extends Pick<
    FormParams<
      {},
      FriendNotificationSettingsFormValues,
      (
        values: FriendNotificationSettingsFormValues,
      ) => FriendNotificationSettingsFormSubmission
    >,
    "onSuccess"
  > {
  friend: Friend;
  notificationSettings: FriendNotificationSettings;
}

export const useFriendNotificationSettingsForm = ({
  friend,
  notificationSettings,
  onSuccess,
}: FriendNotificationSettingsFormParams): FormHelper<
  {},
  FriendNotificationSettingsFormValues,
  (
    values: FriendNotificationSettingsFormValues,
  ) => FriendNotificationSettingsFormSubmission
> => {
  const initialValues = useMemo(
    () => ({
      subscribed_post_types: notificationSettings.subscribed_post_types,
    }),
    [notificationSettings.subscribed_post_types],
  );
  const form = useForm<
    {},
    FriendNotificationSettingsFormValues,
    (
      values: FriendNotificationSettingsFormValues,
    ) => FriendNotificationSettingsFormSubmission
  >({
    action: routes.friendNotificationSettings.update,
    params: {
      query: {
        friend_token: friend.access_token,
      },
    },
    descriptor: "update notification preferences",
    initialValues,
    transformValues: values => ({ notification_settings: values }),
    onSuccess: (data, form) => {
      void mutateRoute(routes.friendNotificationSettings.show, {
        query: {
          friend_token: friend.access_token,
        },
      });
      onSuccess?.(data, form);
    },
  });
  const { reset, setInitialValues } = form;
  useDidUpdate(() => {
    setInitialValues(initialValues);
    reset();
  }, [initialValues]); // eslint-disable-line react-hooks/exhaustive-deps
  return form;
};
