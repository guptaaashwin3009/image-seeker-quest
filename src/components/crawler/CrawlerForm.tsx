
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';

interface CrawlerFormProps {
  onSubmit: (url: string, depth: number) => void;
  disabled?: boolean;
}

const CrawlerForm: React.FC<CrawlerFormProps> = ({ onSubmit, disabled = false }) => {
  const [url, setUrl] = useState('https://example.com');
  const [depth, setDepth] = useState(2);
  const [urlError, setUrlError] = useState('');
  const { toast } = useToast();

  const validateUrl = (value: string) => {
    try {
      new URL(value);
      setUrlError('');
      return true;
    } catch (e) {
      setUrlError('Please enter a valid URL including http:// or https://');
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL including http:// or https://",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit(url, depth);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg animate-slide-up">
      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="url" className="text-sm font-medium">
            Starting URL
          </label>
          <Input
            id="url"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (e.target.value) validateUrl(e.target.value);
            }}
            className="w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            required
            disabled={disabled}
          />
          {urlError && <p className="text-xs text-destructive mt-1">{urlError}</p>}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label htmlFor="depth" className="text-sm font-medium">
              Crawling Depth
            </label>
            <span className="px-2 py-1 bg-secondary rounded-md text-xs font-medium">
              {depth}
            </span>
          </div>
          
          <Slider
            id="depth"
            min={1}
            max={5}
            step={1}
            value={[depth]}
            onValueChange={(values) => setDepth(values[0])}
            disabled={disabled}
            className="py-4"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>Minimal</span>
            <span>Moderate</span>
            <span>Deep</span>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 button-animation"
          disabled={disabled || !url}
        >
          Start Crawling
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          Using command: <code className="px-2 py-1 bg-secondary rounded-md font-mono">crawl {url} {depth}</code>
        </p>
      </div>
    </form>
  );
};

export default CrawlerForm;
