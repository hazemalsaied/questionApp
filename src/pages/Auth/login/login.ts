import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, AlertController } from 'ionic-angular';
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
  public backgroundImage: any = "./assets/bg1.jpg";
  public imgLogo: any = "./assets/medium_150.70391061453px_1202562_easyicon.net.png";

  constructor(public navCtrl: NavController,
    public authData: AuthData,
    public fb: FormBuilder,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public afAuth: AngularFireAuth,
    public facebook: Facebook,
    private googlePlus: GooglePlus) {


    this.afAuth.authState.subscribe((user) => {
      if (user && user.email) {
        this.navCtrl.setRoot('HomePage');
      }
    });
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
        content: ''
      });
      loadingPopup.present();

      this.authData.loginUser(this.loginForm.value.email, this.loginForm.value.password)
        .then(authData => {
          console.log("Auth pass");
          loadingPopup.dismiss();
          this.navCtrl.setRoot('HomePage');
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
    return this.facebook.login(['email'])
      .then(response => {
        const facebookCredential = firebase.auth.FacebookAuthProvider
          .credential(response.authResponse.accessToken);

        firebase.auth().signInWithCredential(facebookCredential)
          .then(success => {
            console.log("Firebase success: " + JSON.stringify(success));
          });

      }).catch((error) => { console.log(error) });
  }

  googleLogin(): void {
    this.googlePlus.login({
      'webClientId': '235551466519-6ra9kjh1k1rgvdg8sius8nct0ke78ok9.apps.googleusercontent.com',
      'offline': true
    }).then(res => {
      const googleCredential = firebase.auth.GoogleAuthProvider
        .credential(res.idToken);

      firebase.auth().signInWithCredential(googleCredential)
        .then(response => {
          console.log("Firebase success: " + JSON.stringify(response));
        });
    }, err => {
      console.error("Error: ", err)
    });
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
