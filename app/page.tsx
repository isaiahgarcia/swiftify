"use client";

import { signIn } from "next-auth/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Home() {
  return (
    <>
      <div className="w-1/2 bg-slate-800 w-screen">
        <h1 className="font-bold text-5xl p-4">Swiftify</h1>
        <div className="flex items-center justify-center h-screen p-20">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is Swiftify?</AccordionTrigger>
              <AccordionContent>
                Swiftify is an automation tool that updates your playlists 
                to stream Taylor&apos;s Version if there are any old versions.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How does it work?</AccordionTrigger>
              <AccordionContent>
                You can log into your Spotify account, allowing you to access
                and update your playlists using the Spotify API. Swiftify
                will detect if any of your playlists contain old Taylor Swift songs
                and will guide you to update them within seconds!
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Why?</AccordionTrigger>
              <AccordionContent>
                On the Spotify app, you have to individually delete
                and add songs to your playlists.
                When Taylor releases a new re-recorded album, this becomes
                time-consuming if you are a Swiftie with many songs on many playlists.
                And as a Swiftie, of course you want to support Taylor&apos;s
                re-record journey and what better way than to only
                stream her re-recorded music. 
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      <div className="w-1/2 w-screen">
        <div className="p-4"></div>
        <div className="flex items-center justify-center h-screen">
          <button className="text-black rounded-md bg-white hover:bg-slate-300 p-2" onClick={() => signIn('spotify', { callbackUrl: '/dashboard' })}>Sign In to Spotify</button>
        </div>
      </div>
    </>
  );
};
