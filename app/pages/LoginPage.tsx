import AppLayout from "~/components/AppLayout";
import LoginForm from "~/components/LoginForm";

export interface LoginPageProps extends SharedPageProps {}

const LoginPage: PageComponent<LoginPageProps> = () => {
  return (
    <Card w="100%" maw={380} withBorder>
      <Card.Section inheritPadding withBorder pt="sm" pb={8}>
        <Title size="h4" ta="center" lh="xs">
          sign in or sign up
        </Title>
      </Card.Section>
      <Card.Section inheritPadding py="md">
        <LoginForm
          onSessionCreated={registered => {
            const query = queryParamsFromPath(location.href);
            if (registered) {
              const { redirect_to } = queryParamsFromPath(location.href);
              if (redirect_to && destinationHasSameHost(redirect_to)) {
                location.href = redirect_to;
              } else {
                const worldPath = withTrailingSlash(
                  routes.userWorld.show.path({ query }),
                );
                location.href = worldPath;
              }
            } else {
              const registrationPath = routes.registrations.new.path({ query });
              router.visit(registrationPath);
            }
          }}
        />
      </Card.Section>
    </Card>
  );
};

LoginPage.layout = page => (
  <AppLayout title="sign in">
    <Center style={{ flexGrow: 1 }}>{page}</Center>
  </AppLayout>
);

export default LoginPage;

const destinationHasSameHost = (destination: string) => {
  const destinationUrl = hrefToUrl(destination);
  return destinationUrl.host === location.host;
};
