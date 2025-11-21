import { useDidUpdate } from "@mantine/hooks";
import { useMemo } from "react";

import {
  type Friend,
  type FriendNotificationSettings,
  type PostType,
} from "~/types";

import { type FormHelper, type FormParams, useForm } from "./form";
import routes from "./routes";
import { mutateRoute, useRouteSWR } from "./routes/swr";

export const prettyFriendName = (
  friend: Pick<Friend, "emoji" | "name">,
): string => {
  const { emoji, name } = friend;
  return [emoji, name].filter(Boolean).join(" ");
};

export const useFriendNotificationSettings = (friendAccessToken: string) => {
  const { data, ...swrResponse } = useRouteSWR<{
    notificationSettings: FriendNotificationSettings;
  }>(routes.friend.notificationSettings, {
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

export interface FriendNotificationSettingsFormData {
  notificationSettings: FriendNotificationSettings;
}

export interface FriendNotificationSettingsFormValues {
  subscribed_post_types: PostType[];
}

export interface FriendNotificationSettingsFormSubmission {
  notification_settings: FriendNotificationSettingsFormValues;
}

export interface FriendNotificationSettingsFormParams
  extends Pick<
    FormParams<
      FriendNotificationSettingsFormData,
      FriendNotificationSettingsFormValues,
      (
        values: FriendNotificationSettingsFormValues,
      ) => FriendNotificationSettingsFormSubmission
    >,
    "onSuccess"
  > {
  currentFriend: Friend;
  notificationSettings: FriendNotificationSettings;
}

export const useFriendNotificationSettingsForm = ({
  currentFriend,
  notificationSettings,
  onSuccess,
}: FriendNotificationSettingsFormParams): FormHelper<
  FriendNotificationSettingsFormData,
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
    { notificationSettings: FriendNotificationSettings },
    FriendNotificationSettingsFormValues,
    (
      values: FriendNotificationSettingsFormValues,
    ) => FriendNotificationSettingsFormSubmission
  >({
    action: routes.friend.update,
    params: {
      query: {
        friend_token: currentFriend.access_token,
      },
    },
    descriptor: "update notification preferences",
    initialValues,
    transformValues: values => ({ notification_settings: values }),
    onSuccess: (data, form) => {
      void mutateRoute(routes.friend.notificationSettings, {
        query: {
          friend_token: currentFriend.access_token,
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
