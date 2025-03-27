
import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-5 h-5 text-primary-foreground transform group-hover:rotate-12 transition-transform duration-300"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
          <h1 className="text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Image Seeker
          </h1>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            About
          </Link>
          <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Documentation
          </Link>
        </nav>
        
        <div className="flex items-center">
          <button className="button-animation px-5 py-2 rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80">
            GitHub
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
