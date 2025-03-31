# Image Seeker Quest

A simple Node.js web crawler that downloads images from websites.

## Features

- Crawls websites starting from a specific URL
- Controls crawling depth
- Downloads images from each visited page
- Creates an index.json file with information about downloaded images
- Only visits pages within the same domain
- Avoids duplicates

## Installation

### Local Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Make sure both scripts are executable:

```bash
chmod +x index.js crawl
```

### Global Installation (Recommended)

To use the `crawl` command from anywhere, install the package globally:

```bash
sudo npm install -g .
```

This will make the `crawl` command available system-wide.

## Usage

After local installation, you can use the crawler with:

```bash
./crawl <start_url> <depth>
```

After global installation, you can use it from anywhere with:

```bash
crawl <start_url> <depth>
```

### Parameters

- `start_url`: The URL where the crawling starts
- `depth`: The crawling depth (1 means only the starting page)

### Example

```bash
crawl https://example.com 2
```

This will:
1. Crawl https://example.com
2. Find and download all images on that page
3. Find all links on that page to the same domain
4. Visit each link and download images there too
5. Store all images in the "images" folder
6. Create an index.json file with information about each image

## Output

All downloaded images are stored in the `images` folder. An `index.json` file is created with the following format:

```json
{
  "images": [
    {
      "url": "https://example.com/image.jpg",
      "page": "https://example.com",
      "depth": 1
    },
    ...
  ]
}
```

## Dependencies

- axios: For HTTP requests
- cheerio: For HTML parsing
- commander: For CLI argument parsing
- fs-extra: For file system operations
- url-parse: For URL parsing
