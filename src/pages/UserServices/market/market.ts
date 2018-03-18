import { UserProvider } from './../../../providers/user/user';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { User } from './../../../shared/models/user';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { PayPal, PayPalPayment, PayPalConfiguration } from '@ionic-native/paypal';
import { Settings } from '../../../shared/settings/settings';

@IonicPage()
@Component({
  selector: 'page-market',
  templateUrl: 'market.html',
})
export class MarketPage {

  stormNum = 0;
  jokerNum = 0;
  hammerNum = 0;
  disableAds = false;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private payPal: PayPal,
    public userP: UserProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MarketPage');
  }

  pay() {
    this.payPal.init({
      PayPalEnvironmentProduction: Settings.payPalEnvironmentProduction,
      PayPalEnvironmentSandbox: Settings.payPalEnvironmentSandbox
    }).then(() => {
      // Environments: PayPalEnvironmentNoNetwork, PayPalEnvironmentSandbox, PayPalEnvironmentProduction
      this.payPal.prepareToRender('PayPalEnvironmentSandbox', new PayPalConfiguration({
        // Only needed if you get an "Internal Service Error" after PayPal login!
        //payPalShippingAddressOption: 2 // PayPalShippingAddressOptionPayPal
      })).then(() => {
        let price = this.claculatePrices();
        let payment = new PayPalPayment(price.toString(), 'USD', 'Description', 'sale');
        this.payPal.renderSinglePaymentUI(payment).then(() => {
          // Successfully paid

          // Example sandbox response
          //
          // {
          //   "client": {
          //     "environment": "sandbox",
          //     "product_name": "PayPal iOS SDK",
          //     "paypal_sdk_version": "2.16.0",
          //     "platform": "iOS"
          //   },
          //   "response_type": "payment",
          //   "response": {
          //     "id": "PAY-1AB23456CD789012EF34GHIJ",
          //     "state": "approved",
          //     "create_time": "2016-10-03T13:33:33Z",
          //     "intent": "sale"
          //   }
          // }
        }, () => {
          // Error or render dialog closed without being successful
        });
      }, () => {
        // Error in configuration
      });
    }, () => {
      // Error in initialization, maybe PayPal isn't supported or something else
    });
  }



  claculatePrices() {
    let res = 0;
    res += this.stormNum * Settings.stormPrice;
    res += this.jokerNum * Settings.jokerPrice;
    res += this.stormNum * Settings.hammarPrice;
    if (this.disableAds) {
      this.userP.getUser().then(user => {
        if (typeof user.noAds != 'undefined' && !user.noAds) {
          res += Settings.noAdsPrice;
        }
      })
    }
    return res;
  }
}
