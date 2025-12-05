import {
  type CardProps,
  Image,
  Overlay,
  Spoiler,
  Text,
  Typography,
} from "@mantine/core";
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
import { openNewSpacePostModal } from "./NewSpacePostModal";
import { openNewWorldPostModal } from "./NewWorldPostModal";
import QuotedPostCard from "./QuotedPostCard";

import classes from "./PostCard.module.css";
import "yet-another-react-lightbox/styles.css";

export interface PostCardProps
  extends BoxProps,
    Pick<CardProps, "withBorder" | "shadow"> {
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
const PROMPT_CARD_WIDTH = 220;
const PROMPT_CARD_HEIGHT = 140;

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
  withBorder,
  shadow = "md",
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

  const { prompt } = post;
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
      {prompt && (
        <Card
          w={PROMPT_CARD_WIDTH}
          h={PROMPT_CARD_HEIGHT}
          bg={prompt.deck.background_color}
          c={prompt.deck.text_color}
          className={classes.promptCard}
          onClick={() => {
            if (post.space_id) {
              openNewSpacePostModal({
                spaceId: post.space_id,
                postType: "response",
                prompt,
              });
            } else if (post.world_id) {
              openNewWorldPostModal({
                worldId: post.world_id,
                postType: "response",
                prompt,
              });
            }
          }}
        >
          <Text
            size="xs"
            ff="heading"
            ta="center"
            fw={500}
            inline
            opacity={0.8}
          >
            {prompt.deck.name}
          </Text>
          <Text fw={600} ta="center" lh={1.2}>
            {prompt.prompt}
          </Text>
          <Space h="xs" />
        </Card>
      )}
      <Card
        ref={cardRef}
        {...{ withBorder, shadow }}
        className={classes.card}
        mod={{
          focus,
          ...(post.world_id && {
            "world-visibility": post.visibility,
          }),
        }}
      >
        <Card.Section inheritPadding pt="xs" pb={10}>
          <Group gap={8} align="start">
            <Group gap={6} style={{ flexGrow: 1 }}>
              {!!post.emoji && (
                <Box className={classes.emoji}>{post.emoji}</Box>
              )}
              <Group gap={3} className={classes.headerGroup}>
                <Group
                  className={classes.typeGroup}
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
                  <Text size="xs" className={classes.typeLabel} inline>
                    {POST_TYPE_TO_LABEL[post.type]}
                  </Text>
                </Group>
                {!!author && (
                  <Text size="xs" className={classes.authorLabel}>
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
            <Group gap={8} align="start" className={classes.headerGroup}>
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
