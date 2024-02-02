"use client";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
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
                {session?.user?.name} <br />
                <button onClick={() => signOut()}>Sign Out</button>
            </>
        );
    }

    return (
        <>
            Not signed in <br />
            <button onClick={() => signIn()}>Sign In</button>
        </>
    );
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
        <div className="w-1/4">
            <AuthButton />
            <hr className="my-4" />
            <ul>
                <Link href="/">
                    <li className={pathname === "/" ? ACTIVE_ROUTE : INACTIVE_ROUTE}>
                        Home
                    </li>
                </Link>
                <Link href="/library">
                    <li className={pathname === "/library" ? ACTIVE_ROUTE : INACTIVE_ROUTE}>
                        Library
                    </li>
                </Link>
            </ul>
            <hr className="my-4" />
            {session?.user?.name ? (
                <>
                <ul className="flex flex-col space-y-3">
                    {
                        playlists.map((playlist) => {
                            const href = `/library/${playlist.id}`;

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
                </>
            ) : (
                <div></div>
            )}
        </div>

    );
};