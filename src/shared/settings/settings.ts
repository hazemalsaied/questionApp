import { ResultsPage } from './../../pages/results/results';
import { PlayPage } from '../../pages/play/play';
import { ProfilePage } from '../../pages/Auth/profile/profile';
import { HomePage } from '../../pages/Dashboard/home/home';

export class Settings {

  static readonly easyQuestionNum = 2;
  static readonly intermediateQuestionNum = 2;
  static readonly difficultQuestionNum = 2;
  static readonly questionNum = Settings.easyQuestionNum + Settings.intermediateQuestionNum + Settings.difficultQuestionNum;

  static readonly questionPoint = 15;
  
  static readonly waitingTime = 2000;
  static readonly progressBarSep = 500;
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