import { TeamProvider } from './../team/team';
import { Settings } from './../../shared/settings/settings';
import { TeamUserAlias } from './../../shared/models/team';
import { AngularFireAuth } from 'angularfire2/auth';
import { QuestionProvider } from './../question/question';
import { User } from './../../shared/models/user';
import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database-deprecated';
import { Quiz } from '../../shared/models/quiz';

@Injectable()
export class UserProvider {

  users$: FirebaseListObservable<User[]>;


  constructor(public afd: AngularFireDatabase,
    public questionProv: QuestionProvider,
    // public teamP: TeamProvider, 
    public afa: AngularFireAuth) {
    console.log('user provider service');

  }

  getBestUser(type = null): Promise<User> {
    let field = 'pointNum';
    if (type != null) {
      field = type;
    }
    return new Promise((resolve, reject) => {
      this.afd.list('userProfile', { query: { orderByChild: field, limitToLast: 1 } }).
        subscribe(users => {
          this.setVirtualSettings(users[0]);
          resolve(users[0]);
        })
    })
  }

  getBestMonthUser(): Promise<User> {
    var d = new Date();
    var n = 'pointNum' + String(d.getFullYear()) + String(d.getMonth());
    return new Promise((resolve, reject) => {
      this.afd.list('userProfile', { query: { orderByChild: n, limitToLast: 1 } }).
        subscribe(users => {
          this.setVirtualSettings(users[0]);
          resolve(users[0]);
        })
    })
  }

  getBestUsers(field): Promise<Array<User>> {
    console.log(field);
    return new Promise((resolve, reject) => {
      this.afd.list('userProfile', { query: { orderByChild: field, limitToLast: 10 } }).
        subscribe(users => {
          users.forEach(user => {
            this.setVirtualSettings(user);
            user.points = user[field];
          });
          resolve(users);
        });
    })
  }

  removeQuiz() {
    this.getUser().then(user => {
      if (user != null && user.quiz != null) {
        let quizId = user.quiz;
        this.afd.object('quiz/' + quizId).subscribe(quiz => {
          if (quiz != null) {
            this.afd.list('quiz/').remove(quizId);
          }
        });
        user.quiz = null;
        this.afd.list('/userProfile/').update(user.$key, user).
          then(_ => { console.log('User quiz removed'); });
      }
    });
  }

  getUser(): Promise<User> {
    return new Promise((resolve, reject) => {
      if (this.afa.auth != null && this.afa.auth.currentUser != null) {
        let currentUserId = this.afa.auth.currentUser.uid;
        this.afd.object('/userProfile/' + currentUserId).subscribe(us => {
          this.setVirtualSettings(us);
          resolve(us);
        });
      } else { resolve(null); }
    });


  }

  getUserByKey(key): Promise<User> {
    return new Promise((resolve, reject) => {
      this.afd.object('/userProfile/' + key).subscribe(us => {
        this.setVirtualSettings(us);
        resolve(us);
      });
    });
  }

  setVirtualSettings(us: User) {
    if (us != null) {
      if (us.imageUrl == null || typeof us.imageUrl == 'undefined') {
        us.imageLink = Settings.userImage;
      } else {
        us.imageLink = Settings.profileImageBeg + us.imageUrl + Settings.imageEnd;
      }
      if (us.goldenPoints == null) {
        us.goldenPoints = 0;
      }
      if (us.stormNum == null) {
        us.stormNum = 5;
        // this.afd.list('userProfile').update(us.$key, us).then(_ => {
        // });
      }
    }
  }

  updateScores(us: User, helpTool: string, amount: number = 1, catKey: string = null, type: string = null, trueAnswers = 0): Promise<User> {
    return new Promise((resolve, reject) => {
      if (us != null) {
        if (helpTool == 'joker') {
          us.jokerNum -= amount;
        } else if (helpTool == 'hammar') {
          us.hammarNum -= amount;
        } else if (helpTool == 'storm') {
          us.stormNum -= amount;
        } else if (helpTool == 'pointNum') {
          us.pointNum += amount;
          this.updateGoldPoints(us, amount);
          this.updateCatPoints(us, catKey, amount);
          // this.updateQuizTypeScore(us, type, trueAnswers);
          this.updateMonthPoints(us, amount);
        }
        this.afd.list('userProfile').update(us.$key, us).then(_ => {
          if (helpTool == 'pointNum') {
            this.updateTeamsPoints(us, amount).then(_ => {
              resolve(us);
            });
          } else {
            resolve(us);
          }
        });
      } else {
        resolve(null);
      }
    });
  }
  updateMonthPoints(us, amount) {
    var n = this.getMonthField();
    if (us[n] == null) {
      us[n] = amount
    } else {
      us[n] += amount
    }
  }

  brokePreviousScore(us, type, points, trueAnswers) {
    var quizPointNum = String(type);
    if (us[quizPointNum] != null && trueAnswers > us[quizPointNum]) {
      us[type] = trueAnswers;
      points += 50;
    }
    return points;

  }

  // updateQuizTypeScore(us, type, trueAnswers) {
  //   if (type != null) {
  //     var quizPointNum = String(type);
  //     if (us[quizPointNum] == null) {
  //       us[quizPointNum] = trueAnswers;
  //     } else {
  //       if (trueAnswers > us[quizPointNum])
  //         us[quizPointNum] = trueAnswers;
  //     }
  //   }
  // }
  updateCatPoints(us, catKey, amount) {
    if (catKey != null) {
      var catPointNum = 'pointNum' + String(catKey);
      if (us[catPointNum] == null) {
        us[catPointNum] = amount;
      } else {
        us[catPointNum] += amount;
      }
    }
  }
  updateGoldPoints(us, amount) {
    if (us.goldenPoints != null) {
      us.goldenPoints += amount;
    } else {
      us.goldenPoints = amount;
    }
  }

  updateTeamsPoints(user, points) {
    return new Promise((resolve, reject) => {
      if (user.teams != null && typeof user.teams != "undefined") {
        for (let i = 0; i < user.teams.length; i++) {
          this.updateTeamPoints(user.teams[i].key, points);

        }
        resolve();
      } else {
        resolve();
      }
    });
  }
  updateTeamPoints(teamKey, pointNum): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getTeam(teamKey).then(team => {
        team.points += pointNum;
        this.afd.list('teams').update(team.$key, team).then(_ => {
          console.log('team points updates!');
          resolve();
        });
      });
    });
  }
  getTeam(teamKey): Promise<any> {
    return new Promise((resolve, reject) => {
      this.afd.object('teams/' + teamKey).subscribe(team => {
        resolve(team);
      })
    });
  }

  getMonthField() {
    var d = new Date();
    var n = 'pointNum' + String(d.getFullYear()) + String(d.getMonth());
    return n;
  }
  addTeam(user, teamKey) {
    return new Promise((resolve, reject) => {
      if (typeof user.teams == "undefined") {
        user.teams = [];
      }
      let tAlias: TeamUserAlias = { key: teamKey, isAdmin: false };
      user.teams.push(tAlias);
      this.afd.list('/userProfile/').update(user.$key, user).then(_ => {
        console.log('user updated');
        resolve(user);
      });
    });
  }

  addQuiz(user, quizKey): Promise<any> {
    return new Promise((resolve, reject) => {
      user.quiz = quizKey;
      this.afd.list('/userProfile/').update(user.$key, user).then(_ => {
        console.log('quiz added');
        resolve();
      });
    });
  }

  setAllUserInfo() {
    this.afd.list('userProfile').subscribe(userList => {
      userList.forEach(user => {
        user.questionNum = 5;
        user.jokerNum = 3;
        user.hammarNum = 6;
        user.pointNum = 150;
        user.name = user.email.split('@')[0];
        user.role = 'admin';
        if (user.$key) {
          this.afd.list('userProfile').update(user.$key, user);
        }
      });
    });
  }

  changeQuestionNumber(uid, decrease = false) {
    let userBuf;
    new Promise((resolve, reject) => {
      console.log(uid);
      let user$ = this.afd.object('/userProfile/' + uid);
      user$.subscribe(user => {
        if (user.questionNumber) {
          if (decrease) {
            user.questionNumber = user.questionNumber - 1;
          } else {
            user.questionNumber = user.questionNumber + 1;
          }
        } else {
          if (decrease) {
            user.questionNumber = 0;
          } else {
            user.questionNumber = 1;
          }
        }
        userBuf = user;
        resolve();
      });
    }).then(_ => {
      if (userBuf.$key) {
        this.afd.list('userProfile/').update(uid, userBuf).
          then(_ => {
            console.log('User question number is updated');
            console.log(userBuf);
          });
      }
    });
  }

  setInitialQuestionNumber() {

    this.afd.list('/userProfile').
      subscribe(userList => {
        userList.forEach(user => {
          this.questionProv.getQuestions({ orderByChild: 'user', equalTo: user.$key }).
            subscribe(questionList => {
              let userBuf;
              new Promise((resolve, reject) => {
                let user$ = this.afd.object('/userProfile/' + user.$key);
                user$.subscribe(user => {
                  user.questionNumber = questionList.length;
                  user.questionNum = null;
                  userBuf = user;
                  resolve();
                });
              }).then(_ => {
                if (userBuf.$key) {
                  this.afd.list('userProfile/').update(user.$key, userBuf).
                    then(_ => {
                      console.log(userBuf);
                    });
                }
              });
            });
        });
      });
  }
}
