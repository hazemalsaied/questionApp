import { Settings } from './../../shared/settings/settings';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import { User } from 'firebase';

@Injectable()
export class AuthData {

  authState: any = null;
 
  constructor(public afAuth: AngularFireAuth) {
    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth;
    });
  } 

  loginUser(newEmail: string, newPassword: string) {
    return this.afAuth.auth.signInWithEmailAndPassword(newEmail, newPassword);
  }

  resetPassword(email: string) {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }

  logoutUser() {
    this.afAuth.auth.signOut();
    console.log('log out');
    console.log(this.afAuth.authState);
  }


  isLogged() {
    this.afAuth.authState.subscribe(user => {
      if (user && user.email){
        return true;
      }else{
        return false;    
      }
    });
  }

  registerUser( email: string, password: string){//, language: string){
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password).then((newUser) => {
      firebase.database().ref('/userProfile').child(newUser.uid).set({
        email: email,
        name : email.split('@')[0],
        language: 'arabic',
        questionNum : 0,
        jokerNum : Settings.initJokerNum, 
        hammarNum : Settings.initHammarNum,
        stormNum : Settings.initStormNum,
        pointNum : Settings.initPointNum,
        role : 'user',
        unlimitedSavedQuestionNum: false

      });
    });
  }
  // Returns true if user is logged in
  get authenticated(): boolean {
    return this.afAuth.authState !== null;
  }

  // Returns current user data
  getCurrentUser(): Observable<User> {
    return this.authenticated ? this.afAuth.authState : null;
  }

  // Returns
  get currentUserObservable(){
    return this.afAuth.authState;
  }

  // Returns current user UID
  // get currentUserId() {
  //   return this.authenticated ? this.afAuth.authState.uid : '';
  // }

  // Anonymous User
  // get currentUserAnonymous() {
  //   return this.authenticated ? this.afAuth.authState.isAnonymous : false;
  // }

  // Returns current user display name or Guest
  // get currentUserDisplayName() {
  //   if (!this.authState) { return 'Guest'; }
  //   else if (this.currentUserAnonymous) { return 'Anonymous'; }
  //   else { return this.authState['displayName'] || 'User without a Name'; }
  // }
}

