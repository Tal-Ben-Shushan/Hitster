import AsyncStorage from "@react-native-async-storage/async-storage";

const CLIENT_ID = "YOUR_CLIENT_ID";
const REDIRECT_URI = "myapp://spotify-auth";
const SCOPES = "user-read-private user-read-email streaming playlist-read-private";

export const getAuthUrl = () => {
  return `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
};

export const handleRedirect = async (url: string) => {
  if (url.startsWith(REDIRECT_URI)) {
    const [, fragment] = url.split("#");
    const params = Object.fromEntries(fragment.split("&").map((p: string) => p.split("=")));
    await AsyncStorage.setItem("spotify_access_token", params.access_token);
    return true;
  }
  return false;
};
