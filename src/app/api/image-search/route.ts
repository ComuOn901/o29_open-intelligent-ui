// Photo search for the Image component: Wikipedia lead images for the best
// matching articles, then Wikimedia Commons files. Runs on the server so the
// browser makes one same-origin request per description and results are cached.

const cache = new Map<string, string[]>();
const HEADERS = { "User-Agent": "open-intelligent-ui (https://github.com/thesysdev/open-intelligent-ui)" };
const SKIP = /\.svg|icon|logo|map|flag|seal|coat_of_arms|signature|diagram/i;
const WIDTH = 960;

type Page = { index?: number; thumbnail?: { source?: string }; imageinfo?: { thumburl?: string; url?: string; mime?: string }[] };

async function query(host: string, params: Record<string, string>): Promise<Page[]> {
  const url = `https://${host}/w/api.php?${new URLSearchParams({ action: "query", format: "json", formatversion: "2", ...params })}`;
  const response = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`${host} ${response.status}`);
  const data: { query?: { pages?: Page[] } } = await response.json();
  return (data.query?.pages ?? []).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
}

async function search(q: string): Promise<string[]> {
  const images: string[] = [];
  const add = (url: string | undefined) => {
    if (url && url.startsWith("https://") && !SKIP.test(url) && !images.includes(url)) images.push(url);
  };
  const articles = await query("en.wikipedia.org", { generator: "search", gsrsearch: q, gsrlimit: "4", prop: "pageimages", piprop: "thumbnail", pithumbsize: String(WIDTH) });
  articles.forEach((page) => add(page.thumbnail?.source));
  if (images.length < 3) {
    const files = await query("commons.wikimedia.org", { generator: "search", gsrsearch: `${q} filetype:bitmap`, gsrnamespace: "6", gsrlimit: "6", prop: "imageinfo", iiprop: "url|mime", iiurlwidth: String(WIDTH) });
    files.forEach((page) => {
      const info = page.imageinfo?.[0];
      if (info?.mime?.startsWith("image/")) add(info.thumburl ?? info.url);
    });
  }
  return images.slice(0, 4);
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.replace(/\s+/g, " ").trim();
  if (!q || q.length < 2 || q.length > 200) return Response.json({ error: { message: "q must be 2 to 200 characters" } }, { status: 400 });
  let images = cache.get(q);
  if (!images) {
    try {
      images = await search(q);
    } catch {
      return Response.json({ error: { message: "Image search unavailable" } }, { status: 502 });
    }
    if (cache.size >= 500) cache.delete(cache.keys().next().value!);
    cache.set(q, images);
  }
  return Response.json({ images }, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
