import { Affix, Modal } from "@mantine/core";
import {
  createHtmlPortalNode,
  InPortal,
  OutPortal,
} from "react-reverse-portal";

import NewIcon from "~icons/heroicons/pencil-square-20-solid";

import {
  POST_TYPE_TO_ICON,
  POST_TYPE_TO_LABEL,
  POST_TYPES,
} from "~/helpers/posts";
import { type PostType } from "~/types";

import PostForm from "./PostForm";

import classes from "./NewPost.module.css";

export interface NewPostProps {
  disabled?: boolean;
}

const NewPost: FC<NewPostProps> = ({ disabled }) => {
  const [postType, setPostType] = useState<PostType | null>(null);
  const previousPostType = usePrevious(postType);

  // == Drawer / Modal
  const portalNode = useMemo(() => createHtmlPortalNode(), []);

  // == Affix
  const affixInset = "var(--mantine-spacing-xl)";
  return (
    <>
      <Space h={50} />
      <InPortal node={portalNode}>
        <PostForm
          postType={postType ?? previousPostType ?? null}
          onPostCreated={() => {
            setPostType(null);
          }}
        />
      </InPortal>
      <Affix
        position={{
          bottom: `max(${affixInset}, env(safe-area-inset-bottom, 0px))`,
          left: affixInset,
          right: affixInset,
        }}
      >
        <Center style={{ pointerEvents: "none" }}>
          <Transition transition="pop" mounted={!disabled && !postType}>
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
                    size="lg"
                    className={classes.button}
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
          <Modal
            title={<>new {postType ? POST_TYPE_TO_LABEL[postType] : "post"}</>}
            opened={!!postType}
            onClose={() => {
              setPostType(null);
            }}
          >
            <OutPortal node={portalNode} />
          </Modal>
        </Center>
      </Affix>
    </>
  );
};

export default NewPost;
