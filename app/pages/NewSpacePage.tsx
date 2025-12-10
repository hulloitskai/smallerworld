import AppLayout from "~/components/AppLayout";
import NewSpaceForm from "~/components/NewSpaceForm";

export interface NewSpacePageProps extends SharedPageProps {}

const NewSpacePage: PageComponent<NewSpacePageProps> = () => {
  return (
    <NewSpaceForm
      onSpaceCreated={space => {
        router.visit(routes.spaces.show.path({ id: space.friendly_id }));
      }}
    />
  );
};

NewSpacePage.layout = page => (
  <AppLayout<NewSpacePageProps>
    title="new space"
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default NewSpacePage;
