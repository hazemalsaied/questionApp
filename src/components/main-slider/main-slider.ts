import { Slides, NavController } from 'ionic-angular';
import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'main-slider',
  templateUrl: 'main-slider.html'
})
export class MainSliderComponent {
  @ViewChild(Slides) slides: Slides;

  playQuizImg = "./assets/playQuiz.png";
  playOnlineQuizImg = "./assets/playOnlineQuiz.png";
  infiniteQuizImg = "./assets/infiniteQuiz.jpg";
  speedQuizImg = "./assets/speedQuiz.png";


  constructor(public navCtrl: NavController) {
  }

  openPage(p) {
    this.navCtrl.setRoot(p);
  }

}
