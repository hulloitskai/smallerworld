import AppLayout from "~/components/AppLayout";
import EditSpaceForm from "~/components/EditSpaceForm";
import { type Space, type World } from "~/types";

export interface EditSpacePageProps extends SharedPageProps {
  space: Space;
  userWorld: World | null;
}

const EditSpacePage: PageComponent<EditSpacePageProps> = ({ space }) => {
  useWorldTheme("cloudflow", true);

  return (
    <EditSpaceForm
      {...{ space }}
      onSpaceUpdated={space => {
        router.visit(routes.spaces.show.path({ id: space.friendly_id }));
      }}
    />
  );
};

EditSpacePage.layout = page => (
  <AppLayout<EditSpacePageProps>
    title="edit space"
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default EditSpacePage;
