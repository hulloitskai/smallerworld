import { Image, Text } from "@mantine/core";

import AppLayout from "~/components/AppLayout";
import EditSpaceButton from "~/components/EditSpaceButton";
import LoadMoreButton from "~/components/LoadMoreButton";
import PostCard from "~/components/PostCard";
import SpacePageFloatingActions from "~/components/SpacePageFloatingActions";
import SpacePostCardAuthorActions from "~/components/SpacePostCardAuthorActions";
import SpacePostCardFriendActions from "~/components/SpacePostCardFriendActions";
import { useSpacePosts } from "~/helpers/spaces";
import { WORLD_ICON_RADIUS_RATIO } from "~/helpers/worlds";
import { type Space } from "~/types";

import classes from "./SpacePage.module.css";

export interface SpacePageProps extends SharedPageProps {
  space: Space;
}

const SPACE_ICON_SIZE = 96;

const SpacePage: PageComponent<SpacePageProps> = ({ space }) => {
  useWorldTheme("cloudflow");

  const currentUser = useCurrentUser();
  const queryParams = useQueryParams();
  const isOwner = currentUser?.id === space.owner_id;

  // == Load posts
  const { posts, hasMorePosts, setSize, isValidating } = useSpacePosts(
    space.id,
  );

  return (
    <>
      <Stack>
        {isOwner && (
          <Button
            component={Link}
            href={routes.userSpaces.index.path()}
            leftSection={<BackIcon />}
            mb="xs"
            style={{ alignSelf: "center" }}
          >
            your spaces
          </Button>
        )}
        <Box pos="relative">
          <Stack gap="xs" align="center">
            {space.icon ? (
              <Image
                className={classes.spaceIcon}
                src={space.icon.src}
                {...(!!space.icon.srcset && { srcSet: space.icon.srcset })}
                w={SPACE_ICON_SIZE}
                h={SPACE_ICON_SIZE}
                radius={SPACE_ICON_SIZE / WORLD_ICON_RADIUS_RATIO}
                onClick={() => {
                  const pageUrl = normalizeUrl(
                    routes.spaces.show.path({
                      id: space.friendly_id,
                    }),
                  );
                  void navigator.clipboard.writeText(pageUrl).then(() => {
                    toast.success("space url copied");
                  });
                }}
              />
            ) : (
              <>{isOwner && <Space h="sm" />}</>
            )}
            <Box ta="center">
              <Title size="h2" lh="xs">
                {space.name}
              </Title>
              <Text size="xs" c="dimmed">
                {space.description}
              </Text>
            </Box>
          </Stack>
          {isOwner && (
            <EditSpaceButton
              {...{ space }}
              variant="default"
              size="compact-xs"
              pos="absolute"
              top={0}
              right={0}
              styles={{ section: { marginRight: rem(6) } }}
              onSpaceUpdated={space => {
                router.visit(
                  routes.spaces.show.path({ id: space.friendly_id }),
                  {
                    only: ["space"],
                  },
                );
              }}
            />
          )}
        </Box>
        {posts ? (
          isEmpty(posts) ? (
            <EmptyCard itemLabel="posts" />
          ) : (
            <>
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  {...{ post }}
                  author={{
                    name: post.author_name,
                    world: post.author_world,
                  }}
                  focus={queryParams.post_id === post.id}
                  actions={
                    post.author_id === currentUser?.id ? (
                      <SpacePostCardAuthorActions {...{ space, post }} />
                    ) : (
                      <SpacePostCardFriendActions {...{ post }} />
                    )
                  }
                />
              ))}
              {hasMorePosts && (
                <LoadMoreButton
                  loading={isValidating}
                  style={{ alignSelf: "center" }}
                  onVisible={() => {
                    void setSize(size => size + 1);
                  }}
                />
              )}
            </>
          )
        ) : (
          [...new Array(3)].map((_, i) => <Skeleton key={i} h={120} />)
        )}
      </Stack>
      <SpacePageFloatingActions />
    </>
  );
};

SpacePage.layout = page => (
  <AppLayout<SpacePageProps>
    title={({ space }) => space.name}
    manifestUrl={routes.userManifest.show.path()}
    withContainer
    containerSize="xs"
    withGutter
  >
    {page}
  </AppLayout>
);

export default SpacePage;
