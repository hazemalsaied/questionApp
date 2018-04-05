import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { User } from 'firebase';
import { AllUserPage } from './../pages/all-user/all-user';
import { MainPage } from './../pages/main/main';
import { MyTeamsPage } from './../pages/UserServices/my-teams/my-teams';
import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireAuth } from 'angularfire2/auth';

import { AddTeamPage } from './../pages/UserServices/add-team/add-team';
import { MyQuestionsPage } from './../pages/UserServices/my-questions/my-questions';
import { MarketPage } from './../pages/UserServices/market/market';

import { PlayPage } from './../pages/Quiz/play/play';
import { PlayOnlinePage } from '../pages/Quiz/play-online/play-online';
import { InfiniteTestPage } from './../pages/Quiz/infinite-test/infinite-test';
import { SpeedTestPage } from './../pages/Quiz/speed-test/speed-test';

// import { Settings } from './../shared/settings/settings';
import { LoginPage } from './../pages/Auth/login/login';

import { AuthData } from './../providers/auth-data/auth-data';


// import { ResultsPage } from '../pages/Results/results/results';

import { HomePage } from './../pages/Dashboard/home/home';
import { AddQuestionPage } from '../pages/Dashboard/add-question/add-question';
import { CategoriesPage } from '../pages/Dashboard/categories/categories';
import { ReportedQuestionsPage } from '../pages/Dashboard/reported-questions/reported-questions';
import { AddCategoryPage } from '../pages/Dashboard/add-category/add-category';
import { StatisticsPage } from '../pages/Dashboard/statistics/statistics';



import { ProfilePage } from '../pages/Auth/profile/profile';





@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;
  user = {
    email: '',
    jokerNum: 3,
    hammarNum: 3,
    pointNum: 150,
    name: '',
    role: 'user',
    imageUrl: '',
    sex: 'male'
  };
  pages: Array<{ title: string, component: any }>;
  servicePages: Array<{ title: string, component: any }>;
  public backgroundImage: any = "./assets/bg5.jpg";

  constructor(platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    public authData: AuthData,
    public afd: AngularFireDatabase,
    public afAuth: AngularFireAuth) {
    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();

      this.afAuth.authState.subscribe((user) => {
        if (user && user.email) {
          this.rootPage = MainPage;// Settings.rootPage;
          this.afd.object('userProfile/' + user.uid).subscribe(u => {
            this.user = u;
          })
        } else {
          this.rootPage = LoginPage;
        }
      });

    });
    this.pages = [
      { title: 'الأسئلة', component: HomePage },
      { title: 'تبليغات', component: ReportedQuestionsPage },
      { title: 'إحصائيات', component: StatisticsPage },
      { title: 'إضافة سؤال', component: AddQuestionPage },
      { title: 'إدارة الأعضاء', component: AllUserPage },
      { title: 'تبويبات', component: CategoriesPage },
      { title: 'إضافة تبويب', component: AddCategoryPage }
    ];

    this.servicePages = [
      { title: 'المتجر', component: MarketPage },
      { title: 'أسئلتي', component: MyQuestionsPage },
      { title: 'إضافة فريق', component: AddTeamPage },
      { title: 'فرقي', component: MyTeamsPage }
    ];
  }

  openPage(page) {
    this.nav.setRoot(page.component);
  }
  openProfilePage() {
    this.nav.setRoot(ProfilePage);
  }
  openPlayPage() {
    this.nav.setRoot(PlayPage);
  }
  openPlayOnlinePage() {
    this.nav.setRoot(PlayOnlinePage);
  }
  openSpeedTestPage() {
    this.nav.setRoot(SpeedTestPage);
  }
  openInfiniteTestPage() {
    this.nav.setRoot(InfiniteTestPage);
  }
  openMainPage() {
    this.nav.setRoot(MainPage);
  }

  logout() {
    this.authData.logoutUser();
    this.nav.setRoot(LoginPage);

  }
}

