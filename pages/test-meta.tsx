import React from 'react';
import Head from 'next/head';
import { LaunchOnMetaButton } from '@/components/LaunchOnMetaButton';
import { SparklesText } from '@/components/ui/sparkles-text';

export default function TestMetaPage() {
    // Mock strategy data for testing
    const mockStrategy = {
        name: "Test Campaign " + new Date().toISOString().slice(0, 10),
        description: "This is a test campaign created from Adziga AI dashboard.",
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Head>
                <title>Test Meta Integration | Adziga AI</title>
            </Head>

            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-8">
                    <div className="mb-8 text-center">
                        <SparklesText
                            text="Meta Integration Test"
                            className="text-3xl font-bold text-gray-900 mb-2"
                            colors={{ first: '#1877F2', second: '#4267B2' }} // Facebook Blue colors
                        />
                        <p className="text-gray-600">
                            Use this page to verify the connection between Adziga AI and Meta Ads Manager.
                        </p>
                    </div>

                    <div className="space-y-6 border-t pt-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <h3 className="font-semibold text-blue-900 mb-2">Test Parameters:</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li><strong>Campaign Name:</strong> {mockStrategy.name}</li>
                                <li><strong>Objective:</strong> OUTCOME_TRAFFIC</li>
                                <li><strong>Status:</strong> PAUSED (Safety default)</li>
                            </ul>
                        </div>

                        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <p className="mb-4 text-sm text-gray-500 font-medium">Click to launch test campaign</p>
                            <LaunchOnMetaButton
                                strategy={mockStrategy}
                                imageUrl="https://images.unsplash.com/photo-1562577309-4932fdd64cd1?auto=format&fit=crop&w=1000&q=80"
                                link="https://adziga.ai"
                            />
                        </div>

                        <div className="text-xs text-gray-400 text-center">
                            Check your browser console (F12) for detailed logs.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
