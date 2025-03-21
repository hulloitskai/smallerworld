import {
  AspectRatio,
  type BoxProps,
  Image,
  Overlay,
  Text,
  TypographyStylesProvider,
} from "@mantine/core";
import { type ReactNode } from "react";
import Lightbox from "yet-another-react-lightbox";

import LockIcon from "~icons/heroicons/lock-closed-20-solid";

import { POST_TYPE_TO_ICON, POST_TYPE_TO_LABEL } from "~/helpers/posts";
import { type Image as ImageModel, type Post } from "~/types";

import classes from "./PostCard.module.css";
import "yet-another-react-lightbox/styles.css";

export interface PostCardProps extends BoxProps {
  post: Post;
  actions: ReactNode;
  blurContent?: boolean;
}

const PostCard: FC<PostCardProps> = ({
  post,
  actions,
  blurContent,
  ...otherProps
}) => {
  return (
    <Card withBorder shadow="sm" {...otherProps}>
      <Card.Section inheritPadding pt="xs" pb={10}>
        <Group gap={8} align="start">
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
          <Time
            format={DateTime.DATETIME_MED}
            size="xs"
            inline
            className={classes.timestamp}
            display="block"
          >
            {post.created_at}
          </Time>
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
        </Stack>
        {blurContent && (
          <Overlay backgroundOpacity={0} blur={4} inset={-4} zIndex={0}>
            <Center h="100%">
              <Alert
                variant="outline"
                color="gray"
                icon={<LockIcon />}
                title="visible only to invited friends"
                className={classes.restrictedAlert}
              />
            </Center>
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
  image: ImageModel;
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
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
        }}
      />
    </Box>
  );
};
