$(document).ready(function(){



});




var fitbitAccessToken;
var sleepDate;


$(document).ready(function(){

    $(".graph-cont").hide();
    $("#sleep-graph-title").hide();
    $("#sleep-table").hide();
    $("#sleepData-section").hide();


    $("#apiCall").click(function(){

        window.location.replace("http://localhost:3000/auth/fitbit");
 
        var url = "/fitbitUser";
        $.ajax({
          url:url,
          type: "GET",

          success: function() {
              $("#json").html("API REQUEST MADE");

              $("#authorize-section").hide();
              $("#sleepData-section").show();
          }
        })
    });


    //Not working to hide authorize-section 
    $("authorize-button").click(function(){
        $("#authorize-section").hide();
        $("#sleepData-section").show();

    });


    if (window.location.hash){
        $("#authorize-section").hide();
        $("#sleepData-section").show();

    };   

    // $("#authorize-button").click(function(){
    //     if(!window.location.hash){
    //         window.location.replace("https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=228M9H&redirect_uri=http://ec2-52-14-184-86.us-east-2.compute.amazonaws.com/inhabit/fitbitApiTest.html&scope=activity%20nutrition%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=86400");
    //     }
    // });
    // if (window.location.hash){

    //     $("#authorize-section").hide();
    //     $("#sleepData-section").show();
    //     var fragmentQueryParameters = {};
    //     window.location.hash.slice(1).replace(
    //         new RegExp("([^?=&]+)(=([^&]*))?", "g"),
    //         function($0, $1, $2, $3) { fragmentQueryParameters[$1] = $3; }
    //     );
    //     fitbitAccessToken = fragmentQueryParameters.access_token;
    // };   
    

    $("#submit-sleep").click(function(){
        sleepDate = $("#input-sleep-date").val(); 
        console.log("submit-sleep works");
        console.log(sleepDate);

        fetch(
        'https://api.fitbit.com/1.2/user/-/sleep/date/'+sleepDate+'.json',
        {
                headers: new Headers({
                    'Authorization': 'Bearer ' + fitbitAccessToken
                }),
                mode: 'cors',
                method: 'GET'
        }).then(function(response){
            return response.json();

        }).then(function(j){


            
            var totalMinutesSleep = j['summary']['totalMinutesAsleep'];
            var totalDeepSleep = j['summary']['stages']['deep'];
            var totalLightSleep = j['summary']['stages']['light'];
            var totalRemSleep = j['summary']['stages']['rem'];
            var totalWakeSleep = j['summary']['stages']['wake'];

            var totalSleepWake = totalDeepSleep + totalLightSleep + totalRemSleep + totalWakeSleep;


            function graphPercentage(minutes){

                return Math.round((minutes/totalSleepWake)*100);
            }

            var graphDeepSleep = graphPercentage(totalDeepSleep);
            var graphLightSleep = graphPercentage(totalLightSleep);
            var graphRemSleep = graphPercentage(totalRemSleep);
            var graphWakeSleep = graphPercentage(totalWakeSleep);

            console.log(j);

            $(".graph-cont").show();
            $("#sleep-graph-title").show();
            $("#sleep-table").show();

            function hoursMinutes(min){
                var hours = Math.floor(min/60);
                var minute = min%60;

                if (hours === 0){
                    return minute+"m";

                }else{    
                    return hours+"h "+minute+"m";
                }
                
            }

            console.log("hours fixed");

            var minutesHoursTotal = hoursMinutes(totalMinutesSleep);
            var minutesHoursDeep = hoursMinutes(totalDeepSleep); 
            var minutesHoursLight = hoursMinutes(totalLightSleep);
            var minutesHoursRem = hoursMinutes(totalRemSleep);
            var minutesHoursWake = hoursMinutes(totalWakeSleep);


            $("#total-min-asleep").text(minutesHoursTotal);
            $("#total-deep-sleep").text(minutesHoursDeep);
            $("#total-light-sleep").text(minutesHoursLight);
            $("#total-rem-sleep").text(minutesHoursRem);
            $("#total-wake-sleep").text(minutesHoursWake);

            $("#deepSleep-percentage").text(graphDeepSleep+"%");
            $("#lightSleep-percentage").text(graphLightSleep+"%");
            $("#remSleep-percentage").text(graphRemSleep+"%");
            $("#wakeSleep-percentage").text(graphWakeSleep+"%");

            document.styleSheets[0].addRule('.bar4::after', 'max-width: ' + graphDeepSleep + '%;');
            document.styleSheets[0].addRule('.bar3::after', 'max-width: ' + graphLightSleep + '%;');
            document.styleSheets[0].addRule('.bar2::after', 'max-width: ' + graphRemSleep + '%;');
            document.styleSheets[0].addRule('.bar1::after', 'max-width: ' + graphWakeSleep + '%;');

        });

    });

});