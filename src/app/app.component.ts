import { InfiniteTestPage } from './../pages/infinite-test/infinite-test';
import { SpeedTestPage } from './../pages/speed-test/speed-test';
import { PlayPage } from './../pages/play/play';
import { Settings } from './../shared/settings/settings';
import { LoginPage } from './../pages/Auth/login/login';
import { HomePage } from './../pages/Dashboard/home/home';
import { AuthData } from './../providers/auth-data/auth-data';
import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';


import { AddQuestionPage } from '../pages/Dashboard/add-question/add-question';
import { CategoriesPage } from '../pages/Dashboard/categories/categories';

import { AddCategoryPage } from '../pages/Dashboard/add-category/add-category';
import { StatisticsPage } from '../pages/Dashboard/statistics/statistics';
import { AngularFireAuth } from 'angularfire2/auth';
import { ProfilePage } from '../pages/Auth/profile/profile';
import { ResultsPage } from '../pages/results/results';
import { PlayOnlinePage } from '../pages/play-online/play-online';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;

  pages: Array<{ title: string, component: any }>;
  public backgroundImage: any = "./assets/bg5.jpg";
  
  constructor(platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    public authData: AuthData,
    public afAuth: AngularFireAuth) {
    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();
  
      this.afAuth.authState.subscribe((user) => {
        if (user && user.email) {
          this.rootPage = ProfilePage;// Settings.rootPage;
        } else {
          this.rootPage = LoginPage;
        }
      });

    });
    this.pages = [
      { title: 'الأسئلة', component: HomePage },
      { title: 'تبويبات', component: CategoriesPage },
      { title: 'إضافة سؤال', component: AddQuestionPage },
      { title: 'إضافة تبويب', component: AddCategoryPage },
      { title: 'إحصائيات', component: StatisticsPage }
    ];
  }

  openPage(page) {
    this.nav.setRoot(page.component);
  }
  openProfilePage() {
    this.nav.setRoot(ProfilePage);
  }
  openPlayPage(){
    this.nav.setRoot(PlayPage);
  }
  openPlayOnlinePage(){
    // this.nav.setRoot(PlayOnlinePage);
  }
  openSpeedTestPage(){
    this.nav.setRoot(SpeedTestPage);
  }
  openInfiniteTestPage(){
    this.nav.setRoot(InfiniteTestPage);
  }
  
  logout() {
    this.authData.logoutUser();
    this.nav.setRoot(LoginPage);

  }
}

