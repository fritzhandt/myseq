import React from 'react';
import { TranslatedText } from '@/components/TranslatedText';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/contexts/TranslationContext';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TestTranslation = () => {
  const { currentLanguage } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="mb-6 flex items-center text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <TranslatedText 
            contentKey="common.back_home"
            originalText="Back to Home"
          />
        </Button>

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <TranslatedText
              contentKey="test.page_title"
              originalText="Translation Test Page"
              as="h1"
              className="text-4xl font-bold mb-4"
            />
            <TranslatedText
              contentKey="test.page_description"
              originalText="This page demonstrates the Google Translate integration. Select different languages from the language selector in the navigation to see translations in action."
              as="p"
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Current Language: <strong>{currentLanguage}</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  <TranslatedText
                    contentKey="test.welcome_card_title"
                    originalText="Welcome to Our Community"
                  />
                </CardTitle>
                <CardDescription>
                  <TranslatedText
                    contentKey="test.welcome_card_description"
                    originalText="Join thousands of residents staying connected"
                  />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TranslatedText
                  contentKey="test.welcome_card_content"
                  originalText="Our community platform helps you stay informed about local events, find resources, and connect with your neighbors. Whether you're looking for community services, local government information, or ways to get involved, we're here to help."
                  as="p"
                  className="text-sm text-muted-foreground"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <TranslatedText
                    contentKey="test.services_card_title"
                    originalText="Available Services"
                  />
                </CardTitle>
                <CardDescription>
                  <TranslatedText
                    contentKey="test.services_card_description"
                    originalText="Everything you need in one place"
                  />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                    <TranslatedText
                      contentKey="test.service_events"
                      originalText="Community Events & Calendar"
                    />
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                    <TranslatedText
                      contentKey="test.service_resources"
                      originalText="Local Resources Directory"
                    />
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                    <TranslatedText
                      contentKey="test.service_government"
                      originalText="Government Services & Contact Info"
                    />
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                    <TranslatedText
                      contentKey="test.service_jobs"
                      originalText="Job Opportunities & Career Resources"
                    />
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                <TranslatedText
                  contentKey="test.multilingual_title"
                  originalText="Multilingual Support"
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TranslatedText
                contentKey="test.multilingual_content"
                originalText="This website supports multiple languages to serve our diverse community. Use the language selector in the top navigation to switch between English, Spanish, French, Korean, Chinese, Arabic, Russian, Portuguese, German, and Italian. All content is automatically translated using Google Translate to ensure everyone can access important community information in their preferred language."
                as="p"
                className="text-muted-foreground"
              />
            </CardContent>
          </Card>

          <div className="text-center">
            <Button onClick={() => navigate('/')}>
              <TranslatedText
                contentKey="test.explore_button"
                originalText="Explore the Community Platform"
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestTranslation;