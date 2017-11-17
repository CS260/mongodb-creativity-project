var fitbitAccessToken;


var returnedSleepData;

$(document).ready(function(){

    $(".graph-cont").hide();
    $("#sleep-graph-title").hide();
    $("#sleep-table").hide();
    $("#sleepData-section").hide();



    //Update dropdown menu names
    var url = "/getUserNames";
        $.ajax({
            url:url,
            type: "GET",
            success: function(data,textStatus) {
                console.log(data);
                for(var i = 0; i < data.length; i++){
                    console.log(data[i].firstName);

                    var dropdownName = data[i].firstName;
                    var namesHtml;
                    namesHtml = "<option value="+dropdownName+">"+dropdownName+"</option>"
                    $("#input-sleep-date").append(namesHtml);
                }
           
            }
        
        });




    $("#apiCall").click(function(){

        window.location.href="http://localhost:3000/auth/fitbit";
 
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


  
    $("#authorize-button").click(function(){
        $("#authorize-section").hide();
        $("#sleepData-section").show();

    });


    if (window.location.hash){
        $("#authorize-section").hide();
        $("#sleepData-section").show();

    };   
    

    $("#submit-sleep").click(function(){
        
            var totalMinutesSleep;
            var totalDeepSleep;
            var totalLightSleep;
            var totalRemSleep;
            var totalWakeSleep;
            var sleepDate;


        var myobj = {date:$("#input-sleep-date").val()};
        jobj = JSON.stringify(myobj);

        var url = "/getFitbitSleep";
        $.ajax({
            url:url,
            type: "POST",
            data: jobj,
            contentType: "application/json; charset=utf-8",
            success: function(data,textStatus) {
                console.log(data);
                returnedSleepData = data;
                $(".graph-cont").empty();
            for(var i = 0; i < data[0].sleepData.length; i++)
            {
                totalMinutesSleep = data[0].sleepData[i].duration;
                totalDeepSleep = data[0].sleepData[i].totalDeepSleep;
                totalLightSleep = data[0].sleepData[i].totalLightSleep;
                totalRemSleep = data[0].sleepData[i].totalRemSleep;
                totalWakeSleep = data[0].sleepData[i].totalWakeSleep;
                sleepDate = data[0].sleepData[i].date;
            
                var totalSleepWake = totalDeepSleep + totalLightSleep + totalRemSleep + totalWakeSleep;

                function graphPercentage(minutes){

                    return Math.round((minutes/totalSleepWake)*100);
                }

                var graphDeepSleep = graphPercentage(totalDeepSleep);
                var graphLightSleep = graphPercentage(totalLightSleep);
                var graphRemSleep = graphPercentage(totalRemSleep);
                var graphWakeSleep = graphPercentage(totalWakeSleep);

                // console.log(j);

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

                var everything;
                everything = "<div>Date:"+sleepDate+"  </div>";
                everything += "<div>Total Time Asleep: "+totalMinutesSleep+" </div>";
                everything += "<div>Total Deep Sleep:: "+totalDeepSleep+" </div>";
                everything += "<div>Total Light Asleep: "+totalLightSleep+" </div>";
                everything += "<div>Total REM Asleep: "+totalRemSleep+" </div>";
                everything += "<div>Total Awake Time: "+totalWakeSleep+" </div>";
                $(".graph-cont").append(everything);
                
                everything = "<div class='day-graph'>";
                everything += "<div class='bar bar1' style='width: "+graphWakeSleep+"%; background: #f43c6e;'>Awake: "+graphWakeSleep+"%</div>";
                everything += "<div class='bar bar2' style='width: "+graphRemSleep+"%; background: #7ec4ff;'>REM: "+graphRemSleep+"%</div>";
                everything += "<div class='bar bar3' style='width: "+graphLightSleep+"%; background: #408dff;'>Light: "+graphLightSleep+"%</div>";
                everything += "<div class='bar bar4' style='width: "+graphDeepSleep+"%; background: #154aa6;'>Deep: "+graphDeepSleep+"%</div>"
                everything += "</div>";
                $(".graph-cont").append(everything);


            }

            }
         });

    });

});