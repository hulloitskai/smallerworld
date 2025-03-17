import { type ReactNode } from "react";

import { usePosts } from "~/helpers/posts";
import { type Post, type User } from "~/types";

import PostCard from "./PostCard";

export interface FeedProps {
  user: User;
  emptyCard: ReactNode;
  renderControls: (post: Post) => ReactNode;
}

const Feed: FC<FeedProps> = ({ user, emptyCard, renderControls }) => {
  const { posts } = usePosts(user.id);
  return (
    <Stack>
      {posts
        ? isEmpty(posts)
          ? emptyCard
          : posts.map(post => (
              <PostCard
                key={post.id}
                {...{ post }}
                controls={renderControls(post)}
              />
            ))
        : // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          [...new Array(3)].map((_, i) => <Skeleton key={i} h={120} />)}
    </Stack>
  );
};

export default Feed;
