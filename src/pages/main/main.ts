import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database-deprecated';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';
import { storage } from 'firebase';
import { User } from '../../shared/models/user';

@IonicPage()
@Component({
  selector: 'page-main',
  templateUrl: 'main.html',
})
export class MainPage {

  // @ViewChild(Slides) slidess: Slides;

  user: User = {
    email: '',
    password: '',
    jokerNum: 3,
    hammerNum: 3,
    pointNum: 150,
    name: '',
    role: '',
    imageUrl: '',
    sex: 'male'
  };

  imageUrl = "./assets/profile.png";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afa: AngularFireAuth,
    public afd: AngularFireDatabase
  ) {

    if (firebase.auth().currentUser) {
      let uid = firebase.auth().currentUser.uid;
      this.afd.object('/userProfile/' + uid).subscribe(snapshot => {
        this.user = snapshot;
        console.log(this.user)
      });
    }
  }
  openPage(page){
    this.navCtrl.setRoot(page);
  }

}
