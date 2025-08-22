import { Text } from "@mantine/core";

import TextIcon from "~icons/heroicons/chat-bubble-bottom-center-text-20-solid";

import AcceptInvitationForm from "~/components/AcceptInvitationForm";
import AppLayout from "~/components/AppLayout";
import HomescreenPreview from "~/components/HomescreenPreview";
import PostCard from "~/components/PostCard";
import { prettyInviteeName } from "~/helpers/invitations";
import { type Invitation, type Post, type User } from "~/types";

export interface InvitationPageProps extends SharedPageProps {
  user: User;
  invitation: Invitation;
  invitationAccepted: boolean;
  featuredPost: Post | null;
}

const InvitationPage: PageComponent<InvitationPageProps> = ({
  user,
  invitation,
  invitationAccepted,
  featuredPost,
}) => (
  <Stack gap="lg" pb="xs">
    <Stack gap={4} maw={320} ta="center" style={{ alignSelf: "center" }}>
      <Title order={3}>hi, {prettyInviteeName(invitation)}!</Title>
      <Text size="sm">
        i&apos;m inviting you to my{" "}
        <span style={{ fontWeight: 600 }}>smaller world</span>, an exclusive
        space where i share what&apos;s really on my mind.
      </Text>
    </Stack>
    {featuredPost && (
      <Stack gap={8}>
        <Text size="sm" fs="italic" ta="center">
          (psst... here&apos;s a peek into one of my posts...)
        </Text>
        <PostCard post={featuredPost} actions={null} hideEncouragement />
      </Stack>
    )}
    <Stack gap={8} align="center" my="xs">
      <Text size="sm" ta="center" maw={320}>
        you can get updates from me thru text, OR you can get my world as a wee
        app on your phone :)
      </Text>
      <HomescreenPreview
        pageName={user.name}
        pageIcon={user.page_icon}
        arrowLabel="it's me!"
      />
    </Stack>
    {invitationAccepted ? (
      <Alert
        variant="default"
        icon={<TextIcon />}
        title="we've sent you a text!"
        styles={{ title: { fontWeight: 600 } }}
      >
        check your messages for your personal link to my world :)
      </Alert>
    ) : (
      <Card withBorder>
        <Stack gap={8}>
          <Text>
            if all this sounds dope to you, drop your # below, and we&apos;ll
            send you a private link you can use to access my world.
          </Text>
          <AcceptInvitationForm
            {...{ user, invitation }}
            onInvitationAccepted={() => {
              router.reload({ async: true, only: ["invitationAccepted"] });
            }}
          />
        </Stack>
      </Card>
    )}
  </Stack>
);

InvitationPage.layout = page => (
  <AppLayout<InvitationPageProps>
    title={({ user }) => `you're invited to ${possessive(user.name)} world`}
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default InvitationPage;
