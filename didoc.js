$(function(){

    var didoc = new Didoc($("#content"));
    var menu = $(".nav-menu");
    menu.css("display","none");

    // Ajax-y behaviour for local links
    $(document).on( 'click',
        'a:not([href^=http])',
        function(event){
            didoc.newpage(event.currentTarget.pathname);
            return false; });

    $(document).on( 'click',
        '.back',
        function(){ didoc.back(); });

    $(document).on( 'click',
        '.forward',
        function(){ didoc.forward(); });

    $(document).on( 'click',
        '.menu',
        function(){
            menu.slideToggle();
    });

    // Initially, load home page
    didoc.newpage("/didoc/homepage.html");

});

