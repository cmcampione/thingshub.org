import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  toggle = new Subject();

  open() {
    this.toggle.next();
  }

}
