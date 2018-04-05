import { TeamProvider } from './../../../providers/team/team';
import { Settings } from './../../../shared/settings/settings';
import { ImageProvider } from './../../../providers/image/image';
import { UserProvider } from './../../../providers/user/user';
import { User } from './../../../shared/models/user';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { Component } from '@angular/core';
import { IonicPage, ToastController, NavController, NavParams } from 'ionic-angular';
import { Team, TeamUserAlias } from '../../../shared/models/team';
// import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';
import { Camera } from '@ionic-native/camera';
import { CameraOptions } from '@ionic-native/camera';
import { storage } from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';

@IonicPage()
@Component({
  selector: 'page-add-team',
  templateUrl: 'add-team.html',
})
export class AddTeamPage {

  team: any = Settings.emptyTeam; 
  imageUrl = "./assets/team.jpg";
  showCreatePanel = true;

  constructor(
    private camera: Camera,
    private toastCtrl: ToastController,
    public afd: AngularFireDatabase,
    public afa: AngularFireAuth,
    public userP: UserProvider,
    public imageP: ImageProvider,
    public teamP: TeamProvider,
    public navParams: NavParams
  ) {
    if (navParams.get('team')) {
      this.team = navParams.get('team');
      this.showCreatePanel = true;
      this.showUserPanel = true;
    }
  }

  save() {
    if (this.validate) {
      this.userP.getUser().then(user => {
        if (this.team.$key == null) {
          this.saveNewTeam(user);
        } else {
          this.editTeam(user);
        }
      });
    } else {
      this.showToast('bottom', 'الرجاء اختيار اسم للفريق!')
    }
  }

  saveNewTeam(user) {
    this.team.points = user.pointNum;
    this.team.admin = user.$key;
    this.team.users = [];
    this.team.users.push({ key: user.$key, isAdmin: true })
    this.afd.list('/teams/').push(this.team).
      then(teamRef => {
        this.afd.object('/teams/' + teamRef.getKey()).subscribe(team => {
          this.team = team;
          console.log(this.team);
          this.userP.getUser().then(user => {
            this.userP.addTeam(user, teamRef.getKey()).then(_ => {
              this.showToast('bottom', 'تمت إضافة الفريق بنجاح!');
              this.showCreatePanel = false;
              this.showUserPanel = true;
            });
          });
        });
      });
  }

  editTeam(user) {
    if (this.team.admin === user.$key) {
      this.afd.list('/teams/').update(this.team.$key, this.team).
        then(_ => {
          this.showToast('bottom', 'تم تحرير الفريق بنجاح!');
          this.showCreatePanel = false;
          this.showUserPanel = true;
        });
    }
    else {
      this.showToast('bottom', 'لا تمتلك الصلاحيات الكاف لتحرير الفريق!');
      this.showCreatePanel = false;
      this.showUserPanel = true;
    }
  }

  async uploadImage() {
    if (this.team.imageUrl) {
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
        const pictures = storage().ref('teams/' + imageName);
        const base64Image = result; //'data:image/jpeg;base64,{result}';// + imageData;
        pictures.putString(base64Image, 'base64').then((_) => {
          this.team.imageUrl = imageName;
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
    this.imageP.removeImage('team', this.team.imageUrl).then(_ => {
      this.team.imageUrl = '';
    });
  }

  users: Array<User> = [];
  showUserPanel: boolean = false;

  filterUsers(ev: any) {
    let query = ev.target.value;
    if (query && query.trim().length > 2) {
      this.afd.list('userProfile/', { query: { orderByChild: 'name', startAt: query } }).
        subscribe(users => {
          users.forEach(us => {
            if (us.imageUrl != null && us.imageUrl != '') {
              us.imagelink = Settings.imageBeg + us.imageUrl + Settings.imageEnd;
            } else {
              us.imageLink = "./assets/profile.png";
            }

          });
          console.log(users);
          this.showUserPanel = true;
          this.users = users;
        });
    }
  }

  inviteUser(u: User) {
    this.userP.getUser().then(currentUser => {
      if (u.$key != currentUser.$key &&
        this.teamP.userInTeam(this.team.$key, u.$key)) {
        if (u.invitations == null) {
          u.invitations = [{ key: this.team.$key }];
        } else {
          u.invitations.push({ key: this.team.$key });
        }
        u.imageLink = null;
        this.afd.list('userProfile/').update(u.$key, u).then(_ => {
          this.showToast('bottom', 'تم إرسال الدعوة!');
          console.log('invitation sent!');
        });
      } else {
        this.showToast('bottom', ' لا يمكنك إرسال دعوة لنفسك أو لأعضاء في فريقك!');
      }
    })
  }

  validate() {
    if (this.team.name.trim() !== '') {
      return true;
    }
    return false;
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
