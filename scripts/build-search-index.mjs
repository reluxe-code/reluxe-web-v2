// scripts/build-search-index.mjs
import fs from "fs/promises";
import path from "path";
import fg from "fast-glob";
import cheerio from "cheerio";

/**
 * Usage:
 *  node scripts/build-search-index.mjs [outDir] [destJson]
 *  Defaults: outDir="out", destJson="public/search-index.json"
 *
 * Recommended flow:
 *   next build && next export && node scripts/build-search-index.mjs
 */

const outDir = process.argv[2] || "out";
const destJson = process.argv[3] || "public/search-index.json";

const IGNORES = [
  "**/_next/**",
  "**/cms/**",
  "**/wp-admin/**",
  "**/wp-includes/**",
  "**/api/**",
];

const TYPE_BY_SEGMENT = (seg) => ({
  services: "Service",
  conditions: "Condition",
  events: "Event",
  locations: "Location",
  team: "Team",
  about: "About",
  blog: "Blog",
  posts: "Blog",
  legal: "Policy",
}[seg] || "Page");

const titleCase = (s = "") =>
  s.replace(/[-_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());

const normalizeSpace = (s = "") => s.replace(/\s+/g, " ").trim();

const htmlToText = ($, selector) =>
  normalizeSpace($(selector).text() || "");

const toUrlFromFile = (root, file) => {
  const rel = path.posix.relative(root, file).replace(/\\/g, "/");
  if (rel.endsWith("/index.html")) {
    const d = rel.slice(0, -"/index.html".length);
    return `/${d}`;
  }
  if (rel.endsWith(".html")) {
    return `/${rel.slice(0, -".html".length)}`;
  }
  return `/${rel}`;
};

async function main() {
  // ensure dest folder exists
  await fs.mkdir(path.dirname(destJson), { recursive: true });

  // collect html files from /out
  const pattern = path.posix.join(outDir.replace(/\\/g, "/"), "**/*.html");
  const files = await fg(pattern, { ignore: IGNORES });

  const items = [];

  for (const file of files) {
    try {
      const html = await fs.readFile(file, "utf8");
      const $ = cheerio.load(html);

      // URL
      const url = toUrlFromFile(outDir.replace(/\\/g, "/"), file);

      // META
      const ogTitle = $('meta[property="og:title"]').attr("content");
      const headTitle = $("title").first().text();
      const h1 = $("h1").first().text();
      const title = normalizeSpace(
        ogTitle || headTitle || h1 || titleCase(url.split("/").pop())
      );

      const ogDesc = $('meta[property="og:description"]').attr("content");
      const metaDesc = $('meta[name="description"]').attr("content");
      const firstP = htmlToText($, "main p, article p, p");
      const description = normalizeSpace(ogDesc || metaDesc || firstP);

      // CONTENT SNIPPET (prefer main/article)
      const mainText =
        htmlToText($, "main") || htmlToText($, "article") || htmlToText($, "body");
      const snippet = (description || mainText).slice(0, 220);

      // TYPE + TAGS
      const seg = url.split("/").filter(Boolean)[0] || "";
      const type = TYPE_BY_SEGMENT(seg);
      const tags = [seg, type, ...title.toLowerCase().split(/\s+/)].filter(Boolean);

      // Skip obvious non-content pages
      if (["/_error", "/500"].includes(url)) continue;

      items.push({
        title,
        url: url === "" ? "/" : url,
        type,
        tags,
        content: mainText.slice(0, 1400), // keep it reasonable
        description,
      });
    } catch (e) {
      // ignore bad file, continue
      // console.error("Index error:", file, e.message);
    }
  }

  // De-dupe by URL (in case both foo/index.html and foo.html exist)
  const unique = [];
  const seen = new Set();
  for (const it of items) {
    if (seen.has(it.url)) continue;
    seen.add(it.url);
    unique.push(it);
  }

  // Sort: type weight + title
  const typeOrder = ["Service", "Condition", "Event", "Location", "Team", "Blog", "Policy", "Page"];
  unique.sort((a, b) => {
    const ta = typeOrder.indexOf(a.type);
    const tb = typeOrder.indexOf(b.type);
    if (ta !== tb) return ta - tb;
    return a.title.localeCompare(b.title);
  });

  await fs.writeFile(destJson, JSON.stringify(unique, null, 2), "utf8");
  console.log(`✓ Built search index: ${unique.length} items -> ${destJson}`);

  // Optional: also drop into /out for static hosting convenience
  try {
    const outDest = path.join(outDir, "search-index.json");
    await fs.writeFile(outDest, JSON.stringify(unique, null, 2), "utf8");
    console.log(`✓ Copied to ${outDest}`);
  } catch {}
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
