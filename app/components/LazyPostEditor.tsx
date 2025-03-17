import { lazy, Suspense } from "react";

import { type PostEditorProps } from "./PostEditor";

const PostEditor = lazy(() => import("./PostEditor"));

export interface LazyPostEditorProps extends PostEditorProps {}

const LazyPostEditor: FC<LazyPostEditorProps> = props => (
  <Suspense fallback={<Skeleton height={144} />}>
    <PostEditor {...props} />
  </Suspense>
);

export default LazyPostEditor;
