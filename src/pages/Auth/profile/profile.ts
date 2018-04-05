import { TeamProvider } from './../../../providers/team/team';
import { Team } from './../../../shared/models/team';
import { Settings } from './../../../shared/settings/settings';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database-deprecated';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { User } from '../../../shared/models/user';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';
import { Camera } from '@ionic-native/camera';
import { CameraOptions } from '@ionic-native/camera';
import { storage } from 'firebase';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { UserProvider } from '../../../providers/user/user';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  user: User = Settings.emptyUser;
  userLanguage: string = 'arabic';
  country: string = 'مصر';
  countries = [
    'سوريا', 'لبنان', 'فلسطين', 'العراق', 'الأردن',
    'مصر', 'السودان', 'ليبيا', 'تونس', 'الحزائر',
    'المغرب', 'السعودية', 'الكويت', 'الإمارات', 'عمان',
    'قطر', 'البحرين', 'اليمن', 'كردستان', 'تركيا',
    'عمان', 'جيبوتي', 'موريتانيا', 'أستراليا', 'نيوزيلندا', 'الهند', 'الصين', 'اليابان', 'اندونيسيا', 'ماليزيا', 'سنغافورة', 'كازاخستان', 'اوزبكستان', 'أثيوبيا', 'أذربيجان', 'الأرجنتين', 'الصومال', 'أرمينيا', 'أريتريا', 'إسبانيا', 'إستونيا', 'أفريقيا الوسطى', 'أفغانستان',
    'الاكوادور', 'ألبانيا', 'ألمانيا', 'أنتيغوا و باربودا', 'أندورا', 'أنغولا', 'الاوروغواي', 'أوغندا', 'أوكرانيا', 'إيران', 'إيرلندا', 'إيطاليا', 'بابوا غينيا الجديدة', 'باراغواي', 'باربادوس', 'باكستان', 'بالاو', 'البرازيل', 'البرتغال', 'بروناي', 'بلجيكا', 'بلغاريا', 'بليز', 'بنغلاديش', 'بنما', 'بنين', 'باهاماس', 'بوتان', 'بوتسوانا', 'بوركينا فاسو',
    'بوروندي', 'البوسنة و الهرسك', 'بولندا', 'بوليفا', 'البيرو', 'تايلاند', 'تايوان', 'تركمانستان', 'تركيا', 'ترينيداد و توباغو', 'تشاد', 'جمهورية التشيك', 'تشيلي', 'تنزانيا', 'توغو', 'توفالو', 'تونغا', 'تيمور الشرقية', 'جامايكا', 'الجبل الأسود', 'جنوب أفريقيا', 'جورجيا', 'الدانمارك', 'دومينيكا',
    'جمهورية الدومينيكان', 'الرأس الأخضر', 'رواندا', 'روسيا', 'روسيا البيضاء', 'رومانيا', 'زامبيا', 'زيمبابوي', 'ساحل العاج', 'ساموا', 'سان مارينو', 'سانت فينسنت و الغرينادين', 'سانت كيتس و نيفيس', 'سانت لوسيا', 'ساو تومي و برينسيب', 'سريلانكا', 'السلفادور', 'سلوفاكيا', 'جزر سليمان',
    'السنغال', 'سوازيلاند', 'سورينام', 'السويد', 'سويسرا', 'سيراليون', 'سيشل', 'صربيا', 'طاجكستان', 'الغابون', 'غامبيا', 'غانا', 'غرينادا', 'غواتيمالا', 'غينيا', 'غينيا الإستوائية', 'غينيا بيساو', 'فانواتو', 'فرنسا', 'الفلبين', 'فنزويلا', 'فنلندا', 'فيتنام', 'فيجي', 'قبرص', 'قيرغيزستان', 'جزر القمر',
    'الكاميرون', 'كرواتيا', 'كمبوديا', 'كندا', 'كوبا', 'كوريا الشمالية', 'كوريا الجنوبية', 'كوستاريكا', 'كوسوفو', 'كولومبيا', 'الكونغو', 'الكونغو الديمقراطية', 'كيريباتي', 'كينيا', 'لاتفيا', 'لاوس', 'لوكسمبورغ', 'ليبيريا', 'ليتوانيا', 'ليشتنشتاين', 'ليسوتو', 'جزر مارشال', 'المالديف', 'مالطا', 'مالي', 'مدغشقر', 'المجر', 'مقدونيا', 'المكسيك', 'مالاوي',
    'المملكة المتحدة', 'منغوليا', 'موريشيوس', 'موزامبيق', 'مولدافيا', 'موناكو', 'ميكرونيزيا', 'ناميبيا', 'ناورو', 'النرويج', 'النمسا', 'نيبال', 'النيجر', 'نيجيريا', 'نيكاراغوا', 'هاييتي', 'الهندوراس', 'هولندا', 'اليونان', 'الولايات المتحدة', 'ميانمار', 'مولدافيا', 'لاتفي'
  ];

  imageUrl = "./assets/profile.png";

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private camera: Camera,
    private toastCtrl: ToastController,
    public afd: AngularFireDatabase,
    public alertCtrl: AlertController,
    public userP: UserProvider) {
      
    this.userP.getUser().then(user => {
      this.user = user;
    });

  }


  async uploadImage() {
    if (this.user.imageUrl) {
      this.removeImage();
    }
    try {
      const cameraOptions: CameraOptions = {
        sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
        mediaType: this.camera.MediaType.PICTURE,
        destinationType: this.camera.DestinationType.DATA_URL,
        quality: 50,
        targetWidth: 600,
        targetHeight: 600,
        encodingType: this.camera.EncodingType.JPEG
        // ,correctOrientation: true
      };
      const result = await this.camera.getPicture(cameraOptions);
      let imageName = new Date().toISOString() + '.jpg';
      const pictures = storage().ref('userProfile/' + imageName);
      const base64Image = result; //'data:image/jpeg;base64,{result}';// + imageData;
      pictures.putString(base64Image, 'base64').then((_) => {
        this.user.imageUrl = imageName;
        pictures.getDownloadURL().then((url) => {
          this.user.imageLink = url;
        });
      });

    } catch (error) {
      console.log(error);
    }
  }

  removeImage() {
    const imageRef = storage().ref('userProfile/' + this.user.imageUrl);
    imageRef.delete().then(_ => {
      console.log('Image deleted!');
      this.user.imageUrl = '';
    });
  }

  saveUser() {
    this.user.language = 'arabic';
    this.afd.list('/userProfile/').update(this.user.$key, this.user).
      then(_ => { console.log('User edited'); });
    this.showToast('bottom', 'تم تحرير الحساب بنجاح!');
  }

  showToast(position: string, message: string) {
    const toast = this.toastCtrl.create({
      message: message,
      position: position,
      duration: 2000
    });
    toast.onDidDismiss(this.dismissHandler);
    toast.present();
  }

  private dismissHandler() {
  }
}
