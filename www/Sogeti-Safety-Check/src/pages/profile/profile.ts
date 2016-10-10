/**
 * Created by ekersale on 05/10/2016.
 */

import {Component} from '@angular/core';
import {APIService} from '../../services/server'

@Component({
  templateUrl: 'profile.html',
  providers: [APIService]
})

export class TabProfilePage {

  public currentUser : any;
  public userEvents : any;

  constructor(private api: APIService) {
      api.getUserInfo().subscribe(
        data => {
          console.log(data);
        },
        error => console.log(error)
      );
  }
}
