
import { toast } from 'sonner';

// Sample images for demo purposes
const sampleImages = [
  {
    url: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94',
    page: 'https://example.com/nature',
    depth: 1
  },
  {
    url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b',
    page: 'https://example.com/nature/mountains',
    depth: 2
  },
  {
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
    page: 'https://example.com/nature/forest',
    depth: 2
  },
  {
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05',
    page: 'https://example.com/nature/sunset',
    depth: 2
  },
  {
    url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e',
    page: 'https://example.com/nature/sunrise',
    depth: 3
  },
  {
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
    page: 'https://example.com/nature/valleys',
    depth: 3
  },
  {
    url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff',
    page: 'https://example.com/nature/rivers',
    depth: 3
  },
  {
    url: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07',
    page: 'https://example.com/nature/beach',
    depth: 3
  },
  {
    url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d',
    page: 'https://example.com/nature/forest/pine',
    depth: 4
  },
  {
    url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716',
    page: 'https://example.com/nature/waterfall',
    depth: 3
  },
  {
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
    page: 'https://example.com/nature/landscape',
    depth: 2
  },
  {
    url: 'https://images.unsplash.com/photo-1439853949127-fa647821eba0',
    page: 'https://example.com/nature/ocean',
    depth: 2
  }
];

export interface CrawlResult {
  images: {
    url: string;
    page: string;
    depth: number;
  }[];
}

// Simulated crawler service
export const crawlWebsite = async (startUrl: string, depth: number): Promise<CrawlResult> => {
  // Show a toast notification at the start
  toast.info('Crawler started', {
    description: `Starting at ${startUrl} with depth ${depth}`
  });

  // Simulate crawling time based on depth
  const duration = 1000 + depth * 3000;
  
  return new Promise((resolve) => {
    // We'd implement actual web crawling here in a real application
    // For demo purposes, we'll filter the sample images based on the requested depth
    setTimeout(() => {
      const filteredImages = sampleImages.filter(img => img.depth <= depth);
      
      // Create simulated result structure
      const result: CrawlResult = {
        images: filteredImages.map(img => ({
          url: img.url,
          page: img.page,
          depth: img.depth
        }))
      };
      
      // Show completion toast
      toast.success('Crawling completed', {
        description: `Found ${result.images.length} images`
      });
      
      resolve(result);
    }, duration);
  });
};

// Helper function to simulate progress during crawling
export const getSimulatedProgress = (
  startTime: number, 
  estimatedDuration: number
): number => {
  const elapsed = Date.now() - startTime;
  const progress = Math.min((elapsed / estimatedDuration) * 100, 99.9);
  return progress;
};

// Export results as JSON file
export const exportResultsAsJson = (results: CrawlResult): string => {
  const dataStr = JSON.stringify(results, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  
  return dataUri;
};

// Generate a report from the results
export const generateReport = (results: CrawlResult): string => {
  // Group images by depth
  const byDepth: { [key: number]: number } = {};
  // Group by domain
  const byDomain: { [key: string]: number } = {};
  
  results.images.forEach(img => {
    // Count by depth
    byDepth[img.depth] = (byDepth[img.depth] || 0) + 1;
    
    // Count by domain
    try {
      const domain = new URL(img.page).hostname;
      byDomain[domain] = (byDomain[domain] || 0) + 1;
    } catch (e) {
      // Handle invalid URLs
    }
  });
  
  // Format the report
  const report = `
# Image Crawler Report

## Summary
Total images found: ${results.images.length}

## Images by Depth
${Object.entries(byDepth)
  .map(([depth, count]) => `- Depth ${depth}: ${count} images`)
  .join('\n')}

## Images by Domain
${Object.entries(byDomain)
  .map(([domain, count]) => `- ${domain}: ${count} images`)
  .join('\n')}
  `;
  
  return report;
};
