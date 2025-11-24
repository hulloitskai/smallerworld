import { Image, Text } from "@mantine/core";

import bottomLeftArrowSrc from "~/assets/images/bottom-left-arrow.png";

import AcceptInvitationForm from "~/components/AcceptInvitationForm";
import AppLayout from "~/components/AppLayout";
import PostCard from "~/components/PostCard";
import WorldHomescreenPreview from "~/components/WorldHomescreenPreview";
import { prettyFriendName } from "~/helpers/friends";
import { prettyInviteeName } from "~/helpers/invitations";
import { WORLD_ICON_RADIUS_RATIO } from "~/helpers/worlds";
import {
  type FriendProfile,
  type Invitation,
  type Post,
  type World,
} from "~/types";

import classes from "./InvitationPage.module.css";

export interface InvitationPageProps extends SharedPageProps {
  world: World;
  invitation: Invitation;
  featuredPost: Post | null;
  existingFriend: FriendProfile | null;
  autofillPhoneNumber: string | null;
}

const ICON_SIZE = 96;

const InvitationPage: PageComponent<InvitationPageProps> = ({
  world,
  invitation,
  featuredPost,
  existingFriend,
  autofillPhoneNumber,
}) => {
  useWorldTheme(world.theme);
  // const [invitationSent, setInvitationSent] = useState(false);
  return (
    <Stack gap="lg" pb="xs">
      <Stack gap="sm">
        <Box pos="relative" style={{ alignSelf: "center" }}>
          <Image
            className={classes.pageIcon}
            src={world.icon.src}
            {...(!!world.icon.srcset && { srcSet: world.icon.srcset })}
            w={ICON_SIZE}
            h={ICON_SIZE}
            radius={ICON_SIZE / WORLD_ICON_RADIUS_RATIO}
          />
          <Image src={bottomLeftArrowSrc} className={classes.pageArrow} />
        </Box>
        <Title className={classes.pageTitle} size="h2">
          <span style={{ fontWeight: 500 }}>you&apos;re invited to</span>{" "}
          {world.name}
          <span style={{ fontWeight: 500 }}>!</span>
        </Title>
      </Stack>
      <Stack gap={4} maw={320} ta="center" style={{ alignSelf: "center" }}>
        <Text ff="heading" fw={500}>
          hi,{" "}
          {existingFriend
            ? prettyFriendName(existingFriend)
            : prettyInviteeName(invitation)}
          —
        </Text>
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
          get my world as a wee app on your phone :)
        </Text>
        <WorldHomescreenPreview {...{ world }} arrowLabel="it's me!" />
      </Stack>
      {/* {invitationSent ? (
        <Alert
          variant="default"
          icon={<TextIcon />}
          title="we've sent you a text!"
          styles={{ title: { fontWeight: 600 } }}
        >
          check your messages for your personal link to my world :)
        </Alert>
      ) : ( */}
      <Card withBorder className={classes.joinCard}>
        <Stack gap={8}>
          <Text>ready to join my world?</Text>
          <AcceptInvitationForm
            {...{
              world,
              invitation,
            }}
            initialPhoneNumber={autofillPhoneNumber}
            onInvitationAccepted={friendAccessToken => {
              const installationPath = withTrailingSlash(
                routes.worlds.show.path({
                  id: world.handle,
                  query: {
                    friend_token: friendAccessToken,
                    intent: "install",
                  },
                }),
              );
              router.visit(installationPath);
            }}
          />
        </Stack>
      </Card>
      {/* )} */}
    </Stack>
  );
};

InvitationPage.layout = page => (
  <AppLayout<InvitationPageProps>
    title={({ world }) => `you're invited to ${world.name}`}
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default InvitationPage;
