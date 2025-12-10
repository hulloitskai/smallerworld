import AppLayout from "~/components/AppLayout";
import NewSpacePostForm from "~/components/NewSpacePostForm";
import { POST_TYPE_TO_LABEL } from "~/helpers/posts";
import { type PostType, type Space, type World } from "~/types";

export interface NewSpacePostPageProps extends SharedPageProps {
  space: Space;
  postType: PostType;
  userWorld: World | null;
}

const NewSpacePostPage: PageComponent<NewSpacePostPageProps> = ({
  space,
  postType,
}) => {
  useWorldTheme("cloudflow");

  return <NewSpacePostForm spaceId={space.id} {...{ postType }} />;
};

NewSpacePostPage.layout = page => (
  <AppLayout<NewSpacePostPageProps>
    title={({ postType: type }) => `new ${POST_TYPE_TO_LABEL[type]}`}
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default NewSpacePostPage;
