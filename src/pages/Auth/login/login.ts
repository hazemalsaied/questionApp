import { UserProvider } from './../../../providers/user/user';
import { Settings } from './../../../shared/settings/settings';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthData } from '../../../providers/auth-data/auth-data';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';
import { Facebook } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';


@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  public loginForm: any;
  public backgroundImage: any = "./assets/splash.png";
  // public imgLogo: any = "./assets/splash.png";

  constructor(public navCtrl: NavController,
    public authData: AuthData,
    public fb: FormBuilder,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public afAuth: AngularFireAuth,
    public facebook: Facebook,
    private googlePlus: GooglePlus,
    public toastCtrl: ToastController,
    public afd: AngularFireDatabase,
    public userP: UserProvider
  ) {

    let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    this.loginForm = fb.group({
      email: ['', Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEXP)])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
    });
  }

  login() {
    if (!this.loginForm.valid) {
      //this.presentAlert('Username password can not be blank')
      console.log("error");
    } else {
      let loadingPopup = this.loadingCtrl.create({
        spinner: 'crescent',
        content: '',
        enableBackdropDismiss:true
      });
      loadingPopup.present();

      this.authData.loginUser(this.loginForm.value.email, this.loginForm.value.password)
        .then(authData => {
          console.log("Auth pass");
          loadingPopup.dismiss();
          this.userP.removeQuiz();
          this.navCtrl.setRoot('MainPage');
        }, error => {
          if (false) { // error.code === 'auth/network-request-failed') {
            // console.log('hazz');
            // loadingPopup.dismiss();
            // this.navCtrl.setRoot('HomePage');
            // console.log(this.authData.authState);
            // this.authData.loginUser(this.loginForm.value.email, this.loginForm.value.password);
            // .then(authData => {
            //   console.log("Auth pass");
            //   loadingPopup.dismiss();
            //   this.navCtrl.setRoot('HomePage');
            // });
            // this.navCtrl.setRoot('HomePage');
          } else {
            console.log(error);
            var errorMessage: string = error.message;
            loadingPopup.dismiss().then(() => {
              this.presentAlert(errorMessage)
            });
          }
        });
    }
  }

  facebookLogin(): Promise<any> {
    if (Settings.onDevice) {
      return this.facebook.login(['email'])
        .then(response => {
          const facebookCredential = firebase.auth.FacebookAuthProvider
            .credential(response.authResponse.accessToken);

          firebase.auth().signInWithCredential(facebookCredential)
            .then(success => {
              this.afd.object('userProfile/' + success.uid).subscribe(user => {
                if (user != null && user.email === success.email) {
                  this.userP.removeQuiz();
                  this.navCtrl.setRoot('MainPage');
                } else {
                  firebase.database().ref('/userProfile').child(success.uid).set({
                    email: success.email,
                    name: success.displayName,
                    language: 'arabic',
                    // imageLink: success.photoURL,
                    questionNum: 0,
                    jokerNum: Settings.initJokerNum,
                    hammarNum: Settings.initHammarNum,
                    stormNum: Settings.initStormNum,
                    pointNum: Settings.initPointNum,
                    role: 'user',
                    unlimitedSavedQuestionNum: false
                  }).then(user => {
                    this.navCtrl.setRoot('MainPage');
                  });
                }
              });
              // if (success.lastLoginAt === success.createdAt) {
              //   firebase.database().ref('/userProfile').child(success.uid).set({
              //     email: success.email,
              //     name: success.displayName,
              //     language: 'arabic',
              //     imageLink: success.photoURL,
              //     questionNum: 0,
              //     jokerNum: Settings.initJokerNum,
              //     hammarNum: Settings.initHammarNum,
              //     stormNum: Settings.initStormNum,
              //     pointNum: Settings.initPointNum,
              //     role: 'user',
              //     unlimitedSavedQuestionNum: false
              //   });
              // } else{
              //   this.userP.removeQuiz();
              // }
              console.log("Firebase success: " + JSON.stringify(success));
            });
        }).catch((error) => {
          this.showToast('تعذر الاتصال عن طريق فيسبوك!');
          console.log(error)
        });
    }
    else {
      return new Promise((resolve, reject) => { resolve(); });
    }
  }
  googleLogin(): void {
    if (Settings.onDevice) {
      this.googlePlus.login({
        'webClientId': '235551466519-6ra9kjh1k1rgvdg8sius8nct0ke78ok9.apps.googleusercontent.com',
        // 'webClientId': '235551466519-olq2vn6ol8c5mp92j6k854qo71848njl.apps.googleusercontent.com',
        
        'offline': true
      }).then(res => {
        const googleCredential = firebase.auth.GoogleAuthProvider
          .credential(res.idToken);

        firebase.auth().signInWithCredential(googleCredential)
          .then(response => {
            this.showToast(response);
            this.userP.removeQuiz();
            console.log("Firebase success: " + JSON.stringify(response));
            this.showToast(JSON.stringify(response));
          });
      }, err => {
        console.error("Error: ", err);
        this.showToast(err);
        this.showToast('تعذر الاتصال عن طريق جوجل!')
      });
    } else {
      new Promise((resolve, reject) => { resolve(); });
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

  forgot() {
    this.navCtrl.push('ForgotPage');
  }

  createAccount() {
    this.navCtrl.push('RegisterPage');
  }
  presentAlert(title) {
    let alert = this.alertCtrl.create({
      title: title,
      buttons: ['موافق']
    });
    alert.present();
  }

}
