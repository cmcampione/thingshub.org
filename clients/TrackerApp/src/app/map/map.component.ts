import { Component, OnInit } from '@angular/core';
import * as thingshub from 'thingshub-js-sdk';
import { endPointAddress } from '../utils';
import { AccountService } from '../account.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  lat = 51.678418;
  lng = 7.809007;

  // tslint:disable-next-line:max-line-length
  socket = new thingshub.SocketIOConnector(endPointAddress.server,
      this.accountService.getSecurityToken, 
      this.onError, this.onConnectError, this.onStateChanged);

  private onError(error) {
    console.log(error);
  }
  private onConnectError(error) {
    console.log(error);
  }

  private onStateChanged(change) {
    console.log(change);
  }

  constructor(private accountService: AccountService) { 
    
  }

  ngOnInit() {
    this.socket.subscribe();
    // Uses of "fat arrow" sintax for "this" implicit binding
    this.socket.setHook('onUpdateThingValue', (value) => {
      this.lat = value.lat;
      this.lng = value.lng;
      console.log(value);
    });
  }

}
