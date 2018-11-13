$(document).ready(function(){
    $.ajax({
            type:'post',
            url: 'http://ip-api.com/json',
            dataType: 'json',
            data: { get_param: 'value' },                 crossDomain:true,
            success: function(data){
                $("#search_btn").prop("disabled",false);
                var usr_lat = data.lat;
                var usr_lng = data.lon;                    console.log("User location:",usr_lat,usr_lng);
            }  
        });
});
