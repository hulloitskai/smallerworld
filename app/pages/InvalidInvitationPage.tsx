import { Text } from "@mantine/core";

import AppLayout from "~/components/AppLayout";

export interface InvalidInvitationPageProps extends SharedPageProps {}

const InvalidInvitationPage: PageComponent<InvalidInvitationPageProps> = () => {
  return (
    <Stack gap={4} align="center">
      <Box component={InvitationIcon} fz="xl" />
      <Title size="h2" lh="xs" ta="center">
        this invite link is no longer valid :(
      </Title>
      <Text ta="center">
        if you&apos;d like, you can ask your friend to send you a new one :)
      </Text>
    </Stack>
  );
};

InvalidInvitationPage.layout = page => (
  <AppLayout<InvalidInvitationPageProps>
    title="invalid invite link"
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default InvalidInvitationPage;
