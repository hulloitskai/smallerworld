import AppLayout from "~/components/AppLayout";
import NewSpacePostForm from "~/components/NewSpacePostForm";
import { POST_TYPE_TO_LABEL } from "~/helpers/posts";
import { type PostType, type Space } from "~/types";

export interface NewSpacePostPageProps extends SharedPageProps {
  space: Space;
  postType: PostType;
}

const NewSpacePostPage: PageComponent<NewSpacePostPageProps> = ({
  space,
  postType,
}) => {
  return (
    <NewSpacePostForm
      spaceId={space.id}
      {...{ postType }}
      onPostCreated={() => {
        router.visit(routes.spaces.show.path({ id: space.friendly_id }), {
          replace: true,
        });
      }}
    />
  );
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
