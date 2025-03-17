import { type Notification, type PostNotificationPayload } from "~/types";

import { POST_TYPE_TO_LABEL } from "./posts/labels";
import routes from "./routes";

export const DEFAULT_NOTIFICATION_ICON_URL = "/logo.png";

export interface RenderedNotification
  extends Pick<NotificationOptions, "body" | "icon"> {
  title: string;
}

export const renderNotification = (
  notification: Notification,
): RenderedNotification => {
  switch (notification.type) {
    case "Post": {
      const { post, author } = notification.payload as PostNotificationPayload;
      let body = post.body_snippet;
      if (post.title_snippet) {
        body = `${post.title_snippet}: ${body}`;
      }
      if (post.emoji) {
        body = `${post.emoji} ${body}`;
      }
      return {
        title: `new ${POST_TYPE_TO_LABEL[post.type]} from ${author.name}`,
        body,
      };
    }
    default:
      throw new Error(`Unknown notification type: ${notification.type}`);
  }
};

export const notificationActionUrl = (notification: Notification): string => {
  switch (notification.type) {
    case "Post": {
      const { post, author } = notification.payload as PostNotificationPayload;
      return routes.users.show.path({
        handle: author.handle,
        query: {
          post_id: post.id,
        },
      });
    }
    default:
      throw new Error(`Unknown notification type: ${notification.type}`);
  }
};
