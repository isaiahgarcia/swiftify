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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const [topTaylorSongs, setTopTaylorSongs] = useState<Track[]>([]);
  const [topTaylorSongsByAlbumShort, setTopTaylorSongsByAlbumShort] = useState<Track[]>([]);
  const [topTaylorSongsByAlbumMedium, setTopTaylorSongsByAlbumMedium] = useState<Track[]>([]);
  const [topTaylorSongsByAlbumLong, setTopTaylorSongsByAlbumLong] = useState<Track[]>([]);

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
        const data_short_term = await SpotifyApiRequest(`https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=short_term`, session.accessToken);
        if (data_short_term && data_short_term.items) {
          const topTaylorSongs = data_short_term.items.filter((track: any) => track.artists.map((artist: any) => artist.id).includes('06HL4z0CvFAxyc27GXpf02'));
          const albumsFromTopSongs = topTaylorSongs.map((track: any) => { return (track.name in songsToAlbums) ? songsToAlbums[track.name] : "" });
          const topSongBreakdown = new Array(10).fill(0);
          for (const album of albumsFromTopSongs) {
            if (album != "") topSongBreakdown[albumIdx[album]] += 1;
          }
          setTopTaylorSongsByAlbumShort(topSongBreakdown);
        }

        const data_medium_term = await SpotifyApiRequest(`https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=medium_term`, session.accessToken);
        if (data_medium_term && data_medium_term.items) {
          const topTaylorSongs = data_medium_term.items.filter((track: any) => track.artists.map((artist: any) => artist.id).includes('06HL4z0CvFAxyc27GXpf02'));
          const albumsFromTopSongs = topTaylorSongs.map((track: any) => { return (track.name in songsToAlbums) ? songsToAlbums[track.name] : "" });
          const topSongBreakdown = new Array(10).fill(0);
          for (const album of albumsFromTopSongs) {
            if (album != "") topSongBreakdown[albumIdx[album]] += 1;
          }
          setTopTaylorSongsByAlbumMedium(topSongBreakdown);
        }

        const data_long_term = await SpotifyApiRequest(`https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=long_term`, session.accessToken);
        if (data_long_term && data_long_term.items) {
          const topTaylorSongs = data_long_term.items.filter((track: any) => track.artists.map((artist: any) => artist.id).includes('06HL4z0CvFAxyc27GXpf02'));
          const albumsFromTopSongs = topTaylorSongs.map((track: any) => { return (track.name in songsToAlbums) ? songsToAlbums[track.name] : "" });
          const topSongBreakdown = new Array(10).fill(0);
          for (const album of albumsFromTopSongs) {
            if (album != "") topSongBreakdown[albumIdx[album]] += 1;
          }
          setTopTaylorSongsByAlbumLong(topSongBreakdown);
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
          <Tabs defaultValue="short_term" className="">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="short_term">Last 4 Weeks</TabsTrigger>
              <TabsTrigger value="medium_term">Last 6 Months</TabsTrigger>
              <TabsTrigger value="long_term">All Time</TabsTrigger>
            </TabsList>
            <TabsContent value="short_term">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Your Swiftie Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <PieChart seriesData={topTaylorSongsByAlbumShort} labelNames={["Debut", "Fearless", "Speak Now", "Red", "1989", "Reputation", "Lover", "folklore", "evermore", "Midnights"]} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="medium_term">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Your Swiftie Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <PieChart seriesData={topTaylorSongsByAlbumMedium} labelNames={["Debut", "Fearless", "Speak Now", "Red", "1989", "Reputation", "Lover", "folklore", "evermore", "Midnights"]} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="long_term">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Your Swiftie Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <PieChart seriesData={topTaylorSongsByAlbumLong} labelNames={["Debut", "Fearless", "Speak Now", "Red", "1989", "Reputation", "Lover", "folklore", "evermore", "Midnights"]} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
