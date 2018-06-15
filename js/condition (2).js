$(function(){


    var modelIdCookie  = getCookie("modelId");
    if(modelIdCookie.length){
        $("#pkcount").text(modelIdCookie.split(",").length);
    }else{
        $("#pkcount").text(0);
    }

    $("#pk").click(function(){
        /*var modelId="${dataMap.vehicleModel.modelId}";
         var outterId=$("#outter").find("a.aa").data("id");
         var innerId=$("#inner").find("a.aa").data("id");*/
        window.location.href=$("#ctx").val()+"/c/quicksearch/compare/view";//?modelId="+modelId+"&outterId="+outterId+"&innerId="+innerId;

    });
});

function getCookie(cname){
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++){
        var c = ca[i].trim();
        if (c.indexOf(name)==0) return c.substring(name.length,c.length);
    }
    return "";
}

