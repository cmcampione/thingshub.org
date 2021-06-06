import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { HttpRequestCanceler } from 'thingshub-js-sdk';
import { ThingsService } from '../things.service';

@Component({
  selector: 'app-things',
  templateUrl: './things.component.html',
  styleUrls: ['./things.component.css'],
  providers: [
    { provide: 'thingKind', useValue: null },
    ThingsService,
  ]
})
export class ThingsComponent implements OnInit, OnDestroy {

  // ToDo: It will beuseful when in the future we could need to call "this.infiniteScroll.disabled"
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  private canceler = new HttpRequestCanceler();
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

  public async loadData(event) {
      try {
        await this.thingsService.thingsManager.getMoreThings(this.canceler);
      } catch (e) {
        console.log(e);
      }
      event.target.complete();
  }
}
