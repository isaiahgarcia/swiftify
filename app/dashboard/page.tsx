"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

import { Track } from "spotify-types";
import SpotifyApiRequest from "@/lib/spotify";
import NavMenu from "@/components/NavMenu";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { PieChart } from "@/components/Chart";

export default function DashboardPage() {
  const { data: session } = useSession();

  const [topNonTaylorSongs, setTopNonTaylorSongs] = useState<Track[]>([]);
  const [topTaylorSongs, setTopTaylorSongs] = useState<Track[]>([]);

  useEffect(() => {
    async function displayTopTaylorSongs() {
      if (session && session.accessToken) {
        // Grab current user's top Taylor Swift tracks
        const data = await SpotifyApiRequest(`https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50`, session.accessToken);
        // const topTaylorSongs = data.items.filter((track: any) => track.artists.map((artist: any) => artist.id).includes('06HL4z0CvFAxyc27GXpf02'));
        // const topNonTaylorSongs = data.items.filter((track: any) => !track.artists.map((artist: any) => artist.id).includes('06HL4z0CvFAxyc27GXpf02'));
        // setTopNonTaylorSongs(topNonTaylorSongs);
        // setTopTaylorSongs(topTaylorSongs);
      }
    }
    displayTopTaylorSongs();
  }, [session, topTaylorSongs]);

  return (
    <>
      <NavMenu />
      <div className="w-3/4 flex flex-col items-center space-y-2">
        <div className="flex flex-row space-x-20">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Top Song Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart seriesData={[topTaylorSongs.length, topNonTaylorSongs.length]} labelNames={["Taylor songs", "Non-Taylor songs"]} />
            </CardContent>
          </Card>
          <p>Chart</p>
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