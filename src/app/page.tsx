"use client";
import React, { useState } from "react";
import { BackgroundLines } from "@/components/ui/background-lines";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Home() {
  const [url, setUrl] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsDialogOpen(true);
  };

  return (
    <>
      <BackgroundLines className="flex items-center justify-center w-full flex-col px-4">
        <h2 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight">
          Download Youtube, <br /> Videos Fast.
        </h2>
        <p className="max-w-xl mx-auto text-sm md:text-lg text-neutral-700 dark:text-neutral-400 text-center mb-6">
          Download youtube videos in mp4 format for free. Just paste the youtube
          video URL in the input box and click on the download button.
        </p>

        <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm items-center space-x-2 z-50"
      >
        <Input
          type="url"
          placeholder="Paste YouTube URL here"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <Button type="submit">Download</Button>
      </form>
      
      </BackgroundLines>

      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download Information</DialogTitle>
          </DialogHeader>
          <p>You submitted the following URL: {url}</p>
          {/* Add more content or functionality here */}
        </DialogContent>
      </Dialog>
    </>
  );
}
