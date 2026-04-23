import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

export const renderEmailTemplate = (element: ReactElement) =>
  `<!DOCTYPE html>${renderToStaticMarkup(element)}`;
