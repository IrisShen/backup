import { Component, OnInit } from '@angular/core';
import { FormControl,FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { HttpClient,HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'app-user-input',
  templateUrl: './user-input.component.html',
  styleUrls: ['../css/hw8.css','../css/bootstrap.min.css']
})


export class UserInputComponent {
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


    
    getData() {
        return this.http.get(this.ticket_url,this.options);
    }
    eventsData = {};
    onSubmit() {
        this.updateInput(); 
        console.log(this.options);
        this.getData().subscribe((resp) =>{
            console.log("received data from ticket master");
            this.eventsData = JSON.parse(JSON.stringify(resp));
            console.log(this.eventsData);

            if(this.eventsData.hasOwnProperty('error')){
                this.noEvent = false;
                this.errorEvent = true;
                console.log('ERROR!');
            } else if(this.eventsData.result.hasOwnProperty('_embedded')){
                this.errorEvent = false;
                this.noEvent = false;
                console.log(this.eventsData);
                console.log('GOT DATA!');
            } else {
                this.errorEvent = false;
                this.noEvent = true;
                console.log('NO DATA!');

            }

            // console.log(resp.result._embedded.events[0].name);//.events[0].name);

    });















    }

}

