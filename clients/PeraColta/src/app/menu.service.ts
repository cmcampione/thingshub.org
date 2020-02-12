import { Injectable } from '@angular/core';
import { Observable ,  Subject } from 'rxjs';

@Injectable()
export class MenuService {

  toggle = new Subject();
  
  open() {
    this.toggle.next();
  }

}
