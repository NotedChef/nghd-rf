import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'nghd-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Westeros County General Hospital';

  public constructor(private titleService: Title) {
    this.titleService.setTitle(this.title);
  }
}
