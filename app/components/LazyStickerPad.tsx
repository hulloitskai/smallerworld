import { lazy, Suspense } from "react";

import { type StickerPadProps } from "./StickerPad";

const StickerPad = lazy(() => import("./StickerPad"));

export interface LazyStickerPadProps extends StickerPadProps {}

const LazyStickerPad = forwardRef<HTMLDivElement, LazyStickerPadProps>(
  (props, ref) => (
    <Suspense fallback={<Skeleton height={144} />}>
      <StickerPad {...props} ref={ref} />
    </Suspense>
  ),
);

export default LazyStickerPad;
