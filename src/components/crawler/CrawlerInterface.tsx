
import React, { useState, useEffect } from 'react';
import CrawlerForm from './CrawlerForm';
import LoadingAnimation from './LoadingAnimation';
import ImageGrid, { CrawledImage } from './ImageGrid';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { crawlWebsite, getSimulatedProgress, exportResultsAsJson, generateReport } from '@/utils/crawlerService';

const CrawlerInterface: React.FC = () => {
  const [isCrawling, setIsCrawling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [images, setImages] = useState<CrawledImage[]>([]);
  const [activeTab, setActiveTab] = useState('crawler');
  const [resultJson, setResultJson] = useState('');
  const [report, setReport] = useState('');

  // Handle progress updates during crawling
  useEffect(() => {
    let intervalId: number;
    
    if (isCrawling) {
      intervalId = window.setInterval(() => {
        // Calculate simulated progress based on time elapsed
        const estimatedDuration = 3000 + (images.length > 0 ? 0 : 5000); // Longer for first crawl
        const currentProgress = getSimulatedProgress(startTime, estimatedDuration);
        setProgress(currentProgress);
      }, 100);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isCrawling, startTime, images.length]);

  const handleStartCrawl = async (url: string, depth: number) => {
    setIsCrawling(true);
    setStartTime(Date.now());
    setProgress(0);
    
    try {
      const result = await crawlWebsite(url, depth);
      setImages(result.images);
      
      // Generate exportable JSON and report
      setResultJson(exportResultsAsJson(result));
      setReport(generateReport(result));
      
      // Switch to images tab after crawling
      if (result.images.length > 0) {
        setActiveTab('images');
      }
    } catch (error) {
      console.error('Crawling failed:', error);
    } finally {
      setIsCrawling(false);
    }
  };

  const clearResults = () => {
    setImages([]);
    setResultJson('');
    setReport('');
    setActiveTab('crawler');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-16 animate-fade-in">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <TabsList className="h-10">
            <TabsTrigger value="crawler" className="px-4">Crawler</TabsTrigger>
            <TabsTrigger value="images" className="px-4">
              Images
              {images.length > 0 && (
                <span className="ml-2 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                  {images.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="data" className="px-4">Data</TabsTrigger>
          </TabsList>
          
          {images.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearResults}
              className="text-xs"
            >
              Clear Results
            </Button>
          )}
        </div>
        
        <TabsContent value="crawler" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="overflow-hidden border-border/50">
              <CardContent className="p-6">
                <h2 className="text-2xl font-medium mb-6">Web Crawler</h2>
                {isCrawling ? (
                  <LoadingAnimation visible={isCrawling} progress={progress} />
                ) : (
                  <CrawlerForm onSubmit={handleStartCrawl} disabled={isCrawling} />
                )}
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <div className="bg-secondary/50 rounded-lg p-6 border border-border/50">
                <h3 className="text-lg font-medium mb-4">How It Works</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  The web crawler starts at the URL you provide and systematically browses web pages 
                  to discover and download images. It follows links up to the specified depth level, 
                  where depth 1 means only the starting page.
                </p>
                
                <h4 className="text-md font-medium mt-6 mb-2">Settings Explained</h4>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2 text-sm">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                    <span><strong>Starting URL:</strong> The webpage where crawling begins</span>
                  </li>
                  <li className="flex items-start space-x-2 text-sm">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                    <span><strong>Depth:</strong> How many levels of links to follow (1-5)</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-secondary/50 rounded-lg p-6 border border-border/50">
                <h3 className="text-lg font-medium mb-2">Command Line Usage</h3>
                <div className="bg-background rounded-md p-4 font-mono text-sm mb-4 overflow-x-auto">
                  <code>crawl &lt;start_url&gt; &lt;depth&gt;</code>
                </div>
                <p className="text-muted-foreground text-sm">
                  Results will be placed in an <code className="text-xs bg-primary/10 px-1 rounded">images</code> folder with an <code className="text-xs bg-primary/10 px-1 rounded">index.json</code> file.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="images" className="mt-0">
          <Card className="overflow-hidden border-border/50">
            <CardContent className="p-6">
              <ImageGrid images={images} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="overflow-hidden border-border/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">JSON Data</h3>
                {images.length > 0 ? (
                  <>
                    <div className="bg-secondary rounded-md p-4 h-[300px] overflow-auto">
                      <pre className="text-xs font-mono">
                        {JSON.stringify({ images }, null, 2)}
                      </pre>
                    </div>
                    <div className="mt-4">
                      <a
                        href={resultJson}
                        download="index.json"
                        className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        Download JSON
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] bg-secondary/50 rounded-md">
                    <p className="text-muted-foreground">No data available</p>
                    <p className="text-xs text-muted-foreground mt-1">Start crawling to generate data</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-border/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Crawl Report</h3>
                {images.length > 0 ? (
                  <div className="bg-secondary rounded-md p-4 h-[300px] overflow-auto">
                    <div className="prose prose-sm">
                      <pre className="text-xs whitespace-pre-wrap">{report}</pre>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] bg-secondary/50 rounded-md">
                    <p className="text-muted-foreground">No report available</p>
                    <p className="text-xs text-muted-foreground mt-1">Start crawling to generate a report</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CrawlerInterface;
