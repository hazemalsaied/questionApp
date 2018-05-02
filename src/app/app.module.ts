import { NativeAudio } from '@ionic-native/native-audio';
import { AdMobFreeProvider } from './../providers/admonfree/admobfree';
import { TabsPageModule } from './../pages/Main/tabs/tabs.module';
import { TabsPage } from './../pages/Main/tabs/tabs';
// import { TeamOrderPageModule } from './../pages/Main/team-order/team-order.module';
// import { TeamOrderPage } from './../pages/Main/team-order/team-order';
import { MainPageModule } from './../pages/Main/main/main.module';
import { MainPage } from './../pages/Main/main/main';
import { QuizQuestionsPageModule } from './../pages/Results/quiz-questions/quiz-questions.module';
import { MarketPageModule } from './../pages/UserServices/market/market.module';
import { ReportedQuestionsPageModule } from './../pages/Dashboard/reported-questions/reported-questions.module';
import { AddTeamPageModule } from './../pages/UserServices/add-team/add-team.module';
import { MyTeamsPageModule } from './../pages/UserServices/my-teams/my-teams.module';
import { MyQuestionsPageModule } from './../pages/UserServices/my-questions/my-questions.module';
import { QuizQuestionsPage } from './../pages/Results/quiz-questions/quiz-questions';
import { MarketPage } from './../pages/UserServices/market/market';
import { ReportedQuestionsPage } from './../pages/Dashboard/reported-questions/reported-questions';
import { AddTeamPage } from './../pages/UserServices/add-team/add-team';
import { MyTeamsPage } from './../pages/UserServices/my-teams/my-teams';
import { InfiniteResultPageModule } from './../pages/Results/infinite-result/infinite-result.module';
import { SpeedResultPageModule } from './../pages/Results/speed-result/speed-result.module';
import { SpeedResultPage } from './../pages/Results/speed-result/speed-result';
import { InfiniteResultPage } from './../pages/Results/infinite-result/infinite-result';
import { AuxiliaryProvider } from './../providers/auxiliary/auxiliary';
import { PlayOnlinePageModule } from './../pages/Quiz/play-online/play-online.module';
import { PlayPageModule } from './../pages/Quiz/play/play.module';

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

import { AddQuestionPageModule } from '../pages/Dashboard/add-question/add-question.module';
import { AddQuestionPage } from '../pages/Dashboard/add-question/add-question';

import { AddCategoryPageModule } from '../pages/Dashboard/add-category/add-category.module';
import { AddCategoryPage } from '../pages/Dashboard/add-category/add-category';

import { AfterLoginPageModule } from '../pages/Auth/after-login/after-login.module';
import { AfterLoginPage } from '../pages/Auth/after-login/after-login';
import { ProfilePage } from '../pages/Auth/profile/profile';
import { ProfilePageModule } from '../pages/Auth/profile/profile.module';
import { CategoryProvider } from '../providers/category/category';

import { CategoriesPageModule } from '../pages/Dashboard/categories/categories.module';
import { CategoriesPage } from '../pages/Dashboard/categories/categories';

import { StatisticsPageModule } from '../pages/Dashboard/statistics/statistics.module';
import { StatisticsPage } from '../pages/Dashboard/statistics/statistics';

import { UserProvider } from '../providers/user/user';
import { PlayPage } from '../pages/Quiz/play/play';
import { PlayOnlinePage } from '../pages/Quiz/play-online/play-online';
import { ResultsPageModule } from '../pages/Results/results/results.module';
import { ResultsPage } from '../pages/Results/results/results';
import { SpeedTestPage } from '../pages/Quiz/speed-test/speed-test';
import { InfiniteTestPage } from '../pages/Quiz/infinite-test/infinite-test';
import { InfiniteTestPageModule } from '../pages/Quiz/infinite-test/infinite-test.module';
import { SpeedTestPageModule } from '../pages/Quiz/speed-test/speed-test.module';
import { MyQuestionsPage } from '../pages/UserServices/my-questions/my-questions';
import { TeamProvider } from '../providers/team/team';
import { ImageProvider } from '../providers/image/image';
import { PayPal } from '@ionic-native/paypal';
import { AllUserPage } from '../pages/Dashboard/all-user/all-user';
import { AllUserPageModule } from '../pages/Dashboard/all-user/all-user.module';
// import { UserOrderPage } from '../pages/Main/user-order/user-order';
// import { UserOrderPageModule } from '../pages/Main/user-order/user-order.module';
import { Facebook } from '@ionic-native/facebook'
import { GooglePlus } from '@ionic-native/google-plus';
import { AdMobFree } from '@ionic-native/admob-free';


export const config = {
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
    SpeedResultPageModule,
    InfiniteResultPageModule,
    MyQuestionsPageModule,
    MyTeamsPageModule,
    AddTeamPageModule,
    ReportedQuestionsPageModule,
    MarketPageModule,
    QuizQuestionsPageModule,
    MainPageModule,
    AllUserPageModule,
    TabsPageModule,
    // BrowserAnimationsModule,
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
    ResultsPage,
    InfiniteResultPage,
    SpeedResultPage,
    MyQuestionsPage,
    MyTeamsPage,
    AddTeamPage,
    ReportedQuestionsPage,
    MarketPage,
    QuizQuestionsPage,
    MainPage,
    AllUserPage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AuthData,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    QuestionProvider,
    CategoryProvider,
    Camera,
    UserProvider,
    AuxiliaryProvider,
    TeamProvider,
    ImageProvider,
    PayPal,
    Facebook,
    GooglePlus,
    AdMobFree,
    NativeAudio,
    AdMobFreeProvider
  ]
})
export class AppModule { }
