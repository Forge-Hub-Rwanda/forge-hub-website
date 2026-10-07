/**
 * Cache tags for the public site's CMS reads (`src/lib/content.ts`).
 *
 * The public pages are served from Next's cache; every admin action that
 * changes one of these tables must call `updateTag` with its tag, or the edit
 * will not show until the cache's safety-net refresh.
 */
export const CONTENT_TAGS = {
  portfolio: "content:portfolio",
  events: "content:events",
  testimonials: "content:testimonials",
  team: "content:team",
} as const;
