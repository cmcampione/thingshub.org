import * as moment from 'moment';
import { Component, OnInit, LOCALE_ID, Inject } from '@angular/core';
import * as thingshub from 'thingshub-js-sdk';
import { endPointAddress } from '../utils';
import { AccountService } from '../account.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  public deviceId = '087073117560';
  public surveyDateTime = '';
  public lastEventDateTime = '';
  public lastStatusMsg = '';

  public lat = 51.678418;
  public lng = 7.809007;

  socket = new thingshub.SocketIORealtimeConnector(
      endPointAddress.server,
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

  constructor(@Inject(LOCALE_ID) private locale: string, private accountService: AccountService) {

  }

  ngOnInit() {
    this.socket.subscribe();
    // Uses of "fat arrow" sintax for "this" implicit binding
    this.socket.setHook('onUpdateThingValue', (thingId, value) => {

      if (this.deviceId !== value.deviceId) {
        return;
      }

      moment.locale('IT-it');
      this.deviceId = value.deviceId;
      this.lastEventDateTime = moment(value.lastEventDateTime).format('L LTS');
      this.lastStatusMsg = value.lastStatus.message;
      this.surveyDateTime = moment(value.surveyDateTime).format('L LTS');
      this.lat = value.lat;
      this.lng = value.lng;
      console.log(value);
    });
  }

}
