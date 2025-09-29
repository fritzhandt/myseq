import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import CommunityAlertBanner from '@/components/CommunityAlertBanner';
import { TranslatedText } from '@/components/TranslatedText';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CommunityAlertBanner />
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <TranslatedText contentKey="back-to-home-btn" originalText="Back to Home" />
            </Button>
            <h1 className="text-4xl font-bold mb-8 text-center">
              <TranslatedText contentKey="about-page-title" originalText="About Southeast Queens Community Resource Center" />
            </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg mb-6 text-muted-foreground">
              <TranslatedText contentKey="about-intro" originalText="Southeast Queens Community Resource Center is your one-stop shop for discovering and participating in all the happenings across Southeast Queens. From family-friendly activities to cultural celebrations, this platform makes it easy to stay connected, informed, and engaged." />
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-card p-6 rounded-lg border">
                <h2 className="text-2xl font-semibold mb-4">
                  <TranslatedText contentKey="our-mission-title" originalText="Our Mission" />
                </h2>
                <p className="text-muted-foreground">
                  <TranslatedText contentKey="our-mission-text" originalText="To serve as the central hub for Southeast Queens residents by connecting neighbors with local events, fostering civic engagement, and strengthening community pride." />
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border">
                <h2 className="text-2xl font-semibold mb-4">
                  <TranslatedText contentKey="what-we-do-title" originalText="What We Do" />
                </h2>
                <p className="text-muted-foreground">
                  <TranslatedText contentKey="what-we-do-text" originalText="Built and managed by your " />
                  <Link to="/contact-elected" className="text-primary hover:text-primary/80 underline underline-offset-4">
                    <TranslatedText contentKey="local-elected-officials-link" originalText="local elected officials" />
                  </Link>
                  <TranslatedText contentKey="what-we-do-text-2" originalText=", Southeast Queens Community Resource Center brings together everything you need to know about what's happening in your neighborhood. We highlight events for all ages—youth programs, senior activities, cultural festivals, and more—so everyone has a chance to get involved and make lasting connections." />
                </p>
              </div>
            </div>
            
            <div className="bg-muted p-8 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">
                <TranslatedText contentKey="get-involved-title" originalText="Get Involved" />
              </h2>
              <p className="text-muted-foreground">
                <TranslatedText contentKey="get-involved-text" originalText="Explore events, meet your neighbors, and engage with your representatives right here in Southeast Queens. Whether you're attending your first community gathering or looking for ways to volunteer, this site is designed to keep you informed and involved in shaping the future of our community." />
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;