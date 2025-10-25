"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  handleGenerateSummary,
  handleExtractCitations,
  handleQuestion,
} from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardCopy, LoaderCircle, MessageSquare, Quote, Sparkles, Terminal, FileText } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

type DocumentClientProps = {
  documentId: string;
};

type QnAPair = {
  question: string;
  answer: string;
  citations: string[];
};

const questionSchema = z.object({
  query: z.string().min(5, 'Question must be at least 5 characters long.'),
});

export default function DocumentClient({ documentId }: DocumentClientProps) {
  const { toast } = useToast();
  // Summary State
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Citation State
  const [isExtracting, setIsExtracting] = useState(false);
  const [citations, setCitations] = useState<string[] | null>(null);
  const [citationError, setCitationError] = useState<string | null>(null);

  // Q&A State
  const [isAnswering, setIsAnswering] = useState(false);
  const [qnaHistory, setQnaHistory] = useState<QnAPair[]>([]);
  const [qnaError, setQnaError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof questionSchema>>({
    resolver: zodResolver(questionSchema),
    defaultValues: { query: '' },
  });

  const onGenerateSummary = async () => {
    setIsSummarizing(true);
    setSummary(null);
    setSummaryError(null);
    const result = await handleGenerateSummary(documentId);
    if ('error' in result) {
      setSummaryError(result.error);
    } else {
      setSummary(result.summary);
    }
    setIsSummarizing(false);
  };

  const onExtractCitations = async () => {
    setIsExtracting(true);
    setCitations(null);
    setCitationError(null);
    const result = await handleExtractCitations(documentId);
    if ('error' in result) {
      setCitationError(result.error);
    } else {
      setCitations(result.citations);
    }
    setIsExtracting(false);
  };

  async function onAskQuestion(values: z.infer<typeof questionSchema>) {
    setIsAnswering(true);
    setQnaError(null);
    const result = await handleQuestion(documentId, values.query);
    if ('error' in result) {
      setQnaError(result.error);
    } else {
      setQnaHistory([
        ...qnaHistory,
        {
          question: values.query,
          answer: result.answer,
          citations: result.citations,
        },
      ]);
      form.reset();
    }
    setIsAnswering(false);
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to Clipboard',
      description: `The ${type} has been copied.`,
    });
  };

  return (
    <Card className="sticky top-24">
       <CardHeader>
          <CardTitle className="font-headline text-xl">AI Assistant</CardTitle>
          <CardDescription>Interact with your document.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="qa">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="qa"><MessageSquare className="h-4 w-4 mr-2"/> Q&A</TabsTrigger>
                <TabsTrigger value="summary"><FileText className="h-4 w-4 mr-2"/>Summary</TabsTrigger>
                <TabsTrigger value="citations"><Quote className="h-4 w-4 mr-2"/>Citations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="qa" className="mt-4">
                <div className="flex flex-col h-[60vh]">
                  <ScrollArea className="flex-1 pr-4">
                      <div className="space-y-4">
                          {qnaHistory.length === 0 && !isAnswering && (
                              <div className="text-center py-8">
                                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50"/>
                                  <p className="mt-4 text-sm text-muted-foreground">
                                  Ask a question about the document to get started.
                                  </p>
                              </div>
                          )}
                          {qnaHistory.map((item, index) => (
                              <div key={index} className="space-y-4">
                                  <div className="text-right">
                                      <p className="inline-block bg-primary text-primary-foreground rounded-lg p-3 text-sm">{item.question}</p>
                                  </div>
                                  <div>
                                      <p className="inline-block bg-muted rounded-lg p-3 text-sm">{item.answer}</p>
                                      {item.citations.length > 0 && (
                                          <div className="mt-2 text-xs text-muted-foreground space-y-1 pl-3 border-l-2 ml-2">
                                              <p className="font-semibold">Citations:</p>
                                              {item.citations.map((cit, i) => <p key={i}>- {cit}</p>)}
                                          </div>
                                      )}
                                  </div>
                              </div>
                          ))}
                          {isAnswering && <Skeleton className="h-16 w-3/4" />}
                          {qnaError && <Alert variant="destructive"><Terminal className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{qnaError}</AlertDescription></Alert>}
                      </div>
                  </ScrollArea>
                  <div className="mt-4">
                      <Form {...form}>
                          <form onSubmit={form.handleSubmit(onAskQuestion)} className="flex items-start gap-4">
                              <FormField control={form.control} name="query" render={({ field }) => (
                                  <FormItem className="flex-1">
                                      <FormControl>
                                          <Textarea placeholder="e.g., What are the ethical implications?" {...field} rows={1} className="min-h-[48px]" />
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )} />
                              <Button type="submit" disabled={isAnswering} size="icon" className="h-12 w-12 shrink-0">
                                  {isAnswering ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
                              </Button>
                          </form>
                      </Form>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="summary" className="mt-4 min-h-[60vh] flex flex-col">
                <Button onClick={onGenerateSummary} disabled={isSummarizing} className="w-full">
                  {isSummarizing ? (
                    <LoaderCircle className="animate-spin mr-2" />
                  ) : (
                    <Sparkles className="mr-2" />
                  )}
                  Generate Summary
                </Button>

                <div className="mt-4 flex-1">
                    {isSummarizing && <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>}
                    {summaryError && <Alert variant="destructive"><Terminal className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{summaryError}</AlertDescription></Alert>}
                    {summary && (
                        <Card>
                            <CardHeader className="flex flex-row items-start justify-between">
                                <CardTitle className="text-base">Generated Summary</CardTitle>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(summary, 'summary')}>
                                    <ClipboardCopy className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{summary}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
              </TabsContent>

              <TabsContent value="citations" className="mt-4 min-h-[60vh] flex flex-col">
                <Button onClick={onExtractCitations} disabled={isExtracting} className="w-full">
                  {isExtracting ? (
                    <LoaderCircle className="animate-spin mr-2" />
                  ) : (
                    <Sparkles className="mr-2" />
                  )}
                  Extract Citations
                </Button>
                <div className="mt-4 flex-1">
                    {isExtracting && <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>}
                    {citationError && <Alert variant="destructive"><Terminal className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{citationError}</AlertDescription></Alert>}
                    {citations && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Extracted Citations</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {citations.map((citation, index) => (
                                    <div key={index} className="flex items-start justify-between gap-2">
                                        <p className="text-sm text-muted-foreground flex-1 italic">"{citation}"</p>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => copyToClipboard(citation, 'citation')}>
                                            <ClipboardCopy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {citations.length === 0 && <p className="text-sm text-center text-muted-foreground py-4">No citations found in this document.</p>}
                            </CardContent>
                        </Card>
                    )}
                </div>
              </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}
