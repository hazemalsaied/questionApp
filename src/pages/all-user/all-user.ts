import { Settings } from './../../shared/settings/settings';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { User } from './../../shared/models/user';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-all-user',
  templateUrl: 'all-user.html',
})
export class AllUserPage {
  users: Array<User> = []
  roles = [{ arabic: 'مدير', alias: 'admin' }, { arabic: 'مستخدم', alias: 'user' }];


  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    public afd: AngularFireDatabase) {
    this.getUsers().then(users => {
      this.users = users;
    });
  }

  ionViewDidLoad() {
  }

  filterUsers(ev: any) {
    let query = ev.target.value;
    if (query && query.trim().length > 2) {
      this.afd.list('userProfile/', { query: { orderByChild: 'name', startAt: query } }).
        subscribe(users => {
          users.forEach(us => {
            if (us.imageUrl != null && us.imageUrl != '') {
              us.imagelink = Settings.profileImageBeg + us.imageUrl + Settings.profileImageEnd;
            } else {
              us.imageLink = "./assets/profile.png";
            }
          });
          console.log(users);
          this.users = users;
        });
    }
  }

  getUsers(): Promise<Array<User>> {
    return new Promise((resolve, reject) => {
      this.afd.list('userProfile', { query: { orderByKey: true, limitToLast: 10 } }).
        subscribe(users => {
          users.forEach(user => {
            if (user.imageUrl == null || user.imageUrl.trim() == '' || typeof user.imageUrl == 'undefined') {
              user.imageLink = Settings.userImage;
            } else {
              user.imageLink = Settings.imageBeg + user.imageUrl + Settings.imageEnd;
            }
          });
          resolve(users);
        });
    });
  }

  // edit(u) {
  //   this.navCtrl.push(EditUserPage, {
  //     user: u
  //   });
  // }
  save(u) { 
    this.afd.list('userProfile').update(u.$key, u).then(_=>{
      this.showToast('bottom', 'لقد تم حفظ المستخدم!');
      console.log('user updated');
    });
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

  dismissHandler(){

  }

}
