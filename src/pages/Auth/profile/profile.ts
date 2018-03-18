import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database-deprecated';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { User } from '../../../shared/models/user';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';
import { Camera } from '@ionic-native/camera';
import { CameraOptions } from '@ionic-native/camera';
import { storage } from 'firebase';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  user$: FirebaseObjectObservable<User[]>;
  user: any = {
    key$: '',
    email: '',
    password: '',
    jokerNum: '',
    hammerNum: 3,
    pointNum: 150,
    name: '',
    role: '',
    imageUrl: '',
    sex: 'male'
  };

  userLanguage: string = 'arabic';
  country: string = '';
  countries = [
    'سوريا', 'لبنان', 'فلسطين', 'العراق', 'الأردن',
    'مصر', 'السودان', 'ليبيا', 'تونس', 'الحزائر',
    'المغرب', 'السعودية', 'الكويت', 'الإمارات', 'عمان',
    'قطر', 'البحرين', 'اليمن', 'كردستان'
  ];

  imageUrl = "./assets/profile.png";

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public afa: AngularFireAuth,
    public loadingCtrl: LoadingController,
    private camera: Camera,
    private toastCtrl: ToastController,
    public afd: AngularFireDatabase) {

    if (firebase.auth().currentUser) {
      let uid = firebase.auth().currentUser.uid;
      this.user$ = this.afd.object('/userProfile/' + uid);
      this.user$.subscribe(snapshot => {
        this.user = snapshot;
      });
    }
  }

  ionViewDidLoad() {
  }

  async uploadImage() {
    if (this.user.imageUrl) {
      this.removeImage();
    } else {
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
            this.imageUrl = url;
          });
        });

      } catch (error) {
        console.log(error);
      }
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
    console.log(this.user.$key);
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

  play() {
    this.navCtrl.setRoot('PlayPage');
  }

  playOnline() {
    this.navCtrl.push('PlayOnlinePage');
  }
}
