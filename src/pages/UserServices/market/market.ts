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

  noAdsToggleState = false;
  noAdsDisable = false;


  noAdsClicked = false;
  noAdsPrice = Settings.noAdsPrice;
  total = 0;

  useQuestionPackagePrice = false;
  questionPackagePrice = 0;

  products = [
    { number: 1, price: 1, alias: 'noads', title: 'إزالة الإعلانات', description: 'إخفاء كل الإعلانات' },
    { number: 15, price: 1, alias: 'jocker', title: 'الجوكر', description: 'لاعتبار إجابتك صحيحة' },
    { number: 100, price: 5, alias: 'jocker', title: 'الجوكر', description: 'لاعتبار إجابتك صحيحة' },
    { number: 250, price: 10, alias: 'jocker', title: 'الجوكر', description: 'لاعتبار إجابتك صحيحة' },
    { number: 1000, price: 25, alias: 'jocker', title: 'الجوكر', description: 'لاعتبار إجابتك صحيحة' },
    { number: 20, price: 1, alias: 'storm', title: 'العاصفة', description: 'لحذف جوابين' },
    { number: 150, price: 5, alias: 'storm', title: 'العاصفة', description: 'لحذف جوابين' },
    { number: 400, price: 10, alias: 'storm', title: 'العاصفة', description: 'لحذف جوابين' },
    { number: 1200, price: 25, alias: 'storm', title: 'العاصفة', description: 'لحذف جوابين' },
    { number: 20, price: 1, alias: 'hammar', title: 'المطرقة', description: 'لاستبدال السؤال' },
    { number: 150, price: 5, alias: 'hammar', title: 'المطرقة', description: 'لاستبدال السؤال' },
    { number: 400, price: 10, alias: 'hammar', title: 'المطرقة', description: 'لاستبدال السؤال' },
    { number: 1200, price: 25, alias: 'hammar', title: 'المطرقة', description: 'لاستبدال السؤال' },
    { number: 100, price: 1, alias: 'cloud', title: 'مساحة تخزين الأسئلة', description: '' },
    { number: 300, price: 2, alias: 'cloud', title: 'مساحة تخزين الأسئلة', description: '' },
    { number: 1000, price: 3, alias: 'cloud', title: 'مساحة تخزين الأسئلة', description: '' },
    { number: 2500, price: 5, alias: 'cloud', title: 'مساحة تخزين الأسئلة', description: '' },
    { number: 'مفتوح', price: 10, alias: 'cloud', title: 'مخزن الأسئلة', description: '' }
  ];

  user = Settings.emptyUser;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public afd: AngularFireDatabase,
    private payPal: PayPal,
    public userP: UserProvider,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController) {
    this.userP.getUser().then(user => {
      this.user = user;
      if (typeof user.noAds != 'undefined' && user.noAds) {
        this.noAdsDisable = true;
      }
    });
  }

  pay(price, type, numb) {
    if (Settings.onDevice) {
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
          let payment = new PayPalPayment(price.toString(), 'USD', 'وسائل مساعدة لتطبيق كويزي', 'sale');
          this.payPal.renderSinglePaymentUI(payment).then(() => {
            if (type === 'storm' || type === 'jocker' || type === 'hammar') {
              if (this.user[type + 'Num'] != null) {
                this.user[type + 'Num'] += numb;
              } else {
                this.user[type + 'Num'] = numb;
              }
            } else if (type === 'noads') {
              this.user.noAds = true;
            } else if (type === 'cloud') {
              if (numb === 'مفتوح') {
                this.user.questionNumber = 5000000;
              } else {
                this.user.questionNumber = numb;
              }
            }
            this.afd.list('userProfile').update(this.user.$key, this.user);
            console.log('Successfully paid');
            this.showToast('تمت عملية الشراء بنجاح');
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
            console.log('Error or render dialog closed without being successful');
            this.showToast('لم تنجح عملية الشراء');
            // Error or render dialog closed without being successful
          });
        }, () => {
          console.log('Error in configuration');
          this.showToast('هنالك خطأ في الإعدادات');
          // Error in configuration
        });
      }, () => {
        this.showToast('لم نتمكن من الاتصال بخدمة باي بال!');
        console.log('Error in initialization, maybe PayPal isnt supported or something else');
        // Error in initialization, maybe PayPal isn't supported or something else
      });
    }
  }

  stormGoldPrice = 1000;
  jockerGoldPrice = 2000;
  hammarGoldPrice = 1500;

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

}
