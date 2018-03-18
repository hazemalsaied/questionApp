import { AngularFireAuth } from 'angularfire2/auth';
import { QuestionProvider } from './../question/question';
import { User } from './../../shared/models/user';
import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database-deprecated';

@Injectable()
export class UserProvider {

  users$: FirebaseListObservable<User[]>;


  constructor(public afd: AngularFireDatabase,
    public questionProv: QuestionProvider,
    public afa: AngularFireAuth) {

  }

  getUser(): Promise<User> {
    let currentUserId = this.afa.auth.currentUser.uid;
    return new Promise((resolve, reject) => {
      this.afd.object('/userProfile/' + currentUserId).subscribe(us => {
        resolve(us);
      });
    });
  }

  getUserByKey(key):Promise<User> {
    return new Promise((resolve, reject) => {
      this.afd.object('/userProfile/' + key).subscribe(us => {
        resolve(us);
      });
    });
  }

  addTeam(user, teamKey) {
    if (typeof user.teams == "undefined") {
      user.teams = [];
    }
    user.teams.push({ key: teamKey });
    console.log(user);
    this.afd.list('/userProfile/').update(user.$key, user).then(_ => {
      console.log('user updated');
    });
  }

  addQuiz(user, quizKey):Promise<any> {
    return new Promise((resolve, reject) => {
      user.quiz = quizKey;
      this.afd.list('/userProfile/').update(user.$key, user).then(us => {
        console.log('quiz added');
        resolve(us);
      });
    });
  }

  setAllUserInfo() {
    this.afd.list('userProfile').subscribe(userList => {
      userList.forEach(user => {
        user.questionNum = 5;
        user.jokerNum = 3;
        user.hammerNum = 6;
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
