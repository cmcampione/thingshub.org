import { Component, Input, OnInit } from '@angular/core';
import { Thing } from 'thingshub-js-sdk';

@Component({
  selector: 'app-thing',
  templateUrl: './thing.component.html',
  styleUrls: ['./thing.component.scss'],
})
export class ThingComponent implements OnInit {

  @Input() thing: Thing;

  constructor() { }

  ngOnInit() {}

}
