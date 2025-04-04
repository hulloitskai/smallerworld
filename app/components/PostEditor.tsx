import { getRadius, type MantineRadius } from "@mantine/core";
import { RichTextEditor, type RichTextEditorProps } from "@mantine/tiptap";
import LinkExtension from "@tiptap/extension-link";
import PlaceholderExtension from "@tiptap/extension-placeholder";
import { type Editor, type EditorOptions, useEditor } from "@tiptap/react";
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
  const [html, setHtml] = useState(initialValue);
  const editor = useEditor(
    {
      extensions: [
        StarterKitExtension.configure({
          italic: false,
          heading: false,
          history: false,
        }),
        LinkExtension,
        PlaceholderExtension.configure({ placeholder }),
      ],
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

  return (
    <RichTextEditor
      {...{ editor }}
      classNames={{
        root: classes.editor,
        content: classes.content,
        // toolbar: classes.toolbar,
      }}
      style={{
        ...(radius && { "--editor-radius": getRadius(radius) }),
        ...(contentEditableMinHeight && {
          "--editor-content-editable-min-height": `${contentEditableMinHeight}px`,
        }),
      }}
      data-vaul-no-drag
      {...otherProps}
    >
      <RichTextEditor.Content />
    </RichTextEditor>
  );
};

export default PostEditor;
