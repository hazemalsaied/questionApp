// home.module.ts
import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { HomePage } from "./home";
import { AuthData} from '../../../providers/auth-data/auth-data';


@NgModule({
  declarations: [HomePage],
  imports: [IonicPageModule.forChild(HomePage)],
  providers:[AuthData]
})
export class HomePageModule {}