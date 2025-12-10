import AppLayout from "~/components/AppLayout";
import EditSpacePostForm from "~/components/EditSpacePostForm";
import { POST_TYPE_TO_LABEL } from "~/helpers/posts";
import { type Space, type SpacePost } from "~/types";

export interface EditSpacePostPageProps extends SharedPageProps {
  space: Space;
  post: SpacePost;
}

const EditSpacePostPage: PageComponent<EditSpacePostPageProps> = ({
  space,
  post,
}) => {
  return (
    <EditSpacePostForm
      spaceId={space.id}
      {...{ post }}
      onPostUpdated={() => {
        router.visit(routes.spaces.show.path({ id: space.friendly_id }), {
          replace: true,
        });
      }}
    />
  );
};

EditSpacePostPage.layout = page => (
  <AppLayout<EditSpacePostPageProps>
    title={({ post }) => `edit ${POST_TYPE_TO_LABEL[post.type]}`}
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default EditSpacePostPage;
