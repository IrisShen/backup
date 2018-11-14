import { Component, OnInit,Injectable,ViewEncapsulation} from '@angular/core';
import { FormControl,FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { HttpClient,HttpHeaders,HttpClientModule } from '@angular/common/http';
import { Observable,of } from 'rxjs';
import { debounceTime, distinctUntilChanged,map} from 'rxjs/operators';
import { RouterModule, Routes } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { isAbsolute, join } from 'path';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

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
  host_url = 'http://localhost:8080'
  ticket_url = `${this.host_url}/ticket`;
  

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
      this.showDetail = false;
      this.DetailTag = false;
      this.fav_list = [];

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
      this.showDetail = false;
      this.reset_highlight();
      this.fav_list = [];


  }

  errorEvent : boolean = false;
  noEvent : boolean = false;
  yesEvent : boolean = false;
  loadingData : boolean = false;
  showDetail : boolean = false;
  DetailTag : boolean = false;
 
  show_limit = 5;
  show = this.show_limit;
 

  getData() {
      return this.http.get(this.ticket_url,this.options);
  }

  auto_url =`${this.host_url}/auto`;

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
  highlight = [];

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
              // this.events.forEach(element => {
              for(let idata = 0;idata < this.events.length;idata++){
                let element = this.events[idata];
                let event_date = 'N/A';
                let event_time = '';
                if(element.hasOwnProperty('dates') && element.dates.hasOwnProperty('start')){
                  if(element.dates.start.hasOwnProperty('localDate')){
                    event_date = element.dates.start.localDate;
                    if(element.dates.start.hasOwnProperty('localTime')){
                      event_time =  element.dates.start.localTime;
                    }
                  }
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
                let artists = "";
                let artist_list = [];
                if(element.hasOwnProperty('_embedded') && element._embedded.hasOwnProperty('attractions')){
                  for(let ie =0;ie < element._embedded.attractions.length;ie++){
                    artist_list.push(element._embedded.attractions[ie].name);
                    if(!artists){
                      artists += element._embedded.attractions[ie].name;
                    } else{
                      artists += ' | ' +element._embedded.attractions[ie].name;
                    }
                  }
                }

                let seatmap = "";
                if(element.hasOwnProperty('seatmap')){
                  seatmap = element.seatmap.staticUrl;
                }

                let status = "";
                if(element.hasOwnProperty('dates') && element.dates.hasOwnProperty('status')){
                  status = element.dates.status.code;
                }

                let eventlink = "";
                if(element.hasOwnProperty('url')){
                  eventlink = element.url;
                }

                let priceRange = "";
                let currency = "";
                if(element.hasOwnProperty('priceRanges')){
                  let pmin = "";
                  let pmax = ""
                  // console.log(element.priceRanges[0])
                  currency = element.priceRanges[0].currency;

                  if(element.priceRanges[0].hasOwnProperty('min')){
                    pmin = element.priceRanges[0].min;
                  }
                  if(element.priceRanges[0].hasOwnProperty('max')){
                    pmax = element.priceRanges[0].max;
                  }
                  if(pmin && pmax){
                    priceRange = '$'+pmin + ' ~ ' + '$'+pmax;
                  } else if(pmin){
                    priceRange = '$'+pmin;
                  } else if(pmax){
                    priceRange = '$'+pmax;
                  }
                }


                let newData = {"name" : element.name,"abbr":element.name.length < 30?element.name:(element.name.substring(0,25)+'...'),
                  "date": event_date,"time":event_time, "category": event_cat,"artist":artists,"artist_list":artist_list,"eventlink":eventlink,"venue":venue,
                  "clicked":false,"seatmap":seatmap,"status":status,"price":priceRange,"currency":currency,"id":''};
                // console.log(newData.artist);
                this.outputData.push(newData);
                this.highlight.push(false);
                
                
              }

              this.outputData.sort((a,b) => { 
                let dateA = new Date(a.date);
                let dateB = new Date(b.date);
                return dateA - dateB;
              });
              // 
              let indx = 0
              this.outputData.forEach(element => {
                element.id = indx++;
              });
              console.log(this.outputData);

          }


    });
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

  detailTitle = "";
  detailArtist = "";
  detailVenue = "";
  detailDate : Date;
  detailTime = "";
  detailCat = "";
  detailPrice = "";
  detailStatus = "";
  detailUrl = "";
  detailSeat = "";
  artist_list = "";
  // detailCurrency = "";
  artist_detail_list = [];
  detail_index:number;

  reset_highlight(){
    for (let ih = 0; ih < this.highlight.length; ih++) {
      if(this.highlight[ih]){
        this.highlight[ih]= false;
      }
    }
  }

  displayDetail(ind){
    this.detail_index=ind;
    this.show = this.show_limit;
    this.reset_highlight();
    this.highlight[ind] = true;
    this.DetailTag = true;
    this.artist_detail_list = [];
    this.showDetail = true;
    this.yesEvent = false;
    console.log(ind);

    this.detailTitle = this.outputData[ind].name;
    this.detailVenue = this.outputData[ind].venue;
    this.detailCat = this.outputData[ind].category.replace('-',' | ');
    this.detailDate = new Date(this.outputData[ind].date);
    this.detailTime = this.outputData[ind].time;
    this.detailArtist = this.outputData[ind].artist;
    this.detailStatus = this.outputData[ind].status;
    this.detailUrl = this.outputData[ind].eventlink;
    this.detailSeat = this.outputData[ind].seatmap;
    this.detailPrice = this.outputData[ind].price;
    this.artist_list = this.outputData[ind].artist_list;
    // this.detailCurrency = this.outputData[ind].currency;
    // console.log(this.detailPrice);
    // console.log(this.detailSeat);
    // console.log(this.detailUrl);
    // console.log(this.artist_list);
    this.venue_detail(this.detailVenue);
    this.upcoming_detail(this.detailVenue);
    
      for(let il = 0; il < this.artist_list.length; il ++){
        let element = this.artist_list[il];
        // console.log(element);
        let art_name = element;
        let art_pop = '';
        let art_followers = '';
        let art_url = '';
        let art_images = [];
        if(this.detailCat.includes('Music')){
          let spotify_url =  `${this.host_url}/artistdetails`;
          this.http.get(spotify_url,{params:{keyword:element}}).subscribe(resp => {
            // console.log(JSON.parse(JSON.stringify(resp)));
            let artists_array = JSON.parse(JSON.stringify(resp)).artists.items;
            if(artists_array.length){
              let artist_detail;
              // console.log(artists_array);
              for(let ia = 0;ia < artists_array.length; ia++){
                if(artists_array[ia].name.toUpperCase() == element.toUpperCase()){
                  artist_detail = artists_array[ia];
                  break;
                }
              }
              art_pop = artist_detail.popularity;
              art_followers = artist_detail.followers.total.toLocaleString();
              art_url = artist_detail.external_urls.spotify;
            } 
          });
        }
        let search_url = `${this.host_url}/images`;
        this.http.get(search_url,{params:{keyword:element}}).subscribe(resp => {
          let images_array = JSON.parse(JSON.stringify(resp));
          for(let ilink = 0; ilink < images_array.length; ilink ++){
            // console.log(images_array[ilink].link);
            art_images.push(images_array[ilink].link);
          }
          // console.log(art_images);
          let new_artist = {'id':il,'art_name':art_name,'art_url':art_url,'art_pop':art_pop,'art_followers':art_followers,'art_images':art_images};
          this.artist_detail_list.push(new_artist);
          this.artist_detail_list.sort(function(a,b){return a.id - b.id});
        });
        
      
    }
    // console.log(this.artist_detail_list);
  }


  venue_add = "";
  venue_city = "";
  venue_number = "";
  venue_open = "";
  venue_rule = "";
  venue_child = "";
  venue_lat:number = 0;
  venue_lon:number = 0;

  reset_venue(){
    this.venue_add = "";
    this.venue_city = "";
    this.venue_number = "";
    this.venue_open = "";
    this.venue_rule = "";
    this.venue_child = "";
    this.venue_lat = 0;
    this.venue_lon = 0;
  }

  venue_detail(venue_name){
    this.reset_venue();
    let venue_url = `${this.host_url}/venue`;
    this.http.get(venue_url,{params:{keyword:venue_name}}).subscribe(resp => {
      let venue_info = JSON.parse(JSON.stringify(resp));
      if(venue_info.hasOwnProperty('empty')){
        console.log('Empty Venue Info!');
      } else if(venue_info.hasOwnProperty('error')){
        console.log('Error Venue Info!');
      } else{

        if(venue_info.hasOwnProperty('location')){
          this.venue_lat = parseFloat(venue_info.location.latitude);
          this.venue_lon = parseFloat(venue_info.location.longitude);
          // console.log(this.venue_lat,this.venue_lon);
        }

        if(venue_info.hasOwnProperty('address') && venue_info.address.hasOwnProperty('line1')){
          this.venue_add = venue_info.address.line1;
        }
        if(venue_info.hasOwnProperty('city'))
        this.venue_city = venue_info.city.name;
      } if(venue_info.hasOwnProperty('state')){
        this.venue_city += ', '+ venue_info.state.name;
      }
      if(venue_info.hasOwnProperty('boxOfficeInfo')){
        if(venue_info.boxOfficeInfo.hasOwnProperty('phoneNumberDetail')){
          this.venue_number = venue_info.boxOfficeInfo.phoneNumberDetail;
        }
        if(venue_info.boxOfficeInfo.hasOwnProperty('openHoursDetail')){
          this.venue_open = venue_info.boxOfficeInfo.openHoursDetail;
        }
      }

      if(venue_info.hasOwnProperty('generalInfo')){
        if(venue_info.generalInfo.hasOwnProperty('generalRule')){
          this.venue_rule = venue_info.generalInfo.generalRule;
        }
        if(venue_info.generalInfo.hasOwnProperty('childRule')){
          this.venue_child = venue_info.generalInfo.childRule;
        }
      }

      
    });
  }
  
  upcoming_events = [];
  upcoming_detail(venue_name){
    this.upcoming_events = [];
    let upcoming_url = `${this.host_url}/songkick`;
    this.http.get(upcoming_url,{params:{keyword:venue_name}}).subscribe(resp => {
      let res_events = JSON.parse(JSON.stringify(resp));
      // console.log(res_events);
      res_events.forEach(event => {
        let event_name = event.displayName;
        let event_uri = event.uri;
        let event_artist = event.performance[0].displayName;
        let event_date = new Date(event.start.date);
        let event_time = '';
        if(event.start.hasOwnProperty('time')){
          event_time = event.start.time;
        }
        let event_type = event.type;
        this.upcoming_events.push({'name':event_name,'date':event_date,'time':event_time,'type':event_type,'uri':event_uri,'artist':event_artist})
      });
    
    });
  }



 

  detailTag(){
    this.showDetail = true;
    this.yesEvent = false;
  }

  showList(){
    this.showDetail = false;
    this.yesEvent = true;
  }
}


