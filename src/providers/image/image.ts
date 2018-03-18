import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { storage } from 'firebase';
import { Camera } from '@ionic-native/camera';
import { CameraOptions } from '@ionic-native/camera';


@Injectable()
export class ImageProvider {

  constructor(private camera: Camera, ) {

  }
  removeImage(imagePath, imageUrl) {
    return new Promise((resolve, reject) => {
      const imageRef = storage().ref(imagePath + '/' + imageUrl);
      imageRef.delete().then(_ => {
        console.log('Image deleted!');
        resolve();
      });
    });
  }


  // async uploadImage(imagePath): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     const cameraOptions: CameraOptions = {
  //       sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
  //       mediaType: this.camera.MediaType.PICTURE,
  //       destinationType: this.camera.DestinationType.DATA_URL,
  //       quality: 50,
  //       targetWidth: 600,
  //       targetHeight: 600,
  //       encodingType: this.camera.EncodingType.JPEG
  //       // ,correctOrientation: true
  //     };
  //     const result = await this.camera.getPicture(cameraOptions);
  //     let imageName = new Date().toISOString() + '.jpg';
  //     const pictures = storage().ref(imagePath + '/' + imageName);
  //     const base64Image = result; //'data:image/jpeg;base64,{result}';// + imageData;
  //     pictures.putString(base64Image, 'base64').then((_) => {
  //       pictures.getDownloadURL().then((url) => {
  //         resolve([imageName, url]);
  //       });
  //     });

  //   });
  // }
}



