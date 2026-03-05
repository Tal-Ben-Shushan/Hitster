import React, { useEffect, useState } from "react";
import { View, Button, StyleSheet } from "react-native";
import * as AuthSession from "expo-auth-session";

const CLIENT_ID = "...";
const SCOPES = ["user-modify-playback-state", "user-read-playback-state"];

const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

export default function TabTwoScreen() {
  const [token, setToken] = useState<string | null>(null);

  const redirectUri = AuthSession.makeRedirectUri({ scheme: "beatBlitz", path: "spotify-auth" });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: SCOPES,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    discovery,
  );

  useEffect(() => {
    if (response?.type === "success" && response.params.access_token) {
      setToken(response.params.access_token);
    }
  }, [response]);

  const SPOTIFY_API = "https://api.spotify.com/v1/me/player";

  const play = async () => {
    if (!token) return;
    await fetch(`${SPOTIFY_API}/play`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const pause = async () => {
    if (!token) return;
    await fetch(`${SPOTIFY_API}/pause`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  return (
    <View style={styles.container}>
      {!token ? (
        <Button title="Login to Spotify" disabled={!request} onPress={() => promptAsync()} />
      ) : (
        <>
          <Button title="Play" onPress={play} />
          <Button title="Pause" onPress={pause} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
});
