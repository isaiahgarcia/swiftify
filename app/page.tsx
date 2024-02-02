"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
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
        // const data = await SpotifyApiRequest('https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50', session.accessToken);
        setTopTaylorSongs([]);
      }
    }
    displayTopTaylorSongs();
  }, [session]);

  return (
    <>
      {session?.user?.name ? (
        <>
          <div className="grid grid-cols-1 grid-flow-row gap-6">
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
        <div>Not logged in</div>
      )}
    </>
  );
};
