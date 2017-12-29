import { Component, OnInit } from '@angular/core';
import * as thingshub from 'thingshub-js-sdk';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  lat = 51.678418;
  lng = 7.809007;

  // tslint:disable-next-line:max-line-length
  socket = new thingshub.SocketIOConnector('https://server1.carmelocampione.it:3000', this.authHook, this.onError, this.onConnectError, this.onStateChanged);

  private authHook() {
    return 'token=5e4ff11c-5391-465b-a9c4-9803e0b78799';
  }
  private onError(error) {
    console.log(error);
  }
  private onConnectError(error) {
    console.log(error);
  }

  private onStateChanged(change) {
    console.log(change);
  }

  constructor() { 
    this.socket.subscribe();
    // Uses of "fat arrow" sintax for "this" implicit binding
    this.socket.setHook('onUpdateThingValue', (value) => {
      this.lat = value.lat;
      this.lng = value.lng;
      console.log(value);
    });
  }

  ngOnInit() {
  }

}
