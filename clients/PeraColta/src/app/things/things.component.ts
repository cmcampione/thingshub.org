import { Component, OnInit, OnDestroy } from '@angular/core';
import * as thingshub from 'thingshub-js-sdk';
import { ThingsService } from '../things.service';

@Component({
  selector: 'app-things',
  templateUrl: './things.component.html',
  styleUrls: ['./things.component.css'],
  providers: [ThingsService,
    { provide: 'thingKind', useValue: 'c3aa4d95-4cb4-415c-a251-7fe846e0fd17' }
  ]
})
export class ThingsComponent implements OnInit, OnDestroy {

  private canceler = new thingshub.HttpRequestCanceler();
  public things: thingshub.Thing[];

  constructor(private readonly thingsService: ThingsService) {
      this.things = this.thingsService.mainThing.children;
  }

  async ngOnInit() {
    this.thingsService.init();
    await this.thingsService.thingsManager.getMoreThings(this.canceler);
  }

  ngOnDestroy() {
    this.thingsService.done();
  }

  public async recall() {
      try {
        await this.thingsService.thingsManager.getMoreThings(this.canceler);
      } catch (e) {
        console.log(e);
      }
  }
}
