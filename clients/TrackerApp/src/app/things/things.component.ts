import { Component, OnInit } from '@angular/core';
import * as thingshub from 'thingshub-js-sdk';
import { endPointAddress } from '../utils';
import { AccountService } from '../account.service';

@Component({
  selector: 'app-things',
  templateUrl: './things.component.html',
  styleUrls: ['./things.component.css']
})
export class ThingsComponent implements OnInit {

  private thingsDataContext: thingshub.ThingsDataContext;
  private things: thingshub.Thing[] = [];
  private things1: thingshub.Thing[] = [];

  constructor(private accountService: AccountService) {
    this.thingsDataContext = new thingshub.ThingsDataContext(endPointAddress, accountService.getSecurityHeader);
  }

  ngOnInit() {

    const thingsGetParams =  {
      parentThingId : null,
      thingFilter : '',
      valueFilter : '',
      orderBy : '',
      skip : 0,
      top : 100
    };

    this.thingsDataContext.getThings(thingsGetParams)
    .then(things => {
      for (let i = 0; i < things.things.length; i++) {
      this.things.push(things.things[i]);
    }});
    console.log("things = " + this.things);

    this.thingsDataContext.getThings(thingsGetParams)
    .then(things => {
      for (let i = 0; i < things.things.length; i++) {
        this.things1.push(things.things[i]);
      }
    });
    console.log("things1 = " + this.things1);
  }

  private async recall() {
    
    const thingsGetParams =  {
      parentThingId : null,
      thingFilter : '',
      valueFilter : '',
      orderBy : '',
      skip : 0,
      top : 100
    };

    this.thingsDataContext.getThings(thingsGetParams)
    .then(things => {
      for (let i = 0; i < things.things.length; i++) {
      this.things.push(things.things[i]);
    }})
    .catch(e => {
      console.log(e);
    });

    this.thingsDataContext.getThings(thingsGetParams)
    .then(things => {
      for (let i = 0; i < things.things.length; i++) {
        this.things1.push(things.things[i]);
      }
    })
    .catch(e => {
      console.log(e);
    });
  }
}
