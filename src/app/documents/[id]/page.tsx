import { getDocument } from '@/lib/documents';
import { notFound } from 'next/navigation';
import DocumentClient from '@/components/document-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type DocumentPageProps = {
  params: {
    id: string;
  };
};

export default async function DocumentPage({ params }: DocumentPageProps) {
  const document = await getDocument(params.id);

  if (!document) {
    notFound();
  }

  const Icon = document.icon;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-3">
          <Icon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold font-headline">{document.title}</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Uploaded on {new Date(document.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Document Content</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none text-foreground text-base leading-relaxed">
                    <p>{document.content}</p>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1">
          <DocumentClient documentId={document.id} />
        </div>
      </div>
    </div>
  );
}
