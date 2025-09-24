import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Agency {
  id: string;
  name: string;
  description: string;
  website: string;
  level: 'city' | 'state' | 'federal';
  confidence?: number;
  reasoning?: string;
}

interface SearchResult {
  results: Agency[];
  totalFound: number;
  message: string;
  confidence: number;
}

const SolveMyIssue = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agencyLevel, setAgencyLevel] = useState<'city' | 'state' | 'federal' | 'unknown' | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Build the search query with agency level preference if specified
      let searchQuery = query.trim();
      if (agencyLevel && agencyLevel !== 'unknown') {
        searchQuery = `${searchQuery} (preferably ${agencyLevel} level agency)`;
      } else if (agencyLevel === 'unknown') {
        searchQuery = `${searchQuery} (user doesn't know which government level handles this)`;
      }

      const { data, error: functionError } = await supabase.functions.invoke('search-agencies', {
        body: { 
          query: searchQuery,
          preferredLevel: agencyLevel 
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search agencies');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'city': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'state': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'federal': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return 'text-green-600 dark:text-green-400';
    if (confidence >= 90) return 'text-blue-600 dark:text-blue-400';
    if (confidence >= 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Search Interface */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Search className="h-5 w-5" />
            Solve My Issue
          </CardTitle>
          <CardDescription>
            Describe your issue and we'll find the right government agency to help you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="describe your issue as you would to a friend (e.g., my landlord won't fix my heat)."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch} 
              disabled={loading || !query.trim()}
              className="min-w-[100px]"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* Agency Level Selection */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Do you know which level of government handles your issue?</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={agencyLevel === 'city' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAgencyLevel(agencyLevel === 'city' ? null : 'city')}
              >
                City/Local
              </Button>
              <Button
                variant={agencyLevel === 'state' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAgencyLevel(agencyLevel === 'state' ? null : 'state')}
              >
                State
              </Button>
              <Button
                variant={agencyLevel === 'federal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAgencyLevel(agencyLevel === 'federal' ? null : 'federal')}
              >
                Federal
              </Button>
              <Button
                variant={agencyLevel === 'unknown' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAgencyLevel(agencyLevel === 'unknown' ? null : 'unknown')}
              >
                I don't know
              </Button>
            </div>
            {agencyLevel && (
              <p className="text-xs text-muted-foreground">
                {agencyLevel === 'unknown' 
                  ? "We'll search all levels to find the right agency for you."
                  : `Focusing search on ${agencyLevel} level agencies.`
                } Click the button again to clear selection.
              </p>
            )}
          </div>

          <Alert className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              <strong>Disclaimer:</strong> Solve My Issue is experimental and may not be accurate.
            </AlertDescription>
          </Alert>

          <div className="text-sm text-muted-foreground">
            <p className="mb-2"><strong>Tips for better results:</strong></p>
            <p className="leading-relaxed">
              The Solve My Issue algorithm uses natural language to pair you with the right government agency. 
              Simply describe your problem as you would to a friend. The more detailed the better. 
              If the AI is not confident based on your description, it may provide multiple agencies. 
              You can always try to redescribe your issue.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-4">
          {/* Results Message */}
          {results.message && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{results.message}</AlertDescription>
            </Alert>
          )}

          {/* Confidence Indicator */}
          {results.results.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">
                      Found {results.results.length} {results.results.length === 1 ? 'agency' : 'agencies'}
                    </span>
                  </div>
                  {results.confidence > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Top match confidence: </span>
                      <span className={`font-medium ${getConfidenceColor(results.confidence)}`}>
                        {results.confidence}%
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Agency Results */}
          {results.results.map((agency, index) => (
            <Card key={agency.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{agency.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={getLevelColor(agency.level)}>
                        {agency.level.charAt(0).toUpperCase() + agency.level.slice(1)}
                      </Badge>
                      {agency.confidence && (
                        <Badge variant="outline" className={getConfidenceColor(agency.confidence)}>
                          {agency.confidence}% match
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {agency.description}
                </p>
                
                {agency.reasoning && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                    <p className="text-sm">
                      <strong className="text-blue-700 dark:text-blue-300">Why this matches:</strong>{' '}
                      <span className="text-blue-600 dark:text-blue-400">{agency.reasoning}</span>
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => window.open(agency.website, '_blank')}
                    className="flex items-center gap-2"
                  >
                    Visit Website
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Result {index + 1} of {results.results.length}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          {results.results.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No agencies found</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't find any agencies that match your issue with sufficient confidence.
                </p>
                <p className="text-sm text-muted-foreground">
                  Try rephrasing your query with more specific details or different keywords.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default SolveMyIssue;