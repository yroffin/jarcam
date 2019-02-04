import { Component, OnInit } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/services/utility/decorators';

@AutoUnsubscribe()
@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
