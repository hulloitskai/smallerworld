import { Affix, HoverCard, Indicator, Text } from "@mantine/core";
import { useModals } from "@mantine/modals";

import DraftIcon from "~icons/heroicons/ellipsis-horizontal-20-solid";
import DraftCircleIcon from "~icons/heroicons/ellipsis-horizontal-circle-20-solid";
import MegaphoneIcon from "~icons/heroicons/megaphone-20-solid";
import NewIcon from "~icons/heroicons/pencil-square-20-solid";

import { openNewWorldPostModal } from "~/components/NewWorldPostModal";
import { prettyFriendName } from "~/helpers/friends";
import { NEKO_SIZE } from "~/helpers/neko";
import {
  POST_TYPE_TO_ICON,
  POST_TYPE_TO_LABEL,
  POST_TYPES,
  worldPostDraftKey,
} from "~/helpers/posts";
import { useSavedDraftType } from "~/helpers/posts/drafts";
import { useWebPush } from "~/helpers/webPush";
import { type UserWorldPageProps } from "~/pages/UserWorldPage";
import { type Encouragement, type Post } from "~/types";

import DrawerModal from "./DrawerModal";
import FeedbackNeko from "./FeedbackNeko";
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

  // == New post draft
  const newPostDraftType = useSavedDraftType({
    localStorageKey: worldPostDraftKey(world.id),
  });

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
                <Menu
                  width={220}
                  shadow="sm"
                  classNames={{
                    dropdown: classes.menuDropdown,
                    itemLabel: classes.menuItemLabel,
                    itemSection: classes.menuItemSection,
                  }}
                >
                  <Menu.Target>
                    <Indicator
                      className={classes.newPostDraftIndicator}
                      label={<DraftIcon />}
                      size={16}
                      offset={4}
                      color="white"
                      disabled={!newPostDraftType}
                    >
                      <Button
                        id="new-post"
                        size="md"
                        variant="filled"
                        radius="xl"
                        className={classes.menuButton}
                        leftSection={<Box component={NewIcon} fz="lg" />}
                      >
                        new post
                      </Button>
                    </Indicator>
                  </Menu.Target>
                  <Menu.Dropdown>
                    {POST_TYPES.map(postType => (
                      <Menu.Item
                        key={postType}
                        leftSection={
                          <Box
                            component={POST_TYPE_TO_ICON[postType]}
                            fz="md"
                          />
                        }
                        {...(postType === newPostDraftType && {
                          rightSection: (
                            <Box
                              component={DraftCircleIcon}
                              className={classes.menuItemDraftIcon}
                            />
                          ),
                        })}
                        onClick={() => {
                          openNewWorldPostModal({
                            worldId: world.id,
                            postType,
                            encouragementId: latestEncouragement?.id,
                            onPostCreated: () => {
                              router.reload({
                                only: ["hasAtLeastOneUserCreatedPost"],
                              });
                            },
                          });
                        }}
                      >
                        new {POST_TYPE_TO_LABEL[postType]}
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>
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
