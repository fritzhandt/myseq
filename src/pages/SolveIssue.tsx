import React, { useEffect } from 'react';
import SkipLinks from '@/components/SkipLinks';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CommunityAlertBanner from '@/components/CommunityAlertBanner';
import SolveMyIssue from '@/components/SolveMyIssue';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { seedGovernmentAgencies } from '@/utils/seedAgencies';

const SolveIssue = () => {
  useEffect(() => {
    document.title = "Solve My Issue - My SEQ";
  }, []);

  useEffect(() => {
    // Seed agencies when the page loads
    seedGovernmentAgencies().then(result => {
      console.log('Seed result:', result);
    });
  }, []);

  return (
    <>
      <SkipLinks />
      <header id="primary-navigation">
        <Navbar />
      </header>
      
      <main id="main-content" className="min-h-screen bg-background">
        <CommunityAlertBanner />
      
      {/* Back to Main Menu */}
      <div className="bg-muted/50 border-b">
        <div className="container mx-auto px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/'}
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Main Menu
          </Button>
        </div>
      </div>
      
        <div className="container mx-auto px-4 py-8">
          <SolveMyIssue />
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SolveIssue;