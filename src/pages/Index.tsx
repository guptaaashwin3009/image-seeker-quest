
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CrawlerInterface from '@/components/crawler/CrawlerInterface';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <section className="container mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 animate-slide-down">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-6 h-6 text-primary"
              >
                <path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V6.5L15.5 2z" />
                <path d="M3 7.6v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8" />
                <path d="M15 2v5h5" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-5xl">
              Image Seeker
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover and collect images across the web with our powerful and elegant crawler.
            </p>
          </div>

          <CrawlerInterface />
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
