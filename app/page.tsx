"use client";

import { useEffect, useMemo, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";

import { SimplifiedPlaylist, Track } from "spotify-types";
import SpotifyApiRequest from "@/lib/spotify";
import { redirect } from "next/navigation";

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
        <div className="flex items-center justify-center h-screen w-screen">
          <button className="text-black rounded-md bg-white hover:bg-slate-300 p-2" onClick={() => signIn('spotify', { callbackUrl: '/' })}>Sign In to Spotify</button>
        </div>
      )}
    </>
  );
};
