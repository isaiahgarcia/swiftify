"use client";

import { Badge } from "@/components/ui/badge";
import SpotifyApiRequest from "@/lib/spotify";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Episode, PlaylistTrack, SimplifiedAlbum, SimplifiedTrack, Track } from "spotify-types";

const stolenAlbumNames = [
    "Fearless",
    "Fearless Platinum Edition",
    "Speak Now",
    "Speak Now (Deluxe Edition)",
    "Red",
    "Red (Deluxe Edition)",
    "1989",
    "1989 (Deluxe Edition)"
];

const tvAlbumNames = [
    "1989 (Taylor's Version) [Deluxe]",
    "Speak Now (Taylor's Version)",
    "Red (Taylor's Version)",
    "Fearless (Taylor's Version)",
];

// Caveat function to cast an item as Track type because Track and Episode types are the exact same in Spotify Web API but different in imported Spotify types
function isTrack(item: Track | Episode): item is Track {
    return item.type === 'track' || item.type === 'episode';
}

const PlaylistPage = ({
    params
} : {
    params: { playlistId: string }
}) => {
    const { data: session } = useSession();
    const [playlistName, setPlaylistName] = useState<string>('');
    const [songs, setSongs] = useState<PlaylistTrack[]>([]);
    const [mapping, setMapping] = useState<any>({});
    const [stolenIds, setStolenIds] = useState<string[]>([]);
    const [tvIds, setTvIds] = useState<string[]>([]);
    const [statuses, setStatuses] = useState<string[]>([]);

    // Listen for active session
    useEffect(() => {
        // Get playlist name
        async function getPlaylistName() {
            if (session && session.accessToken) {
                const data = await SpotifyApiRequest(`https://api.spotify.com/v1/playlists/${params.playlistId}`, session.accessToken);
                setPlaylistName(data.name);
            }
        }

        // Grab songs from playlist 
        async function getPlaylistSongs() {
            if (session && session.accessToken) {
                const data = await SpotifyApiRequest(`https://api.spotify.com/v1/playlists/${params.playlistId}/tracks`, session.accessToken);
                setSongs(data.items);
            }
        }

        // Store stolen and tv ids
        async function createStolenToTVMap() {
            if (session && session.accessToken) {
                const stolenToTV: any = {};

                // Get Taylor's albums
                const data = await SpotifyApiRequest(`https://api.spotify.com/v1/artists/06HL4z0CvFAxyc27GXpf02/albums?include_groups=album&limit=50`, session?.accessToken);
                const albums: SimplifiedAlbum[] = data.items;

                // Split albums by SV and TV
                const stolenAlbums = albums.filter((album) => {
                    return stolenAlbumNames.includes(album.name);
                });
                const tvAlbums = albums.filter((album) => {
                    return tvAlbumNames.includes(album.name);
                })

                // Loop through stolen albums
                let ids = [];
                for (const album of stolenAlbums) {
                    // Add album name as a key
                    let name = album.name;
                    name = name.replace(" (Deluxe Edition)", "");
                    name = name.replace(" Platinum Edition", "");
                    if (!stolenToTV[name]) {
                        stolenToTV[name] = {
                            name: name
                        };
                    }

                    // Traverse into object containing album name
                    const stolenToTvByAlbum = stolenToTV[name];

                    // Grab SV album tracks
                    const data = await SpotifyApiRequest(`https://api.spotify.com/v1/albums/${album.id}/tracks`, session.accessToken);

                    // Store SV info into object and into stolenIds
                    for (const track of data.items) {
                        ids.push(track.id);
                        if (!(track.id in stolenToTvByAlbum)) {
                            stolenToTvByAlbum[track.id] = {
                                id: track.id,
                                name: track.name,
                                tvId: ""
                            };
                        }
                    }
                }
                setStolenIds(ids);

                // Loop through TV albums
                ids = [];
                for (const album of tvAlbums) {
                    // Grab TV album tracks
                    const data = await SpotifyApiRequest(`https://api.spotify.com/v1/albums/${album.id}/tracks`, session.accessToken);

                    // Pattern match album name (e.g. '1989 (Taylor's Version)' -> '1989')
                    let albumName = album.name.replace(/ *\([^)]*\) */g, "");
                    albumName = albumName.replace("[Deluxe]", "");

                    // Loop through tracks and store TV ids into tvIds
                    for (const track of data.items) {
                        ids.push(track.id);
                        // Pattern match track name (e.g. 'Bad Blood (Taylor's Version)' -> 'Bad Blood')
                        let name = track.name;
                        name = name.replace(/ *\([^)]*\) */g, "");
                        if (name === "I Knew You Were Trouble") name += ".";
                        if (track.name === "State Of Grace (Acoustic Version) (Taylor's Version)") name += " - Acoustic";
                        
                        // Store TV ids if track names match
                        const stolenToTvByAlbum = stolenToTV[albumName];
                        for (const id of Object.keys(stolenToTvByAlbum)) {
                            if (name === stolenToTvByAlbum[id].name) stolenToTvByAlbum[id].tvId = track.id;
                        }
                    }
                }
                setTvIds(ids);
                setMapping(stolenToTV);
            }
        }

        getPlaylistName();
        getPlaylistSongs();
        createStolenToTVMap();
    }, [session, params.playlistId]);

    // Track which songs are stolen, re-records, or neither
    useEffect(() => {
        if (songs.length > 0) {
            const statuses: string[] = [];
            for (const song of songs) {
                // Check if song exists and is of type Track
                if (song.track && isTrack(song.track)) {
                    // Check if song is a Taylor song
                    const artistsNames = song.track.artists.map(artist => artist.name);
                    if (artistsNames.includes("Taylor Swift")) {
                        // Check if song is stolen, TV, or not yet updated (i.e. reputation and debut)
                        if (stolenIds.includes(song.track.id)) {
                            statuses.push('stolen');
                        } else if (tvIds.includes(song.track.id)) {
                            statuses.push('re-record');
                        } else {
                            statuses.push('');
                        }
                    } else {
                        statuses.push('');
                    }
                } else {
                    statuses.push('');
                }
            }
            setStatuses(statuses);
        }
    }, [songs, stolenIds, tvIds]);

    // Update playlists with button click
    const updatePlaylists = async () => {
        if (session && session.accessToken) {
            const uris = [];
            const resource = "spotify:track:";
    
            // Loop through all playlist tracks
            for (const tracks of songs) {
                const track = tracks.track;
                if (track && isTrack(track)) {
                    // Parse album name to match mapping
                    let albumName = track.album.name.replace(/ *\([^)]*\) */g, "");
                    albumName = albumName.replace("[Deluxe]", "");
    
                    // Populate uris with TV ids if current song id is SV, else keep the same
                    if (albumName in mapping) {
                        const songsInMap = mapping[albumName];
                        if (track.id in songsInMap) {
                            uris.push(resource + songsInMap[track.id].tvId);
                        } else {
                            uris.push(resource + track.id);
                        }
                    } else {
                        uris.push(resource + track.id);
                    }
                }
            }
    
            const urisAsString = uris.join(",");
    
            // Update playlist with Taylor's Version
            const data = await SpotifyApiRequest(`https://api.spotify.com/v1/playlists/${params.playlistId}/tracks?uris=${urisAsString}`, session?.accessToken, "PUT");

            if (data && data.snapshot_id) {
                // Grab playlist and update React state
                const data = await SpotifyApiRequest(`https://api.spotify.com/v1/playlists/${params.playlistId}/tracks`, session?.accessToken);
                setSongs(data.items);
                toast.success('Playlists updated.');
            } else {
                toast.error('Access Denied.');
            }
        }
    }
    
    return (
        <div className="pl-7 pr-5 space-y-3">
            <div className="sticky top-0 bg-slate-950 h-20">
                <div className="flex items-center pt-5 justify-between">
                    <div className="text-pretty font-bold">
                        {playlistName}
                    </div>
                    <button 
                        className="bg-[#1db954] rounded-xl font-bold text-black p-2"
                        onClick={updatePlaylists}
                    >
                        update
                    </button>
                </div>
            </div>
            <div className="flex flex-col space-y-3">
                {
                    songs.map((item, idx) => {
                        return item.track && isTrack(item.track) ? (
                            <div key={item.track.id}>
                                <div className="flex justify-between space-x-4 items-center">
                                    <div className="flex flex-row items-center space-x-2">
                                        <Image 
                                            src={item.track.album.images[0].url}
                                            width={85}
                                            height={85}
                                            alt="Song"
                                        />
                                        <div className="flex flex-col space-y-1">
                                            <p>{item.track.name}</p>
                                            <p className="text-slate-600 text-sm">{item.track.artists.map(artist => artist.name).join(', ')}</p>
                                        </div>
                                    </div>
                                    {
                                        statuses[idx] === 're-record' ? (
                                            <Badge className="bg-[#c6e597] rounded-md">
                                                <p className="text-black text-nowrap text-sm font-bold p-2">{statuses[idx]}</p>
                                            </Badge>
                                        ) : statuses[idx] === 'stolen' ? (
                                            <Badge className="bg-[#a03f18] rounded-md">
                                                <p className="text-black text-nowrap text-sm font-bold p-2">{statuses[idx]}</p>
                                            </Badge>
                                        ) : null
                                    }
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