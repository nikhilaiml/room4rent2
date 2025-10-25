import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getDocuments } from '@/lib/documents';
import { UploadDialog } from '@/components/upload-dialog';
import { BookOpenCheck, FileText, Home, LogOut, Settings } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import Logo from '@/components/logo';

export const metadata: Metadata = {
  title: 'ScholarSage',
  description: 'AI-Powered Research Assistant',
};

// This is a server component
async function SidebarDocs() {
  const documents = await getDocuments();
  return (
    <SidebarMenu>
      {documents.map((doc) => (
        <SidebarMenuItem key={doc.id}>
          <SidebarMenuButton
            asChild
            tooltip={doc.title}
          >
            <Link href={`/documents/${doc.id}`}>
              <FileText />
              <span>{doc.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider>
          <Sidebar collapsible="icon">
            <SidebarHeader className="p-4">
                <Logo />
            </SidebarHeader>
            <SidebarContent className="p-2">
                <div className="flex flex-col gap-4">
                  <UploadDialog />
                   <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Dashboard">
                        <Link href="/">
                          <Home />
                          <span>Dashboard</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </div>
                <div className="flex flex-col gap-1 p-2 mt-4">
                    <h3 className="text-sm font-medium text-sidebar-foreground/70 px-2 group-data-[collapsible=icon]:hidden">Documents</h3>
                    <div className="max-h-64 overflow-y-auto">
                        <SidebarDocs />
                    </div>
                </div>
            </SidebarContent>
            <SidebarFooter className="p-4 flex-row justify-between items-center gap-2 group-data-[collapsible=icon]:flex-col">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                    <AvatarImage src="https://picsum.photos/seed/user/40/40" alt="User" />
                    <AvatarFallback>SS</AvatarFallback>
                </Avatar>
                <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-semibold text-sidebar-foreground">Scholar Sage</span>
                    <span className="text-xs text-sidebar-foreground/70">user@example.com</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8">
                <LogOut className="h-4 w-4"/>
              </Button>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset className="flex flex-col">
            <header className="flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10 border-b md:justify-end">
              <SidebarTrigger className="md:hidden"/>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                  <Settings />
                </Button>
              </div>
            </header>
            <main className="flex-1 p-4 md:p-8">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
