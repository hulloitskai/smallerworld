import { Image, Overlay, Text } from "@mantine/core";

import PlayIcon from "~icons/heroicons/play-20-solid";

import bottomLeftArrowSrc from "~/assets/images/bottom-left-arrow.png";
import homescreenRowSrc from "~/assets/images/homescreen-row.jpeg";
import logoSrc from "~/assets/images/logo.png";
import swirlyUpArrowSrc from "~/assets/images/swirly-up-arrow.png";
import demoVideoSrc from "~/assets/videos/demo.mp4";

import AppLayout from "~/components/AppLayout";
import SingleDayFontHead from "~/components/SingleDayFontHead";
import { USER_ICON_RADIUS_RATIO } from "~/helpers/userPages";
import { type User } from "~/types";

import classes from "./LandingPage.module.css";

const WORLD_SIZE = 74;

export interface LandingPageProps extends SharedPageProps {
  demoUser: User | null;
}

const LandingPage: PageComponent<LandingPageProps> = ({ demoUser }) => {
  const currentUser = useCurrentUser();

  // == Reveal demovideo
  const videoRef = useRef<HTMLVideoElement>(null);
  const [revealVideo, setRevealVideo] = useState(false);

  return (
    <Stack align="center" gap={44} pb="xl">
      {currentUser && (
        <Alert
          styles={{ root: { alignSelf: "stretch" }, body: { rowGap: rem(4) } }}
        >
          <Group gap="xs" justify="space-between">
            <Text ff="heading" fw={700}>
              welcome back, {currentUser.name}
              <span style={{ marginLeft: rem(6) }}>➡️</span>
            </Text>
            <Button
              component={Link}
              href={routes.world.show.path()}
              variant="filled"
              leftSection={<Image src={logoSrc} h={24} w="unset" />}
              style={{ flexShrink: 0 }}
            >
              your world
            </Button>
          </Group>
        </Alert>
      )}
      <Image
        src={homescreenRowSrc}
        w="100%"
        maw={360}
        style={{ borderRadius: "var(--mantine-radius-default)" }}
      />
      <Stack align="center">
        <Title className={classes.title}>
          pov: <span className={classes.emph}>you are an app</span> on your
          friend&apos;s phone
        </Title>
        <Text className={classes.subtitle}>
          a way for close friends to know about what&apos;s{" "}
          <span style={{ color: "var(--mantine-color-text)" }}>*actually*</span>{" "}
          going on in your life
        </Text>
      </Stack>
      <Box pos="relative">
        <Box
          component="video"
          ref={videoRef}
          muted
          loop
          playsInline
          controls={false}
          autoPlay
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          maw={275}
          style={{ borderRadius: "var(--mantine-radius-default)" }}
        >
          <source src={demoVideoSrc} type="video/mp4" />
        </Box>
        {!revealVideo && (
          <Overlay backgroundOpacity={0} blur={3} radius="lg">
            <Center h="100%">
              <Button
                variant="filled"
                leftSection={<PlayIcon />}
                onClick={() => {
                  const video = videoRef.current;
                  if (video) {
                    video.pause();
                    video.currentTime = 0;
                    setRevealVideo(true);
                    void video.play();
                  }
                }}
              >
                ok show me more
              </Button>
            </Center>
          </Overlay>
        )}
        <Box pos="absolute" top={0} right={-150}>
          <SingleDayFontHead />
          <Stack gap={0} style={{ transform: "rotate(8deg)" }}>
            <Text className={classes.checkItOutLabel}>check it out :)</Text>
            <Image src={swirlyUpArrowSrc} className={classes.checkItOutArrow} />
          </Stack>
        </Box>
      </Box>
      <Card className={classes.howItWorksCard} withBorder>
        <Stack gap={8}>
          <Center
            p={8}
            bg="var(--mantine-color-white)"
            style={{ borderRadius: 32, alignSelf: "center" }}
          >
            <Image src={logoSrc} h={44} w="unset" />
          </Center>
          <Title order={2} size="h3" ta="center">
            how it works
          </Title>
          <List type="ordered" className={classes.howItWorksList}>
            <List.Item>set up your page and custom home screen icon</List.Item>
            <List.Item>
              invite only your real friends (or people you want to be closer to)
              to pin your page to their home screen
            </List.Item>
            <List.Item>
              share poems, journal entries, invitations to events you&apos;re
              going to, etc.
            </List.Item>
            <List.Item>
              your friends get notifications sent right to their lock screen.
              they can click on it to drop into a dm with you
            </List.Item>
          </List>
        </Stack>
      </Card>
      <Button
        component={Link}
        href={routes.world.show.path()}
        leftSection="😍"
        size="lg"
        radius="xl"
        styles={{ section: { fontSize: "var(--mantine-font-size-xl)" } }}
      >
        wtf? i want this!
      </Button>
      {demoUser && (
        <Stack align="center" gap={4} style={{ alignSelf: "stretch" }}>
          <Box pos="relative">
            <SingleDayFontHead />
            <Text className={classes.demoWorldLabel}>
              our cofounder&apos;s cat has a world!
            </Text>
          </Box>
          <Group align="start" gap={8}>
            <Anchor
              component={Link}
              href={routes.users.show.path({ handle: demoUser.handle })}
            >
              <Stack className={classes.demoWorld} gap={6}>
                <Image
                  className={classes.demoWorldIcon}
                  src={demoUser.page_icon.src}
                  {...(demoUser.page_icon.srcset && {
                    srcSet: demoUser.page_icon.srcset,
                  })}
                  h={WORLD_SIZE}
                  w={WORLD_SIZE}
                  radius={WORLD_SIZE / USER_ICON_RADIUS_RATIO}
                />
                <Text className={classes.demoWorldName} size="sm">
                  {possessive(demoUser.name)} world
                </Text>
              </Stack>
            </Anchor>
            <Stack gap={4}>
              <Image
                className={classes.demoWorldArrow}
                src={bottomLeftArrowSrc}
                w={60}
              />
            </Stack>
          </Group>
        </Stack>
      )}
    </Stack>
  );
};

LandingPage.layout = page => (
  <AppLayout<LandingPageProps> withContainer containerSize="xs">
    {page}
  </AppLayout>
);

export default LandingPage;
