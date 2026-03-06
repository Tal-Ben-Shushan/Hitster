import React, { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as AuthSession from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "../context/AuthContext";

const CLIENT_ID = "...";

export default function SpotifyAuth() {
  const { setToken } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();

  const redirectUri = AuthSession.makeRedirectUri({ scheme: "beatblitz", path: "spotify-auth" });

  useEffect(() => {
    if (params.code) {
      exchangeCode(params.code as string);
    }
  }, [params.code]);

  const exchangeCode = async (authCode: string) => {
    try {
      // 1. GET THE VERIFIER WE SAVED IN THE PREVIOUS STEP
      const savedVerifier = await SecureStore.getItemAsync("temp_code_verifier");

      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: authCode,
          redirect_uri: redirectUri,
          client_id: CLIENT_ID,
          code_verifier: savedVerifier || "", // Now it's not empty!
        }).toString(),
      });

      const data = await response.json();

      if (data.access_token) {
        // 2. CLEAN UP THE TEMPORARY VERIFIER
        await SecureStore.deleteItemAsync("temp_code_verifier");

        // 3. SAVE THE ACTUAL TOKEN
        const expirationDate = new Date().getTime() + data.expires_in * 1000;
        await SecureStore.setItemAsync(
          "auth_data",
          JSON.stringify({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expirationDate,
          }),
        );

        setToken(data.access_token);
        router.replace("/(tabs)");
      }
    } catch (err) {
      console.error("Exchange Error:", err);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#1DB954" />
      <Text>Connecting to Spotify...</Text>
    </View>
  );
}
