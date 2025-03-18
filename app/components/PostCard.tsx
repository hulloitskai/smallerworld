import { Text, TypographyStylesProvider } from "@mantine/core";
import { type ReactNode } from "react";

import { POST_TYPE_TO_ICON, POST_TYPE_TO_LABEL } from "~/helpers/posts";
import { type Post } from "~/types";

import classes from "./PostCard.module.css";

export interface PostCardProps extends BoxProps {
  post: Post;
  actions: ReactNode;
}

const PostCard: FC<PostCardProps> = ({ post, actions, ...otherProps }) => {
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
                display="block"
                component={POST_TYPE_TO_ICON[post.type]}
                fz={10}
                c="dimmed"
              />
            )}
            <Text size="xs" ff="heading" fw={600} c="dimmed">
              {POST_TYPE_TO_LABEL[post.type]}
            </Text>
          </Group>
          <Time
            format={DateTime.DATETIME_MED}
            size="sm"
            inline
            className={classes.timestamp}
            display="block"
          >
            {post.created_at}
          </Time>
        </Group>
      </Card.Section>
      <Card.Section inheritPadding>
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
