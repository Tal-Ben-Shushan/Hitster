package com.myapp.spotify;

import com.facebook.react.bridge.*;
import com.spotify.android.appremote.api.*;
import com.spotify.protocol.client.Subscription;
import com.spotify.protocol.types.PlayerState;

public class SpotifyModule extends ReactContextBaseJavaModule {
    private SpotifyAppRemote mSpotifyAppRemote;

    public SpotifyModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() { return "SpotifyModule"; }

    @ReactMethod
    public void connect(String clientId, String redirectUri, Promise promise) {
        ConnectionParams connectionParams =
            new ConnectionParams.Builder(clientId)
            .setRedirectUri(redirectUri)
            .showAuthView(true)
            .build();

        SpotifyAppRemote.connect(getReactApplicationContext(), connectionParams,
            new Connector.ConnectionListener() {
                public void onConnected(SpotifyAppRemote spotifyAppRemote) {
                    mSpotifyAppRemote = spotifyAppRemote;
                    promise.resolve(true);
                }
                public void onFailure(Throwable throwable) {
                    promise.reject("CONNECT_ERROR", throwable);
                }
            });
    }

    @ReactMethod
    public void playUri(String uri, Promise promise) {
        if (mSpotifyAppRemote != null) {
            mSpotifyAppRemote.getPlayerApi().play(uri);
            promise.resolve(true);
        } else {
            promise.reject("NOT_CONNECTED", "Spotify not connected");
        }
    }

    @ReactMethod
    public void pause(Promise promise) {
        if (mSpotifyAppRemote != null) {
            mSpotifyAppRemote.getPlayerApi().pause();
            promise.resolve(true);
        } else {
            promise.reject("NOT_CONNECTED", "Spotify not connected");
        }
    }

    @ReactMethod
    public void getPlayerState(Promise promise) {
        if (mSpotifyAppRemote != null) {
            mSpotifyAppRemote.getPlayerApi().getPlayerState().setResultCallback(
                playerState -> promise.resolve(playerState.track.name)
            );
        } else {
            promise.reject("NOT_CONNECTED", "Spotify not connected");
        }
    }
}