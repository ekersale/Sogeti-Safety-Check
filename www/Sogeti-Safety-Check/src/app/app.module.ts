import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';


import {LoginPage} from '../pages/login/login';
import {RegistrationStoryPage} from '../pages/RegistrationStory/registrationStory';
import {RegistrationPage} from '../pages/register/register';
import {PwdRecuperationPage} from '../pages/PwdRecover/pwdRecover';
import { TabHomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import {TabProfilePage} from '../pages/profile/profile'
import {TabChatPage} from '../pages/chat/chat';
import {HttpModule} from '@angular/http';
import {AlertModal} from "../pages/alert-modal/alert-modal";
import {EventEditorModal} from "../pages/event-editor-modal/event-editor-modal";
import {PreviewEvent} from "../pages/preview-event/preview-event";
import {GoogleMapModal} from "../pages/google-map-modal/google-map-modal";
import {APIService} from "../services/server";
import {EventsDetails} from "../pages/events-details/events-details";
import { ElasticModule }  from 'angular2-elastic';
import {MomentModule} from "angular2-moment";
import {AlertEventModal} from '../pages/alert-event-modal/alert-event-modal';
import {UserPopOver} from '../pages/user-pop-over/user-pop-over'
import {Talk} from '../pages/talk/talk';

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    RegistrationPage,
    RegistrationStoryPage,
    PwdRecuperationPage,
    AboutPage,
    ContactPage,
    TabsPage,
    TabHomePage,
    TabProfilePage,
    TabChatPage,
    AlertModal,
    EventEditorModal,
    PreviewEvent,
    GoogleMapModal,
    EventsDetails,
    AlertEventModal,
    UserPopOver,
    Talk
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    HttpModule,
    ElasticModule,
    MomentModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    RegistrationPage,
    RegistrationStoryPage,
    PwdRecuperationPage,
    AboutPage,
    ContactPage,
    TabsPage,
    TabHomePage,
    TabProfilePage,
    TabChatPage,
    AlertModal,
    EventEditorModal,
    PreviewEvent,
    GoogleMapModal,
    EventsDetails,
    AlertEventModal,
    UserPopOver,
    Talk
  ],
  providers: [APIService]
})
export class AppModule {}
