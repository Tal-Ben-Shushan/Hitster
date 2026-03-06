import React, { useEffect, useState } from "react";
import { View, Button, StyleSheet } from "react-native";
import * as AuthSession from "expo-auth-session";
import { useAuth } from "@/context/AuthContext";
import { ThemedText } from "@/components/themed-text";
import * as SecureStore from "expo-secure-store";

const CLIENT_ID = "...";

const SCOPES = ["user-modify-playback-state", "user-read-playback-state"];

const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

export default function TabTwoScreen() {
  const { token, logout, isLoading } = useAuth();

  const redirectUri = AuthSession.makeRedirectUri({ scheme: "beatblitz", path: "spotify-auth" });

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

  const handleLogin = async () => {
    if (request?.codeVerifier) {
      // SAVE THE VERIFIER BEFORE THE BROWSER OPENS
      await SecureStore.setItemAsync("temp_code_verifier", request.codeVerifier);
      promptAsync();
    }
  };

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

  if (isLoading)
    return (
      <View style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );

  return (
    <View style={styles.container}>
      {!token ? (
        <Button title="Login to Spotify" disabled={!request} onPress={handleLogin} />
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
