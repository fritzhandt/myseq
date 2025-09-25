import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AINavigationResponse {
  destination: string;
  searchTerm?: string;
  category?: string;
  dateStart?: string;
  dateEnd?: string;
  employer?: string;
  location?: string;
  success: boolean;
  error?: string;
}

export default function AISearchBar() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query.trim()) return;

    console.log('Starting AI search with query:', query);
    setIsLoading(true);
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
        toast.error(response.error || "Sorry, I couldn't understand your request. Please try rephrasing.");
        return;
      }

      console.log('Navigating to:', response.destination, 'with state:', {
        searchTerm: response.searchTerm,
        category: response.category,
        dateStart: response.dateStart,
        dateEnd: response.dateEnd,
        employer: response.employer,
        location: response.location
      });

      // Navigate to the destination with search parameters
      const navigationState = {
        searchTerm: response.searchTerm,
        category: response.category,
        dateStart: response.dateStart,
        dateEnd: response.dateEnd,
        employer: response.employer,
        location: response.location
      };

      navigate(response.destination, { state: navigationState });
      setQuery("");
      
    } catch (error) {
      console.error('AI search error:', error);
      toast.error("Something went wrong. Please try again.");
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
    "Find giveaways in October",
    "Is UBS hiring?", 
    "Teaching jobs in Queens",
    "Which civic organization covers Rosedale?"
  ];

  return (
    <div className="max-w-4xl mx-auto mb-16">
      {/* Main Search Bar */}
      <div className="relative mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about Southeast Queens..."
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
  );
}