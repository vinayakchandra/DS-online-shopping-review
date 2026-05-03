import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const runtimeNodeModules = "/Users/admin55/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const PptxGenJS = require(path.join(runtimeNodeModules, "pptxgenjs"));
const sharp = require(path.join(runtimeNodeModules, "sharp"));
const JSZip = require(path.join(runtimeNodeModules, "jszip"));

const ROOT = "/Users/admin55/Downloads/DS-shopping";
const WORK = path.join(ROOT, "presentation-workspace");
const SCRATCH = path.join(WORK, "scratch");
const ASSETS = path.join(SCRATCH, "assets");
const PREVIEWS = path.join(SCRATCH, "previews");
const OUTPUT = path.join(WORK, "output", "output.pptx");
fs.mkdirSync(PREVIEWS, { recursive: true });
fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });

const metrics = JSON.parse(fs.readFileSync(path.join(SCRATCH, "project_metrics.json"), "utf8"));
const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Codex";
pptx.subject = "Shopping app review sentiment analysis";
pptx.title = "Shopping App Reviews Sentiment Analysis";
pptx.company = "Data Science Project";
pptx.lang = "en-US";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-US",
};
pptx.defineLayout({ name: "CUSTOM_WIDE", width: 13.333, height: 7.5 });
pptx.layout = "CUSTOM_WIDE";

const bg = path.join(ASSETS, "star-bg.jpeg");
const C = {
  white: "FFFFFF",
  muted: "D9E2FF",
  cyan: "65E4FF",
  teal: "31D1B5",
  yellow: "F7D064",
  pink: "FF6B9E",
  dark: "081023",
  navy: "101735",
};

function addBg(slide) {
  slide.background = { color: "080B1D" };
  slide.addImage({ path: bg, x: 0, y: 0, w: 13.333, h: 7.5 });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 7.5,
    fill: { color: "050817", transparency: 15 },
    line: { color: "050817", transparency: 100 },
  });
}

function title(slide, text, subtitle) {
  slide.addText(text, {
    x: 0.65,
    y: 0.36,
    w: 12.0,
    h: 0.58,
    margin: 0,
    fontFace: "Aptos Display",
    fontSize: 30,
    bold: true,
    color: C.white,
    breakLine: false,
    fit: "shrink",
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 0.65,
    y: 1.02,
    w: 2.0,
    h: 0,
    line: { color: C.cyan, width: 2 },
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.65,
      y: 1.13,
      w: 11.9,
      h: 0.34,
      margin: 0,
      fontSize: 13.5,
      color: C.muted,
      fit: "shrink",
    });
  }
}

function bullets(slide, items, x, y, w, h, options = {}) {
  slide.addText(items.map((item) => ({ text: item, options: { bullet: { type: "bullet" } } })), {
    x,
    y,
    w,
    h,
    margin: 0.08,
    fontSize: options.fontSize ?? 18,
    color: C.white,
    breakLine: false,
    fit: "shrink",
    paraSpaceAfterPt: options.spaceAfter ?? 12,
    valign: "mid",
  });
}

function pill(slide, label, value, x, y, w, color) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h: 0.92,
    rectRadius: 0.08,
    fill: { color: "0E1838", transparency: 6 },
    line: { color, transparency: 10, width: 1.4 },
  });
  slide.addText(value, {
    x: x + 0.12,
    y: y + 0.12,
    w: w - 0.24,
    h: 0.35,
    margin: 0,
    fontSize: 21,
    bold: true,
    color,
    align: "center",
    fit: "shrink",
  });
  slide.addText(label, {
    x: x + 0.12,
    y: y + 0.52,
    w: w - 0.24,
    h: 0.24,
    margin: 0,
    fontSize: 9.5,
    color: C.muted,
    align: "center",
    fit: "shrink",
  });
}

function imagePanel(slide, img, x, y, w, h) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    fill: { color: "FFFFFF", transparency: 0 },
    line: { color: "BBD3FF", transparency: 15, width: 1 },
  });
  slide.addImage({ path: img, x: x + 0.08, y: y + 0.08, w: w - 0.16, h: h - 0.16, sizingCrop: true });
}

function footer(slide, n) {
  slide.addText(`Shopping App Reviews Sentiment Analysis  |  ${n}`, {
    x: 0.65,
    y: 7.08,
    w: 5.2,
    h: 0.22,
    margin: 0,
    fontSize: 8,
    color: "AAB5D6",
  });
}

const slides = [];
function addSlide(draw, previewText) {
  const slide = pptx.addSlide();
  addBg(slide);
  draw(slide);
  footer(slide, slides.length + 1);
  slides.push(previewText);
}

addSlide((s) => {
  s.addText("VADER Sentiment Analysis", {
    x: 0.72,
    y: 2.05,
    w: 11.8,
    h: 0.7,
    margin: 0,
    fontFace: "Aptos Display",
    fontSize: 42,
    bold: true,
    color: C.white,
    fit: "shrink",
  });
  s.addText("of Shopping App Reviews", {
    x: 0.72,
    y: 2.78,
    w: 11.7,
    h: 0.5,
    margin: 0,
    fontSize: 28,
    color: C.cyan,
    bold: true,
  });
  s.addShape(pptx.ShapeType.line, { x: 0.74, y: 3.55, w: 3.1, h: 0, line: { color: C.yellow, width: 3 } });
  s.addText("Data Science Project | E-commerce review mining", {
    x: 0.76,
    y: 3.78,
    w: 8.6,
    h: 0.35,
    margin: 0,
    fontSize: 16,
    color: C.muted,
  });
  pill(s, "review rows", `${(metrics.clean_review_rows / 1000).toFixed(0)}K`, 8.25, 5.6, 1.25, C.cyan);
  pill(s, "shopping apps", `${metrics.app_count}`, 9.75, 5.6, 1.25, C.teal);
  pill(s, "dataset columns", "8+", 11.25, 5.6, 1.25, C.yellow);
}, "VADER Sentiment Analysis of Shopping App Reviews");

addSlide((s) => {
  title(s, "Introduction", "Why sentiment analysis matters for shopping platforms");
  bullets(s, [
    "Shopping apps receive thousands of short, emotional reviews every day.",
    "Manual reading does not scale when teams need quick product feedback.",
    "Sentiment analysis converts review text into Positive, Neutral, and Negative signals.",
    "The project compares major apps such as Alibaba, Aliexpress, Amazon, Flipkart, Myntra, Shein, Walmart, and others.",
  ], 0.9, 1.75, 11.6, 3.8, { fontSize: 22, spaceAfter: 15 });
}, "Introduction");

addSlide((s) => {
  title(s, "Dataset Collection", "Combined review data across multiple e-commerce applications");
  pill(s, "total CSV rows", `${metrics.total_csv_rows.toLocaleString()}`, 0.85, 1.55, 2.05, C.cyan);
  pill(s, "clean reviews used", `${metrics.clean_review_rows.toLocaleString()}`, 3.15, 1.55, 2.4, C.teal);
  pill(s, "largest source", metrics.largest_app, 5.85, 1.55, 2.2, C.yellow);
  pill(s, "largest source rows", `${metrics.largest_app_reviews.toLocaleString()}`, 8.35, 1.55, 2.4, C.pink);
  bullets(s, [
    "Key fields: reviewId, content, score, thumbsUpCount, at, replyContent, repliedAt, appName.",
    "Each row represents a user review and its numerical rating.",
    "The appName field enables grouped comparisons across platforms.",
  ], 1.1, 3.05, 10.9, 2.4, { fontSize: 20, spaceAfter: 14 });
}, "Dataset Collection");

addSlide((s) => {
  title(s, "Data Cleaning Process", "Preparing review text and rating fields for analysis");
  imagePanel(s, path.join(ASSETS, "missing_values.png"), 7.4, 1.45, 5.15, 4.9);
  bullets(s, [
    "Removed rows with missing review content or missing score.",
    "Converted score values to integer categories from 1 to 5.",
    `Reply content was sparse: about ${metrics.missing_reply_percent}% missing after cleaning.`,
    "Created derived columns for sentiment label and review length.",
  ], 0.85, 1.75, 5.95, 4.2, { fontSize: 19, spaceAfter: 13 });
}, "Data Cleaning Process");

addSlide((s) => {
  title(s, "Exploratory Data Analysis", "Ratings vary strongly across shopping applications");
  imagePanel(s, path.join(ASSETS, "rating_distribution.png"), 0.82, 1.25, 11.75, 5.55);
}, "Exploratory Data Analysis");

addSlide((s) => {
  title(s, "Sentiment Labelling", "VADER maps review language into polarity labels");
  bullets(s, [
    "VADER analyzes informal review text using positive, neutral, negative, and compound scores.",
    "Compound score >= 0.05 is classified as Positive.",
    "Compound score <= -0.05 is classified as Negative.",
    "Scores between -0.05 and 0.05 are treated as Neutral.",
  ], 0.92, 1.65, 6.15, 4.55, { fontSize: 21, spaceAfter: 14 });
  imagePanel(s, path.join(ASSETS, "sentiment_mix_by_app.png"), 7.35, 1.45, 5.15, 4.95);
}, "Sentiment Labelling");

addSlide((s) => {
  title(s, "Best-Performing Apps", "Average rating gives a quick baseline before text sentiment");
  imagePanel(s, path.join(ASSETS, "average_rating_by_app.png"), 0.88, 1.35, 6.7, 5.25);
  const top = metrics.top_apps_by_rating.slice(0, 3);
  s.addText("Top rating leaders", { x: 8.05, y: 1.55, w: 3.9, h: 0.3, margin: 0, fontSize: 18, bold: true, color: C.white });
  top.forEach((row, i) => {
    pill(s, row.app, `${row.avg_score}/5`, 8.05, 2.12 + i * 1.15, 2.15, [C.teal, C.cyan, C.yellow][i]);
    s.addText(`${row.reviews.toLocaleString()} reviews`, { x: 10.45, y: 2.36 + i * 1.15, w: 1.8, h: 0.25, margin: 0, fontSize: 11, color: C.muted });
  });
}, "Best-Performing Apps");

addSlide((s) => {
  title(s, "VADER Sentiment Distribution", "The notebook compares sentiment counts by application");
  imagePanel(s, path.join(ASSETS, "vader_sentiment_counts.png"), 0.82, 1.25, 11.75, 5.55);
}, "VADER Sentiment Distribution");

addSlide((s) => {
  title(s, "Clustering Review Characteristics", "Review length and sentiment can segment user feedback");
  imagePanel(s, path.join(ASSETS, "review_length_by_sentiment.png"), 7.15, 1.45, 5.35, 4.9);
  bullets(s, [
    "Created review_length from the character count of each review.",
    "Encoded sentiment numerically: Positive = 1, Neutral = 0, Negative = -1.",
    "Standardization makes both features comparable.",
    "K-Means groups similar review behavior patterns for app-level inspection.",
  ], 0.85, 1.72, 5.75, 4.25, { fontSize: 20, spaceAfter: 13 });
}, "Clustering Review Characteristics");

addSlide((s) => {
  title(s, "Key Insights & Conclusion", "What the analysis reveals about customer experience");
  bullets(s, [
    "Alibaba, Shein, and Aliexpress show the strongest average rating baselines.",
    "Flipkart, Myntra, Snapdeal, and Meesho need closer attention in this dataset.",
    "Negative reviews are useful because they surface friction: shipping, notifications, quality, trust, and app usability.",
    "Sentiment analysis helps product teams prioritize issues faster than manual review reading.",
  ], 0.92, 1.6, 11.2, 4.45, { fontSize: 21, spaceAfter: 14 });
}, "Key Insights & Conclusion");

addSlide((s) => {
  title(s, "Future Scope", "How the project can be extended");
  bullets(s, [
    "Use live app-store review streams for real-time monitoring.",
    "Add topic modelling to connect sentiment with product issues.",
    "Build a dashboard for app-wise sentiment trends over time.",
    "Compare VADER against transformer models for higher accuracy.",
    "Add multilingual sentiment support for regional shopping apps.",
  ], 0.92, 1.55, 11.2, 4.7, { fontSize: 22, spaceAfter: 14 });
}, "Future Scope");

await pptx.writeFile({ fileName: OUTPUT });

const originalPackage = await JSZip.loadAsync(fs.readFileSync(OUTPUT));
const cleanedPackage = new JSZip();
cleanedPackage.platform = "UNIX";
for (const [name, entry] of Object.entries(originalPackage.files)) {
  if (entry.dir || name.endsWith("/")) continue;
  const bytes = await entry.async("nodebuffer");
  cleanedPackage.file(name, bytes, { createFolders: false });
}
fs.writeFileSync(OUTPUT, await cleanedPackage.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));

const bgData = fs.readFileSync(bg).toString("base64");
for (let i = 0; i < slides.length; i++) {
  const heading = slides[i].replace(/&/g, "&amp;");
  const svg = `
  <svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
    <image href="data:image/jpeg;base64,${bgData}" width="1280" height="720" preserveAspectRatio="xMidYMid slice"/>
    <rect width="1280" height="720" fill="#050817" opacity="0.18"/>
    <text x="68" y="88" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="#fff">${heading}</text>
    <line x1="68" y1="116" x2="270" y2="116" stroke="#65E4FF" stroke-width="5"/>
    <text x="68" y="650" font-family="Arial, sans-serif" font-size="18" fill="#AAB5D6">Slide ${i + 1}</text>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(PREVIEWS, `slide-${String(i + 1).padStart(2, "0")}.png`));
}

console.log(JSON.stringify({ output: OUTPUT, slides: slides.length, previews: PREVIEWS }, null, 2));
