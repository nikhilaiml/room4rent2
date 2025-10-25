"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import Link from 'next/link';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { handleSearch } from '@/app/actions';
import type { SemanticSearchOutput } from '@/ai/flows/semantic-search-gen-ai';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, LoaderCircle, Search, Terminal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const searchSchema = z.object({
  query: z.string().min(3, 'Search query must be at least 3 characters long.'),
});

export default function DashboardClient() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SemanticSearchOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  const emptyStateImage = PlaceHolderImages.find(img => img.id === 'dashboard-empty');

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: '',
    },
  });

  async function onSubmit(values: z.infer<typeof searchSchema>) {
    setIsSearching(true);
    setHasSearched(true);
    setError(null);
    setSearchResults(null);
    
    const result = await handleSearch(values.query);
    
    if ('error' in result) {
      setError(result.error);
    } else {
      setSearchResults(result);
    }
    setIsSearching(false);
  }

  const getDocumentIdFromText = (docText: string): string | null => {
    const match = docText.match(/Document ID: (\w+)/);
    return match ? match[1] : null;
  }

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Semantic Search</CardTitle>
          <CardDescription>
            Use natural language to search across all your documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder="What is the future of transformer architectures?"
                          className="pl-10 text-base"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSearching} className="h-12 text-base">
                {isSearching ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <Search />
                )}
                <span className="ml-2 hidden sm:inline">Search</span>
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="min-h-[400px]">
        {isSearching && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[250px] w-full" />
            <Skeleton className="h-[250px] w-full" />
          </div>
        )}
        
        {error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Search Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {searchResults && searchResults.results.length > 0 && (
          <div className="flex flex-col gap-4">
             <h2 className="text-2xl font-headline font-semibold">Search Results</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResults.results.map((result, index) => {
                   const docId = getDocumentIdFromText(result.document);
                  return (
                    <Card key={index} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Document Snippet</span>
                                <Badge variant={result.relevanceScore > 0.7 ? "default" : "secondary"}>
                                Relevance: {(result.relevanceScore * 100).toFixed(0)}%
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-sm text-muted-foreground line-clamp-3 italic">"{result.summary}"</p>
                        </CardContent>
                        <CardFooter>
                            {docId ? (
                                <Button asChild variant="outline" className="w-full">
                                    <Link href={`/documents/${docId}`}>
                                        View Document <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <p className="text-sm text-destructive">Could not link to document.</p>
                            )}
                        </CardFooter>
                    </Card>
                  );
                })}
             </div>
          </div>
        )}

        {!isSearching && hasSearched && searchResults?.results.length === 0 && (
            <div className="text-center py-10">
                <p className="text-muted-foreground">No relevant documents found for your query.</p>
            </div>
        )}

        {!isSearching && !hasSearched && emptyStateImage &&(
            <div className="text-center py-10 flex flex-col items-center justify-center bg-card rounded-lg border">
                <Image 
                  src={emptyStateImage.imageUrl}
                  alt={emptyStateImage.description}
                  width={400}
                  height={300}
                  data-ai-hint={emptyStateImage.imageHint}
                  className="rounded-lg object-cover mb-6"
                />
                <h3 className="text-xl font-semibold font-headline">Unlock Knowledge</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                    Your document library is ready. Start by asking a question to find insights across your uploaded content.
                </p>
            </div>
        )}
      </div>
    </div>
  );
}
