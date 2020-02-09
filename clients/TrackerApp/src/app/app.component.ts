import { Component, ViewChild, OnDestroy } from '@angular/core';
import { SidePageComponent } from './side-page/side-page.component';
import { ContentPageComponent } from './content-page/content-page.component';
import { MenuService } from './menu.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {

  public sidePage    = SidePageComponent;
  public contentPage = ContentPageComponent;

  @ViewChild('splitter', {static: false}) splitter;

  constructor(private menuService: MenuService) {
    this.menuService.toggle.subscribe(() => this.splitter.nativeElement.side.open());
  }

  ngOnDestroy() {
    //this.realTimeConnector.realTimeConnectorRaw.unsubscribe();
  }
}
