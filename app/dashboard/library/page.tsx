"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

import { SimplifiedPlaylist } from "spotify-types";
import SpotifyApiRequest from "@/lib/spotify";

export default function LibraryPage() {
  const { data: session } = useSession();
  const [playlists, setPlaylists] = useState<SimplifiedPlaylist[]>([]);

  useEffect(() => {
    async function getUserPlaylists() {
      if (session && session.accessToken) {
        // Grab all of current user's playlists
        let playlists: SimplifiedPlaylist[] = [];
        let offset = 0;
        const limit = 50;

        // Send request until there are no playlists to retrieve
        while (true) {
          const data = await SpotifyApiRequest(`https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`, session.accessToken);
          if (data?.items.length == 0) {
            break;
          }
          playlists = playlists.concat(data?.items);
          offset += 50;
        }

        // Filter playlists by created by current user only (show no followed playlists)
        const data = await SpotifyApiRequest('https://api.spotify.com/v1/me', session.accessToken);
        playlists = playlists.filter((track) => track.owner.id === data.id);
        setPlaylists(playlists);
      }
    }
    getUserPlaylists();
  }, [session]);

  return (
    <>
      {session?.user?.name ? (
        <>
          <div className="grid grid-cols-4 grid-flow-row gap-6">
            {
              playlists.map((playlist) => 
                <div key={playlist.id}>
                  <Image
                    src={playlist.images[0]?.url}
                    width={100}
                    height={100}
                    alt="Playlist"
                  />
                  {playlist.name}
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
