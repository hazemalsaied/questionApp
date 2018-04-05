import { Team } from './../models/team';
import { User } from './../models/user';
import { Question } from './../models/question';
import { ProfilePage } from '../../pages/Auth/profile/profile';

export class Settings {
  static readonly infiniteTestType = 'infiniteTest';
  static readonly playType = 'play';
  static readonly playOnlineType = 'playOnline';
  static readonly speedTestType = 'speedTest';
  static readonly playOnlineUserCardWaitingInterval = 3000;
  static readonly infiniteTestQPoint = 5;
  static readonly playQPoint = 5;
  static readonly playOnlineQPoint = 5;
  static readonly speedTestQPoint = 5;

  static readonly easyQuestionNum = 5;
  static readonly intermediateQuestionNum = 5;
  static readonly difficultQuestionNum = 5;
  static readonly questionNum = Settings.easyQuestionNum + Settings.intermediateQuestionNum + Settings.difficultQuestionNum;

  static readonly freeSavedQuestionNum = 50;
  static readonly questionPoint = 5;

  static readonly initQuesNumForInfiniteTest = 20;
  static readonly initQuesNumForSpeedTest = 80;

  static readonly initJokerNum = 5;
  static readonly initHammarNum = 5;
  static readonly initStormNum = 5;
  static readonly initPointNum = 150

  static readonly waitingTime = 2000;
  static readonly waitingTimeSpeed = 500;
  static readonly progressBarSep = 1500;
  static readonly progressBarSpeed = 1200;
  static readonly waitingListStep = 3000;
  static readonly imageQuestionInterval = 2000;
  static readonly loadingStep = 400;

  static readonly jokerPoints = 20;
  static readonly hammerPoints = 10;
  static readonly stormPoints = 5;

  static readonly rootPage = ProfilePage; //PlayPage;//HomePage;//ResultsPage //  ProfilePage;

  static readonly yellowCColor = '#FCC744';
  static readonly yellowCDarkColor = 'rgb(252, 180, 0)';
  static readonly yellowCLightColor = '#fae0a8';
  static readonly dangerColor = '#ca0c35';
  static readonly validColor = '#00A234';//'#1fa804';
  static readonly primaryColor = '#D01E29';
  static readonly choiceColor = '#4C4C4C'; //'#FCC744';
  static readonly activeChoiceColor = '#ebae15';
  static readonly imageBeg = 'https://firebasestorage.googleapis.com/v0/b/questionapp-fdb6a.appspot.com/o/pictures%2F';
  static readonly imageEnd = '?alt=media';
  static readonly teamImageBeg = 'https://firebasestorage.googleapis.com/v0/b/questionapp-fdb6a.appspot.com/o/teams%2F';
  static readonly teamImageEnd = '?alt=media';
  static readonly profileImageBeg = 'https://firebasestorage.googleapis.com/v0/b/questionapp-fdb6a.appspot.com/o/userProfile%2F';
  static readonly profileImageEnd = '?alt=media';
  static readonly teamImage = "./assets/team.jpg"
  static readonly userImage = "./assets/profile.png"
  
  static readonly sotrmIcn = "./assets/storm64.png";
  static readonly goldIcn = "./assets/gold64.png";
  static readonly jockerIcn = "./assets/jocker64.png";
  static readonly hammarIcn = "./assets/hammar64.png";

  static readonly hammarPrice = 0.50;
  static readonly jokerPrice = 1;
  static readonly stormPrice = 0.25;
  static readonly noAdsPrice = 1;
  static readonly appName = 'كويزي';
  static readonly addToPanelTxt = 'أضف';
  static readonly removeFromPanelTxt = 'حذف';
  static readonly emptyUser: User = {
    email: '',
    jokerNum: 3,
    hammarNum: 3,
    stormNum: 3,
    pointNum: 150,
    name: '',
    role: 'user',
    imageUrl: ''
  };
  static readonly emptyQuestion: Question = {
    content: '',
    questionType: 'text',
    answer: '',
    answerType: 'multipleChoices',
    choices: [{ text: '' }, { text: '' }, { text: '' }],
    imageUrl: '',
    difficulty: "2",
    user: '',
    cat: '',
    subCat: ''
  };
  static readonly emptyTeam: Team = {
    name: '',
    slogan: '',
    points: 0,
    imageUrl: '',
    admin: ''
  };


  static readonly payPalEnvironmentSandbox = 'AVPD94MN8eCN_KKfnq0-ZGqLwWmULUNyhWMY0405o84N1KGZbN2QqJUXXK-38Shk5OHZ_jmB-UnhJQbU';
  static readonly payPalEnvironmentProduction = '';

  constructor() {
  }

  public static replaceNumbers(s: string) {
    s = s.replace(/١/gi, '1');
    s = s.replace(/٢/gi, '2');
    s = s.replace(/٣/gi, '3');
    s = s.replace(/٤/gi, '4');
    s = s.replace(/٥/gi, '5');
    s = s.replace(/٦/gi, '6');
    s = s.replace(/٧/gi, '7');
    s = s.replace(/٨/gi, '8');
    s = s.replace(/٩/gi, '9');
    s = s.replace(/٠/gi, '0');
    return s;
  }

  public static replaceAleph(s: string) {
    s = s.replace(/أ/gi, 'ا');
    s = s.replace(/إ/gi, 'ا');
    s = s.replace(/آ/gi, 'ا');
    s = s.replace(/ء/gi, 'ا');
    s = s.replace(/ئ/gi, 'ا');
    s = s.replace(/ى/gi, 'ا');
    return s;
  }

  public static shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
    return a;
  }

}