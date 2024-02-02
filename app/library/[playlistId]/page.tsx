"use client";

import SpotifyApiRequest from "@/lib/spotify";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Episode, PlaylistTrack, Track } from "spotify-types";

function isTrack(item: Track | Episode): item is Track {
    return item.type === 'track';
}

const PlaylistPage = ({
    params
} : {
    params: { playlistId: string }
}) => {
    const { data: session } = useSession();
    const [songs, setSongs] = useState<PlaylistTrack[]>([]);

    // Listen for active session
    useEffect(() => {
        // Grab songs from playlist 
        async function getPlaylistSongs() {
            if (session && session.accessToken) {
                const data = await SpotifyApiRequest(`https://api.spotify.com/v1/playlists/${params.playlistId}/tracks`, session.accessToken);
                setSongs(data.items);
            }
        }
        getPlaylistSongs();
    }, [session, params.playlistId]);
    
    return (
        <div className="w-3/4 pl-5">
            <div className="flex flex-col space-y-3">
                {
                    songs.map((item) => {
                        return item.track && isTrack(item.track) ? (
                            <div key={item.track.id}>
                                <div className="flex flex-row items-center space-x-2">
                                    <Image 
                                        src={item.track.album.images[0].url}
                                        width={85}
                                        height={85}
                                        alt="Song"
                                    />
                                    <div className="flex flex-col space-y-1">
                                        <p>{item.track.name}</p>
                                        <p className="text-slate-600 text-sm">{item.track.artists[0].name}</p>
                                    </div>
                                </div>
                            </div>
                        ) : item.track && !isTrack(item.track) ? (
                            <div className="flex flex-row items-center space-x-2">
                                <Image 
                                    src={item.track.show?.images[0].url}
                                    width={85}
                                    height={85}
                                    alt="Episode"
                                />
                                <div className="flex flex-col space-y-1">
                                    <p>{item.track.name}</p>
                                    <p className="text-slate-600 text-sm">{item.track.name}</p>
                                </div>
                            </div>

                        ) : null
                    })
                }
            </div>
        </div>
    );
};

export default PlaylistPage;