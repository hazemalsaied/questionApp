import { ProfilePage } from './../../Auth/profile/profile';
import { MarketPage } from './../../UserServices/market/market';
import { MainPage } from './../main/main';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }
  tab1Root = MarketPage;
  tab2Root = MainPage;
  tab3Root = ProfilePage;
  ionViewDidLoad() {
    console.log('ionViewDidLoad TabsPage');
  }

}
