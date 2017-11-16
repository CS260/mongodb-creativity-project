$(document).ready(function(){

    $("#apiProfile").click(function(){

      var url = "/fitbitUser";
      $.ajax({
       url:url,
      type: "GET",

      success: function() {
          $("#json").html("API REQUEST MADE");
      }
      })
    });

});