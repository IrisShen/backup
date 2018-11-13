import { Component, OnInit,Injectable,ViewEncapsulation} from '@angular/core';
import { FormControl,FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { HttpClient,HttpHeaders,HttpClientModule } from '@angular/common/http';
import { Observable,of } from 'rxjs';
import { debounceTime, distinctUntilChanged,map} from 'rxjs/operators';
import { RouterModule, Routes } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  // template : `<ngx-loading-bar></ngx-loading-bar>`,
  styleUrls: ['./css/bootstrap.min.css','./css/hw8.css'],
  //imports: [MatTooltipModule]
})

export class AppComponent{
  user_loc = {user_lat: '',user_lon:''};
  ip_api_url = 'http://ip-api.com/json';
  req_query = {};
  ticket_url = 'http://localhost:8080/ticket';

  constructor (private http: HttpClient){}

  getUserLoc(){
    return this.http.get(this.ip_api_url);
  }

  ngOnInit() {
    this.getUserLoc().subscribe((data) => this.user_loc = {
      user_lat: data['lat'],
      user_lon: data['lon']
    });

  }
  
  init_value = { keyword: '', category: 'All', distance: '', unit:'miles',locationRadios: 'option1',locationInput:{value:'',disabled:true}};
  user_value = { keyword: '', category: 'All', distance: '10', unit:'miles',locationRadios: 'option1',user_lat: this.user_loc.user_lat, user_lon: this.user_loc.user_lon,input_loc:''};
  options = {params:this.user_value};
  auto_options = [];
  fav_list = [];

  disableOn: boolean = true;

      user_input = new FormGroup({
          // 'keyword' : new FormControl(this.init_value.keyword,{validators: [Validators.required], updateOn:'blur'}),
          'keyword' : new FormControl(this.init_value.keyword,{validators: [Validators.required]}),
          'category' : new FormControl(this.init_value.category),
          'distance': new FormControl(this.init_value.distance),
          'unit' : new FormControl(this.init_value.unit),
          'locationRadios' : new FormControl('option1'),
          'locationInput' : new FormControl({value:'',disabled:true},{validators: [Validators.required]})
  });
 
  updateEdit(){
      if(this.user_input.value.locationRadios == 'option1'){
          this.disableOn = true;
          this.locationInput.reset({value:'',disabled:this.disableOn});
      } else{
          this.disableOn = false;
          this.locationInput.reset({value:'',disabled:this.disableOn});

      }
      return;
  }
  
  resetForm(){
      this.user_input.reset(this.init_value);
      this.errorEvent = false;
      this.noEvent = false;
      this.yesEvent = false;
      this.auto_options = [];
      // this.locationInput.reset({value:'',disabled:true});

  }

  get keyword() { return this.user_input.get('keyword'); }
  
  get category() { return this.user_input.get('category'); }

  get distance() { return this.user_input.get('distance'); }

  get unit() { return this.user_input.get('unit'); }

  get locationRadios() { return this.user_input.get('locationRadios'); }

  get locationInput() { return this.user_input.get('locationInput'); }

  updateInput(){
      this.user_value = {
          keyword: this.keyword.value,
          category: this.category.value,
          distance: this.distance.value?this.distance.value:'10',
          unit: this.unit.value,
          locationRadios: this.locationRadios.value,
          user_lat: this.user_loc.user_lat,
          user_lon: this.user_loc.user_lon,
          input_loc:this.locationInput.value?this.locationInput.value:'None'
      }
      this.options = {params:this.user_value};

  }

  errorEvent : boolean = false;
  noEvent : boolean = false;
  yesEvent : boolean = false;
  loadingData : boolean = false;

 

  getData() {
      return this.http.get(this.ticket_url,this.options);
  }

  auto_url =`http://localhost:8080/auto`;

  onType(){
    if(!this.keyword.value){
      this.auto_options = [];
    } else{
    let auto_req = {params:{keyword:this.keyword.value}};

    this.http.get(this.auto_url,auto_req).subscribe((auto_resp) =>{
      this.auto_options = JSON.parse(JSON.stringify(auto_resp));
      // console.log(this.keyword.value);
      // console.log(this.auto_options);
    });
  }
  }



  eventsData = {};
  events = [];
  clicked = [];
  outputData =[];

  stopLoading(){
    this.loadingData = false;
  }
  onSubmit() {
      this.updateInput();
      // console.log(this.options);
      this.loadingData = true;
      setTimeout(this.stopLoading, 100000);
      this.getData().subscribe((resp) =>{
          this.eventsData = JSON.parse(JSON.stringify(resp));
          // console.log(this.eventsData);

          if(this.eventsData.hasOwnProperty('error')){
              this.noEvent = false;
              this.errorEvent = true;
              this.yesEvent = false;
              console.log('ERROR!');
          } else if(!this.eventsData.hasOwnProperty('_embedded')){
            this.yesEvent = false;
            this.errorEvent = false;
            this.noEvent = true;
            console.log('NO DATA!');
          } else if(this.eventsData.hasOwnProperty('_embedded')){
              this.errorEvent = false;
              this.noEvent = false;
              this.yesEvent = true;
              this.events = this.eventsData._embedded.events;
              // console.log(this.events);
              this.outputData = [];
              // console.log(this.eventsData);
              console.log('GOT DATA!');
              // console.log(this.outputData);
              this.events.forEach(element => {
                let event_date = 'N/A';
                if(element.hasOwnProperty('dates') && element.dates.hasOwnProperty('start') && element.dates.start.hasOwnProperty('localDate')){
                  event_date = element.dates.start.localDate;
                }
                let event_cat = 'N/A';
                let genre = '';
                let segment = '';
                let venue = '';
                // let seatmap = '';
                if(element.hasOwnProperty('classifications') && element.classifications[0].hasOwnProperty('genre') && element.classifications[0].genre.hasOwnProperty('name')){
                  genre = element.classifications[0].genre.name;
                }
                if(element.hasOwnProperty('classifications') && element.classifications[0].hasOwnProperty('segment') && element.classifications[0].segment.hasOwnProperty('name')){
                  segment = element.classifications[0].segment.name;
                }
                if(genre && segment && genre!='Undefined' && segment != 'Undefined') {
                  event_cat = `${genre}-${segment}`;
                } else if(genre && genre!='Undefined'){
                  event_cat = genre;
                } else if(segment && segment != 'Undefined'){
                  event_cat = segment;
                }
                if(element.hasOwnProperty('_embedded') && element._embedded.hasOwnProperty('venues') && element._embedded.venues[0].hasOwnProperty('name')){
                  if(element._embedded.venues[0].name != 'Undefined'){
                    venue = element._embedded.venues[0].name;
                  }
                }
                
                let newData = {"name" : element.name,"abbr":element.name.length < 30?element.name:(element.name.substring(0,25)+'...'),
                  "date": event_date, "category": event_cat,"eventlink":'',"venue":venue,"clicked":false};
                // console.log(newData.abbr);
                this.outputData.push(newData);

                
              });

              this.outputData.sort((a,b) => { 
                let dateA = new Date(a.date);
                let dateB = new Date(b.date);
                return dateA - dateB;
              });
              // console.log(this.outputData);

          }


    });
    this.loadingData = false;

  } 

  addFav(dt){
      if(dt.clicked == true){
        this.fav_list.push(dt);
      } else{
        this.fav_list.splice(this.fav_list.indexOf(dt),1);
      }
  }

  liked = "assets/images/baseline_star_border_black_24dp.png";
  disliked= "assets/images/baseline_star_white_24dp.jpg";

  displayDetail(ind){
    console.log(`index is ${ind}`);
  }
}

