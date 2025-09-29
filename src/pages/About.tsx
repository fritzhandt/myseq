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
              <TranslatedText contentKey="about.back_to_home" pagePath="/about">
                Back to Home
              </TranslatedText>
            </Button>
            <TranslatedText 
              contentKey="about.page_title" 
              pagePath="/about" 
              as="h1" 
              className="text-4xl font-bold mb-8 text-center"
            >
              About Southeast Queens Community Resource Center
            </TranslatedText>
          
          <div className="prose prose-lg max-w-none">
            <TranslatedText 
              contentKey="about.intro" 
              pagePath="/about" 
              as="p" 
              className="text-lg mb-6 text-muted-foreground"
            >
              Southeast Queens Community Resource Center is your one-stop shop for discovering and participating in all the happenings across Southeast Queens. From family-friendly activities to cultural celebrations, this platform makes it easy to stay connected, informed, and engaged.
            </TranslatedText>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-card p-6 rounded-lg border">
                <TranslatedText 
                  contentKey="about.mission_title" 
                  pagePath="/about" 
                  as="h2" 
                  className="text-2xl font-semibold mb-4"
                >
                  Our Mission
                </TranslatedText>
                <TranslatedText 
                  contentKey="about.mission_description" 
                  pagePath="/about" 
                  as="p" 
                  className="text-muted-foreground"
                >
                  To serve as the central hub for Southeast Queens residents by connecting neighbors with local events, fostering civic engagement, and strengthening community pride.
                </TranslatedText>
              </div>
              
              <div className="bg-card p-6 rounded-lg border">
                <TranslatedText 
                  contentKey="about.what_we_do_title" 
                  pagePath="/about" 
                  as="h2" 
                  className="text-2xl font-semibold mb-4"
                >
                  What We Do
                </TranslatedText>
                <TranslatedText 
                  contentKey="about.what_we_do_description" 
                  pagePath="/about" 
                  as="p" 
                  className="text-muted-foreground"
                >
                  Built and managed by your local elected officials, Southeast Queens Community Resource Center brings together everything you need to know about what's happening in your neighborhood. We highlight events for all ages—youth programs, senior activities, cultural festivals, and more—so everyone has a chance to get involved and make lasting connections.
                </TranslatedText>
              </div>
            </div>
            
            <div className="bg-muted p-8 rounded-lg">
              <TranslatedText 
                contentKey="about.get_involved_title" 
                pagePath="/about" 
                as="h2" 
                className="text-2xl font-semibold mb-4"
              >
                Get Involved
              </TranslatedText>
              <TranslatedText 
                contentKey="about.get_involved_description" 
                pagePath="/about" 
                as="p" 
                className="text-muted-foreground"
              >
                Explore events, meet your neighbors, and engage with your representatives right here in Southeast Queens. Whether you're attending your first community gathering or looking for ways to volunteer, this site is designed to keep you informed and involved in shaping the future of our community.
              </TranslatedText>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;