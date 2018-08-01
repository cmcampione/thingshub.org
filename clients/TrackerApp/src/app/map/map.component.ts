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

  private thingsDataContext: thingshub.ThingsDataContext;

  private thingKind = 'c3aa4d95-4cb4-415c-a251-7fe846e0fd17';
  private thingId = '';
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
    this.thingsDataContext = new thingshub.ThingsDataContext(endPointAddress, accountService.getSecurityHeader);
  }

  private setValue(value: any) {
    this.deviceId = value.deviceId;
    this.lastEventDateTime = moment(value.lastEventDateTime).format('L LTS');
    this.lastStatusMsg = value.lastStatus.message;
    this.surveyDateTime = moment(value.surveyDateTime).format('L LTS');
    this.lat = value.lat;
    this.lng = value.lng;

    console.log(value);
  }

  ngOnInit() {

    const thingsGetParams: thingshub.ThingsGetParams =  {
      parentThingId : null,
      thingFilter : {kind: this.thingKind },
      valueFilter : null,
      orderBy : '',
      skip : 0,
      top : 100
    };
    this.thingsDataContext.getThings(thingsGetParams)
    .then(things => {

      moment.locale('IT-it');

      for (let i = 0; i < things.things.length; i++) {

        this.setValue(things.things[i].value);

        this.thingId = things.things[i].id;
    }})
    .catch(e => {
      console.log(e);
    });

    this.socket.subscribe();
    // Uses of "fat arrow" sintax for "this" implicit binding
    this.socket.setHook('onUpdateThingValue', (thingId, value) => {

      if (this.thingId !== thingId || this.deviceId !== value.deviceId) {
        return;
      }

      moment.locale('IT-it');
      this.setValue(value);
    });
  }
}
