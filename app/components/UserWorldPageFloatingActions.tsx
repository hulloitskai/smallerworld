import { Affix, HoverCard, Indicator, Text } from "@mantine/core";
import { useModals } from "@mantine/modals";

import MegaphoneIcon from "~icons/heroicons/megaphone-20-solid";

import { prettyFriendName } from "~/helpers/friends";
import { NEKO_SIZE } from "~/helpers/neko";
import { useWebPush } from "~/helpers/webPush";
import { type UserWorldPageProps } from "~/pages/UserWorldPage";
import { type Encouragement, type Post } from "~/types";

import DrawerModal from "./DrawerModal";
import FeedbackNeko from "./FeedbackNeko";
import NewWorldPostButton from "./NewWorldPostButton";
import PostCard from "./PostCard";
import WorldPostCardAuthorActions from "./WorldPostCardAuthorActions";

import classes from "./UserWorldPageFloatingActions.module.css";

export interface UserWorldPageFloatingActionsProps {}

const UserWorldPageFloatingActions: FC<
  UserWorldPageFloatingActionsProps
> = () => {
  const { world } = usePageProps<UserWorldPageProps>();
  const { isStandalone, outOfPWAScope } = usePWA();
  const { pushRegistration, permission: webPushPermission } = useWebPush();
  const { modals } = useModals();

  // == Load encouragements
  const { data: encouragementsData } = useRouteSWR<{
    encouragements: Encouragement[];
  }>(routes.userWorldEncouragements.index, {
    descriptor: "load encouragements",
    keepPreviousData: true,
  });
  const { encouragements = [] } = encouragementsData ?? {};
  const latestEncouragement = last(encouragements);

  // == Load pinned posts
  const { data: pinnedPostsData } = useRouteSWR<{ posts: Post[] }>(
    routes.userWorldPosts.pinned,
    {
      descriptor: "load pinned posts",
      keepPreviousData: true,
    },
  );
  const pinnedPosts = pinnedPostsData?.posts ?? [];

  // == Pinned posts drawer modal
  const [pinnedPostsDrawerModalOpened, setPinnedPostsDrawerModalOpened] =
    useState(false);

  const actionsVisible =
    (isStandalone === false ||
      outOfPWAScope ||
      !!pushRegistration ||
      webPushPermission === "denied") &&
    isEmpty(modals) &&
    !pinnedPostsDrawerModalOpened;
  return (
    <>
      <Space className={classes.space} />
      <Affix className={classes.affix} position={{}} zIndex={180}>
        <Transition transition="pop" mounted={actionsVisible} enterDelay={100}>
          {transitionStyle => (
            <Group
              align="end"
              justify="center"
              gap={8}
              style={[{ pointerEvents: "none" }, transitionStyle]}
            >
              {!isEmpty(encouragements) && (
                <Center mih={42} maw={176}>
                  <Badge
                    className={classes.encouragementsBadge}
                    variant="outline"
                    radius="lg"
                  >
                    {encouragements.map(encouragement => (
                      <HoverCard
                        key={encouragement.id}
                        position="top"
                        shadow="sm"
                      >
                        <HoverCard.Target>
                          <Box className={classes.encouragementEmoji}>
                            {encouragement.emoji}
                          </Box>
                        </HoverCard.Target>
                        <HoverCard.Dropdown px="xs" py={8} maw={240}>
                          <Stack gap={2}>
                            <Text size="sm">
                              &ldquo;{encouragement.message}&rdquo;
                            </Text>
                            <Text
                              size="xs"
                              c="dimmed"
                              style={{ alignSelf: "end" }}
                            >
                              — {prettyFriendName(encouragement.friend)}
                            </Text>
                          </Stack>
                        </HoverCard.Dropdown>
                      </HoverCard>
                    ))}
                  </Badge>
                </Center>
              )}
              <Box pos="relative">
                <NewWorldPostButton
                  worldId={world.id}
                  encouragementId={latestEncouragement?.id}
                  onPostCreated={() => {
                    router.reload({
                      only: ["hasAtLeastOneUserCreatedPost"],
                    });
                  }}
                />
                {!world.hide_neko && (
                  <FeedbackNeko
                    pos="absolute"
                    top={3 - NEKO_SIZE}
                    right="var(--mantine-spacing-lg)"
                  />
                )}
              </Box>
              <Transition
                transition="pop"
                mounted={!isEmpty(pinnedPosts)}
                enterDelay={100}
              >
                {transitionStyle => (
                  <ActionIcon
                    className={classes.pinnedPostsButton}
                    variant="outline"
                    size={42}
                    radius="xl"
                    style={transitionStyle}
                    onClick={() => {
                      setPinnedPostsDrawerModalOpened(true);
                    }}
                  >
                    <Indicator
                      className={classes.pinnedPostsIndicator}
                      label={pinnedPosts.length}
                      size={16}
                      offset={-4}
                    >
                      <MegaphoneIcon />
                    </Indicator>
                  </ActionIcon>
                )}
              </Transition>
            </Group>
          )}
        </Transition>
      </Affix>
      <DrawerModal
        title="your invitations to your friends"
        opened={pinnedPostsDrawerModalOpened}
        onClose={() => {
          setPinnedPostsDrawerModalOpened(false);
        }}
      >
        <Stack>
          {pinnedPosts.map(post => (
            <PostCard
              key={post.id}
              {...{ post }}
              actions={
                <WorldPostCardAuthorActions
                  {...{ post, world }}
                  onFollowUpDrawerModalOpened={() => {
                    setPinnedPostsDrawerModalOpened(false);
                  }}
                />
              }
            />
          ))}
        </Stack>
      </DrawerModal>
    </>
  );
};

export default UserWorldPageFloatingActions;
