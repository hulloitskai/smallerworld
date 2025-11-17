import { getRadius, type MantineRadius } from "@mantine/core";
import {
  RichTextEditor,
  type RichTextEditorContentProps,
  type RichTextEditorProps,
} from "@mantine/tiptap";
import PlaceholderExtension from "@tiptap/extension-placeholder";
import { type Editor, type EditorOptions, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKitExtension from "@tiptap/starter-kit";

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
  contentProps?: RichTextEditorContentProps;
}

const PostEditor: FC<PostEditorProps> = ({
  initialValue,
  placeholder,
  onChange,
  onUpdate,
  onEditorCreated,
  radius,
  contentProps,
  ...otherProps
}) => {
  const vaulPortalTarget = useVaulPortalTarget();

  // == Editor
  const htmlRef = useRef(initialValue);
  const [showUnlink, setShowUnlink] = useState(false);
  const editor = useEditor(
    {
      extensions: [
        StarterKitExtension.configure({
          heading: false,
          link: { defaultProtocol: "https" },
        }),
        PlaceholderExtension.configure({ placeholder }),
      ],
      editorProps: {
        attributes: {
          class: cn(classes.contentEditable),
        },
      },
      content: initialValue,
      autofocus: true,
      onCreate: ({ editor }) => {
        editor.commands.focus("end");
        if (!!htmlRef.current && editor.getHTML() !== htmlRef.current) {
          editor.commands.setContent(htmlRef.current);
        }
        onEditorCreated?.(editor);
      },
      onUpdate: props => {
        const { editor } = props;
        const html = editor.getHTML();
        htmlRef.current = html;
        onUpdate?.(props);
        onChange?.(html);
      },
      onSelectionUpdate: ({ editor }) => {
        const attributes = editor.getAttributes("link");
        setShowUnlink(!!attributes.href);
      },
      onDestroy: () => {
        console.info("Destroying editor...");
      },
    },
    [],
  );

  return (
    <RichTextEditor
      {...{ editor }}
      classNames={{
        root: classes.editor,
        content: classes.content,
        controlsGroup: classes.controlsGroup,
      }}
      style={{
        ...(radius && {
          "--editor-radius": getRadius(radius),
        }),
      }}
      {...otherProps}
    >
      <BubbleMenu
        options={{
          placement: "top",
          inline: true,
          flip: true,
          shift: true,
          offset: true,
        }}
        {...{ editor }}
      >
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
          {showUnlink && <RichTextEditor.Unlink />}
        </RichTextEditor.ControlsGroup>
      </BubbleMenu>
      <RichTextEditor.Content {...contentProps} />
    </RichTextEditor>
  );
};

export default PostEditor;
