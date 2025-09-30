import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAnalytics } from "@/hooks/useAnalytics";
import GeneralInfoDialog from "./GeneralInfoDialog";

interface AINavigationResponse {
  destination?: string;
  searchTerm?: string;
  category?: string;
  dateStart?: string;
  dateEnd?: string;
  employer?: string;
  location?: string;
  answer?: string;
  isGeneralQuery?: boolean;
  success: boolean;
  error?: string;
}

export default function AISearchBar() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generalAnswer, setGeneralAnswer] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { trackAISearch, trackAIGeneralAnswer, trackAIPageRedirect } = useAnalytics();

  const MAX_QUERY_LENGTH = 500;

  const handleSearch = async () => {
    if (!query.trim()) return;

    console.log('Starting AI search with query:', query);
    setIsLoading(true);
    
    // Track AI search usage
    trackAISearch();
    
    try {
      console.log('Calling supabase function...');
      const { data, error } = await supabase.functions.invoke('ai-navigate', {
        body: { query: query.trim() }
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      const response: AINavigationResponse = data;
      console.log('Parsed response:', response);
      
      if (!response.success) {
        console.log('AI returned error:', response.error);
        if (response.error === 'Daily search limit exceeded') {
          toast({
            title: "Daily limit reached",
            description: "Our AI needs a break! You've reached the daily limit of 1,000 searches. Come back tomorrow to use AI search, or navigate the site manually.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Search error",
            description: response.error || "Sorry, I couldn't understand your request. Please try rephrasing.",
            variant: "destructive"
          });
        }
        return;
      }

      // Check if this is a general query that should show an answer
      if (response.isGeneralQuery && response.answer) {
        console.log('Showing general answer:', response.answer);
        trackAIGeneralAnswer();
        setGeneralAnswer(response.answer);
        setQuery("");
        return;
      }

      // Otherwise, navigate to the destination
      console.log('Navigating to:', response.destination, 'with state:', {
        searchTerm: response.searchTerm,
        category: response.category,
        dateStart: response.dateStart,
        dateEnd: response.dateEnd,
        employer: response.employer,
        location: response.location
      });

      const navigationState = {
        searchTerm: response.searchTerm,
        category: response.category,
        dateStart: response.dateStart,
        dateEnd: response.dateEnd,
        employer: response.employer,
        location: response.location
      };

      trackAIPageRedirect();
      navigate(response.destination, { state: navigationState });
      setQuery("");
      
    } catch (error) {
      console.error('AI search error:', error);
      toast({
        title: "Search error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const exampleQueries = [
    "Who is my elected official?",
    "There's a broken down car on my street",
    "How do I file for unemployment?", 
    "Teaching jobs in Queens",
    "Which civic organization covers Rosedale?"
  ];

  return (
    <>
      <div className="max-w-4xl mx-auto mb-16">
        {/* Main Search Bar */}
        <div className="relative mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 font-orbitron font-black text-primary text-sm tracking-wider z-10 pointer-events-none">AI</span>
            <Input
              value={query}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= MAX_QUERY_LENGTH) {
                  setQuery(value);
                } else {
                  toast({
                    title: "Character limit reached",
                    description: "500 character limit please.",
                    variant: "destructive"
                  });
                }
              }}
              onKeyPress={handleKeyPress}
              placeholder={isMobile ? "Ask me anything..." : "Ask me anything about Southeast Queens..."}
              className="pl-12 pr-4 py-6 text-lg bg-background/80 backdrop-blur-sm border-2 border-primary/20 focus:border-primary/40 rounded-2xl shadow-card"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={!query.trim() || isLoading}
            size="lg"
            className="px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white rounded-2xl shadow-card"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Example Queries */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-3">Try asking:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {exampleQueries.map((example, index) => (
            <button
              key={index}
              onClick={() => setQuery(example)}
              className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors duration-200"
              disabled={isLoading}
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>
      </div>
      
      {/* General Info Dialog */}
      {generalAnswer && (
        <GeneralInfoDialog 
          answer={generalAnswer} 
          onClose={() => setGeneralAnswer(null)} 
        />
      )}
    </>
  );
}