import { ActionIcon, Affix, Drawer, Modal, Text } from "@mantine/core";
import { type Editor } from "@tiptap/react";
import {
  createHtmlPortalNode,
  InPortal,
  OutPortal,
} from "react-reverse-portal";

import EmojiIcon from "~icons/heroicons/face-smile";
import NewIcon from "~icons/heroicons/pencil-square-20-solid";

import {
  mutatePosts,
  POST_TYPE_TO_ICON,
  POST_TYPE_TO_LABEL,
  POST_TYPES,
} from "~/helpers/posts";
import { type PostType } from "~/types";

import EmojiPopover from "./EmojiPopover";
import LazyPostEditor from "./LazyPostEditor";

import classes from "./NewPost.module.css";

export interface NewPostProps {}

const NewPost: FC<NewPostProps> = () => {
  const [postType, setPostType] = useState<PostType | null>(null);
  const previousPostType = usePrevious(postType);

  // == Drawer / Modal
  const portalNode = useMemo(() => createHtmlPortalNode(), []);
  const { breakpoints } = useMantineTheme();
  const showDrawer = useMediaQuery(`(max-width: ${breakpoints.xs})`);
  const DrawerOrModal = showDrawer ? Drawer : Modal;

  // == Affix
  const affixInset = showDrawer
    ? "var(--mantine-spacing-md)"
    : "var(--mantine-spacing-xl)";
  return (
    <>
      <Space h={36} />
      <InPortal node={portalNode}>
        <NewPostForm
          postType={postType ?? previousPostType ?? null}
          onPostCreated={() => {
            setPostType(null);
          }}
        />
      </InPortal>
      <Affix
        position={{ bottom: affixInset, left: affixInset, right: affixInset }}
      >
        <Center style={{ pointerEvents: "none" }}>
          <Transition transition="pop" mounted={!postType}>
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
                    className={classes.button}
                    leftSection={<Box component={NewIcon} fz="lg" />}
                    {...{ style }}
                  >
                    share to your friends
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
          <DrawerOrModal
            title={<>new {postType ? POST_TYPE_TO_LABEL[postType] : "post"}</>}
            opened={!!postType}
            onClose={() => {
              setPostType(null);
            }}
            {...(!showDrawer && { size: "var(--container-size-xs)" })}
          >
            <OutPortal node={portalNode} />
          </DrawerOrModal>
        </Center>
      </Affix>
    </>
  );
};

export default NewPost;

interface NewPostFormProps {
  postType: PostType | null;
  onPostCreated: () => void;
}

const POST_TITLE_PLACEHOLDERS: Partial<Record<PostType, string>> = {
  journal_entry: "february 13, 2025",
  poem: "the invisible mirror",
};

const POST_TYPES_WITH_TITLE = Object.keys(POST_TITLE_PLACEHOLDERS);

const POST_BODY_PLACEHOLDERS: Record<PostType, string> = {
  journal_entry: "today felt kind of surreal. almost like a dream...",
  poem: "broken silver eyes cry me a thousand mirrors\nbeautiful reflections of personal nightmares\nthe sort i save for my therapist's office\nand of course the pillowcase i water every night",
  invitation:
    "i'm going to https://lu.ma/2323 tonight! pls come out if you're free :)",
  question: "liberty village food recs??",
};

const NewPostForm: FC<NewPostFormProps> = ({ postType, onPostCreated }) => {
  const currentUser = useAuthenticatedUser();
  const titlePlaceholder = postType
    ? POST_TITLE_PLACEHOLDERS[postType]
    : undefined;
  const bodyPlaceholder = postType
    ? POST_BODY_PLACEHOLDERS[postType]
    : undefined;

  // == Editor
  const editorRef = useRef<Editor | null>();

  // == Form
  const { setFieldValue, getInputProps, submit, values, submitting } = useForm({
    action: routes.posts.create,
    descriptor: "new post",
    initialValues: {
      title: "",
      body_html: "",
      emoji: "",
    },
    transformValues: ({ title, body_html, emoji }) => ({
      post: {
        type: postType,
        title: title || null,
        body_html,
        emoji,
      },
    }),
    onSuccess: (data, { reset }) => {
      reset();
      editorRef.current?.commands.clearContent();
      void mutatePosts(currentUser.id);
      onPostCreated();
    },
  });

  const [bodyTextEmpty, setBodyTextEmpty] = useState(true);
  return (
    <form onSubmit={submit}>
      <Stack gap="xs">
        <Group gap="xs" align="start">
          <EmojiPopover
            onEmojiClick={({ emoji }) => {
              setFieldValue("emoji", emoji);
            }}
          >
            {({ open }) => (
              <ActionIcon
                className={classes.emojiButton}
                variant="default"
                size={36}
                onClick={() => {
                  if (values.emoji) {
                    setFieldValue("emoji", "");
                  } else {
                    open();
                  }
                }}
              >
                {values.emoji ? (
                  <Text size="xl">{values.emoji}</Text>
                ) : (
                  <Box
                    component={EmojiIcon}
                    c="var(--mantine-color-placeholder)"
                  />
                )}
              </ActionIcon>
            )}
          </EmojiPopover>
          <Stack gap="xs" style={{ flexGrow: 1 }}>
            {!!postType && POST_TYPES_WITH_TITLE.includes(postType) && (
              <TextInput
                {...getInputProps("title")}
                placeholder={titlePlaceholder}
              />
            )}
            <LazyPostEditor
              {...getInputProps("body_html")}
              placeholder={bodyPlaceholder}
              onEditorCreated={editor => {
                editorRef.current = editor;
              }}
              onUpdate={({ editor }) => {
                setBodyTextEmpty(editor.getText().trim() === "");
              }}
            />
            <Button
              type="submit"
              leftSection={<SendIcon />}
              style={{ alignSelf: "end" }}
              disabled={bodyTextEmpty}
              loading={submitting}
            >
              post
            </Button>
          </Stack>
        </Group>
      </Stack>
    </form>
  );
};
