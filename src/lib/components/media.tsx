"use client";

import { defineComponent } from "@openuidev/react-lang";
import { ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod/v4";
import { Glyph } from "./glyph";
import { color, cx, fg, radius, radiusSchema, webUrl } from "./style";

const ICON_SIZE = { sm: 14, md: 18, lg: 24, xl: 32 } as const;

export const Icon = defineComponent({
  name: "Icon",
  props: z.object({
    name: z.string(),
    size: z.enum(["sm", "md", "lg", "xl"]).optional(),
    color: color.optional(),
  }),
  description: 'Lucide icon by name, e.g. "map-pin".',
  component: ({ props }) => (
    <span className="iui-icon" style={{ color: fg(props.color) }}>
      <Glyph name={props.name} size={ICON_SIZE[props.size ?? "md"] ?? 18} />
    </span>
  ),
});

// ─── Image search ───────────────────────────────────────────────────────────

const searches = new Map<string, Promise<string[]>>();

/** Photo URLs for a description, from /api/image-search. Failures are retried next time. */
function searchImages(query: string): Promise<string[]> {
  let request = searches.get(query);
  if (!request) {
    request = fetch(`/api/image-search?q=${encodeURIComponent(query)}`)
      .then((response) => (response.ok ? (response.json() as Promise<{ images?: unknown }>) : { images: [] }))
      .then((data) => (Array.isArray(data.images) ? data.images.flatMap((u) => (webUrl(u) ? [u as string] : [])) : []))
      .catch(() => {
        searches.delete(query);
        return [];
      });
    if (searches.size > 200) searches.delete(searches.keys().next().value!);
    searches.set(query, request);
  }
  return request;
}

/** Search results for `query`, or undefined while waiting. The query settles first: it may still be streaming. */
function useImageSearch(query: string | null): string[] | undefined {
  const [result, setResult] = useState<{ query: string; images: string[] } | null>(null);
  useEffect(() => {
    if (!query) return;
    let active = true;
    const timer = setTimeout(() => {
      searchImages(query).then((images) => {
        if (active) setResult({ query, images });
      });
    }, 500);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);
  return query && result?.query === query ? result.images : undefined;
}

export const Image = defineComponent({
  name: "Image",
  props: z.object({
    alt: z.string(),
    src: z.string().optional(),
    aspectRatio: z.number().optional(),
    fit: z.enum(["cover", "contain"]).optional(),
    radius: radiusSchema.optional(),
  }),
  description: "Photo. Without src, or if src fails, a photo is found by searching alt.",
  component: function ImageView({ props }) {
    const alt = typeof props.alt === "string" ? props.alt.trim() : "";
    const src = webUrl(props.src);
    const [failed, setFailed] = useState<string[]>([]);
    const [loaded, setLoaded] = useState<string | null>(null);
    const needSearch = (!src || failed.includes(src)) && alt.length > 2;
    const found = useImageSearch(needSearch ? alt : null);
    const current = [src, ...(found ?? [])].find((url): url is string => !!url && !failed.includes(url));
    const settled = !current && (!needSearch || found !== undefined);
    const ratio = typeof props.aspectRatio === "number" && props.aspectRatio > 0.2 && props.aspectRatio < 5 ? props.aspectRatio : 1.5;
    return (
      <div
        className={cx("iui-image", props.fit === "contain" && "is-contain", loaded === current && "is-loaded")}
        style={{ aspectRatio: ratio, borderRadius: radius(props.radius ?? "lg") }}
        role={current ? undefined : "img"}
        aria-label={current ? undefined : alt}
      >
        {current ? (
          <img
            key={current}
            src={current}
            alt={alt}
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(current)}
            onError={() => setFailed((list) => [...list, current])}
          />
        ) : settled ? (
          <ImageIcon aria-hidden className="iui-image-empty" strokeWidth={1.5} />
        ) : null}
      </div>
    );
  },
});
