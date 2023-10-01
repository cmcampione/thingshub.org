import * as moment from 'moment';
import { Component, OnInit, OnDestroy, LOCALE_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ThingsDataContext } from 'thingshub-js-sdk';
import { endPointAddress } from '../utils';
import { RealTimeConnectorService } from '../real-time-connector.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy  {

  apiLoaded: Observable<boolean>;
  
  private thingsDataContext: thingshub.ThingsDataContext;

  private thingKind = 'c3aa4d95-4cb4-415c-a251-7fe846e0fd17';
  private thingId = '';

  public deviceId = '087073117560';
  public surveyDateTime = '';
  public lastEventDateTime = '';
  public lastStatusMsg = '';

  public lat = 51.678418;
  public lng = 7.809007;

  markerPosition: google.maps.LatLngLiteral = {lat:this.lat, lng: this.lng}

  options: google.maps.MapOptions = {
    zoom: 16,
    mapTypeId: 'hybrid'
  };

  constructor(@Inject(LOCALE_ID) private locale: string,
    httpClient: HttpClient,
    private realTimeConnector: RealTimeConnectorService) {
      this.apiLoaded = httpClient.jsonp('https://maps.googleapis.com/maps/api/js?key=AIzaSyD11pjYHyE0ekfygLBNJhvL1FgUp9-twkQ', 'callback')
      .pipe(
        map(() => true),
        catchError(() => of(false)),
      );
    this.thingsDataContext = new ThingsDataContext(endPointAddress);
  }

  private setValue(value: any) {

    this.deviceId = value.deviceId;
    this.lastEventDateTime = moment(value.lastEventDateTime).format('L LTS');
    this.lastStatusMsg = value.lastStatus.message;
    this.surveyDateTime = moment(value.surveyDateTime).format('L LTS');
    this.lat = value.lat;
    this.lng = value.lng;

    this.markerPosition = {lat:value.lat, lng: value.lng}

    console.log(value);
  }

  private readonly onUpdateThingValue = (thingId, value, asCmd): void => {
    if (this.thingId !== thingId || this.deviceId !== value.deviceId) {
      return;
    }

    moment.locale('IT-it');
    this.setValue(value);
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

    this.realTimeConnector.realTimeConnectorRaw.setHook('onUpdateThingValue', this.onUpdateThingValue);
  }

  ngOnDestroy() {
    this.realTimeConnector.realTimeConnectorRaw.remHook('onUpdateThingValue', this.onUpdateThingValue);
  }
}
