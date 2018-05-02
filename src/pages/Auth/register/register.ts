import { LoginPage } from './../login/login';
import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, AlertController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthData } from '../../../providers/auth-data/auth-data';



@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html'
})
export class RegisterPage {
  public registerForm;
  public backgroundImage: any = "./assets/splash.png";  

  constructor(public nav: NavController, public authData: AuthData, public fb: FormBuilder, public loadingCtrl: LoadingController, public alertCtrl: AlertController) {

    let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

    this.registerForm = fb.group({
      email: ['', Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEXP)])],
      // profileName: ['', Validators.compose([Validators.minLength(2), Validators.required])],
      // language: ['', Validators.compose([Validators.required]) ],
      // phone: ['', Validators.compose([Validators.minLength(6), Validators.required])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])],
    });
    // this.registerForm.controls['language'].setValue('arabic'); 
  }

  registerUser() {
    if (!this.registerForm.valid) {
      console.log(this.registerForm.value);
      this.presentAlert("الرجاء ادخال البيانات");
    } else {

      let loadingPopup = this.loadingCtrl.create({
        spinner: 'crescent',
        content: 'جاري الإنشاء..',
        enableBackdropDismiss:true
      });
      loadingPopup.present();

      this.authData.registerUser(
        // this.registerForm.value.profileName,
        this.registerForm.value.email,
        this.registerForm.value.password
        // ,this.registerForm.value.language
      )
        // ,this.registerForm.value.phone
        .then(() => {
          loadingPopup.dismiss();
          this.nav.setRoot('MainPage');
        }, (error) => {
          var errorMessage: string = error.message; 
          loadingPopup.dismiss();
          console.log(errorMessage);
          this.presentAlert('لم نتمكن من إنشاء الحساب. الرجاء المحاولة لاحقاً');
        });
    }
  }
  presentAlert(title) {
    let alert = this.alertCtrl.create({
      title: title,
      buttons: ['موافق']
    });
    alert.present();
  }
  openPage(){
    this.nav.setRoot(LoginPage); 
  }
}
