import { useEffect, useState } from "react";
import {
  createHtmlPortalNode,
  type HtmlPortalNode,
} from "react-reverse-portal";

export const useHtmlPortalNode = (): HtmlPortalNode | undefined => {
  const [portalNode, setPortalNode] = useState<HtmlPortalNode | undefined>(
    undefined,
  );
  useEffect(() => {
    setPortalNode(createHtmlPortalNode());
  }, []);
  return portalNode;
};
