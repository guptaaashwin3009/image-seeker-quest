
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface CrawledImage {
  url: string;
  page: string;
  depth: number;
}

interface ImageGridProps {
  images: CrawledImage[];
  className?: string;
}

const ImageGrid: React.FC<ImageGridProps> = ({ images, className }) => {
  const [selectedImage, setSelectedImage] = useState<CrawledImage | null>(null);

  if (!images.length) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-10", className)}>
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-muted-foreground"
          >
            <path d="M5 7.2A2.2 2.2 0 0 1 7.2 5h9.6A2.2 2.2 0 0 1 19 7.2v9.6a2.2 2.2 0 0 1-2.2 2.2H7.2A2.2 2.2 0 0 1 5 16.8z" />
            <circle cx="10.5" cy="10.5" r="1.5" />
            <path d="m19 19-3.5-3.5" />
            <path d="M4 15v-3a8 8 0 0 1 8-8h3" />
            <path d="M20 9v3a8 8 0 0 1-8 8h-3" />
          </svg>
        </div>
        <h3 className="text-lg font-medium">No images found</h3>
        <p className="text-sm text-muted-foreground mt-1">Start crawling to find images</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Image count */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium">Discovered Images</h3>
        <span className="px-3 py-1 rounded-full bg-secondary text-xs font-medium">
          {images.length} images
        </span>
      </div>
      
      {/* Image grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <Card 
            key={index} 
            className="overflow-hidden group image-grid-item cursor-pointer"
            onClick={() => setSelectedImage(image)}
          >
            <div className="relative aspect-square overflow-hidden bg-secondary">
              <img
                src={image.url}
                alt={`Crawled image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                <div className="text-white text-xs">
                  <div className="truncate max-w-full">
                    {new URL(image.page).hostname}
                  </div>
                  <div className="opacity-70">Depth: {image.depth}</div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Image detail dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-3xl w-[90vw]">
          <DialogHeader>
            <DialogTitle>Image Details</DialogTitle>
          </DialogHeader>
          
          {selectedImage && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-square bg-secondary rounded-md overflow-hidden">
                <img 
                  src={selectedImage.url} 
                  alt="Selected image" 
                  className="w-full h-full object-contain" 
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Image URL</h4>
                  <p className="text-sm break-all mt-1">{selectedImage.url}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Source Page</h4>
                  <p className="text-sm break-all mt-1">
                    <a 
                      href={selectedImage.page} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary hover:underline"
                    >
                      {selectedImage.page}
                    </a>
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Crawl Depth</h4>
                  <p className="text-sm mt-1">Level {selectedImage.depth}</p>
                </div>
                
                <div className="pt-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Actions</h4>
                  <div className="flex space-x-2 mt-2">
                    <a
                      href={selectedImage.url}
                      download
                      className="px-3 py-2 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                      Download
                    </a>
                    <a
                      href={selectedImage.page}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                      Visit Source
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageGrid;
