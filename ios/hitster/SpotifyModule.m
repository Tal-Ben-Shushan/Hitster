#import "React/RCTBridgeModule.h"
#import <SpotifyiOS/SpotifyiOS.h>

@interface RCT_EXTERN_MODULE(SpotifyModule, NSObject)
RCT_EXTERN_METHOD(connect:(NSString *)clientId redirectUri:(NSString *)redirectUri resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(playUri:(NSString *)uri resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(pause:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getPlayerState:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
@end