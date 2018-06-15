$(document).ready(function() {
    //右侧悬浮图标
    if (!!window.ActiveXObject || "ActiveXObject" in window){
        $('.chat-index').css("right","17px");
        $('.chat-man').css("right","17px");
        $('.chat-box').css("right","17px");
//		$('.chat-small').css("right","17px");
        $('.chat-heart').css("right","17px");
        $('.chat-phone').css("right","17px");
        $('.row-vsNo').css("right","17px");
        $('.addCarcol').css("right","17px");
        $(".chat-box .chatIcon").click(function(){
            $("div.chatCall").animate({right:'32px'});
        });
        $(".chat-phone .chatIcon").click(function(){
            $("div.chatPhone").animate({right:'32px'});
        });
    }

    $(".chat-box .chatIcon").click(function(){
        $("div.chatCall").animate({right:'0px'});
    });
    $("#chatclose").click(function(){
        $("div.chatCall").animate({right:'-320px'});
    });
    $(".chat-phone .chatIcon").click(function(){
        $("div.chatPhone").animate({right:'0px'});
    });
    $("#phoneclose").click(function(){
        $("div.chatPhone").animate({right:'-141px'});
    });
    $(".page-click").click(function(event) {
        if ($(this).hasClass('fa-circle-o')) {
            $(this).removeClass('fa-circle-o').addClass('fa-dot-circle-o');
        } else {
            $(this).removeClass('fa-dot-circle-o').addClass('fa-circle-o');
        }
    });
    $("a[data-toggle='collapse']").each(function(index, el) {
        $(this).click(function(event) {
            if (!$(this).next(".collapse").hasClass('in')) {
                $(this).find('span').removeClass('pacollapse-span').addClass('pacollapse-clickspan');
            } else {
                $(this).find('span').removeClass('pacollapse-clickspan').addClass('pacollapse-span');
            }
        });
    });

    /*select style*/
    /*city*/
    $('div[data-name="cityCode"]').click(function(e){
        $('.nice-select ul').hide();
        $('div[data-name="cityCode"]').find('ul').hide();
        $(this).find('span').removeClass('nice-select-spanDown').addClass('nice-select-spanUp');
        $(this).find('ul').show();
        e.stopPropagation();
    });

    $('div[data-name="cityCode"] li').hover(function(e){
        $(this).toggleClass('on');
        e.stopPropagation();
    });
    $('div[data-name="cityCode"] li').click(function(e){
        var val = $(this).text();
        var lis = $(this).attr("data-value");
        $("#ssCity").val(lis);
        $("#ssProvince").val($(this).attr("data-province"));
        $(this).parents('div[data-name="cityCode"]').find('input').val(val);
        $('div[data-name="cityCode"] ul').hide();
        $(this).parents('div[data-name="cityCode"]').find('span').removeClass('nice-select-spanUp').addClass('nice-select-spanDown');
        e.stopPropagation();

        stm_clicki('send', 'event', 'SearchPage', 'Filter-City', val);//监测城市选择
    });
    $('div[data-name="cityCode"] span').click(function(e){
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
        $('div[data-name="cityCode"] ul').hide();
        $('div[data-name="cityCode"]').find('span').removeClass('nice-select-spanUp').addClass('nice-select-spanDown');
    });
    /*sSeries*/
    $('div[data-name="sSeries"]').click(function(e){
        $('.nice-select ul').hide();
        $('div[data-name="sSeries"]').find('ul').hide();
        $(this).find('span').removeClass('nice-select-spanDown').addClass('nice-select-spanUp');
        $(this).find('ul').show();
        e.stopPropagation();
    });
    $('div[data-name="sSeries"] li').hover(function(e){
        $(this).toggleClass('on');
        e.stopPropagation();
    });
    $('div[data-name="sSeries"] li').click(function(e){
        var val = $(this).text();
        var lis = $(this).attr("data-value");
        $("#ssSeries").val(lis);
        $(this).parents('div[data-name="sSeries"]').find('input').val(val);
        $('div[data-name="sSeries"] ul').hide();
        $(this).parents('div[data-name="sSeries"]').find('span').removeClass('nice-select-spanUp').addClass('nice-select-spanDown');
        e.stopPropagation();

        stm_clicki('send', 'event', 'SearchPage', 'Filter-Series', val);//监测车系

    });
    $('div[data-name="sSeries"] span').click(function(e){
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
        $('.nice-select ul').hide();
        $('div[data-name="sSeries"] ul').hide();
        $('div[data-name="sSeries"]').find('span').removeClass('nice-select-spanUp').addClass('nice-select-spanDown');
    });

    /*salePrice*/
    $('div[data-name="salePrice"]').click(function(e){
        $('.nice-select ul').hide();
        $('[data-name="salePrice"]').find('ul').hide();
        $(this).find('span').removeClass('nice-select-spanDown').addClass('nice-select-spanUp');
        $(this).find('ul').show();
        e.stopPropagation();
    });
    $('div[data-name="salePrice"] li').hover(function(e){
        $(this).toggleClass('on');
        e.stopPropagation();
    });
    $('div[data-name="salePrice"] li').click(function(e){
        var val = $(this).text();
        var lis = $(this).attr("data-value");
        getValue(lis);
        $(this).parents('div[data-name="salePrice"]').find('input').val(val);
        $('div[data-name="salePrice"] ul').hide();
        $(this).parents('div[data-name="salePrice"]').find('span').removeClass('nice-select-spanUp').addClass('nice-select-spanDown');
        e.stopPropagation();

        stm_clicki('send', 'event', 'SearchPage', 'Filter-Price', val);//监测预算

    });
    $('div[data-name="salePrice"] span').click(function(e){
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
        $('div[data-name="salePrice"] ul').hide();
        $('div[data-name="salePrice"]').find('span').removeClass('nice-select-spanUp').addClass('nice-select-spanDown');
    });

    /*orderTown*/
    $('div[data-name="orderTown"]').click(function(e){
        $('.nice-select ul').hide();
        $('div[data-name="orderTown"]').find('ul').hide();
        $(this).find('i').removeClass('nice-select-spanDown').addClass('nice-select-spanUp');
        $(this).find('ul').show();
        e.stopPropagation();
    });
    $('div[data-name="orderTown"] li').hover(function(e){
        $(this).toggleClass('on');
        e.stopPropagation();
    });
    $('div[data-name="orderTown"] li').click(function(e){
        var val = $(this).text();
        var lis = $(this).attr("data-value");
        $(this).parents('div[data-name="orderTown"]').find('input').val(val);
        $('div[data-name="orderTown"] ul').hide();
        $(this).parents('div[data-name="orderTown"]').find('span').removeClass('nice-select-spanUp').addClass('nice-select-spanDown');
        e.stopPropagation();

    });
    $('div[data-name="orderTown"] span').click(function(e){
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
        $('div[data-name="orderTown"] ul').hide();
        $('div[data-name="orderTown"]').find('span').removeClass('nice-select-spanUp').addClass('nice-select-spanDown');
    });
    $(window).resize(function(event) {
        /* Act on the event */
        if ($(document).height()==window.innerHeight || $(document).height()< window.innerHeight) {
            $('.footer-newsletter').css('position', 'fixed');
            $('section.row-car').css('margin-bottom','90px');
        }else{
            $('.footer-newsletter').css('position', 'static');
        }

    });
});

function getValue(lis){
    if(lis.indexOf("-")){
        $("#modelPriceStart").val(lis.split("-")[0]);
        $("#modelPriceEnd").val(lis.split("-")[1]);
    }else{
        $("#modelPriceStart").val(lis);
        $("#modelPriceEnd").val("");
    }
}