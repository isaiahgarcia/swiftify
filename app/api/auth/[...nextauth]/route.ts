import { Account, Profile, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import NextAuth from "next-auth/next";
import SpotifyProvider from "next-auth/providers/spotify";

const scopes = "user-read-private user-read-email user-top-read playlist-read-private playlist-modify-private playlist-modify-public";

const params = {
    scope: scopes
};

const LOGIN_URL = "https://accounts.spotify.com/authorize?" + new URLSearchParams(params);

async function refreshAccessToken(token: any) {
    // Refreshes an access token
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', token.refreshToken);

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: "POST",
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))
        },
        body: params
    });

    const data = await response.json();
    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? token.refreshToken,
        accessTokenExpires: Date.now() + data.expired_in * 1000
    }

}

export const authOptions = {
    // Configure one or more authentication providers
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID ?? '',
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? '',
            authorization: LOGIN_URL,
        })
    ],
    secret: process.env.JWT_SECRET,
    pages: {
        signIn: "/",
    },
    callbacks: {
        async jwt(params : {
            token: JWT;
            account: Account | null;
        }) {
            const { token, account } = params;
            // Persist the OAuth access_token and or the user id to the token right after signin
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.accessTokenExpires = account.expires_at;
                return token;
            }

            // Access token has not expired
            if (typeof token.accessTokenExpires === 'number' && Date.now() < token.accessTokenExpires * 1000) {
                return token;
            }

            // Access token has expired
            return refreshAccessToken(token);
        },
        async session({ session, token } : {
            session: any;
            token: JWT;
        }) {
            // Send properties to the client, like an access token
            session.accessToken = token.accessToken;
            return session;
        }
    }
};

const handler =  NextAuth(authOptions);

export { handler as GET, handler as POST };