import { themeScriptSource } from "@/lib/theme";

/**
 * Applies the stored theme before the browser paints.
 *
 * Rendered as the first child of <body> rather than through `next/script`:
 * the strategies that component offers all run too late to beat the first
 * paint, and a plain inline script in the markup is parsed and executed the
 * moment it is reached — before a single element of the page below it exists,
 * let alone has been painted. That is the whole point of it.
 *
 * A server component, so the source string never ships twice.
 */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScriptSource }} />;
}
