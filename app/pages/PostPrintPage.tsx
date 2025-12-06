import PostCard from "~/components/PostCard";
import { type AuthorWorldProfile, type Post } from "~/types";

import "./PostPrintPage.css";

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
      {...{ post }}
      author={{ name: authorName, world: authorWorld }}
      expanded
      actions={<Space h="xs" />}
      withBorder={false}
      shadow=""
      hideImages
    />
  );
};

export default PostPrintPage;
