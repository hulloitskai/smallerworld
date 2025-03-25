import { Overlay, Text } from "@mantine/core";

import PlayIcon from "~icons/heroicons/play-20-solid";

import demoVideoSrc from "~/assets/videos/demo.mp4";

import AppLayout from "~/components/AppLayout";
import { useContact } from "~/helpers/contact";

import classes from "./LandingPage.module.css";

export interface LandingPageProps extends SharedPageProps {}

const LandingPage: PageComponent<LandingPageProps> = () => {
  const currentUser = useCurrentUser();

  // == Reveal demovideo
  const videoRef = useRef<HTMLVideoElement>(null);
  const [revealVideo, setRevealVideo] = useState(false);

  return (
    <Stack align="center" gap="xl">
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
              leftSection={<SmallerWorldIcon />}
              style={{ flexShrink: 0 }}
            >
              your world
            </Button>
          </Group>
        </Alert>
      )}
      <Title className={classes.opener} ta="center">
        a <Emph>life log</Emph> that your friends can{" "}
        <Emph>pin to their home screen</Emph>
      </Title>
      <Box pos="relative">
        <Box
          component="video"
          ref={videoRef}
          src={demoVideoSrc}
          muted
          loop
          playsInline
          controls={false}
          autoPlay
          disablePictureInPicture
          disableRemotePlayback
          maw={275}
          style={{ borderRadius: "var(--mantine-radius-default)" }}
        />
        {!revealVideo && (
          <Overlay backgroundOpacity={0} blur={3}>
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
      </Box>
      <Card withBorder>
        <Stack gap={6}>
          <Stack align="center" gap={4}>
            <Box component={SmallerWorldIcon} fz="xl" />
            <Title order={2} size="h3" ta="center">
              how it works
            </Title>
          </Stack>
          <List type="ordered" className={classes.list}>
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
      <IWantThisButton />
    </Stack>
  );
};

LandingPage.layout = page => (
  <AppLayout<LandingPageProps> withContainer containerSize="xs" withGutter>
    {page}
  </AppLayout>
);

export default LandingPage;

const IWantThisButton: FC = () => {
  const [contact] = useContact({
    type: "sms",
    body: "hey i think this smaller world thing is dope. i want to be a beta user! my name is: ",
  });
  return (
    <Button
      leftSection="😍"
      size="lg"
      radius="xl"
      styles={{ section: { fontSize: "var(--mantine-font-size-xl)" } }}
      onClick={() => {
        void contact();
      }}
    >
      wtf? i want this!
    </Button>
  );
};

const Emph: FC<PropsWithChildren> = ({ children }) => (
  <span className={classes.emphasis}>{children}</span>
);
