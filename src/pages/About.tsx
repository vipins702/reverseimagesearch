// src/pages/About.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, Upload, ExternalLink, Users, Globe, Clock, CheckCircle } from 'lucide-react';

export default function About() {
  // SEO: Set page title and meta description
  React.useEffect(() => {
    document.title = "About Our Reverse Image Search Tool - Free Image Lookup & Source Finder";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Learn about our free reverse image search tool. Discover how we help millions find image sources, detect duplicates, and verify authenticity across multiple search engines.');
    }
  }, []);

  const features = [
    {
      icon: Search,
      title: "Multi-Engine Search",
      description: "Search across Google Images, Bing Visual Search, Yandex, and TinEye simultaneously for comprehensive results."
    },
    {
      icon: Upload,
      title: "Secure Upload",
      description: "Your images are processed securely with temporary storage. We don't store or analyze your personal images."
    },
    {
      icon: Globe,
      title: "Global Coverage",
      description: "Our search engines cover billions of images from websites, social media, and databases worldwide."
    },
    {
      icon: Clock,
      title: "Instant Results",
      description: "Get reverse image search results in seconds. Fast processing and immediate access to multiple search engines."
    },
    {
      icon: Shield,
      title: "Privacy Protected",
      description: "No registration required. Your uploaded images are processed securely and automatically cleaned up."
    },
    {
      icon: Users,
      title: "User Friendly",
      description: "Simple drag-and-drop interface works on all devices. No technical knowledge required."
    }
  ];

  const useCases = [
    {
      title: "Content Creators & Photographers",
      description: "Find unauthorized use of your images, discover where your photos are being shared, and protect your intellectual property."
    },
    {
      title: "Journalists & Researchers",
      description: "Verify image authenticity, find original sources, and fact-check visual content for accurate reporting."
    },
    {
      title: "E-commerce & Business",
      description: "Find higher resolution product images, check for unauthorized use of your brand images, and source similar products."
    },
    {
      title: "General Users",
      description: "Identify objects, find wallpapers, discover image sources, and satisfy your curiosity about any image you find online."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3">
              <Search className="w-8 h-8 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Reverse Image Search
              </h1>
            </Link>
            <nav className="hidden sm:flex gap-6">
              <Link 
                to="/" 
                className="text-gray-600 hover:text-primary-600 font-medium"
              >
                Home
              </Link>
              <Link 
                to="/reverse-search" 
                className="text-gray-600 hover:text-primary-600 font-medium"
              >
                Search Tool
              </Link>
              <Link 
                to="/about" 
                className="text-primary-600 font-medium"
              >
                About
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            About Our Reverse Image Search Tool
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            We provide the most comprehensive and user-friendly reverse image search experience, 
            helping millions of users find image sources, detect duplicates, and verify authenticity 
            across the world's largest search engines.
          </p>
          <Link
            to="/reverse-search"
            className="inline-flex items-center gap-3 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
          >
            <Upload className="w-6 h-6" />
            Try Our Search Tool
          </Link>
        </div>

        {/* Features Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Why Choose Our Reverse Image Search?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            How Reverse Image Search Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Upload Image</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Drag and drop or click to upload any image from your device
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Image Processing</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Our system analyzes visual elements and creates a secure public URL
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Multi-Engine Search</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Search across Google, Bing, Yandex, and TinEye simultaneously
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">4</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">View Results</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Get instant results with similar images, sources, and duplicates
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Who Uses Reverse Image Search?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  {useCase.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Is reverse image search free?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes, our reverse image search tool is completely free. No registration, watermarks, 
                  or hidden fees. You can upload and search unlimited images.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  What image formats are supported?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We support all common image formats including JPG, PNG, WebP, GIF, and BMP. 
                  Maximum file size is 10MB per image.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  How secure is my uploaded image?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your images are processed securely and stored temporarily. We don't analyze, 
                  store, or share your personal images beyond the reverse search functionality. 
                  Images are automatically cleaned up after processing.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Which search engines do you use?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We search across Google Images, Bing Visual Search, Yandex Images, and TinEye. 
                  Each engine has different algorithms and databases, providing comprehensive coverage.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Find Similar Images?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Upload any image and discover its sources, find duplicates, or locate similar pictures 
            across the world's largest image databases.
          </p>
          <Link
            to="/reverse-search"
            className="inline-flex items-center gap-3 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
          >
            <Search className="w-6 h-6" />
            Start Reverse Image Search
            <ExternalLink className="w-5 h-5" />
          </Link>
        </section>
      </main>
    </div>
  );
}