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

export default function Home() {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<{
    title: string;
    thumbnail: string;
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [quality, setQuality] = useState("720p");

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setErrorMessage("");

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
        setErrorMessage(data.error || "Something went wrong");
      }
    } catch (error) {
      setErrorMessage("Failed to fetch video information");
    }
  };

  const handleDownload = async () => {
    const downloadId = uuidv4();

    try {
      const response = await fetch("http://localhost:5000/api/download-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          quality,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `${downloadId}.mp4`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to start download");
      }
    } catch (error) {
      setErrorMessage("Failed to download video");
    }
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
          <Button type="submit">Start</Button>
        </form>

        {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
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
                    <SelectItem value="1080p">1080p</SelectItem>
                    <SelectItem value="720p">720p</SelectItem>
                    <SelectItem value="480p">480p</SelectItem>
                    <SelectItem value="360p">360p</SelectItem>
                    <SelectItem value="240p">240p</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleDownload}>Download</Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
