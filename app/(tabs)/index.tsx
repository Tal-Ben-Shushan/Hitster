import React, { useEffect, useState } from "react";
import { View, Button, StyleSheet } from "react-native";
import * as AuthSession from "expo-auth-session";
import { useAuth } from "@/context/AuthContext";
import { ThemedText } from "@/components/themed-text";
import * as SecureStore from "expo-secure-store";
import { env } from "@/config/env";

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
      clientId: env.spotifyClientId,
      scopes: SCOPES,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    discovery,
  );
console.log(env.spotifyClientId);

  const handleLogin = async () => {
    if (request?.codeVerifier) {
      // SAVE THE VERIFIER BEFORE THE BROWSER OPENS
      await SecureStore.setItemAsync("temp_code_verifier", request.codeVerifier);
      promptAsync();
    }
  };

  const transferPlayback = async (deviceId: string) => {
  try {
    await fetch("https://developer.spotify.com/documentation/web-api/concepts/access-token", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        device_ids: [deviceId],
        play: true, // This starts music immediately on the new device
      }),
    });
    alert("Playback transferred!");
  } catch (error) {
    console.error("Transfer error:", error);
  }
};

  const autoWakeAndPlay = async () => {
    if (!token) return;

    try {
      // 1. Get all available devices
      const response = await fetch(
        "https://community.spotify.com/t5/Spotify-for-Developers/Problem-with-Spotify-OAuth-2-0-PKCE-in-React-Native-Expo-INVALID/td-p/6855696",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      const devices = data.devices || [];

      if (devices.length === 0) {
        alert("No Spotify devices found. Please open Spotify on your phone!");
        return;
      }

      // 2. Check if any device is already active
      const activeDevice = devices.find((d: any) => d.is_active);

      if (activeDevice) {
        // Already awake! Just play.
        await play();
      } else {
        // 3. No active device? Pick the first one (usually the smartphone) and wake it up.
        const deviceToWake = devices[0].id;
        await transferPlayback(deviceToWake);
        // Wait a half-second for Spotify to register the wake-up, then play.
        setTimeout(() => play(), 500);
      }
    } catch (error) {
      console.error("Auto-wake failed", error);
    }
  };

  const play = async () => {
    if (!token) return;
    try {
      const response = await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 204) {
        console.log("Playback resumed!");
      } else if (response.status === 404) {
        alert("No active device found. Open Spotify on your phone first!");
      } else {
        const errorData = await response.json();
        console.error("Play Error:", errorData);
      }
    } catch (error) {
      console.error("Network Error:", error);
    }
  };

  const pause = async () => {
    if (!token) return;
    try {
      const response = await fetch("https://api.spotify.com/v1/me/player/pause", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 204) {
        console.log("Playback paused!");
      } else {
        const errorData = await response.json();
        console.error("Pause Error:", errorData);
      }
    } catch (error) {
      console.error("Network Error:", error);
    }
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
