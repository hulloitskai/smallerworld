import {
  AspectRatio,
  type BoxProps,
  type CardProps,
  Image,
  Text,
  TypographyStylesProvider,
} from "@mantine/core";
import Lightbox from "yet-another-react-lightbox";

import { POST_TYPE_TO_ICON, POST_TYPE_TO_LABEL } from "~/helpers/posts";
import { type Image as ImageType, type QuotedPost } from "~/types";

import classes from "./QuotedPostCard.module.css";
import "yet-another-react-lightbox/styles.css";

export interface QuotedPostCardProps extends CardProps {
  post: QuotedPost;
}

const QuotedPostCard: FC<QuotedPostCardProps> = ({ post, ...otherProps }) => {
  const [coverImage] = post.images ?? [];
  const cardRef = useRef<HTMLDivElement>(null);
  const pinnedUntil = useMemo(() => {
    if (post.pinned_until) {
      return DateTime.fromISO(post.pinned_until);
    }
  }, [post.pinned_until]);

  return (
    <Card
      ref={cardRef}
      className={cn("QuotedPostCard", classes.card)}
      withBorder
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
        </Group>
      </Card.Section>
      <Card.Section className={classes.contentSection} inheritPadding pb="xs">
        <Stack gap={6}>
          {!!post.title && (
            <Title order={3} size="h4">
              {post.title}
            </Title>
          )}
          <TypographyStylesProvider>
            <div dangerouslySetInnerHTML={{ __html: post.body_html }} />
          </TypographyStylesProvider>
          {coverImage && <PostImage image={coverImage} />}
        </Stack>
      </Card.Section>
    </Card>
  );
};

export default QuotedPostCard;

interface PostImageProps extends BoxProps {
  image: ImageType;
}

const PostImage: FC<PostImageProps> = ({ image, ...otherProps }) => {
  const [lightboxOpened, setLightboxOpened] = useState(false);
  const children = (
    <Image
      className={classes.image}
      src={image.src}
      srcSet={image.srcset ?? undefined}
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
        open={lightboxOpened}
        close={() => {
          setLightboxOpened(false);
        }}
        slides={[
          {
            src: image.src,
            ...image.dimensions,
          },
        ]}
        carousel={{ finite: true }}
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
        }}
      />
    </Box>
  );
};
