import { CategoryProvider } from './../../../providers/category/category';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserProvider } from '../../../providers/user/user';



@IonicPage()
@Component({
  selector: 'page-user-order',
  templateUrl: 'user-order.html',
})
export class UserOrderPage {

  users: Array<any> = [];
  showUserList: boolean = false;
  showCriteriaPanel: boolean = true;
  mainCats = [];
  subCats = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public userP: UserProvider,
    public catP: CategoryProvider) {
    this.catP.getAllCats().then(allCats => {
      this.mainCats = this.catP.getMainCats(allCats);
    });


  }
  showSubCats(cat) {
    for (let c of this.mainCats) {
      c.showMe = false;
    }
    cat.showMe = true;
    this.subCats = this.catP.getSubCats(cat.$key);
  }

  getUsers(type) {
    this.showCriteriaPanel = false;
    this.showUserList = true;
    let field;
    if (type == 'pointNum'|| type =='play' || type =='infiniteTest'||type =='speedTest') {
      field = type;
    } else if (type == 'month') {
      field = this.userP.getMonthField();
    }
    else {
      field = 'pointNum' + String(type);
    }
    this.userP.getBestUsers(field).then(users => {
      this.users = users.reverse();
    });
  }

}
