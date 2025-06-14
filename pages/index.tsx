import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>Adziga AI - AI-Powered Advertising</title>
        <meta name="description" content="AI-Powered Advertising Agency Platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
                <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors px-3 py-2">
                  Pricing
                </a>
                <Link href="/login" className="text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 font-medium">
                  Login
                </Link>
                <Link href="/onboarding" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
                  Get Started
                </Link>
              </nav>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button className="text-gray-700 hover:text-blue-600 p-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              AI-Powered <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Advertising</span> That Works
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your business with autonomous advertising campaigns. Our AI creates strategies and executes campaigns across Meta, Google, and WhatsApp automatically.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/onboarding" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
                Start Your Campaign
              </Link>
              <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors">
                Watch Demo
              </button>
            </div>

            {/* Platform Icons */}
            <div className="mt-16 flex justify-center items-center space-x-12">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">f</span>
                </div>
                <span className="text-gray-600">Meta Ads</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">W</span>
                </div>
                <span className="text-gray-600">WhatsApp</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">G</span>
                </div>
                <span className="text-gray-600">Google Ads</span>
              </div>
            </div>
          </div>
        </main>

        {/* Features Section */}
        <section id="features" className="bg-white py-20">
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
              <Link href="/onboarding" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
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
              © 2024 Adziga AI. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
} 