import { BrowserModule } from '@angular/platform-browser';
import { NgModule} from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { MatTooltipModule,MatInputModule} from '@angular/material';
import {MatAutocompleteModule} from '@angular/material';
import {MatTabsModule} from '@angular/material/tabs';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { NgProgressModule} from '@ngx-progressbar/core'; 
import { RouterModule, Routes } from '@angular/router';
import {RoundProgressModule} from 'angular-svg-round-progressbar'
import 'hammerjs';
import { AgmCoreModule } from '@agm/core';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule, 
    HttpClientModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatInputModule,
    BrowserAnimationsModule,
    NgProgressModule.forRoot(),
    MatTabsModule,
    RouterModule,
    RoundProgressModule, 
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBkI-COCLg7jGjvVFFdF5On9dWPewHV5HQ'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
