/**
 * Created by ekersale on 07/10/2016.
 */

import {Component, ViewChild} from '@angular/core';
import {Content} from 'ionic-angular';
import {APIService} from "../../services/server";
import { Slides } from 'ionic-angular';


@Component({
    templateUrl: 'home.html',
    selector: 'page-home',
    providers: [APIService]
})

export class TabHomePage {

  public events = [];
  private page = 1;
  mySlideOptions = {
    initialSlide: 0,
    loop: true
  };
  private scroll: boolean = true;

  constructor(private api : APIService) {
    this.api.getEvents(this.page).subscribe(
      data => {
        if (data.data.count <= data.data.events.length)
          this.scroll = false;
        for (let ev of data.data.events) {
          this.events.push(ev);
        }
        console.log(data);
      },
      error => {
        console.log(error);
      }
    );
  }


  doInfinite(infiniteScroll) {
    if (this.scroll == false)
      infiniteScroll.enable(false);
    console.log('doInfinite, start is currently '+ this.page);
    this.page++;
    this.api.getEvents(this.page).subscribe(
      data => {
        if (data.data.count <= data.data.events.length + (this.page * data.data.limit))
          infiniteScroll.enable(false);
        for (let ev of data.data.events) {
          this.events.push(ev);
        }
        console.log(data);
      },
      error => {
        console.log(error);
      },
      () => infiniteScroll.complete()
    );
  }


}
