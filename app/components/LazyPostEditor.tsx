import { type Key, lazy, Suspense } from "react";

import { type PostEditorProps } from "./PostEditor";

const PostEditor = lazy(() => import("./PostEditor"));

export interface LazyPostEditorProps extends PostEditorProps {
  editorKey?: Key;
}

const LazyPostEditor: FC<LazyPostEditorProps> = ({
  editorKey,
  ...otherProps
}) => (
  <Suspense fallback={<Skeleton height={144} />}>
    <PostEditor key={editorKey} {...otherProps} />
  </Suspense>
);

export default LazyPostEditor;
