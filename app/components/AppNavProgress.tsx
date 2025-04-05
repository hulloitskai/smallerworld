import { router } from "@inertiajs/react";
import {
  completeNavigationProgress,
  NavigationProgress,
  startNavigationProgress,
} from "@mantine/nprogress";

import classes from "./AppNavProgress.module.css";
import "@mantine/nprogress/styles.layer.css";

export interface AppNavProgressProps {}

// TODO: On Safari, sometimes the progress bar looks like its "rolling back"
// when it resets. Maybe raise an issue in the Mantine repo?
const AppNavProgress: FC<AppNavProgressProps> = () => {
  useEffect(() => {
    const removeStartListener = router.on("start", startNavigationProgress);
    const removeFinishListener = router.on(
      "finish",
      completeNavigationProgress,
    );
    return () => {
      removeStartListener();
      removeFinishListener();
    };
  }, []);
  return <NavigationProgress className={classes.progress} size={1.5} />;
};

export default AppNavProgress;
