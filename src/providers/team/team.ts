import { User, TeamKey } from './../../shared/models/user';
import { Settings } from './../../shared/settings/settings';
import { Team } from './../../shared/models/team';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';


@Injectable()
export class TeamProvider {

  constructor(public afd: AngularFireDatabase) {
    console.log('Hello TeamProvider Provider');
  }

  getBestTeam(): Promise<Team> {
    return new Promise((resolve, reject) => {
      this.afd.list('teams', { query: { orderByChild: 'points', limitToLast: 1 } }).
        subscribe(teams => {
          this.setVirtualOptions(teams[0])
          resolve(teams[0]);
        })
    });
  }


  getBestTeams(): Promise<Array<Team>> {
    return new Promise((resolve, reject) => {
      this.afd.list('teams', { query: { orderByChild: 'points', limitToLast: 5 } }).
        subscribe(teams => {
          teams.forEach(team => {
            this.setVirtualOptions(team);
          });
          resolve(teams);
        })
    })
  }
  setVirtualOptions(bestTeam) {
    if (bestTeam.imageUrl != null && bestTeam.imageUrl != "") {
      bestTeam.imageLink = Settings.teamImageBeg + bestTeam.imageUrl + Settings.teamImageEnd;
    } else {
      bestTeam.imageLink = Settings.teamImage;
    }
  }

  getTeam(teamKey): Promise<Team> {
    return new Promise((resolve, reject) => {
      this.afd.object('teams/' + teamKey).subscribe(team => {
        resolve(team);
      })
    });
  }
  userInTeam(teamKey, userKey): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.getTeam(teamKey).then(team => {
        for (let u of team.users) {
          if (u.key == userKey) {
            resolve(true);
          }
        }
        resolve(false);
      });
    });
  }




  acceptInvitation(user: User, t: Team): Promise<any> {
    return new Promise((resolve, reject) => {
      let invLength = user.invitations.length;
      for (let i = 0; i < invLength; i++) {
        let teamAlias = user.invitations[i];
        if (teamAlias.key === t.$key) {
          let isAlreadyInteam = false;
          for (let tt of user.teams) {
            if (tt.key == t.$key) {
              isAlreadyInteam = true
            }
          }
          if (!isAlreadyInteam) {
            user.teams.push({ key: teamAlias.key });
            t.users.push({ key: user.$key, isAdmin: false });
            this.afd.list('teams/' + t.$key).update(t.$key, t);

            this.updateTeamPoints(teamAlias.key, user.pointNum).then(_ => {
              user.invitations.splice(i, 1);
              this.afd.list('userProfile').update(user.$key, user).
                then(_ => {
                  resolve(true);
                });
            });
          } else {
            resolve(false);
          }
        }
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

  getTeams(user: User): Promise<Array<Team>> {
    return new Promise((resolve, reject) => {
      if (typeof user.teams != "undefined") {
        let teamArr = [];
        let promises = [];
        for (let i = 0; i < user.teams.length; i++) {
          let p = new Promise((resolve, reject) => {
            this.afd.object('/teams/' + user.teams[i].key).subscribe(item => {
              if (item.imageUrl == null || item.imageUrl == '' || typeof item.imageUrl == "undefined") {
                item.fullImageUrl = "./assets/team.jpg";
              } else {
                item.fullImageUrl = Settings.teamImageBeg + item.imageUrl + Settings.imageEnd;
              }
              teamArr.push(item);
              resolve();
            });
          });
          promises.push(p);
        }
        Promise.all(promises).then(function (values) {
          resolve(teamArr);
        });
      } else {
        resolve([]);
      }
    });
  }

  getInvitations(user): Promise<any> {
    return new Promise((resolve, reject) => {
      let invitations = [];
      if (user.invitations != null) {
        for (let vAlias of user.invitations) {
          this.afd.object('teams/' + vAlias.key).subscribe(t => {
            if (t != null && typeof t !== 'undefined') {
              console.log(t);
              if (t.imageUrl != null && t.imageUrl.trim() != '') {
                t.imageLink = Settings.imageBeg + t.imageUrl + Settings.imageEnd;
              } else {
                t.imageLink = Settings.teamImage;
              }
              console.log(t);
              invitations.push(t);
            }
            resolve(invitations);
          });
        }
      } else {
        resolve([]);
      }
    });
  }
}
