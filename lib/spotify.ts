/* CODE FOR SPOTIFY WEB API PACKAGE */
// import SpotifyWebApi from "spotify-web-api-node";

// const spotifyApi = new SpotifyWebApi({
//     clientId: process.env.SPOTIFY_CLIENT_ID,
//     clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
//     redirectUri: process.env.SPOTIFY_REDIRECT_URL
// });

// export default spotifyApi;

export default async function SpotifyApiRequest(endpoint: string, token: string) {
    const response = await fetch(endpoint, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.text();
    const json = data === "" ? {} : JSON.parse(data);
    return json;
}