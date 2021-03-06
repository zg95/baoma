$(function(){

    $.getProvince();

    if($("#provinceCode").val().length){
        $.getCitys($("#provinceCode").val());
    }else{
        $('div[data-name="s_city"]').find('input').val('请选择');
        $("#s_city").append("<li data-value=''>请选择</li>");
    }


    $('div[data-name="s_city"]').click(function(e){
        $('[data-name="s_city"]').find('ul').hide();
        $(this).find('span').removeClass('nice-select-spanDown').addClass('nice-select-spanUp');
        $(this).find('ul').show();
        e.stopPropagation();
    });
    $('div[data-name="s_city"] span').click(function(e){
        if($(this).hasClass('nice-select-spanDown')){
            $(this).next('ul').show();
            $(this).removeClass('nice-select-spanDown').addClass('nice-select-spanUp');
        }else{
            $(this).next('ul').hide();
            $(this).removeClass('nice-select-spanUp').addClass('nice-select-spanDown');
        }

        e.stopPropagation();
    });
    $(document).click(function(){
        $('div[data-name="s_city"] ul').hide();
        $('div[data-name="s_city"]').find('span').removeClass('nice-select-spanUp').addClass('nice-select-spanDown');
    });

    //查询车系
    $.getSeries();

    $("#h_modelrange").hide();

    $.getOutterColor();

    $.getInnerColor();

    if($("#series").val().length){
        $.getModelrange();
    }
    //开始查询
    $.getList();

    //加载更多

    $("#loadmore").click(function(){
        $("#page").val(parseInt($("#page").val())+1);
        $.getList();
    });

    $("#unlimit_series").click(function(){
        $("#d_series a").css({background:"",color:""});
        $("#rangeId").val("");
        $("#h_modelrange").hide();
        $("#series").val("");
        $.getOutterColor();
        $.getInnerColor();
        //开始查询
        $.getList();
    });

    $("#unlimit_modelrange").click(function(){
        $("#d_modelrange div").find("img").removeClass("nochoBorder");
        $("#rangeId").val("");
        $.getOutterColor();
        $.getInnerColor();
        //开始查询
        $.getList();
    });

    $("#unlimit_price").click(function(){
        $("#modelPriceStart").val("");
        $("#modelPriceEnd").val("");
        $('.slider').slider({values:[0,5]});

        //开始查询
        $.getList();
    });

    $("#unlimit_credit").click(function(){
        $("#cmSupplyStart").val("");
        $("#cmSupplyEnd").val("");
        $('.sliderMonth').slider({values:[0,5]});

        //开始查询
        $.getList();
    });

    $("#unlimit_outter").click(function(){
        $("#d_outter img").removeClass("nochoBorder");
        $("#outterId").val("");
        //开始查询
        $.getList();
    });

    $("#unlimit_inner").click(function(){
        $("#d_inner img").removeClass("nochoBorder");
        $("#innerId").val("");
        //开始查询
        $.getList();
    });

    $("#resetBtn").click(function(){
        $('div[data-name="s_province"]').find('input').val("请选择");
        $('div[data-name="s_city"]').find('input').val("请选择");
        $('div[data-name="m_series"]').find('input').val("车系");
        $('div[data-name="m_modelrange"]').find('input').val("车型");
        $("#s_city").html("").append("<li data-value=''>请选择</li>");
        $("#m_modelrange").html("").append("<li data-value=''>车型</li>");
        $("#h_modelrange").hide();
        $('.slider').slider({values:[0,5]});
        $('.sliderMonth').slider({values:[0,5]});
        $("#provinceCode").val("");
        $("#cityCode").val("");
        $("#series").val("");
        $("#rangeId").val("");
        $("#outterId").val("");
        $("#innerId").val("");
        $("#modelPriceStart").val("");
        $("#modelPriceEnd").val("");
        $("#cmSupplyStart").val("");
        $("#cmSupplyEnd").val("");
        $("#page").val("1");
        $("#sort").val("ASC");
        $("#d_series a").css({background:"",color:""});
        $("#s_province").val("");
        $("#s_city").val("");
        //开始查询
        $.getList();
        $.getOutterColor();
        $.getInnerColor();


    });

    var tempGross="";
    $("#setSort").click(function(){
        var sort=$("#sort").val();
        if($("#sortName").val()!="GROSSPRICE"&&tempGross.length<1){
            sort="ASC";
        }
        $("#sortName").val("GROSSPRICE");
        if(tempGross.length){
            if(tempGross=="ASC"){
                $("#sort").val("DESC");
                tempGross="DESC";
            }else{
                $("#sort").val("ASC");
                tempGross="ASC";
            }
        }else{
            if(sort=="ASC"){
                $("#sort").val("DESC");
                tempGross="DESC";
            }else{
                $("#sort").val("ASC");
                tempGross="ASC";
            }
        }
        $("#page").val("1");
        stm_clicki('send', 'event', 'SearchPage', 'Sort-Price', tempGross);//监测销售价格排序按钮
        $.getList();

    });
    var temSupply="";
    $("#supplySort").click(function(){
        var sort=$("#sort").val();
        if($("#sortName").val()!="CMSUPPLY"&&temSupply.length<1){
            sort="ASC";
        }
        $("#sortName").val("CMSUPPLY");
        if(temSupply.length){
            if(temSupply=="ASC"){
                $("#sort").val("DESC");
                temSupply="DESC";
            }else{
                $("#sort").val("ASC");
                temSupply="ASC";
            }
        }else{
            if(sort=="ASC"){
                $("#sort").val("DESC");
                temSupply="DESC";
            }else{
                $("#sort").val("ASC");
                temSupply="ASC";
            }
        }
        $("#page").val("1");
        stm_clicki('send', 'event', 'SearchPage', 'Sort-Monthly', temSupply);//监测月供价格排序按钮
        $.getList();
    });
});



//根据订单查询
$.getList=function(){

    $('.popover').remove();
    $('.modleMouth').remove();
    $.ajax({
        url:$("#ctx").val()+"/c/quicksearch/search/list",
        data:$("#searchForm").serialize(),
        type:'post',
        success:function(data){
            if(data&&data.models.length){
                var html="";
                var count=data.count;
                $.each(data.models,function(index,item){
                    var outterid=[];
                    var outterName=[];
                    $.each(data.colors,function(cindex,citem){
                        if(citem.modelid==item.modelId){
                            if($.inArray(citem.outterid,outterid)<0){
                                outterid.push(citem.outterid);
                                outterName.push(citem.outtername);
                            }
                        }

                    });
                    html+='<div class="row row-main-list row-select-resault hoverRow" onclick="getVehicle(\''+item.modelId+'\')">';/**/

                    html+='<div class="col-md-3 col-xs-6 text-center "><img class="img-responsive" src="'+item.outterUrl+'" class="cat"></div>';

//					html+='<div class="col-md-3 col-xs-6 text-center "><img class="img-responsive" src="'+$("#ctx").val()+'/images/show_1.jpg" class="cat"></div>';
                    html+=' <div class="col-md-9 col-xs-6">';
                    html+='<div class="row">';
                    html+='<div class="col-md-3 col-xs-12 font-11 namePlan " onclick="getVehicle(\''+item.modelId+'\')">'+item.modelName+'</div>';
                    html+=' <div class="col-md-3 col-xs-12 font-11"><span class="visible-xs">建议零售价:</span><span class="pull-left" style="color:#1c69d4;margin-right:5px;" onclick="getVehicle(\''+item.modelId+'\')">¥ '+$.formatNum(item.grossPrice)+'</span>';
                    html+='<a href="javascript:;" data-container="body" data-toggle="popover" data-placement="bottom" data-trigger="focus"  data-content="本页所示的价格为BMW公认的建议零售价， 并将根据具体车辆的配置不同相应变动，详细信息请洽讯当地BMW授权经营商，BMW保留不经事先通知随时变更上述建议零售价的权利。">';
                    html+='<span class="hidden-xs price-title" title="本页所示的价格为BMW公认的建议零售价， 并将根据具体车辆的配置不同相应变动，详细信息请洽讯当地BMW授权经营商，BMW保留不经事先通知随时变更上述建议零售价的权利。"></span></a>';
                    html+='<div class="priceSpan col-xs-3"><span class="visible-xs price-title ptipshow'+item.modelId+'" onclick="ptipshow(\''+item.modelId+'\')" title="本页所示的价格为BMW公认的建议零售价， 并将根据具体车辆的配置不同相应变动，详细信息请洽讯当地BMW授权经营商，BMW保留不经事先通知随时变更上述建议零售价的权利。"></span></div>';
                    html+='</div>';
                    if(item.cmSupply!=0){
                        html+=' <div class="col-md-3 col-xs-12 font-11"><span class="visible-xs">月供:</span><span class="pull-left" style="color:#1c69d4;margin-right:5px;" onclick="getVehicle(\''+item.modelId+'\')">¥ '+$.formatNum(item.cmSupply)+'</span>';
                        html+='<a href="javascript:void(0);">';
                        html+='<span class="hidden-xs price-title priceMouth" data-pop="1" data-trigger="manual" title="" data-show="0" data-var="'+item.modelId+'" data-container="body" data-monthlyprice="'+item.cmSupply+'"  data-placement="right" data-content=""></span></a>';
                        html+='<div class="showdeSpan col-xs-3" data-var="'+item.modelId+'"  data-monthlyprice="'+item.cmSupply+'"><span class="visible-xs price-title mtipshow'+item.modelId+'"></span></div>';
                        html+='</div>';
                    }else{
                        html+=' <div class="col-md-3 col-xs-12  font-11"></div>';
                    }
                    html+=' <div class="col-md-3 col-xs-12 color_icon font-11 carColor ">';
                    html+='<span class="visible-xs">车身颜色:</span>';
                    $.each(outterid,function(cindex,citem){

                        //	if(citem.isupload==1){
                        html+='<a href="javascript:void(0);" title="'+outterName[cindex]+'"><img  width="29" height="23"  src="'+$("#ctx").val()+'/c/image/show?optionId='+citem+'&prefix=&findex=1"></a>';
//						html+='<a href="javascript:void(0);" title="'+outterName[cindex]+'"><img  width="29" height="23"  src="'+$("#ctx").val()+'/images/show_color.png"></a>';
                        /*
                         }else{
                         html+='<a href="javascript:void(0);" title="'+citem.cnname+'"><img  width="29" height="23"  src="'+citem.imageurl+'"></a>';
                         }*/
                    });
                    html+=' </div></div></div></div>';
                    /*if(item.cmSupply!=0){
                     html+='<div class="priceSpan col-xs-offset-6 col-xs-6"><span class="visible-xs price-title ptipshow'+item.modelId+'" onclick="ptipshow(\''+item.modelId+'\')" title="此价格为针对基本款"></span></div>';
                     html+='<div class="showdeSpan col-xs-offset-6 col-xs-6" data-var="'+item.modelId+'"  data-monthlyprice="'+item.cmSupply+'"><span class="visible-xs price-title mtipshow'+item.modelId+'"></span></div>';
                     }else{
                     html+='<div class="priceSpan col-xs-offset-6 col-xs-6" style="top:-76px;"><span class="visible-xs price-title ptipshow'+item.modelId+'" onclick="ptipshow(\''+item.modelId+'\')" title="此价格为针对基本款"></span></div>';
                     }*/
                    html+=' <div class="row modleMouth">';
                    html+=' </div>';


                });

                $(".marginTop .priceSpan").css("top","-76px !important;");


                $("#count").empty();
                $("#count").text(count);
                if($("#page").val()==1){
                    $(".selectMain").find("div.row-main-list").remove();
                    $(".selectMain").find("div.priceSpan").remove();
                    $(".selectMain").find("div.showdeSpan").remove();
                }
                $("#loadmore").before(html);
                if(data.length<10||parseInt($("#page").val())*10>=count){
                    $("#loadmore").hide();
                }else{
                    $("#loadmore").show();
                }
            }else{
                if($("#page").val()==1){
                    $(".selectMain").find("div.row-main-list").remove();
                }
                $("#count").text(0);
                $("#loadmore").before('<div class="row row-main-list row-select-resault hoverRow" style="text-align:center">暂无相关数据</div>');
                $("#loadmore").hide();
            }
            getCase();
        }

    });

}

function getCase(){
    var $this = $(".priceMouth[data-pop='1']");
    $this.click(function(event){
        var obj=$(this);
        if($(obj).data("show")=="0"){
            $.ajax({
                url:$("#ctx").val()+'/c/quicksearch/sfdetail',
                type:'post',
                data:{modelId:obj.data("var"),monthlyPrice:obj.data("monthlyprice")},
                success:function(data){
                    if(data){
                        var caseHtml = '<div class="row modleMouth"><div class="row col-md-12 col-ox-12 modleTitle">'+data.sub_Prod_Name
                            +'<span class="popover-hide"></span></div><div style="clear:both;"></div><div class="row col-md-12 col-ox-12 modleText">建议零售价：<span>￥'+$.formatNum(data.modelPrice)
                            +'</span></div><div class="row col-md-12 col-ox-12 modleText">首付金额'+data.downpay_Pct+'%：<span>￥'+$.formatNum(data.downpay_Amt)
                            +'</span></div><div class="row col-md-12 col-ox-12 modleText">贷款期限：<span>'+data.term
                            +'</span></div><div class="row col-md-12 col-ox-12 modleText">客户月供：<span>￥'+$.formatNum(data.monthly_Installment);
                        if(data.bonus_Amt || data.bonus_Amt!=0 ){
                            caseHtml+='</span></div><div class="row col-md-12 col-ox-12 modleText">年度还款：<span>￥'+$.formatNum(data.bonus_Amt)+'</span></div></div>';
                        }
                        if(data.balloon_Amt || data.balloon_Amt!=0 ){
                            caseHtml+='</span></div><div class="row col-md-12 col-ox-12 modleText">尾款金额：<span>￥'+$.formatNum(data.balloon_Amt)+'</span></div></div>';
                        }
                        obj.attr('data-content',caseHtml).popover({html : true });
                        obj.popover('show');
                        obj.data("show","1");
                        closeCase(obj);
                    }
                }
            });
        }else{
            obj.popover('destroy');
            obj.data("show","0");
        }
        event.stopPropagation();
    });
    /**/
    $('.showdeSpan').click(function(event){
        var obj=$(this);
        var modelId=obj.data("var");
        var monthlyprice=obj.data("monthlyprice");
        $.ajax({
            url:$("#ctx").val()+'/c/quicksearch/sfdetail',
            type:'post',
            data:{modelId:modelId,monthlyPrice:monthlyprice},
            success:function(data){
                if(data){
                    var mobileHtml=' <div class="col-md-12 col-ox-12 modleTitle">'+data.sub_Prod_Name+'<span></span></div>';
                    mobileHtml+=' <div class="col-md-6 col-ox-6 modleText">建议零售价：<span>￥'+$.formatNum(data.modelPrice)+'</span></div>';
                    mobileHtml+=' <div class="col-md-6 col-ox-6 modleText">首付金额'+data.downpay_Pct+'%：<span>￥'+$.formatNum(data.downpay_Amt)+'</span></div>';
                    mobileHtml+=' <div class="col-md-6 col-ox-6 modleText">贷款期限：<span>'+data.term+'</span></div>';
                    mobileHtml+=' <div class="col-md-6 col-ox-6 modleText">客户月供：<span>￥'+$.formatNum(data.monthly_Installment)+'</span></div>';
                    if(data.bonus_Amt || data.bonus_Amt!=0 ){
                        mobileHtml+=' <div class="col-md-12 col-ox-12 modleText">年度还款：<span>￥'+$.formatNum(data.bonus_Amt)+'</span></div>';
                    }
                    if(data.balloon_Amt || data.balloon_Amt!=0 ){
                        mobileHtml+=' <div class="col-md-12 col-ox-12 modleText">尾款金额：<span>￥'+$.formatNum(data.balloon_Amt)+'</span></div>';
                    }


                    $(obj).parents('.hoverRow').next(".modleMouth").html("").append(mobileHtml).css('display','block');
                    modleClose();
                }
            }
        });
        event.stopPropagation();
    });
}
function modleClose(){
    $('.modleMouth .modleTitle span').click(function(event){
        event.stopPropagation();
        $(this).parents('.modleMouth').css('display','none');
    })
}
function closeCase(obj){
    $('.popover-content .modleMouth .modleTitle span').click(function(event){
        event.stopPropagation();
        $(obj).data("show","0");
        $(obj).popover('destroy');
    })
}

function getVehicle(modelId){
    //获取省市
    var provinceName=$("[data-name='s_province']>input").val();
    var cityName=$("[data-name='s_city']>input").val();
    var provinceCode=$("#provinceCode").val();
    var cityCode=$("#cityCode").val();
    if(provinceCode.length){
        window.location.href=$("#ctx").val()+"/c/quicksearch/vehicles?modelId="+modelId+"&provinceName="+provinceName+
            "&cityName="+cityName+"&provinceCode="+provinceCode+
            "&cityCode="+cityCode;
    }else{
        window.location.href=$("#ctx").val()+"/c/quicksearch/vehicles?modelId="+modelId;
    }
}


function setCookie(cname,cvalue,exdays)
{
    var d = new Date();
    d.setTime(d.getTime()+(exdays*24*60*60*1000));
    var expires = "expires="+d.toGMTString();
    document.cookie = cname + "=" + escape(cvalue) + ";" + expires;
}



function ptipshow(modelId,e){
    var evt = e ? e : window.event;
    layer.tips('本页所示的价格为BMW公认的建议零售价， 并将根据具体车辆的配置不同相应变动，详细信息请洽讯当地BMW授权经营商，BMW保留不经事先通知随时变更上述建议零售价的权利。',$(".ptipshow"+modelId),{tips:[4,'#1c69d4'],time:2000});
    evt.stopPropagation();
}
function mtipshow(modelId,e){
    var evt = e ? e : window.event;
    layer.tips('此价格为针对基本款的金融月供方案',$(".mtipshow"+modelId),{tips:[2,'#1c69d4'],time:2000});
    evt.stopPropagation();
}
//查询省
$.getProvince=function(){
    var provinceCode=$("#provinceCode").val();
    $.ajax({
        url:$("#ctx").val()+"/c/quicksearch/search/provinces",
        /*data:{},token:$("#token").val()*/
        type:'post',
        cache:true,
        success:function(data){
            if(data){
                $("#s_province").html("");
                $("#s_province").append("<li data-value=''>请选择</li>");
                $('div[data-name="s_province"]').find('input').val('请选择');
                $.each(data,function(index,item){
                    if(provinceCode.length&&item.dloId==provinceCode){
                        $('div[data-name="s_province"]').find('input').val(item.cnName);
                        $("#s_province").append('<li data-value="'+item.dloId+'">'+item.cnName+'</li>');
                    }else{
                        $("#s_province").append('<li data-value="'+item.dloId+'">'+item.cnName+'</li>');
                    }
                });
                $.bindProvince();
            }
        }
    });
}
//查询市
$.getCitys=function(pid){
    var cityCode=$("#cityCode").val();
    $.ajax({
        url:$("#ctx").val()+"/c/quicksearch/search/citys",
        data:{pid:pid},
        type:'post',
        success:function(data){
            if(data){
                $("#s_city").html("");
                $("#s_city").append("<li data-value=''>请选择</li>");
                $('div[data-name="s_city"]').find('input').val('请选择');
                $.each(data,function(index,item){
                    if(cityCode==""||cityCode==null){
                        $('div[data-name="s_city"]').find('input').val('请选择');
                    }
                    if(cityCode.length&&item.dloId==cityCode){
                        $('div[data-name="s_city"]').find('input').val(item.cnName);
                        $("#s_city").append('<li data-value="'+item.dloId+'">'+item.cnName+'</li>');
                    }else{

                        $("#s_city").append('<li data-value="'+item.dloId+'">'+item.cnName+'</li>');
                    }
                });
                $.bindCitys();
            }else{
                $("#s_city").html("");
                $("#s_city").append("<li data-value=''>请选择</li>");
                $('div[data-name="s_city"]').find('input').val('请选择');
            }
        }
    });
}
//查询车系
$.getSeries=function(){
    var series=$("#series").val();
    $.ajax({
        url:$("#ctx").val()+"/c/quicksearch/search/series",
        type:'post',
        async:false,
        success:function(data){
            if(data){
                $("#d_series").html("");
                $("#m_series").html("").append("<li data-value=''>车系</li><li data-value='5' class='disableLi'>5系</li>");
                $('div[data-name="m_series"]').find('input').val('车系');
                $("#m_modelrange").html("").append("<li data-value=''>车型</li>");
                $('div[data-name="m_modelrange"]').find('input').val('车型');
                $.each(data,function(index,item){

                    $("#d_series").append('<a  data-series="'+item.series+'" class="disableLi" href="javascript:void(0);">'+item.name_+'系</a>');
                    /*$("#m_series").append('<li data-value="'+item.series+'" class="disableLi">'+item.name_+'系</li>');*/
                    if(series.length&&item.series==series){
                        $('div[data-name="m_series"]').find('input').val(item.name_+'系');
                    }

                });
                $.bindSeries();

            }
        }
    });
    //pc限制车款选择
    $('div#d_series a').hover(function(e){
        var liN = $(this).attr('data-series');

        if(liN == "5"||liN == ""){
            $(this).removeClass('disableLi');
        }else{
            $(this).removeClass('on');
        }
        if($(this).hasClass('disableLi')){
            $(this).unbind();
        }
        e.stopPropagation();
    });
    //m限制车款选择
    $('div[data-name="m_series"] li').hover(function(e){
        var liN = $(this).attr('data-value');

        if(liN == "5"||liN == ""){
            $(this).removeClass('disableLi');
        }else{
            $(this).removeClass('on');
        }
        if($(this).hasClass('disableLi')){
            $(this).unbind();
        }
        e.stopPropagation();
    });

    $("#d_series a").click(function(){
        $("#series").val($(this).data("series"));
        $('div[data-name="m_series"]').find('input').val($(this).text());
        $('div[data-name="m_modelrange"]').find('input').val('');
        $("#rangeId").val("");
        $.getModelrange();
        $.getOutterColor();
        $.getInnerColor();
        $("#outterId").val("");
        $("#innerId").val("");
        $("#page").val(1);
        //查询
        $.getList();
    });
}
//获取车型
$.getModelrange=function(){
    var seriesid = $("#series").val();
    $("#d_series a").css({background:"",color:""});
    $("#d_series a[data-series='"+seriesid+"']").css({background:"#1c69d4",color:"#fff"});
    /*$("#d_series a").each(function(){
     var seriesaid = $(this).attr("data-series");
     if(seriesid == seriesaid){
     $(this).css({background:"#1c69d4",color:"#fff"});
     $(this).siblings("a").css({background:"",color:""});
     }
     })*/
    /**/
    $("#h_modelrange").show();
    var rangeId=$("#rangeId").val();
    $.ajax({
        url:$("#ctx").val()+"/c/quicksearch/search/modelrange",
        data:{series:seriesid},
        type:'post',
        async:false,
        success:function(data){
            if(data){
                $("#d_modelrange").html("");
                $("#m_modelrange").html("").append("<li data-value=''>车型</li>");
                $('div[data-name="m_modelrange"]').find('input').val('车型');
                $.each(data,function(index,item){
                    $("#d_modelrange").append('<div class="col-md-3 row-col-nocho text-center" data-range="'+item.rangeId+'" ><a class="carRowImg" href="javascript:void(0);"><img src="'+$("#ctx").val()+'/c/image/show?rangeCode='+item.rangeCode+'&prefix=&findex=1&type=rangemanage"><span class="col-md-12">'+item.name_+'</span></a></div>');
                    $("#m_modelrange").append('<li data-value="'+item.rangeId+'">'+item.name_+'</li>');
                    if(rangeId.length&&item.rangeId==rangeId){
                        $('div[data-name="m_modelrange"]').find('input').val(item.name_);
                        $('div[data-range="'+rangeId+'"]').find("img").addClass("nochoBorder");
                    }
                });
                $.bindRange();
            }else{
                $("#d_modelrange").html("");
                $("#m_modelrange").html("").append("<li data-value=''>车型</li>");
                $('div[data-name="m_modelrange"]').find('input').val('车型');
                $("#h_modelrange").hide();
            }
        }
    });

    $("#d_modelrange div").click(function(){
        $(this).find("img").addClass("nochoBorder");
        $(this).siblings("div").find("img").removeClass("nochoBorder");
        $("#rangeId").val($(this).data("range"));
        $('div[data-name="m_modelrange"]').find('input').val($(this).find('a').text());
        $.getOutterColor();
        $.getInnerColor();
        $("#page").val(1);
        $("#outterId").val("");
        $("#innerId").val("");
        //查询
        $.getList();
    });

}

//获取车身颜色
$.getOutterColor=function(){
    $.ajax({
        url:$("#ctx").val()+"/c/quicksearch/search/outter",
        data:{series:$("#series").val(),rangeId:$("#rangeId").val()},
        type:'post',
        success:function(data){
            if(data){
                $("#d_outter").html("");
                $.each(data,function(index,item){
                    $("#d_outter").append('<a href="javascript:void(0);" data-id="'+item.optionId+'"  title="'+item.cnName+'"><img width="29" height="23" src="'+$("#ctx").val()+'/c/image/show?optionId='+item.optionId+'&prefix=&findex=1"></a>');
//					$("#d_outter").append('<a href="javascript:void(0);" data-id="'+item.optionId+'"  title="'+item.cnName+'"><img width="29" height="23" src="'+$("#ctx").val()+'/images/show_color.png"></a>');

                });

                $("#d_outter>a").click(function(){
                    var outter=$(this).attr("title");
                    $(this).find("img").addClass("nochoBorder");
                    $(this).siblings("a").find("img").removeClass("nochoBorder");
                    $("#outterId").val($(this).data("id"));
                    $("#page").val(1);

                    stm_clicki('send', 'event', 'SearchPage', 'Filter-Outter', outter);//监测车身颜色
                    //查询
                    $.getList();

                });
            }
        }
    });

}


//获取内饰颜色
$.getInnerColor=function(){
    $.ajax({
        url:$("#ctx").val()+"/c/quicksearch/search/inner",
        type:'post',
        data:{series:$("#series").val(),rangeId:$("#rangeId").val()},
        success:function(data){
            if(data){
                $("#d_inner").html("");
                $.each(data,function(index,item){
                    $("#d_inner").append('<a href="javascript:void(0);" data-id="'+item.optionId+'" title="'+item.cnName+'"><img  width="29" height="23" src="'+$("#ctx").val()+'/c/image/show?optionId='+item.optionId+'&prefix=&findex=1"></a>');

//					$("#d_inner").append('<a href="javascript:void(0);" data-id="'+item.optionId+'" title="'+item.cnName+'"><img  width="29" height="23" src="'+$("#ctx").val()+'/images/show_color.png"></a>');
                });


                $("#d_inner>a").click(function(){
                    var inner=$(this).attr("title");
                    $(this).find("img").addClass("nochoBorder");
                    $(this).siblings("a").find("img").removeClass("nochoBorder");
                    $("#innerId").val($(this).data("id"));
                    $("#page").val(1);

                    stm_clicki('send', 'event', 'SearchPage', 'Filter-Inner', inner);//监测内饰颜色
                    //查询
                    $.getList();

                });
            }
        }
    });
}

$.bindProvince=function(){
    $('div[data-name="s_province"]').click(function(e){
        $('[data-name="s_province"]').find('ul').hide();
        $(this).find('span').removeClass('nice-select-spanDown').addClass('nice-select-spanUp');
        $(this).find('ul').show();
        e.stopPropagation();
    });
    $('div[data-name="s_province"] li').hover(function(e){
        $(this).toggleClass('on',true);
        e.stopPropagation();
    },function(e){
        $(this).toggleClass('on',false);
        e.stopPropagation();
    });
    $('div[data-name="s_province"] li').click(function(e){
        var val = $(this).text();
        $("#provinceCode").val($(this).attr("data-value"));
        $("#cityCode").val("");
        $.getCitys($(this).attr("data-value"));
        $.getList();
        $(this).parents('div[data-name="s_province"]').find('input').val(val);
        $('div[data-name="s_province"] ul').hide();
        $(this).parents('div[data-name="s_province"]').find('span').removeClass('nice-select-spanUp').addClass('nice-select-spanDown');
        e.stopPropagation();

        stm_clicki('send', 'event', 'SearchPage', 'Filter-City', val);//监测省市

    });
    $('div[data-name="s_province"] span').click(function(e){
        if($(this).hasClass('nice-select-spanDown')){
            $(this).next('ul').show();
            $(this).removeClass('nice-select-spanDown').addClass('nice-select-spanUp');
        }else{
            $(this).next('ul').hide();
            $(this).removeClass('nice-select-spanUp').addClass('nice-select-spanDown');
        }

        e.stopPropagation();
    });
    $(document).click(function(){
        $('div[data-name="s_province"] ul').hide();
        $('div[data-name="s_province"]').find('span').removeClass('nice-select-spanUp').addClass('nice-select-spanDown');
    });
}

$.bindCitys=function(){
    /*search page s_city*/
//	$('div[data-name="s_city"]').click(function(e){
//	    $('[data-name="s_city"]').find('ul').hide();
//	    $(this).find('span').removeClass('nice-select-spanDown').addClass('nice-select-spanUp');
//	    $(this).find('ul').show();
//		e.stopPropagation();
//	});
    $('div[data-name="s_city"] li').hover(function(e){

        $(this).toggleClass('on',true);
        e.stopPropagation();
    },function(e){
        $(this).toggleClass('on',false);
        e.stopPropagation();
    });
    $('div[data-name="s_city"] li').click(function(e){
        var val = $(this).text();
        $("#cityCode").val($(this).attr("data-value"));
        $.getList();
        $(this).parents('div[data-name="s_city"]').find('input').val(val);
        $('div[data-name="s_city"] ul').hide();
        $(this).parents('div[data-name="s_city"]').find('span').removeClass('nice-select-spanUp').addClass('nice-select-spanDown');
        e.stopPropagation();

        stm_clicki('send', 'event', 'SearchPage', 'Filter-City', val);//监测城市

    });
//	$('div[data-name="s_city"] span').click(function(e){
//		if($(this).hasClass('nice-select-spanDown')){
//			$(this).next('ul').show();
//			$(this).removeClass('nice-select-spanDown').addClass('nice-select-spanUp');
//		}else{
//			$(this).next('ul').hide();
//			$(this).removeClass('nice-select-spanUp').addClass('nice-select-spanDown');
//		}
//
//		e.stopPropagation();
//	});
//	$(document).click(function(){
//		$('div[data-name="s_city"] ul').hide();
//		$('div[data-name="s_city"]').find('span').removeClass('nice-select-spanUp').addClass('nice-select-spanDown');
//	});

}

$.bindSeries=function(){
    /*search page m_series*/
    $('div[data-name="m_series"]').click(function(e){
        $('[data-name="m_series"]').find('ul').hide();
        $(this).find('span').removeClass('nice-select-spanDown').addClass('nice-select-spanUp');
        $(this).find('ul').show();
        e.stopPropagation();
    });
    $('div[data-name="m_series"] li').hover(function(e){
        $(this).toggleClass('on');
        e.stopPropagation();
    });
    $('div[data-name="m_series"] li').click(function(e){
        var val = $(this).text();
        $("#series").val($(this).attr("data-value"));
        $("#rangeId").val("");
        $.getModelrange();
        $.getOutterColor();
        $.getInnerColor();
        $("#outterId").val("");
        $("#innerId").val("");
        $("#page").val(1);
        //查询
        $.getList();
        $(this).parents('div[data-name="m_series"]').find('input').val(val);
        $('div[data-name="m_series"] ul').hide();
        $(this).parents('div[data-name="m_series"]').find('span').removeClass('nice-select-spanUp').addClass('nice-select-spanDown');
        e.stopPropagation();

        stm_clicki('send', 'event', 'SearchPage', 'Filter-Series', val);//监测车系

    });
    $('div[data-name="m_series"] span').click(function(e){
        if($(this).hasClass('nice-select-spanDown')){
            $(this).next('ul').show();
            $(this).removeClass('nice-select-spanDown').addClass('nice-select-spanUp');
        }else{
            $(this).next('ul').hide();
            $(this).removeClass('nice-select-spanUp').addClass('nice-select-spanDown');
        }

        e.stopPropagation();
    });
    $(document).click(function(){
        $('div[data-name="m_series"] ul').hide();
        $('div[data-name="m_series"]').find('span').removeClass('nice-select-spanUp').addClass('nice-select-spanDown');
    });
}
$.formatNum=function(str){
    var newStr = "";
    var count = 0;

    if(str.indexOf(".")==-1){
        for(var i=str.length-1;i>=0;i--){
            if(count % 3 == 0 && count != 0){
                newStr = str.charAt(i) + "," + newStr;
            }else{
                newStr = str.charAt(i) + newStr;
            }
            count++;
        }
        return newStr;
    }
    else
    {
        for(var i = str.indexOf(".")-1;i>=0;i--){
            if(count % 3 == 0 && count != 0){
                newStr = str.charAt(i) + "," + newStr;
            }else{
                newStr = str.charAt(i) + newStr; //逐个字符相接起来
            }
            count++;
        }
        str = newStr + (str + "00").substr((str + "00").indexOf("."),3);
        return str;
    }
}

$.bindRange=function(){
    /*search page m_modelrange*/
    $('div[data-name="m_modelrange"]').click(function(e){
        $('[data-name="m_modelrange"]').find('ul').hide();
        $(this).find('span').removeClass('nice-select-spanDown').addClass('nice-select-spanUp');
        $(this).find('ul').show();
        e.stopPropagation();
    });
    $('div[data-name="m_modelrange"] li').hover(function(e){
        $(this).toggleClass('on');
        e.stopPropagation();
    });
    $('div[data-name="m_modelrange"] li').click(function(e){
        var val = $(this).text();
        $("#rangeId").val($(this).attr("data-value"));
        $.getOutterColor();
        $.getInnerColor();
        $("#outterId").val("");
        $("#innerId").val("");
        $("#page").val(1);
        //查询
        $.getList();
        $(this).parents('div[data-name="m_modelrange"]').find('input').val(val);
        $('div[data-name="m_modelrange"] ul').hide();
        $(this).parents('div[data-name="m_modelrange"]').find('span').removeClass('nice-select-spanUp').addClass('nice-select-spanDown');
        e.stopPropagation();

        stm_clicki('send', 'event', 'SearchPage', 'Filter-Model', val);//监测车型

    });
    $('div[data-name="m_modelrange"] span').click(function(e){
        if($(this).hasClass('nice-select-spanDown')){
            $(this).next('ul').show();
            $(this).removeClass('nice-select-spanDown').addClass('nice-select-spanUp');
        }else{
            $(this).next('ul').hide();
            $(this).removeClass('nice-select-spanUp').addClass('nice-select-spanDown');
        }

        e.stopPropagation();
    });
    $(document).click(function(){
        $('div[data-name="m_modelrange"] ul').hide();
        $('div[data-name="m_modelrange"]').find('span').removeClass('nice-select-spanUp').addClass('nice-select-spanDown');
    });
}