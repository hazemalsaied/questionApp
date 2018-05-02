import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserOrderPage } from './user-order';

@NgModule({
  declarations: [
    UserOrderPage,
  ],
  imports: [
    IonicPageModule.forChild(UserOrderPage),
  ],
})
export class UserOrderPageModule {}
