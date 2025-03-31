#!/usr/bin/env node

import { program } from "commander";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { crawlPage } from "./crawler.js";

// Get the directory name using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup CLI
program
  .name("crawl")
  .description("A web crawler that downloads images from websites")
  .argument("<start_url>", "URL to start crawling from")
  .argument("<depth>", "Crawling depth (1 = only the start page)", parseInt)
  .action(async (startUrl, depth) => {
    try {
      // Validate URL
      if (!startUrl.startsWith("http://") && !startUrl.startsWith("https://")) {
        startUrl = "https://" + startUrl;
      }

      const url = new URL(startUrl);
      console.log(`Starting crawl at ${url.href} with depth ${depth}`);

      // Create images directory if it doesn't exist
      const imagesDir = path.join(__dirname, "images");
      await fs.ensureDir(imagesDir);

      // Create a fresh index.json file
      const indexPath = path.join(imagesDir, "index.json");
      await fs.writeJson(indexPath, { images: [] }, { spaces: 2 });

      // Start crawling
      await crawlPage(url.href, depth, 1);

      console.log(
        "Crawl complete! Check the images folder for downloaded images."
      );
    } catch (error) {
      console.error("Error:", error.message);
      process.exit(1);
    }
  });

program.parse();
