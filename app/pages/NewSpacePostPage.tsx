import AppLayout from "~/components/AppLayout";
import NewSpacePostForm from "~/components/NewSpacePostForm";
import { type PostType, type Space, type World } from "~/types";

export interface NewSpacePostPageProps extends SharedPageProps {
  space: Space;
  type: PostType;
  userWorld: World | null;
}

const NewSpacePostPage: PageComponent<NewSpacePostPageProps> = ({
  space,
  type,
}) => {
  useWorldTheme("cloudflow");

  return <NewSpacePostForm spaceId={space.id} postType={type} />;
};

NewSpacePostPage.layout = page => (
  <AppLayout<NewSpacePostPageProps> withContainer containerSize="xs" withGutter>
    {page}
  </AppLayout>
);

export default NewSpacePostPage;
