import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth-context';
import { ClientService } from '../services/firestore';
import Button from '../components/ui/Button';
import { Loading } from '../components/ui/Loading';
import { Input } from '@/components/ui/input';
import { OnboardingFormData, Platform, MarketingGoal } from '../types';

export default function Onboarding() {
  const { user, login, signup, loginWithGoogle, isAdmin } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  const [formData, setFormData] = useState<OnboardingFormData>({
    businessName: '',
    businessType: '',
    industry: '',
    city: '',
    budget: 10000,
    preferredPlatforms: [],
    marketingGoal: 'traffic' as MarketingGoal,
    description: '',
    website: '',
    phone: ''
  });

  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const businessTypes = [
    'restaurant', 'retail', 'service', 'ecommerce', 'healthcare',
    'education', 'real_estate', 'automotive', 'beauty', 'fitness', 'other'
  ];

  const industries = [
    'food_beverage', 'fashion_apparel', 'technology', 'healthcare',
    'education', 'real_estate', 'automotive', 'beauty_wellness',
    'fitness_sports', 'home_garden', 'travel_tourism', 'professional_services', 'other'
  ];

  const platforms: Platform[] = ['meta', 'google', 'whatsapp'];

  const marketingGoals: MarketingGoal[] = [
    'brand_awareness', 'traffic', 'engagement', 'leads',
    'conversions', 'sales', 'app_installs', 'video_views'
  ];

  const budgetRanges = [
    { value: 5000, label: '₹5,000 - ₹10,000' },
    { value: 15000, label: '₹10,000 - ₹25,000' },
    { value: 35000, label: '₹25,000 - ₹50,000' },
    { value: 75000, label: '₹50,000 - ₹1,00,000' },
    { value: 150000, label: '₹1,00,000+' }
  ];

  const handleInputChange = (field: keyof OnboardingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePlatformChange = (platform: Platform) => {
    setFormData(prev => ({
      ...prev,
      preferredPlatforms: prev.preferredPlatforms.includes(platform)
        ? prev.preferredPlatforms.filter(p => p !== platform)
        : [...prev.preferredPlatforms, platform]
    }));
  };

  const handleSubmitBusinessInfo = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    setLoading(true);
    try {
      const result = await ClientService.createClient(user.uid, {
        businessName: formData.businessName,
        businessType: formData.businessType,
        industry: formData.industry,
        city: formData.city,
        budget: formData.budget,
        preferredPlatforms: formData.preferredPlatforms,
        marketingGoal: formData.marketingGoal,
        description: formData.description,
        website: formData.website,
        phone: formData.phone,
        email: user.email || ''
      });

      if (result.success) {
        if (isAdmin) {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        alert('Error creating client profile: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'signup') {
        await signup(authData.email, authData.password, authData.name);
      } else {
        await login(authData.email, authData.password);
      }
      setShowAuth(false);
      // User will be automatically set by AuthContext
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      setShowAuth(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.businessName && formData.businessType && formData.industry;
      case 2:
        return formData.city && formData.budget && formData.preferredPlatforms.length > 0;
      case 3:
        return formData.marketingGoal;
      default:
        return false;
    }
  };

  if (showAuth) {
    return (
      <>
        <Head>
          <title>Sign In - Adziga AI</title>
        </Head>

        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <Link href="/">
              <h2 className="text-center text-3xl font-bold text-gradient cursor-pointer">
                Adziga AI
              </h2>
            </Link>
            <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
              {authMode === 'signup' ? 'Create your account' : 'Sign in to your account'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {authMode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
              <button
                onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                {authMode === 'signup' ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <form className="space-y-6" onSubmit={handleAuth}>
                {authMode === 'signup' && (
                  <div className="mb-4">
                    <Input
                      label="Full Name"
                      value={authData.name}
                      onChange={(e) => setAuthData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                )}

                <div className="mb-4">
                  <Input
                    label="Email address"
                    type="email"
                    value={authData.email}
                    onChange={(e) => setAuthData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="mb-6">
                  <Input
                    label="Password"
                    type="password"
                    value={authData.password}
                    onChange={(e) => setAuthData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Button
                    type="submit"
                    fullWidth
                    loading={loading}
                    disabled={loading}
                  >
                    {authMode === 'signup' ? 'Create Account' : 'Sign In'}
                  </Button>
                </div>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      fullWidth
                      onClick={handleGoogleAuth}
                      disabled={loading}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Continue with Google
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Business Onboarding - Adziga AI</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/">
                <h1 className="text-2xl font-bold text-gradient cursor-pointer">Adziga AI</h1>
              </Link>
              <div className="text-sm text-gray-500">
                Step {step} of 3
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((stepNum, index) => (
                  <div key={stepNum} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${stepNum <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                        {stepNum}
                      </div>
                      <span className="text-sm text-gray-600 text-center">
                        {stepNum === 1 ? 'Business Info' : stepNum === 2 ? 'Budget & Platforms' : 'Goals & Launch'}
                      </span>
                    </div>
                    {stepNum < 3 && (
                      <div className={`flex-1 h-1 mx-4 ${stepNum < step ? 'bg-blue-600' : 'bg-gray-200'
                        }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow card-lg">
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Tell us about your business</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="mt-4">
                    <Input
                      label="Business Name *"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      placeholder="e.g., Mumbai Cafe"
                    />
                  </div>

                  <div>
                    <label className="label-field">Business Type *</label>
                    <select
                      className="input-field"
                      value={formData.businessType}
                      onChange={(e) => handleInputChange('businessType', e.target.value)}
                    >
                      <option value="">Select business type</option>
                      {businessTypes.map(type => (
                        <option key={type} value={type}>
                          {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label-field">Industry *</label>
                    <select
                      className="input-field"
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                    >
                      <option value="">Select industry</option>
                      {industries.map(industry => (
                        <option key={industry} value={industry}>
                          {industry.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4">
                    <Input
                      label="Website (Optional)"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://your-website.com"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="label-field">Business Description (Optional)</label>
                  <textarea
                    className="input-field h-24"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Tell us about your business, products, or services..."
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Budget & Platform Preferences</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="mt-4">
                    <Input
                      label="City/Location *"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="e.g., Mumbai, Bangalore"
                    />
                  </div>

                  <div className="mt-4">
                    <Input
                      label="Phone (Optional)"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="label-field">Monthly Advertising Budget *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {budgetRanges.map(range => (
                      <button
                        key={range.value}
                        type="button"
                        onClick={() => handleInputChange('budget', range.value)}
                        className={`p-4 border rounded-lg text-left transition-colors ${formData.budget === range.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                          }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label-field">Preferred Advertising Platforms *</label>
                  <p className="text-sm text-gray-600 mb-3">Select all platforms you'd like to advertise on</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {platforms.map(platform => (
                      <label
                        key={platform}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${formData.preferredPlatforms.includes(platform)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                          }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={formData.preferredPlatforms.includes(platform)}
                          onChange={() => handlePlatformChange(platform)}
                        />
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                            <img
                              src={`/${platform === 'meta' ? '250px-2023_Facebook_icon.svg.webp' :
                                  platform === 'google' ? 'Google__G__logo.webp' :
                                    '250px-WhatsApp.svg.webp'
                                }`}
                              alt={`${platform} logo`}
                              className="w-5 h-5 object-contain"
                            />
                          </div>
                          <div>
                            <div className="font-medium">
                              {platform === 'meta' ? 'Meta (Facebook & Instagram)' :
                                platform === 'google' ? 'Google Ads' :
                                  'WhatsApp Business'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {platform === 'meta' ? 'Social media advertising' :
                                platform === 'google' ? 'Search & display ads' :
                                  'Direct messaging campaigns'}
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Marketing Goals</h2>

                <div className="mb-6">
                  <label className="label-field">Primary Marketing Goal *</label>
                  <p className="text-sm text-gray-600 mb-4">What's your main objective for this advertising campaign?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {marketingGoals.map(goal => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => handleInputChange('marketingGoal', goal)}
                        className={`p-4 border rounded-lg text-left transition-colors ${formData.marketingGoal === goal
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                          }`}
                      >
                        <div className="font-medium">
                          {goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {goal === 'brand_awareness' ? 'Increase brand visibility and recognition' :
                            goal === 'traffic' ? 'Drive more visitors to your website' :
                              goal === 'engagement' ? 'Boost social media engagement' :
                                goal === 'leads' ? 'Generate more qualified leads' :
                                  goal === 'conversions' ? 'Increase sales and conversions' :
                                    goal === 'sales' ? 'Boost direct sales revenue' :
                                      goal === 'app_installs' ? 'Get more app downloads' :
                                        'Increase video views and watch time'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Our AI will analyze your business and create a custom advertising strategy</li>
                    <li>• You'll receive a detailed campaign plan with budget allocation</li>
                    <li>• After approval, campaigns will be automatically launched</li>
                    <li>• Track performance in real-time through your dashboard</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
              >
                Previous
              </Button>

              {step < 3 ? (
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitBusinessInfo}
                  loading={loading}
                  disabled={!isStepValid() || loading}
                >
                  Launch My Campaign
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}