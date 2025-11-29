import { createContext, useContext } from "react";

export interface PageDialogState {
  opened: boolean;
  setOpened: (opened: boolean) => void;
}

export const PageDialogStateContext = createContext<
  PageDialogState | undefined
>(undefined);

const usePageDialogState = (): PageDialogState => {
  const state = useContext(PageDialogStateContext);
  if (!state) {
    throw new Error(
      "usePageDialogState must be used within a PageDialogStateProvider",
    );
  }
  return state;
};

export const usePageDialogOpened = (opened?: boolean): boolean => {
  const state = usePageDialogState();
  useEffect(() => {
    if (typeof opened === "boolean") {
      state.setOpened(opened);
    }
  }, [opened]); // eslint-disable-line react-hooks/exhaustive-deps
  return state.opened;
};
