import { AuxiliaryProvider } from './../providers/auxiliary/auxiliary';
import { PlayOnlinePageModule } from './../pages/play-online/play-online.module';
import { PlayPageModule } from './../pages/play/play.module';
import { SortQuestionNum } from './../pipes/sortByQuestionNum';
import { Camera } from '@ionic-native/camera';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { AuthData } from '../providers/auth-data/auth-data';
import { QuestionProvider } from '../providers/question/question';

import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database-deprecated';

import { MyApp } from './app.component';
import { HomePage } from '../pages/Dashboard/home/home';
import { HomePageModule } from '../pages/Dashboard/home/home.module';

import { LoginPage } from '../pages/Auth/login/login';
import { LoginPageModule } from '../pages/Auth/login/login.module';

import { ForgotPage } from '../pages/Auth/forgot/forgot';
import { ForgotPageModule } from '../pages/Auth/forgot/forgot.module'; 
import { RegisterPageModule } from '../pages/Auth/register/register.module';
import { RegisterPage } from '../pages/Auth/register/register';

import { AddQuestionPageModule  } from '../pages/Dashboard/add-question/add-question.module';
import { AddQuestionPage  } from '../pages/Dashboard/add-question/add-question';

import { AddCategoryPageModule  } from '../pages/Dashboard/add-category/add-category.module';
import { AddCategoryPage  } from '../pages/Dashboard/add-category/add-category';

import { AfterLoginPageModule } from '../pages/Auth/after-login/after-login.module';
import { AfterLoginPage } from '../pages/Auth/after-login/after-login';
import { ProfilePage } from '../pages/Auth/profile/profile';
import { ProfilePageModule } from '../pages/Auth/profile/profile.module';
import { CategoryProvider } from '../providers/category/category';

import { CategoriesPageModule  } from '../pages/Dashboard/categories/categories.module';
import { CategoriesPage  } from '../pages/Dashboard/categories/categories';

import { StatisticsPageModule  } from '../pages/Dashboard/statistics/statistics.module';
import { StatisticsPage  } from '../pages/Dashboard/statistics/statistics';

import { UserProvider } from '../providers/user/user';
import { PlayPage } from '../pages/play/play';
import { PlayOnlinePage } from '../pages/play-online/play-online';
import { ResultsPageModule } from '../pages/results/results.module';
import { ResultsPage } from '../pages/results/results';
import { SpeedTestPage } from '../pages/speed-test/speed-test';
import { InfiniteTestPage } from '../pages/infinite-test/infinite-test';
import { InfiniteTestPageModule } from '../pages/infinite-test/infinite-test.module';
import { SpeedTestPageModule } from '../pages/speed-test/speed-test.module';
import { QuestionBarComponent } from '../components/question-bar/question-bar';
import { ProgressBarComponent } from '../components/progress-bar/progress-bar';



export const config = {
  // questionXP
  // apiKey: "AIzaSyAhimhsmVgWXzPzjJveJ0ex3I-k61FCK74",
  // authDomain: "questionxp-9fdf5.firebaseapp.com",
  // databaseURL: "https://questionxp-9fdf5.firebaseio.com",
  // projectId: "questionxp-9fdf5",
  // storageBucket: "questionxp-9fdf5.appspot.com",
  // messagingSenderId: "246180879985"

  // questionAPP
  apiKey: "AIzaSyDLdC5Irud7dDOWK8ie8GZHnjPtGApdI6g",
  authDomain: "questionapp-fdb6a.firebaseapp.com",
  databaseURL: "https://questionapp-fdb6a.firebaseio.com",
  projectId: "questionapp-fdb6a",
  storageBucket: "questionapp-fdb6a.appspot.com",  
  messagingSenderId: "235551466519"
};

@NgModule({
  declarations: [
    MyApp,
    SortQuestionNum,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(config),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    HomePageModule,
    RegisterPageModule,
    AfterLoginPageModule,
    LoginPageModule,
    ForgotPageModule,
    AddQuestionPageModule,
    AddCategoryPageModule,
    CategoriesPageModule,
    ProfilePageModule,
    StatisticsPageModule,
    PlayPageModule,
    PlayOnlinePageModule,
    InfiniteTestPageModule,
    SpeedTestPageModule,
    ResultsPageModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    RegisterPage,
    ForgotPage,
    AfterLoginPage,
    AddQuestionPage,
    AddCategoryPage,
    CategoriesPage,
    ProfilePage,
    StatisticsPage,
    PlayPage,
    PlayOnlinePage,
    SpeedTestPage,
    InfiniteTestPage,
    ResultsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AuthData,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    QuestionProvider,
    CategoryProvider,
    Camera,
    UserProvider,
    UserProvider,
    AuxiliaryProvider
  ]
}) 
export class AppModule {}
