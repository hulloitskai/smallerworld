import {
  type EncouragementNotificationPayload,
  type FriendNotificationPayload,
  type JoinRequestNotificationPayload,
  type Notification,
  type PostNotificationPayload,
  type PostReactionNotificationPayload,
  type UniversePostNotificationPayload,
} from "~/types";

import { POST_TYPE_TO_LABEL } from "./posts/formatting";
import routes from "./routes";

export const DEFAULT_NOTIFICATION_ICON_URL = "/logo.png";

export interface RenderedNotification
  extends Pick<NotificationOptions, "body" | "icon"> {
  title: string;
  image?: string;
}

export const renderNotification = (
  notification: Notification,
): RenderedNotification => {
  switch (notification.type) {
    case "Post": {
      const { post } = notification.payload as PostNotificationPayload;
      let title = `new ${POST_TYPE_TO_LABEL[post.type]}`;
      if (post.emoji) {
        title = `${post.emoji} ${title}`;
      }
      let body = truncateDoubleNewlines(post.body_snippet);
      if (post.title_snippet) {
        body = `${post.title_snippet}\n${body}`;
      }
      return {
        title,
        body,
        image: post.cover_image_src ?? undefined,
      };
    }
    case "UniversePost": {
      const { post } = notification.payload as UniversePostNotificationPayload;
      let title = `new ${POST_TYPE_TO_LABEL[post.type]}`;
      if (post.emoji) {
        title = `${post.emoji} ${title}`;
      }
      let body = truncateDoubleNewlines(post.body_snippet);
      if (post.title_snippet) {
        body = `${post.title_snippet}\n${body}`;
      }
      return {
        title,
        body,
        image: post.cover_image_src ?? undefined,
      };
    }
    case "PostReaction": {
      const { reaction } =
        notification.payload as PostReactionNotificationPayload;
      const { friend, post, emoji } = reaction;
      let friendName = friend.name;
      if (friend.emoji) {
        friendName = `${friend.emoji} ${friendName}`;
      }
      const truncatedSnippet = truncateDoubleNewlines(post.body_snippet);
      const body = "> " + truncatedSnippet.split("\n").join("\n> ");
      return {
        title: `${emoji} from ${friendName}`,
        body,
      };
    }
    case "JoinRequest": {
      const { join_request } =
        notification.payload as JoinRequestNotificationPayload;
      return {
        title: `${join_request.name} wants to join your world`,
        body: `request from ${join_request.name} (${join_request.phone_number})`,
      };
    }
    case "Friend": {
      const { friend } = notification.payload as FriendNotificationPayload;
      const prettyName = [friend.emoji, friend.name].filter(Boolean).join(" ");
      return {
        title: `${prettyName} joined your world!`,
        body: `${friend.name} installed your world on their phone :)`,
      };
    }
    case "Encouragement": {
      const { encouragement } =
        notification.payload as EncouragementNotificationPayload;
      const { emoji, message, friend } = encouragement;
      return {
        title: `${friend.name} wants to hear from u!`,
        body: [emoji, message].join(" "),
      };
    }
    // default:
    //   throw new Error(`Unknown notification type: ${notification.type}`);
  }
};

export const notificationTargetUrl = (notification: Notification): string => {
  switch (notification.type) {
    case "Post": {
      const { post, user_handle, friend_access_token } =
        notification.payload as PostNotificationPayload;
      return routes.users.show.path({
        id: user_handle,
        query: {
          friend_token: friend_access_token,
          post_id: post.id,
        },
      });
    }
    case "UniversePost": {
      const { post } = notification.payload as UniversePostNotificationPayload;
      return routes.universe.show.path({
        query: {
          post_id: post.id,
        },
      });
    }
    case "PostReaction": {
      const { reaction } =
        notification.payload as PostReactionNotificationPayload;
      return routes.world.show.path({
        query: {
          post_id: reaction.post.id,
        },
      });
    }
    case "JoinRequest": {
      const { join_request } =
        notification.payload as JoinRequestNotificationPayload;
      return routes.joinRequests.index.path({
        query: {
          join_request_id: join_request.id,
        },
      });
    }
    case "Friend": {
      const { friend } = notification.payload as FriendNotificationPayload;
      return routes.friends.index.path({
        query: {
          friend_id: friend.id,
        },
      });
    }
    case "Encouragement":
      return routes.world.show.path();
    // default:
    //   throw new Error(`Unknown notification type: ${notification.type}`);
  }
};

const truncateDoubleNewlines = (text: string): string =>
  text.replace(/\n\n/g, "\n");
