"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SimplifiedPlaylist } from "spotify-types";
import SpotifyApiRequest from "@/lib/spotify";
import Image from "next/image";

const ACTIVE_ROUTE = "py-1 px-2 text-gray-300 bg-gray-700";
const INACTIVE_ROUTE = "py-1 px-2 text-gray-500 hover:text-gray-300 hover:bg-gray-700";

function AuthButton() {
    const { data: session } = useSession();

    if (session) {
        return (
            <>
                <div className="space-y-2">
                    <h1 className="font-bold text-5xl">Swiftify</h1>
                    <h1>{session?.user?.name}</h1>
                    <hr className="my-4" />
                    <button onClick={() => signOut({ callbackUrl: '/' })}>Sign Out</button>
                </div>
            </>
        );
    }

    return null;
};

export default function NavMenu() {
    const pathname = usePathname();

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
        <div className="w-1/4 bg-slate-950 shadow-2xl">
            <AuthButton />
            <hr className="my-4" />
            <ul>
                <Link href="/dashboard">
                    <li className={pathname === "/dashboard" ? ACTIVE_ROUTE : INACTIVE_ROUTE}>
                        Home
                    </li>
                </Link>
                <Link href="/dashboard/library">
                    <li className={pathname === "/dashboard/library" ? ACTIVE_ROUTE : INACTIVE_ROUTE}>
                        Library
                    </li>
                </Link>
            </ul>
            <hr className="my-4" />
            <ul className="flex flex-col space-y-3">
                {
                    playlists.map((playlist) => {
                        const href = `/dashboard/library/${playlist.id}`;

                        return (
                            <Link key={playlist.id} href={href}>
                                <li className={pathname === href ? ACTIVE_ROUTE : INACTIVE_ROUTE}>
                                    <div className="flex items-center space-x-3">
                                        <Image
                                            src={playlist.images[0]?.url}
                                            width={50}
                                            height={50}
                                            alt="Playlist"
                                        />
                                        <p>{playlist.name}</p>
                                    </div>
                                </li>
                            </Link>
                        )
                    })
                }
            </ul>
        </div>
    );
};