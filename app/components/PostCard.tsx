import { Image, Overlay, Text, TypographyStylesProvider } from "@mantine/core";
import { LayoutGroup, motion } from "motion/react";

import LockIcon from "~icons/heroicons/lock-closed-20-solid";

import { clampedImageDimensions } from "~/helpers/images";
import { POST_TYPE_TO_ICON, POST_TYPE_TO_LABEL } from "~/helpers/posts";
import { useWebPush } from "~/helpers/webPush";
import { type Post } from "~/types";

import ImageStack from "./ImageStack";
import QuotedPostCard from "./QuotedPostCard";

import classes from "./PostCard.module.css";
import "yet-another-react-lightbox/styles.css";

export interface PostCardProps extends BoxProps {
  post: Post;
  actions: ReactNode;
  blurContent?: boolean;
  focus?: boolean;
}

const IMAGE_MAX_WIDTH = 340;
const IMAGE_MAX_HEIGHT = 280;
const IMAGE_FLIP_BOUNDARY = 125;

const PostCard: FC<PostCardProps> = ({
  post,
  actions,
  blurContent,
  focus,
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
  const { registration } = useWebPush();
  const focusedRef = useRef(false);
  useEffect(() => {
    const card = cardRef.current;
    if (
      focus &&
      card &&
      (outOfPWAScope || (isStandalone && registration)) &&
      !focusedRef.current
    ) {
      card.scrollIntoView({ behavior: "smooth" });
      focusedRef.current = true;
    }
  }, [focus, isStandalone, outOfPWAScope, registration]);

  return (
    <LayoutGroup>
      <Card
        component={motion.div}
        ref={cardRef}
        className={cn("PostCard", classes.card)}
        withBorder
        shadow="sm"
        layout
        mod={{
          focus,
          "post-visibility": post.visibility,
        }}
        {...otherProps}
      >
        <Card.Section
          component={motion.div}
          layout
          inheritPadding
          pt="xs"
          pb={10}
        >
          <Group gap={8} align="center">
            {!!post.emoji && (
              <Text size="lg" inline display="block">
                {post.emoji}
              </Text>
            )}
            <Group gap={6} style={{ flexGrow: 1 }}>
              {!post.emoji && (
                <Box
                  component={POST_TYPE_TO_ICON[post.type]}
                  fz={10.5}
                  c="dimmed"
                  display="block"
                />
              )}
              <Text size="xs" ff="heading" fw={600} c="dimmed">
                {POST_TYPE_TO_LABEL[post.type]}
              </Text>
            </Group>
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
            {post.visibility === "public" && (
              <Tooltip
                label="this post is publicly visible"
                events={{ hover: true, focus: true, touch: true }}
                position="top-end"
                arrowOffset={16}
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
            {post.visibility === "only_me" && (
              <Tooltip
                label="this post is visible only to you"
                events={{ hover: true, focus: true, touch: true }}
                position="top-end"
                arrowOffset={16}
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
          component={motion.div}
          layout
          mod={{ "blur-content": blurContent }}
        >
          <Stack gap={14}>
            <Stack gap={6}>
              {!!post.title && (
                <Title order={3} size="h4">
                  {post.title}
                </Title>
              )}
              <TypographyStylesProvider>
                <div dangerouslySetInnerHTML={{ __html: post.body_html }} />
              </TypographyStylesProvider>
            </Stack>
            {!!firstImage && (
              <>
                {blurContent || post.images.length === 1 ? (
                  <Image
                    className={classes.image}
                    src={firstImage.src}
                    {...(firstImage.srcset && { srcSet: firstImage.srcset })}
                    fit="contain"
                    mod={{ blur: blurContent }}
                    {...clampedImageDimensions(
                      firstImage,
                      IMAGE_MAX_WIDTH,
                      IMAGE_MAX_HEIGHT,
                    )}
                  />
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
    </LayoutGroup>
  );
};

export default PostCard;
