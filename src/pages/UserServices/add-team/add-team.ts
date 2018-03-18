import { ImageProvider } from './../../../providers/image/image';
import { UserProvider } from './../../../providers/user/user';
import { User } from './../../../shared/models/user';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { Component } from '@angular/core';
import { IonicPage, ToastController } from 'ionic-angular';
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

  team: any = {
    name: '',
    admin: '',
    slogan: '',
    points: 0,
    users: [],
    imageUrl: ''
  };
  imageUrl = "./assets/team.jpg";

  constructor(
    private camera: Camera,
    private toastCtrl: ToastController,
    public afd: AngularFireDatabase,
    public afa: AngularFireAuth,
    public userP: UserProvider,
    public imageP: ImageProvider
  ) {

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

  save() {
    if (this.validate) {
      let currentUserId = this.afa.auth.currentUser.uid;
      if (this.team.$key == null) {
        console.log(this.team);
        this.team.points = 0;
        this.team.admin = currentUserId;
        this.team.users.push({ key: currentUserId, isAdmin: true })
        this.afd.list('/teams/').push(this.team).
          then(_ => {
            this.userP.getUser().then(user => {
              this.userP.addTeam(user, _.getKey())
            });
            this.showToast('bottom', 'تمت إضافة الفريق بنجاح!');
          });
      } else {
        if (this.team.admin === currentUserId) {
          this.afd.list('/teams/').update(this.team.$key, this.team).
            then(_ => {
              this.showToast('bottom', 'تم تحرير الفريق بنجاح!');
            });
        }
        else {
          this.showToast('bottom', 'لا تمتلك الصلاحيات الكاف لتحرير الفريق!');
        }

      }

    } else {
      this.showToast('bottom', 'الرجاء اختيار اسم للفريق!')
    }
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
