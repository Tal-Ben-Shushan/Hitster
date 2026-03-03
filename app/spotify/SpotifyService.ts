import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://api.spotify.com/v1";

export const getPlaylists = async () => {
  const token = await AsyncStorage.getItem("spotify_access_token");
  const res = await fetch(`${BASE_URL}/me/playlists`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
};

export const getSavedTracks = async () => {
  const token = await AsyncStorage.getItem("spotify_access_token");
  const res = await fetch(`${BASE_URL}/me/tracks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
};
