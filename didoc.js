$(function(){

    var nav = new NavHistory($("#content"));

    // Ajax-y behaviour for local links
    $(document).on( 'click',
        'a:not([href^=http])',
        function(event){
            nav.newpage(event.currentTarget.pathname);
            return false; });

    $(document).on( 'click',
        'button#back',
        function(){ nav.back(); });

    $(document).on( 'click',
        'button#forward',
        function(){ nav.forward(); });

    // Initially, load home page
    nav.newpage("/didoc/homepage.html");

});

