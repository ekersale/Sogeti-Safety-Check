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
    EventEditorModal
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    HttpModule
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
    EventEditorModal
  ],
  providers: []
})
export class AppModule {}
