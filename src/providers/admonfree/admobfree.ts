import { Settings } from './../../shared/settings/settings';
import { AdMobFree, AdMobFreeInterstitialConfig, AdMobFreeBannerConfig } from '@ionic-native/admob-free';
import { Injectable } from '@angular/core';

@Injectable()
export class AdMobFreeProvider {

    authState: any = null;

    constructor(public admob: AdMobFree) {

    }

    launchInterstitial(user): Promise<any> {
        if (Settings.onDevice) {
            if (user.noAds == null || !user.noAds) {
                return new Promise((resolve, reject) => {
                    let interstitialConfig: AdMobFreeInterstitialConfig = {
                        isTesting: true, // Remove in production
                        autoShow: true,
                        // id: 'ca-app-pub-8879541481082393~9925193073'
                    };
                    this.admob.interstitial.config(interstitialConfig);
                    this.admob.interstitial.prepare().then(() => {
                        resolve();
                        // success
                    });
                });
            }
        } else {
            return new Promise((resolve, reject) => { resolve(); });
        }
    }

    showBanner(user) {
        if (Settings.onDevice) {
            if (user.noAds == null || !user.noAds) {
                let bannerConfig: AdMobFreeBannerConfig = {
                    isTesting: true, // Remove in production
                    autoShow: true,
                    // id: 'ca-app-pub-8879541481082393~9925193073'
                };

                this.admob.banner.config(bannerConfig);

                this.admob.banner.prepare().then(() => {
                    // success
                }).catch(e => console.log(e));
            }
        } else {
            return new Promise((resolve, reject) => { resolve(); });
        }
    }
}