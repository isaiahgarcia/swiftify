"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

import { Track } from "spotify-types";
import SpotifyApiRequest from "@/lib/spotify";
import NavMenu from "@/components/NavMenu";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { PieChart } from "@/components/Chart";
import { redirect } from "next/navigation";
import { albumIdx, songsToAlbums } from "@/lib/TaylorSongs";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const [topNonTaylorSongs, setTopNonTaylorSongs] = useState<Track[]>([]);
  const [topTaylorSongs, setTopTaylorSongs] = useState<Track[]>([]);
  const [topTaylorSongsByAlbum, setTopTaylorSongsByAlbum] = useState<Track[]>([]);

  // Effect to establish a protected route if user is not signed in
  useLayoutEffect(() => {
    if (status === "unauthenticated") {
      redirect('/');
    }
  }, [status]);

  useEffect(() => {
    async function displayTopTaylorSongs() {
      if (session && session.accessToken) {
        // Grab current user's top Taylor Swift tracks
        const data = await SpotifyApiRequest(`https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=short_term`, session.accessToken);
        if (data && data.items) {
          const topTaylorSongs = data.items.filter((track: any) => track.artists.map((artist: any) => artist.id).includes('06HL4z0CvFAxyc27GXpf02'));
          const topNonTaylorSongs = data.items.filter((track: any) => !track.artists.map((artist: any) => artist.id).includes('06HL4z0CvFAxyc27GXpf02'));
          const albumsFromTopSongs = topTaylorSongs.map((track: any) => { return (track.name in songsToAlbums) ? songsToAlbums[track.name] : "" });
          const topSongBreakdown = new Array(10).fill(0);
          for (const album of albumsFromTopSongs) {
            if (album != "") topSongBreakdown[albumIdx[album]] += 1;
          }
          setTopTaylorSongsByAlbum(topSongBreakdown);
          setTopNonTaylorSongs(topNonTaylorSongs);
          setTopTaylorSongs(topTaylorSongs);
        }
      }
    }
    displayTopTaylorSongs();
  }, [session]);

  return (
    <>
      <NavMenu />
      <div className="w-3/4 flex flex-col items-center space-y-2">
        <div className="flex">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Your Swiftie Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart seriesData={topTaylorSongsByAlbum} labelNames={["Taylor Swift", "Fearless", "Speak Now", "Red", "1989", "Reputation", "Lover", "folklore", "evermore", "Midnights"]} />
            </CardContent>
          </Card>
        </div>
        <Carousel className="max-w-xs">
          <CarouselContent>
            {
              topTaylorSongs.map((song, idx) => 
                <CarouselItem key={song.id}>
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center p-6">
                        <div className="flex flex-col items-center">
                          <Image
                            src={song.album.images[0]?.url}
                            width={100}
                            height={100}
                            alt="Song"
                          />
                          <h1 className="text-balance text-center">{song.name}</h1>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <p>{idx+1}</p>
                      </CardFooter>
                    </Card>
                  </div>
                </CarouselItem>
              )
            }
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </>
  )
};
