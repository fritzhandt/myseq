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

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('search-agencies', {
        body: { query: query.trim() }
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
              placeholder="Describe your issue (e.g., 'My landlord won't fix the heat', 'I need to report a scam', 'Noise complaint about neighbor')"
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

          <div className="text-sm text-muted-foreground">
            <p className="mb-2"><strong>Tips for better results:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Be specific about your problem</li>
              <li>Include relevant details (housing, business, health, etc.)</li>
              <li>Mention if it's urgent or ongoing</li>
            </ul>
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