import { Component, OnInit } from '@angular/core';
import * as thingshub from 'thingshub-js-sdk';
import { endPointAddress } from "../utils";
import { securityHeaderHook } from "../account.service";

@Component({
  selector: 'app-things',
  templateUrl: './things.component.html',
  styleUrls: ['./things.component.css']
})
export class ThingsComponent implements OnInit {

  private thingsDataContext: thingshub.ThingsDataContext;
  private things : thingshub.Thing[] = [];

  constructor() { 
    this.thingsDataContext = new thingshub.ThingsDataContext(endPointAddress, securityHeaderHook);
  }

  async ngOnInit() {

    var thingsGetParams =  {
      parentThingId : null,
      thingFilter : "",
      valueFilter : "",
      orderBy : "",
      skip : 0,
      top : 100
    }

    let things = await this.thingsDataContext.getThings(thingsGetParams);

    console.log(things);

    for (let i = 0; i < things.things.length; i++)
      this.things.push(things.things[i]);


    console.log(things);
  }

}
