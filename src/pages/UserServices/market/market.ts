import { UserProvider } from './../../../providers/user/user';
// import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
// import { User } from './../../../shared/models/user';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController, LoadingController } from 'ionic-angular';
import { PayPal, PayPalPayment, PayPalConfiguration } from '@ionic-native/paypal';
import { Settings } from '../../../shared/settings/settings';

@IonicPage()
@Component({
  selector: 'page-market',
  templateUrl: 'market.html',
})
export class MarketPage {

  // stormNum = 5;
  // jokerNum = 5;
  // hammarNum = 5;
  noAdsToggleState = false;
  noAdsDisable = false;


  stormBtnTxt = Settings.addToPanelTxt;
  jokerBtnTxt = Settings.addToPanelTxt;
  hammarBtnTxt = Settings.addToPanelTxt;
  questionPackageBtnTxt = Settings.addToPanelTxt;

  noAdsPrice = Settings.noAdsPrice;
  total = 0;

  useQuestionPackagePrice = false;
  questionPackagePrice = 0;
  questionPackage = [
    { number: 0, price: 0 },
    { number: 100, price: 1 },
    { number: 300, price: 2 },
    { number: 1000, price: 3 },
    { number: 2500, price: 5 },
    { number: 'مفتوح', price: 10 }
  ];

  jokerPrice = 0;
  addJokers = false;
  joker = [
    { number: 0, price: 0 },
    { number: 15, price: 1 },
    { number: 100, price: 5 },
    { number: 250, price: 10 },
    { number: 1000, price: 25 }
  ];
  stormPrice = 0;
  addStorms = false;
  storm = [
    { number: 0, price: 0 },
    { number: 20, price: 1 },
    { number: 150, price: 5 },
    { number: 400, price: 10 },
    { number: 1200, price: 25 }
  ];
  hammarPrice = 0;
  addHammars = false;
  hammar = [
    { number: 0, price: 0 },
    { number: 20, price: 1 },
    { number: 150, price: 5 },
    { number: 400, price: 10 },
    { number: 1200, price: 25 }
  ];



  // updatePrices() {
  //   this.stormPrice = this.stormNum * Settings.stormPrice;
  //   this.hammarPrice = this.hammarNum * Settings.hammarPrice;
  //   this.jokerPrice = this.jokerNum * Settings.jokerPrice;
  // }
  user = Settings.emptyUser;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public afd: AngularFireDatabase,
    private payPal: PayPal,
    public userP: UserProvider,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController) {
    // this.updatePrices();
    this.claculatePrices();
    this.userP.getUser().then(user => {
      this.user = user;
      if (typeof user.noAds != 'undefined' && user.noAds) {
        this.noAdsDisable = true;
      }
    });
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
        // let price = this.claculatePrices();
        // let payment = new PayPalPayment(price.toString(), 'USD', 'Description', 'sale');
        // this.payPal.renderSinglePaymentUI(payment).then(() => {



        //   // Successfully paid

        //   // Example sandbox response
        //   //
        //   // {
        //   //   "client": {
        //   //     "environment": "sandbox",
        //   //     "product_name": "PayPal iOS SDK",
        //   //     "paypal_sdk_version": "2.16.0",
        //   //     "platform": "iOS"
        //   //   },
        //   //   "response_type": "payment",
        //   //   "response": {
        //   //     "id": "PAY-1AB23456CD789012EF34GHIJ",
        //   //     "state": "approved",
        //   //     "create_time": "2016-10-03T13:33:33Z",
        //   //     "intent": "sale"
        //   //   }
        //   // }
        // }, () => {
        //   // Error or render dialog closed without being successful
        // });
      }, () => {
        // Error in configuration
      });
    }, () => {
      // Error in initialization, maybe PayPal isn't supported or something else
    });
  }

  addToPanel(type) {
    if (type == 'storm') {
      this.addStorms = !this.addStorms;
      if (this.addStorms) {
        this.stormBtnTxt = Settings.removeFromPanelTxt
      } else {
        this.stormBtnTxt = Settings.addToPanelTxt
      }
    } else if (type === 'hammar') {
      this.addHammars = !this.addHammars;
      if (this.addHammars) {
        this.hammarBtnTxt = Settings.removeFromPanelTxt;
      } else {
        this.hammarBtnTxt = Settings.addToPanelTxt;
      }
    } else if (type === 'joker') {
      this.addJokers = !this.addJokers;
      if (this.addJokers) {
        this.jokerBtnTxt = Settings.removeFromPanelTxt;
      } else {
        this.jokerBtnTxt = Settings.addToPanelTxt;
      }
    } else if (type === 'questionPackage') {
      this.useQuestionPackagePrice = !this.useQuestionPackagePrice;
      if (this.useQuestionPackagePrice) {
        this.questionPackageBtnTxt = Settings.removeFromPanelTxt;
      } else {
        this.questionPackageBtnTxt = Settings.addToPanelTxt;
      }
    }

    // this.updatePrices();
    this.claculatePrices();
  }

  // onChangeTime(value, type) {
  //   if (type == 'joker') {
  //     this.jokerNum = value;
  //   } else if (type === 'storm') {
  //     this.stormNum = value;
  //   } else if (type === 'hammar') {
  //     this.hammarNum = value;
  //   }
  //   else if (type === 'noAds') {
  //     // this.disableAds = !this.disableAds;
  //   }
  //   // this.updatePrices();
  //   this.claculatePrices();

  // }
  stormGoldPrice = 1000;
  jockerGoldPrice = 1000;
  hammarGoldPrice = 1000;

  buyByGold(type) {

    let alert = this.alertCtrl.create({
      title: 'تأكيد الشراء بالدنانير؟',
      buttons: [
        {
          text: 'إلغاء',
          handler: data => { }
        }, {
          text: 'شراء',
          handler: data => {
            let loadingPopup = this.loadingCtrl.create({
              spinner: 'crescent',
              content: ''
            });
            loadingPopup.present();
            this.buyG(type);
            loadingPopup.dismiss();
          }
        }
      ]
    });
    alert.present();



  }

  buyG(type) {
    let succeded = false;
    if (type == 'storm') {
      if (this.user.goldenPoints >= this.stormGoldPrice) {
        this.user.goldenPoints -= this.stormGoldPrice;
        this.user.stormNum += 1;
        succeded = true;
      } else {
        this.showToast('ليس لديك رصيد كاف للشراء')
      }
    } else if (type == 'hammar') {
      if (this.user.goldenPoints >= this.hammarGoldPrice) {
        this.user.goldenPoints -= this.hammarGoldPrice;
        this.user.hammarNum += 1;
        succeded = true;
      } else {
        this.showToast('ليس لديك رصيد كاف للشراء')
      }
    } else if (type == 'jocker') {
      if (this.user.goldenPoints >= this.jockerGoldPrice) {
        this.user.goldenPoints -= this.jockerGoldPrice;
        this.user.jokerNum += 1;
        succeded = true;
      } else {
        this.showToast('ليس لديك رصيد كاف للشراء')
      }
    }
    if (succeded) {
      this.afd.list('userProfile').update(this.user.$key, this.user).then(_ => {
        this.showToast('تمت عملية الشراء بنجاح')
      });
    }
  }

  showToast(message: string) {
    const toast = this.toastCtrl.create({
      message: message,
      position: 'bottom',
      duration: 2000
    });
    toast.onDidDismiss(this.dismissHandler);
    toast.present();
  }
  dismissHandler() {

  }
  claculatePrices() {
    if (this.noAdsToggleState) {
      this.noAdsPrice = Settings.noAdsPrice;
    } else {
      this.noAdsPrice = 0;
    }
    let res = 0;
    if (this.addStorms) {
      res += this.stormPrice;// this.stormNum * Settings.stormPrice;
    }
    if (this.addHammars) {
      res += this.hammarPrice;// this.hammarNum * Settings.hammarPrice;
    }
    if (this.addJokers) {
      res += this.jokerPrice; //this.jokerNum * Settings.jokerPrice;
    }
    if (this.noAdsToggleState) {
      res += Settings.noAdsPrice;
    }
    if (this.useQuestionPackagePrice) {
      res += this.questionPackagePrice;
    }
    this.total = res;
  }
}
