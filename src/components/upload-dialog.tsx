"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function UploadDialog() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleUpload = () => {
    toast({
      title: "Feature in Development",
      description: "Document upload functionality is not yet implemented.",
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full justify-start text-base" size="lg">
          <UploadCloud className="mr-2 h-5 w-5" />
          <span className="group-data-[collapsible=icon]:hidden">Upload Document</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Upload Document</DialogTitle>
          <DialogDescription>
            Add a new paper, book, or note to your library. This feature is for demonstration purposes only.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="document">Select File</Label>
            <Input id="document" type="file" disabled />
          </div>
           <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" type="text" placeholder="e.g., The Future of AI" disabled />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="submit" onClick={handleUpload}>Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
