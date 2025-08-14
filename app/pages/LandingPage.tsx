import {
  HoverCard,
  Image,
  Overlay,
  type StackProps,
  Text,
} from "@mantine/core";

import PlayIcon from "~icons/heroicons/play-20-solid";
import QuestionIcon from "~icons/heroicons/question-mark-circle-20-solid";

import bottomLeftArrowSrc from "~/assets/images/bottom-left-arrow.png";
import inviteCloseFriendsSrc from "~/assets/images/invite-close-friends.png";
import logoSrc from "~/assets/images/logo.png";
import shareRealStuffSrc from "~/assets/images/share-real-stuff.png";
import swirlyUpArrowSrc from "~/assets/images/swirly-up-arrow.png";

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

  // == Reveal demo video
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const updateVideoPlaying = useCallback(() => {
    setTimeout(() => {
      const video = videoRef.current;
      if (video) {
        setVideoPlaying(!video.paused && !video.ended);
      }
    }, 10);
  }, []);

  return (
    <Stack align="center" gap={48} pb="xl">
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
      <Stack align="center">
        <Title className={classes.title}>
          you have thoughts you want to share—
          <br />
          <span className={classes.emph}>but not with the whole internet.</span>
        </Title>
        <Text className={classes.subtitle}>
          smaller world is a private space to just be yourself—with your close
          friends.
        </Text>
      </Stack>
      <Box pos="relative">
        <Box className={classes.videoContainer}>
          <Box
            component="video"
            ref={videoRef}
            playsInline
            controls={videoPlaying}
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            className={classes.video}
            onPlaying={updateVideoPlaying}
            onPause={updateVideoPlaying}
            onEnded={updateVideoPlaying}
          >
            <source
              src="https://tttkkdzhzvelxmbcqvlg.supabase.co/storage/v1/object/public/media/realtalk-v2-web.webm"
              type="video/webm"
            />
            <source
              src="https://tttkkdzhzvelxmbcqvlg.supabase.co/storage/v1/object/public/media/realtalk-v2-web.mp4"
              type="video/mp4"
            />
          </Box>
          <Transition transition="fade" mounted={!videoPlaying}>
            {style => (
              <Overlay
                backgroundOpacity={0}
                blur={3}
                radius="lg"
                {...{ style }}
              >
                <Center h="100%">
                  <Button
                    variant="filled"
                    leftSection={<PlayIcon />}
                    onClick={() => {
                      const video = videoRef.current;
                      if (video) {
                        if (video.ended) {
                          video.currentTime = 0;
                        }
                        void video.play();
                      }
                    }}
                  >
                    play
                  </Button>
                </Center>
              </Overlay>
            )}
          </Transition>
        </Box>
        <Box className={classes.videoCallout}>
          <SingleDayFontHead />
          <Stack className={classes.videoCalloutStack}>
            <Text className={classes.videoCalloutLabel}>
              why i made this :)
            </Text>
            <Image
              src={swirlyUpArrowSrc}
              className={classes.videoCalloutArrow}
            />
          </Stack>
        </Box>
      </Box>
      <Stack>
        <Stack gap={8}>
          <Center
            p={8}
            bg="var(--mantine-color-white)"
            style={{ borderRadius: 32, alignSelf: "center" }}
          >
            <Image src={logoSrc} h={44} w="unset" />
          </Center>
          <Title order={2} size="h3" ta="center" lh={1.2}>
            how it works
          </Title>
        </Stack>
        <HowItWorksStepCard
          step={1}
          title="create your world"
          description="a private page for your thoughts, casual event invites, or little life updates — whatever's on your mind."
          bottomSection={
            <Button
              component={Link}
              href={routes.world.show.path()}
              leftSection="😍"
              variant="filled"
              radius="xl"
              styles={{
                section: {
                  fontSize: "var(--mantine-font-size-lg)",
                },
              }}
            >
              create your world
            </Button>
          }
        />
        <HowItWorksStepCard
          step={2}
          title="invite close friends"
          description="send them a special link to enter your world and get notified whenever you post."
          bottomSection={
            <Image src={inviteCloseFriendsSrc} w={320} radius="default" />
          }
        />
        <HowItWorksStepCard
          step={3}
          title="share real stuff"
          description="no likes, no followers. just staying connected with your close friends."
          bottomSection={
            <Stack align="center">
              <Image src={shareRealStuffSrc} radius="default" />
              <HoverCard width={354} withArrow shadow="md">
                <HoverCard.Target>
                  <Badge size="lg">but wait... what do i post???</Badge>
                </HoverCard.Target>
                <HoverCard.Dropdown>
                  <Stack gap={4}>
                    <Text size="sm" ff="heading" fw={600}>
                      you can post whatever you want, but here are some ideas:
                    </Text>
                    <List type="unordered" size="sm" pr="md">
                      <List.Item>
                        a blurry photo you like for reasons even you can&apos;t
                        explain.
                      </List.Item>
                      <List.Item>
                        a snack combination that makes no nutritional sense but
                        works.
                      </List.Item>
                      <List.Item>
                        a tiny win no one clapped for but you.
                      </List.Item>
                      <List.Item>
                        the dumbest thing you believed as a kid.
                      </List.Item>
                      <List.Item>
                        a hill you&apos;d die on that you know is objectively
                        wrong.
                      </List.Item>
                      <List.Item>
                        a photo that makes you look unhinged but happy.
                      </List.Item>
                      <List.Item>
                        the last screenshot you took (no cropping).
                      </List.Item>
                      <List.Item>
                        a weird flex so specific it could be used to identify
                        you in court.
                      </List.Item>
                      <List.Item>
                        the most petty reason you&apos;ve ever disliked someone.
                      </List.Item>
                      <List.Item>
                        something you probably shouldn&apos;t say here but are
                        going to anyway.
                      </List.Item>
                    </List>
                  </Stack>
                </HoverCard.Dropdown>
              </HoverCard>
            </Stack>
          }
        />
        {/* <List type="ordered" className={classes.howItWorksList}>
          <List.Item>
            <strong>create your world</strong>: a private page for your
            thoughts, casual event invites, or little life updates —
            whatever&apos;s on your mind.
          </List.Item>
          <List.Item>
            <strong>invite close friends</strong>: send them a special link to
            enter your world and get notified whenever you post.
          </List.Item>
          <List.Item>
            <strong>share real stuff</strong>: no likes, no followers. just
            staying connected with your close friends.
          </List.Item>
        </List> */}
      </Stack>
      <Stack align="center" gap={8}>
        <Title order={2} size="h3" ta="center">
          start your smaller world today 😌
        </Title>
        <Button
          component={Link}
          href={routes.world.show.path()}
          leftSection="😍"
          size="lg"
          radius="xl"
          variant="filled"
          styles={{
            section: {
              fontSize: rem(28),
            },
          }}
        >
          create your world
        </Button>
      </Stack>
      {/* {demoUser && (
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
              href={routes.users.show.path({ id: demoUser.handle })}
            >
              <Stack className={classes.demoWorld} align="center" gap={6}>
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
      )} */}
    </Stack>
  );
};

LandingPage.layout = page => (
  <AppLayout<LandingPageProps> withContainer containerSize="sm">
    {page}
  </AppLayout>
);

export default LandingPage;

interface HowItWorksStepCardProps {
  step: number;
  title: ReactNode;
  description: ReactNode;
  bottomSection?: ReactNode;
}

const HowItWorksStepCard: FC<HowItWorksStepCardProps> = ({
  step,
  title,
  description,
  bottomSection,
}) => (
  <Card withBorder maw={440} pt="sm">
    <Stack align="center" gap="xs">
      <Box ta="center">
        <Title order={3} size="h5">
          {step}. {title}
        </Title>
        <Text size="sm" lh={1.3} opacity={0.7} style={{ textWrap: "pretty" }}>
          {description}
        </Text>
      </Box>
      {bottomSection}
    </Stack>
  </Card>
);
