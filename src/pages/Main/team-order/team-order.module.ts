import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TeamOrderPage } from './team-order';

@NgModule({
  declarations: [
    TeamOrderPage,
  ],
  imports: [
    IonicPageModule.forChild(TeamOrderPage),
  ],
})
export class TeamOrderPageModule {}
