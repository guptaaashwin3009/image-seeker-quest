import axios from "axios";
import * as cheerio from "cheerio";
import URLParse from "url-parse";
import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import crypto from "crypto";
import pLimit from "p-limit";

// Get the directory name using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  CONCURRENCY: 5, // Maximum concurrent requests
  MAX_LINKS_PER_PAGE: 5, // Maximum links to follow per page
  REQUEST_TIMEOUT: 10000, // 10 seconds
  MAX_CONTENT_LENGTH: 10 * 1024 * 1024, // 10MB
  USER_AGENT:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  IMAGES_DIR: path.join(__dirname, "images"),
  INDEX_PATH: path.join(__dirname, "images", "index.json"),
  BATCH_SIZE: 10, // Number of images to process before updating index
};

// Track visited URLs to avoid duplicates
const visitedUrls = new Set();

// Track downloaded images to avoid duplicates
const downloadedImages = new Set();

// Concurrent request limiter
const limiter = pLimit(CONFIG.CONCURRENCY);

// Batch updates for index.json
let pendingIndexUpdates = [];
let indexData = null;

/**
 * Initialize the crawler
 */
async function initialize() {
  // Ensure the images directory exists
  await fs.ensureDir(CONFIG.IMAGES_DIR);

  // Load or create the index file
  try {
    indexData = await fs.readJson(CONFIG.INDEX_PATH);
  } catch (error) {
    indexData = { images: [] };
    await fs.writeJson(CONFIG.INDEX_PATH, indexData, { spaces: 2 });
  }

  // Populate downloadedImages set from existing index
  indexData.images.forEach((img) => downloadedImages.add(img.url));
}

/**
 * Crawl a web page and its child pages up to the specified depth
 * @param {string} url - URL to crawl
 * @param {number} maxDepth - Maximum crawl depth
 * @param {number} currentDepth - Current depth of crawl
 */
export async function crawlPage(url, maxDepth, currentDepth = 0) {
  // Initialize on first run
  if (currentDepth === 0) {
    await initialize();
  }

  if (visitedUrls.has(url) || currentDepth > maxDepth) {
    return;
  }

  visitedUrls.add(url);
  console.log(`Crawling (${currentDepth}/${maxDepth}): ${url}`);

  try {
    // Fetch the page content
    const { data } = await axios.get(url, {
      headers: { "User-Agent": CONFIG.USER_AGENT },
      timeout: CONFIG.REQUEST_TIMEOUT,
      maxContentLength: CONFIG.MAX_CONTENT_LENGTH,
    });

    // Parse HTML
    const $ = cheerio.load(data);

    // Find and download images in parallel
    await findAndDownloadImages($, url, currentDepth);

    // If we haven't reached max depth, find and crawl links
    if (currentDepth < maxDepth) {
      const links = findLinks($, url);

      // Limit the number of links to crawl
      const limitedLinks = links.slice(0, CONFIG.MAX_LINKS_PER_PAGE);

      if (limitedLinks.length > 0) {
        console.log(`Crawling ${limitedLinks.length} links from ${url}`);

        // Process links in parallel with concurrency limit
        await Promise.all(
          limitedLinks.map((link) =>
            limiter(() => crawlPage(link, maxDepth, currentDepth + 1))
          )
        );
      }
    }
  } catch (error) {
    console.error(`Error crawling ${url}: ${error.message}`);
  }

  // Ensure all pending updates are processed when the top-level crawl finishes
  if (currentDepth === 0 && pendingIndexUpdates.length > 0) {
    await updateIndexBatch();
  }
}

/**
 * Find all links on a page
 * @param {CheerioAPI} $ - Cheerio instance
 * @param {string} baseUrl - Base URL for resolving relative links
 * @returns {string[]} - Array of absolute URLs
 */
function findLinks($, baseUrl) {
  const links = new Set();
  const parsedBaseUrl = new URLParse(baseUrl);
  const baseHostname = parsedBaseUrl.hostname;

  $("a").each((_, element) => {
    const href = $(element).attr("href");
    if (!href) return;

    try {
      // Resolve relative URLs
      const absoluteUrl = new URL(href, baseUrl).href;

      // Skip if already visited or already in our links set
      if (visitedUrls.has(absoluteUrl) || links.has(absoluteUrl)) {
        return;
      }

      // Add the link
      links.add(absoluteUrl);
    } catch (error) {
      // Skip invalid URLs
    }
  });

  return Array.from(links);
}

/**
 * Find images on a page and download them
 * @param {CheerioAPI} $ - Cheerio instance
 * @param {string} pageUrl - URL of the page
 * @param {number} depth - Current depth of crawl
 */
async function findAndDownloadImages($, pageUrl, depth) {
  const imagesToDownload = [];

  $("img").each((_, element) => {
    const src = $(element).attr("src");
    if (!src) return;

    try {
      // Resolve relative URLs
      const absoluteUrl = new URL(src, pageUrl).href;

      // Skip data URLs
      if (absoluteUrl.startsWith("data:")) return;

      // Skip already downloaded images
      if (!downloadedImages.has(absoluteUrl)) {
        imagesToDownload.push(absoluteUrl);
        downloadedImages.add(absoluteUrl); // Mark as downloaded to prevent duplicates
      }
    } catch (error) {
      // Skip invalid URLs
    }
  });

  if (imagesToDownload.length === 0) return;

  console.log(`Found ${imagesToDownload.length} new images on ${pageUrl}`);

  // Download images in parallel with concurrency limit
  await Promise.all(
    imagesToDownload.map((imageUrl) =>
      limiter(() => downloadImage(imageUrl, pageUrl, depth))
    )
  );
}

/**
 * Process a batch update to the index.json file
 */
async function updateIndexBatch() {
  if (pendingIndexUpdates.length === 0) return;

  const updates = [...pendingIndexUpdates];
  pendingIndexUpdates = [];

  try {
    // Add all updates to the index
    indexData.images.push(...updates);

    // Write the updated index
    await fs.writeJson(CONFIG.INDEX_PATH, indexData, { spaces: 2 });
    console.log(`Updated index with ${updates.length} new images`);
  } catch (error) {
    console.error(`Error updating index: ${error.message}`);
    // Put updates back in the queue
    pendingIndexUpdates.push(...updates);
  }
}

/**
 * Download an image and queue an index update
 * @param {string} imageUrl - URL of the image
 * @param {string} pageUrl - URL of the page where the image was found
 * @param {number} depth - Depth of the page in the crawl
 */
async function downloadImage(imageUrl, pageUrl, depth) {
  try {
    // Generate a filename based on the URL
    const hash = crypto.createHash("md5").update(imageUrl).digest("hex");
    const parsedUrl = new URLParse(imageUrl);
    const ext = path.extname(parsedUrl.pathname) || ".jpg";
    const filename = `${hash}${ext}`;
    const outputPath = path.join(CONFIG.IMAGES_DIR, filename);

    // Check if file already exists (to avoid re-downloading)
    if (await fs.pathExists(outputPath)) {
      return;
    }

    // Fetch the image
    const response = await axios({
      method: "get",
      url: imageUrl,
      responseType: "stream",
      timeout: CONFIG.REQUEST_TIMEOUT,
      headers: { "User-Agent": CONFIG.USER_AGENT },
    });

    // Save the image
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // Queue index update
    pendingIndexUpdates.push({
      url: imageUrl,
      page: pageUrl,
      depth: depth,
      filename: filename,
    });

    // Process batch update if we've reached the threshold
    if (pendingIndexUpdates.length >= CONFIG.BATCH_SIZE) {
      await updateIndexBatch();
    }
  } catch (error) {
    console.error(`Error downloading ${imageUrl}: ${error.message}`);
  }
}
