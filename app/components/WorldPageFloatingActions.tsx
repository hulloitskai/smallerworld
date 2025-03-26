import { Affix, Indicator, Modal } from "@mantine/core";
import {
  createHtmlPortalNode,
  InPortal,
  OutPortal,
} from "react-reverse-portal";

import MegaphoneIcon from "~icons/heroicons/megaphone-20-solid";
import NewIcon from "~icons/heroicons/pencil-square-20-solid";

import {
  POST_TYPE_TO_ICON,
  POST_TYPE_TO_LABEL,
  POST_TYPES,
} from "~/helpers/posts";
import { useWebPush } from "~/helpers/webPush";
import { type Post, type PostType } from "~/types";

import AuthorPostCardActions from "./AuthorPostCardActions";
import DrawerModal from "./DrawerModal";
import PostCard from "./PostCard";
import PostForm from "./PostForm";

import classes from "./WorldPageFloatingActions.module.css";

export interface WorldPageFloatingActionsProps {}

const WorldPageFloatingActions: FC<WorldPageFloatingActionsProps> = () => {
  const isStandalone = useIsStandalone();
  const { registration } = useWebPush();
  const [postType, setPostType] = useState<PostType | null>(null);
  const previousPostType = usePrevious(postType);

  // == Load pinned posts
  const { data } = useRouteSWR<{ posts: Post[] }>(routes.posts.pinned, {
    descriptor: "load pinned posts",
  });
  const pinnedPosts = data?.posts ?? [];

  // == New post modal
  const newPostPortalNode = useMemo(() => createHtmlPortalNode(), []);

  // == Pinned posts drawer modal
  const [pinnedPostsDrawerModalOpened, setPinnedPostsDrawerModalOpened] =
    useState(false);

  // == Affix
  const affixInset = "var(--mantine-spacing-xl)";

  const actionsVisible =
    /* (isStandalone === false || !!registration) && */ !pinnedPostsDrawerModalOpened;
  return (
    <>
      <Space className={classes.space} />
      <InPortal node={newPostPortalNode}>
        <PostForm
          postType={postType ?? previousPostType ?? null}
          onPostCreated={() => {
            setPostType(null);
          }}
        />
      </InPortal>
      <Affix
        zIndex={180}
        position={{
          bottom: `max(${affixInset}, var(--safe-area-inset-bottom, 0px))`,
          left: affixInset,
          right: affixInset,
        }}
      >
        <Group
          align="center"
          justify="center"
          gap={8}
          style={{ pointerEvents: "none" }}
        >
          <Transition
            transition="pop"
            mounted={actionsVisible}
            enterDelay={100}
          >
            {style => (
              <Menu
                width={220}
                shadow="sm"
                classNames={{
                  itemLabel: classes.menuItemLabel,
                  itemSection: classes.menuItemSection,
                }}
              >
                <Menu.Target>
                  <Button
                    variant="filled"
                    radius="xl"
                    className={classes.menuButton}
                    leftSection={<Box component={NewIcon} fz="lg" />}
                    {...{ style }}
                  >
                    share with your friends
                  </Button>
                </Menu.Target>
                <Menu.Dropdown style={{ pointerEvents: "auto" }}>
                  {POST_TYPES.map(type => (
                    <Menu.Item
                      key={type}
                      leftSection={
                        <Box component={POST_TYPE_TO_ICON[type]} fz="md" />
                      }
                      onClick={() => {
                        setPostType(type);
                      }}
                    >
                      new {POST_TYPE_TO_LABEL[type]}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            )}
          </Transition>
          <Transition
            transition="pop"
            mounted={actionsVisible && !isEmpty(pinnedPosts)}
            enterDelay={100}
          >
            {style => (
              <ActionIcon
                variant="outline"
                size={36}
                className={classes.pinnedPostsButton}
                {...{ style }}
                onClick={() => {
                  setPinnedPostsDrawerModalOpened(true);
                }}
              >
                <Indicator label={pinnedPosts.length} size={16} offset={-4}>
                  <MegaphoneIcon />
                </Indicator>
              </ActionIcon>
            )}
          </Transition>
        </Group>
      </Affix>
      <Modal
        title={<>new {postType ? POST_TYPE_TO_LABEL[postType] : "post"}</>}
        size="var(--container-size-xs)"
        opened={!!postType}
        onClose={() => {
          setPostType(null);
        }}
      >
        <OutPortal node={newPostPortalNode} />
      </Modal>
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
              actions={<AuthorPostCardActions {...{ post }} />}
            />
          ))}
        </Stack>
      </DrawerModal>
    </>
  );
};

export default WorldPageFloatingActions;
