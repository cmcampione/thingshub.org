import { Component, Input, OnInit } from '@angular/core';
import { ThingUserChangeClaims, Thing, ThingUserReadClaims } from 'thingshub-js-sdk';

@Component({
  selector: 'app-thing',
  templateUrl: './thing.component.html',
  styleUrls: ['./thing.component.scss'],
})
export class ThingComponent implements OnInit {

  @Input() thing: Thing;

  constructor() { }

  ngOnInit() {}
/*
  public get CanReadThingName() {
    return (this.thing.userReadClaims & ThingUserReadClaims.CanReadName) !== 0 && 
      (this.thing.userChangeClaims & ThingUserChangeClaims.CanChangeName) === 0
  }
*/
  public get CanChangeThingName() {
    return (this.thing.userChangeClaims & ThingUserChangeClaims.CanChangeName) !== 0
  }

}
