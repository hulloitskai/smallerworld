import { getRadius, type MantineRadius } from "@mantine/core";
import { RichTextEditor, type RichTextEditorProps } from "@mantine/tiptap";
import { Link as LinkExtension } from "@mantine/tiptap";
import PlaceholderExtension from "@tiptap/extension-placeholder";
import { type Editor, type EditorOptions, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKitExtension from "@tiptap/starter-kit";
import { InPortal, OutPortal } from "react-reverse-portal";

import { useHtmlPortalNode } from "~/helpers/react-reverse-portal";

import classes from "./PostEditor.module.css";
import "@mantine/tiptap/styles.layer.css";

export interface PostEditorProps
  extends Omit<RichTextEditorProps, "onChange" | "editor" | "children">,
    Pick<EditorOptions, "onUpdate"> {
  initialValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onEditorCreated?: (editor: Editor) => void;
  radius?: MantineRadius;
  contentEditableMinHeight?: number;
}

const PostEditor: FC<PostEditorProps> = ({
  initialValue,
  placeholder,
  onChange,
  onUpdate,
  onEditorCreated,
  radius,
  contentEditableMinHeight,
  ...otherProps
}) => {
  // == Editor
  const [html, setHtml] = useState(initialValue);
  const editor = useEditor(
    {
      extensions: [
        StarterKitExtension.configure({ heading: false }),
        LinkExtension.configure({ defaultProtocol: "https" }),
        PlaceholderExtension.configure({ placeholder }),
      ],
      editorProps: {
        attributes: {
          class: classes.contentEditable!,
          "data-vaul-no-drag": "true",
        },
      },
      content: initialValue,
      autofocus: true,
      onCreate: ({ editor }) => {
        editor.commands.focus("end");
        if (!!html && editor.getHTML() !== html) {
          editor.commands.setContent(html);
        }
        onEditorCreated?.(editor);
      },
      onUpdate: props => {
        setHtml(props.editor.getHTML());
        onUpdate?.(props);
        onChange?.(props.editor.getHTML());
      },
    },
    [initialValue, placeholder],
  );

  // == Bubble controls
  const bubbleMenuPortalNode = useHtmlPortalNode();

  // == Link editor
  const vaulPortalTarget = useVaulPortalTarget();

  return (
    <RichTextEditor
      {...{ editor }}
      classNames={{
        root: classes.editor,
        content: classes.content,
        controlsGroup: classes.controlsGroup,
      }}
      style={{
        ...(radius && { "--editor-radius": getRadius(radius) }),
        ...(contentEditableMinHeight && {
          "--editor-content-editable-min-height": rem(contentEditableMinHeight),
        }),
      }}
      data-vaul-no-drag
      {...otherProps}
    >
      {bubbleMenuPortalNode && editor && (
        <>
          <InPortal node={bubbleMenuPortalNode}>
            <RichTextEditor.ControlsGroup style={{ pointerEvents: "auto" }}>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Strikethrough />
              <RichTextEditor.Link
                popoverProps={{
                  withArrow: false,
                  position: "top",
                  offset: -26,
                  portalProps: {
                    target: vaulPortalTarget,
                  },
                  styles: {
                    dropdown: {
                      padding: 0,
                      border: "none",
                    },
                  },
                }}
                styles={{
                  linkEditorSave: {
                    textTransform: "lowercase",
                  },
                  linkEditorExternalControl: {
                    border: "none",
                  },
                }}
              />
              {!!editor.getAttributes("link").href && <RichTextEditor.Unlink />}
            </RichTextEditor.ControlsGroup>
          </InPortal>
          <BubbleMenu
            options={{ inline: true }}
            shouldShow={() => true}
            {...{ editor }}
          >
            <OutPortal node={bubbleMenuPortalNode} />
          </BubbleMenu>
        </>
      )}
      <RichTextEditor.Content />
    </RichTextEditor>
  );
};

export default PostEditor;

// const findPortalParent = (ref: Element): Element | null => {
//   let portalParent: Element | null = ref;
//   while (portalParent instanceof HTMLElement && !portalParent.dataset.portal) {
//     portalParent = portalParent.parentElement;
//   }
//   return portalParent;
// };
