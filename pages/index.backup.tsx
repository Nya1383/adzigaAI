import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Close mobile menu when clicking outside or navigating
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const menuButton = document.querySelector('[aria-label="Toggle menu"]');
      
      if (mobileMenuOpen && 
          !target.closest('.mobile-menu') && 
          !target.isSameNode(menuButton) && 
          !menuButton?.contains(target)) {
        setMobileMenuOpen(false);
      }
    };
    
    const handleRouteChange = () => {
      setMobileMenuOpen(false);
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [mobileMenuOpen]);
  
  // Handle navigation for anchor links
  const handleNavigation = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    
    console.log(`Navigating to section: ${sectionId}`);
    
    // Small delay to allow the mobile menu to close before scrolling
    setTimeout(() => {
      const section = document.getElementById(sectionId);
      console.log('Section element:', section);
      
      if (section) {
        // Add a temporary highlight to make the section visible
        section.style.transition = 'background-color 0.5s';
        section.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        
        // Remove highlight after animation
        setTimeout(() => {
          section.style.backgroundColor = '';
        }, 2000);
        
        // Calculate the position to scroll to, accounting for the fixed header
        const headerOffset = 80; // Height of your header
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        console.log('Scrolling to position:', offsetPosition);
        
        // Scroll to the section
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // Update URL without page reload
        window.history.pushState({}, '', `#${sectionId}`);
      } else {
        console.error(`Section with ID '${sectionId}' not found`);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>Adziga AI - AI-Powered Advertising</title>
        <meta name="description" content="AI-Powered Advertising Agency Platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer">
                  Adziga AI
                </h1>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors px-3 py-2">
                Features
              </a>
              <Link href="/login" className="text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 font-medium">
                Login
              </Link>
              <Link href="/onboarding" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
                Get Started
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden z-50">
              <button 
                className="text-gray-700 hover:text-blue-600 p-2 focus:outline-none"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
                type="button"
              >
                {mobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        {mobileMenuOpen && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-40"
            onClick={toggleMobileMenu}
            role="presentation"
          ></div>
        )}
        <div 
          className={`mobile-menu absolute top-0 left-0 right-0 bg-white shadow-lg rounded-b-lg transform transition-transform duration-300 ease-in-out z-50 ${mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile menu"
          style={{ maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto' }}
        >
          <div className="pt-4 pb-6 px-4 space-y-3">
            <a 
              href="#features" 
              className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={(e) => handleNavigation(e, 'features')}
            >
              Features
            </a>
            <div className="border-t border-gray-200 my-2"></div>
            <Link 
              href="/login" 
              className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link 
              href="/onboarding" 
              className="block bg-blue-600 text-white px-4 py-3 rounded-lg text-base font-medium hover:bg-blue-700 text-center mt-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 transition-opacity ${mobileMenuOpen ? 'opacity-50' : 'opacity-100'}`}>
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Advertising</span> That Works
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your business with autonomous advertising campaigns. Our AI creates strategies and executes campaigns across Meta, Google, and WhatsApp automatically.
          </p>
          
          <div className="flex justify-center">
            <Link href="/onboarding" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
              Start Your Campaign
            </Link>
          </div>

          {/* Platform Icons */}
          <div className="mt-16 flex flex-wrap justify-center gap-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
                <img 
                  src="/250px-2023_Facebook_icon.svg.webp" 
                  alt="Facebook Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-gray-600">Meta Ads</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
                <img 
                  src="/250px-WhatsApp.svg.webp" 
                  alt="WhatsApp Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-gray-600">WhatsApp</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
                <img 
                  src="/Google__G__logo.webp" 
                  alt="Google Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-gray-600">Google Ads</span>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="bg-white py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How Adziga AI Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple 3-step process to automate your advertising
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Tell Us About Your Business</h3>
              <p className="text-gray-600">
                Share your business details, goals, and budget through our simple form.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Creates Your Strategy</h3>
              <p className="text-gray-600">
                Our AI analyzes your business and creates a custom advertising strategy.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Launch & Monitor</h3>
              <p className="text-gray-600">
                Campaigns launch automatically and you track results in real-time.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/onboarding" className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
              Get Started Now
            </Link>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Adziga AI
          </h3>
          <p className="text-gray-400 mb-6">
            AI-powered advertising that works for your business.
          </p>
          <p className="text-gray-500">
            2024 Adziga AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}