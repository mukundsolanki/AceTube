/* eslint-disable */
"use client";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { BackgroundLines } from "@/components/ui/background-lines";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast, { Toaster } from "react-hot-toast";
import { Loader2, ChevronRight } from "lucide-react";
import { FaGithub } from "react-icons/fa";

export default function Home() {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<{
    title: string;
    thumbnail: string;
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [quality, setQuality] = useState("720");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/get-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (response.ok) {
        setVideoInfo(data);
        setIsDialogOpen(true);
      } else {
        toast.error(data.error || "Failed to fetch video information");
      }
    } catch (error) {
      toast.error("Failed to fetch video information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoInfo) return;

    const downloadId = uuidv4();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, quality, downloadId }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = downloadUrl;
        a.download = `${downloadId}.mp4`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);

        toast.success("Video downloaded successfully!");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to download video");
      }
    } catch (error) {
      toast.error("Failed to download video");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster />
      <div className="relative z-50">
        <a
          href="https://github.com/mukundsolanki/AceTube"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 text-gray-700 hover:text-gray-900"
        >
          <FaGithub className="h-6 w-6" />
        </a>
      </div>
      <BackgroundLines className="flex items-center justify-center w-full flex-col px-4">
        <h2 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight">
          Download Videos, <br /> With AceTube.
        </h2>
        <p className="max-w-xl mx-auto text-sm md:text-lg text-neutral-700 dark:text-neutral-400 text-center mb-6">
          Get videos in mp4 format for free.
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
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin mr-2" />
            </div>
          ) : (
            <Button type="submit" variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </form>
      </BackgroundLines>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download Information</DialogTitle>
          </DialogHeader>
          {videoInfo && (
            <>
              <p>Title: {videoInfo.title}</p>
              <img src={videoInfo.thumbnail} alt="Thumbnail" />

              <div className="my-4">
                <label
                  htmlFor="quality"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Select Video Quality:
                </label>
                <Select
                  onValueChange={(value) => setQuality(value)}
                  defaultValue={quality}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1080">1080p</SelectItem>
                    <SelectItem value="720">720p</SelectItem>
                    <SelectItem value="480">480p</SelectItem>
                    <SelectItem value="360">360p</SelectItem>
                    <SelectItem value="240">240p</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2" />
                </div>
              ) : (
                <Button onClick={handleDownload}>Download</Button>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
