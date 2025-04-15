import {
  AspectRatio,
  type BoxProps,
  CloseButton,
  Image,
  Loader,
  Overlay,
  Text,
  TypographyStylesProvider,
} from "@mantine/core";
import { type ReactNode } from "react";
import Lightbox from "yet-another-react-lightbox";
import LightboxZoomPlugin from "yet-another-react-lightbox/plugins/zoom";

import LockIcon from "~icons/heroicons/lock-closed-20-solid";
import ZoomOutIcon from "~icons/heroicons/magnifying-glass-minus-20-solid";
import ZoomInIcon from "~icons/heroicons/magnifying-glass-plus-20-solid";

import { POST_TYPE_TO_ICON, POST_TYPE_TO_LABEL } from "~/helpers/posts";
import { type Image as ImageType, type Post } from "~/types";

import QuotedPostCard from "./QuotedPostCard";

import classes from "./PostCard.module.css";
import "yet-another-react-lightbox/styles.css";

export interface PostCardProps extends BoxProps {
  post: Post;
  actions: ReactNode;
  blurContent?: boolean;
  focus?: boolean;
}

const PostCard: FC<PostCardProps> = ({
  post,
  actions,
  blurContent: initialBlurContent,
  focus,
  ...otherProps
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const pinnedUntil = useMemo(() => {
    if (post.pinned_until) {
      return DateTime.fromISO(post.pinned_until);
    }
  }, [post.pinned_until]);
  const isAdmin = useIsAdmin();

  // == Auto-focus
  useEffect(() => {
    if (focus && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [focus]);

  // == Blur content
  const [blurContent, setBlurContent] = useState(initialBlurContent);

  return (
    <Card
      ref={cardRef}
      className={cn("PostCard", classes.card)}
      withBorder
      shadow="sm"
      mod={{
        focus,
        "post-visibility": post.visibility,
      }}
      {...otherProps}
    >
      <Card.Section inheritPadding pt="xs" pb={10}>
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
              format={DateTime.DATETIME_MED}
              inline
              className={classes.timestamp}
            >
              {post.created_at}
            </Time>
          )}
          {post.visibility === "public" && (
            <Tooltip
              label="this post is publicly visible"
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
        mod={{ "blur-content": blurContent }}
      >
        <Stack gap={6}>
          {!!post.title && (
            <Title order={3} size="h4">
              {post.title}
            </Title>
          )}
          <TypographyStylesProvider>
            <div dangerouslySetInnerHTML={{ __html: post.body_html }} />
          </TypographyStylesProvider>
          {post.image && <PostImage image={post.image} />}
          {post.quoted_post && (
            <QuotedPostCard post={post.quoted_post} mt={8} />
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
              {isAdmin && (
                <Anchor
                  component="button"
                  c="accent"
                  size="xs"
                  fw={600}
                  onClick={() => {
                    setBlurContent(false);
                  }}
                >
                  view as admin
                </Anchor>
              )}
            </Stack>
          </Overlay>
        )}
      </Card.Section>
      <Card.Section
        inheritPadding
        pt="xs"
        py="sm"
        className={classes.footerSection}
      >
        {actions}
      </Card.Section>
    </Card>
  );
};

export default PostCard;

interface PostImageProps extends BoxProps {
  image: ImageType;
}

const PostImage: FC<PostImageProps> = ({ image, ...otherProps }) => {
  const [lightboxOpened, setLightboxOpened] = useState(false);
  const children = (
    <Image
      className={classes.image}
      src={image.src}
      srcSet={image.src_set}
      fit="contain"
      radius="md"
      onClick={() => {
        setLightboxOpened(true);
      }}
    />
  );
  return (
    <Box
      className={classes.imageContainer}
      {...(image.dimensions && {
        component: AspectRatio,
        ratio: image.dimensions.width / image.dimensions.height,
      })}
      {...otherProps}
    >
      {children}
      <Lightbox
        className={classes.imageLightbox}
        plugins={[LightboxZoomPlugin]}
        open={lightboxOpened}
        close={() => {
          setLightboxOpened(false);
        }}
        slides={[
          {
            src: image.src,
            ...(image.dimensions && {
              width: image.dimensions.width,
              height: image.dimensions.height,
            }),
          },
        ]}
        carousel={{ finite: true }}
        controller={{
          closeOnBackdropClick: true,
          closeOnPullDown: true,
          closeOnPullUp: true,
        }}
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
          buttonClose: () => (
            <CloseButton
              key="close"
              className={classes.closeButton}
              variant="transparent"
              size="lg"
              onClick={() => {
                setLightboxOpened(false);
              }}
            />
          ),
          buttonZoom: ({ zoomIn, zoomOut, zoom, maxZoom }) => (
            <Group key="zoom" gap={0} className={classes.zoomButtons}>
              <ActionIcon
                variant="transparent"
                size="lg"
                onClick={zoomOut}
                disabled={zoom <= 1}
              >
                <ZoomOutIcon />
              </ActionIcon>
              <ActionIcon
                variant="transparent"
                size="lg"
                onClick={zoomIn}
                disabled={zoom >= maxZoom}
              >
                <ZoomInIcon />
              </ActionIcon>
            </Group>
          ),
          iconLoading: () => <Loader />,
        }}
      />
    </Box>
  );
};
