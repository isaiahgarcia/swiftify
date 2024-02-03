"use client";

import { useEffect, useMemo, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";

import { SimplifiedPlaylist, Track } from "spotify-types";
import SpotifyApiRequest from "@/lib/spotify";
import { redirect } from "next/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import NavMenu from "@/components/NavMenu";

export default function Home() {
  const { data: session } = useSession();
  const [topTaylorSongs, setTopTaylorSongs] = useState<Track[]>([]);

  useEffect(() => {
    async function displayTopTaylorSongs() {
      if (session && session.accessToken) {
        // Grab current user's top Taylor Swift tracks
        const data = await SpotifyApiRequest('https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50', session.accessToken);
        data.items = data.items.filter((track: any) => track.artists.map((artist: any) => artist.id).includes('06HL4z0CvFAxyc27GXpf02'));
        setTopTaylorSongs(data.items);
      }
    }
    displayTopTaylorSongs();
  }, [session]);

  return (
    <>
      {session?.user?.name ? (
        <>
          <NavMenu />
          <div className="flex flex-col space-y-2">
            {
              topTaylorSongs.map((song) => 
                <div key={song.id}>
                  <Image
                    src={song.album.images[0]?.url}
                    width={100}
                    height={100}
                    alt="Song"
                  />
                  {song.name}
                </div>
              )
            }
          </div>
        </>
      ) : (
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
                    and add songs to your playlists which is time consuming.
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
              <button className="text-black rounded-md bg-white hover:bg-slate-300 p-2" onClick={() => signIn('spotify', { callbackUrl: '/' })}>Sign In to Spotify</button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
