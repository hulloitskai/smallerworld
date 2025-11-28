import { Image, Overlay, Spoiler, Text, Typography } from "@mantine/core";
import { Paper } from "@mantine/core";
import { Spotify } from "react-spotify-embed";

import ExpandIcon from "~icons/heroicons/chevron-down-20-solid";
import LockIcon from "~icons/heroicons/lock-closed-20-solid";

import { clampedImageDimensions } from "~/helpers/images";
import { POST_TYPE_TO_ICON, POST_TYPE_TO_LABEL } from "~/helpers/posts";
import { useWebPush } from "~/helpers/webPush";
import {
  type AuthorWorldProfile,
  type Image as ImageType,
  type Post,
} from "~/types";

import AppLightbox from "./AppLightbox";
import ImageStack from "./ImageStack";
import QuotedPostCard from "./QuotedPostCard";

import classes from "./PostCard.module.css";
import "yet-another-react-lightbox/styles.css";

export interface PostCardProps extends BoxProps {
  post: Post;
  actions: ReactNode;
  author?: {
    name: string;
    world: AuthorWorldProfile | null;
  };
  blurContent?: boolean;
  hideEncouragement?: boolean;
  focus?: boolean;
  expanded?: boolean;
  highlightType?: boolean;
  onTypeClick?: () => void;
}

const IMAGE_MAX_WIDTH = 340;
const IMAGE_MAX_HEIGHT = 280;
const IMAGE_FLIP_BOUNDARY = 125;

const PostCard: FC<PostCardProps> = ({
  post,
  author,
  actions,
  blurContent,
  hideEncouragement,
  focus,
  expanded: forceExpanded = false,
  highlightType,
  onTypeClick,
  className,
  ...otherProps
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const pinnedUntil = useMemo(() => {
    if (post.pinned_until) {
      return DateTime.fromISO(post.pinned_until);
    }
  }, [post.pinned_until]);
  const [firstImage] = post.images;

  // == Auto-focus
  const { isStandalone, outOfPWAScope } = usePWA();
  const { pushRegistration } = useWebPush();
  const focusedRef = useRef(false);
  useEffect(() => {
    const card = cardRef.current;
    if (
      focus &&
      card &&
      (outOfPWAScope || (isStandalone && pushRegistration)) &&
      !focusedRef.current
    ) {
      card.scrollIntoView({ behavior: "smooth" });
      focusedRef.current = true;
    }
  }, [focus, isStandalone, outOfPWAScope, pushRegistration]);

  // == Spoiler
  const [expanded, setExpanded] = useState(forceExpanded);

  return (
    <Stack className={cn("PostCard", className)} gap={6} {...otherProps}>
      {post.encouragement && !hideEncouragement && (
        <Badge
          variant="default"
          leftSection={post.encouragement.emoji}
          className={classes.encouragementBadge}
        >
          &ldquo;{post.encouragement.message}&rdquo;
        </Badge>
      )}
      <Card
        ref={cardRef}
        withBorder
        shadow="sm"
        className={classes.card}
        mod={{
          focus,
          ...(post.world_id && {
            "world-visibility": post.visibility,
          }),
        }}
      >
        <Card.Section inheritPadding pt="xs" pb={10}>
          <Group gap={8} align="center">
            <Group gap={6} align="center" style={{ flexGrow: 1 }}>
              {!!post.emoji && (
                <Box className={classes.emoji}>{post.emoji}</Box>
              )}
              <Group gap={3}>
                <Group
                  className={classes.typeGroup}
                  align="end"
                  gap={6}
                  mod={{ highlight: highlightType, interactive: !!onTypeClick }}
                  onClick={onTypeClick}
                >
                  {!post.emoji && (
                    <Box
                      className={classes.typeIcon}
                      component={POST_TYPE_TO_ICON[post.type]}
                    />
                  )}
                  <Text size="xs" className={classes.typeLabel}>
                    {POST_TYPE_TO_LABEL[post.type]}
                  </Text>
                </Group>
                {!!author && (
                  <Text size="xs" c="dimmed" mb={2}>
                    from{" "}
                    {author?.world ? (
                      <Anchor
                        component={Link}
                        href={withTrailingSlash(
                          routes.worlds.show.path({
                            id: author.world.handle,
                          }),
                        )}
                        fw={700}
                      >
                        {author.name}
                      </Anchor>
                    ) : (
                      <Text span fw={700}>
                        {author.name}
                      </Text>
                    )}
                  </Text>
                )}
              </Group>
            </Group>
            <Group gap={8} align="center">
              {pinnedUntil ? (
                <Box className={classes.timestamp} mod={{ pinned: true }}>
                  {pinnedUntil < DateTime.now() ? "expired" : "expires"}{" "}
                  <Time format={DateTime.DATE_MED} inline inherit>
                    {pinnedUntil}
                  </Time>
                </Box>
              ) : (
                <Time
                  className={classes.timestamp}
                  format={dateTime => {
                    if (dateTime.hasSame(DateTime.now(), "day")) {
                      return dateTime.toLocaleString(DateTime.TIME_SIMPLE);
                    }
                    return dateTime.toLocaleString(DateTime.DATETIME_MED);
                  }}
                  inline
                  block
                >
                  {post.created_at}
                </Time>
              )}
              {!!post.world_id && post.visibility === "public" && (
                <Tooltip
                  label="visible to everyone"
                  events={{ hover: true, focus: true, touch: true }}
                  position="top-end"
                  arrowOffset={20}
                >
                  <Box>
                    <Box
                      component={PublicIcon}
                      fz={10.5}
                      c="primary"
                      display="block"
                    />
                  </Box>
                </Tooltip>
              )}
            </Group>
            {post.visibility === "secret" && (
              <Tooltip
                label="secretly visible to select friends"
                events={{ hover: true, focus: true, touch: true }}
                position="top-end"
                arrowOffset={20}
              >
                <Box>
                  <Box
                    component={LockIcon}
                    fz={10.5}
                    c="primary"
                    display="block"
                  />
                </Box>
              </Tooltip>
            )}
          </Group>
        </Card.Section>
        <Card.Section
          className={classes.contentSection}
          inheritPadding
          mod={{ "blur-content": blurContent }}
        >
          <Stack gap={14}>
            <Stack gap={6}>
              {!!post.title && (
                <Title order={3} size="h4">
                  {post.title}
                </Title>
              )}
              {post.spotify_track_id && (
                <Paper
                  component={Spotify}
                  link={`https://open.spotify.com/track/${post.spotify_track_id}`}
                  wide
                  shadow="lg"
                  mt={2}
                  mb={8}
                  height={152}
                  style={{ borderRadius: "var(--mantine-radius-default)" }}
                />
              )}
              <Spoiler
                maxHeight={380}
                showLabel={
                  <Button
                    component="div"
                    className={classes.showMoreButton}
                    leftSection={<ExpandIcon />}
                    size="compact-sm"
                  >
                    show more
                  </Button>
                }
                hideLabel={null}
                {...{ expanded }}
                onExpandedChange={setExpanded}
                classNames={{
                  root: classes.spoiler,
                  control: classes.spoilerControl,
                  content: classes.spoilerContent,
                }}
                mod={{ expanded }}
              >
                <Typography
                  dangerouslySetInnerHTML={{ __html: post.body_html }}
                />
              </Spoiler>
            </Stack>
            {!!firstImage && (
              <>
                {blurContent || post.images.length === 1 ? (
                  <ImageWithLightbox image={firstImage} {...{ blurContent }} />
                ) : (
                  <ImageStack
                    images={post.images}
                    maxWidth={IMAGE_MAX_WIDTH}
                    maxHeight={IMAGE_MAX_HEIGHT}
                    flipBoundary={IMAGE_FLIP_BOUNDARY}
                    mb={6}
                  />
                )}
              </>
            )}
            {post.quoted_post && (
              <QuotedPostCard post={post.quoted_post} radius="md" mt={8} />
            )}
          </Stack>
          {blurContent && (
            <Overlay backgroundOpacity={0} blur={4} zIndex={0} inset={1}>
              <Stack align="center" justify="center" gap={6} h="100%">
                <Alert
                  variant="outline"
                  color="gray"
                  icon={<LockIcon />}
                  title="visible only to invited friends"
                  className={classes.restrictedAlert}
                />
              </Stack>
            </Overlay>
          )}
        </Card.Section>
        <Card.Section
          className={classes.footerSection}
          inheritPadding
          pt="xs"
          py="sm"
        >
          {actions}
        </Card.Section>
      </Card>
    </Stack>
  );
};

export default PostCard;

interface ImageWithLightboxProps extends BoxProps {
  image: ImageType;
  blurContent?: boolean;
  downloadable?: boolean;
}

const ImageWithLightbox: FC<ImageWithLightboxProps> = ({
  image,
  blurContent,
  downloadable,
  className,
  ...otherProps
}) => {
  const [opened, setOpened] = useState(false);
  const [index, setIndex] = useState(0);
  return (
    <>
      <Image
        className={cn(classes.image, className)}
        src={image.src}
        {...(image.srcset && { srcSet: image.srcset })}
        fit="contain"
        mod={{ blur: blurContent }}
        onClick={() => {
          setOpened(true);
        }}
        {...clampedImageDimensions(image, IMAGE_MAX_WIDTH, IMAGE_MAX_HEIGHT)}
        {...otherProps}
      />
      <AppLightbox
        open={opened}
        close={() => {
          setOpened(false);
        }}
        onIndexChange={setIndex}
        images={[image]}
        {...{ downloadable, index }}
      />
    </>
  );
};
