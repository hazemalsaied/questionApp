import { Slides, NavController } from 'ionic-angular';
import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'main-slider',
  templateUrl: 'main-slider.html'
})
export class MainSliderComponent {
  @ViewChild(Slides) slides: Slides;

  playQuizImg = "https://media.giphy.com/media/3oFzmhVbv3iq7WH38s/giphy.gif";//"./assets/playQuiz.png";
  playOnlineQuizImg ="https://media.giphy.com/media/xUOwFQT8GzSmMvP78s/giphy.gif";// "./assets/playOnlineQuiz.png";
  infiniteQuizImg = "https://media.giphy.com/media/l4pT6KQsOr3H8y5LW/giphy.gif";//"./assets/infiniteQuiz.jpg";
  speedQuizImg = "https://media.giphy.com/media/3ohs4eCkIDLOrQUrio/giphy.gif";// "./assets/speedQuiz.png";


  constructor(public navCtrl: NavController) {
  }

  openPage(p) {
    this.navCtrl.setRoot(p);
  }

}
