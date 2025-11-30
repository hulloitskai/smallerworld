import PostCard from "~/components/PostCard";
import { type AuthorWorldProfile, type Post } from "~/types";

import classes from "./PostPrintPage.module.css";

export interface PostPrintPageProps extends SharedPageProps {
  post: Post;
  authorName: string;
  authorWorld: AuthorWorldProfile | null;
}

const PostPrintPage: PageComponent<PostPrintPageProps> = ({
  post,
  authorName,
  authorWorld,
}) => {
  const { setColorScheme } = useMantineColorScheme();
  useEffect(() => {
    setColorScheme("light");
  }, [setColorScheme]);
  return (
    <PostCard
      className={classes.card}
      {...{ post }}
      author={{ name: authorName, world: authorWorld }}
      expanded
      actions={<Space h="xs" />}
      withBorder={false}
      shadow=""
    />
  );
};

export default PostPrintPage;
