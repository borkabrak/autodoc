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

    $('.menu').mouseenter(
        function(event){ 
            if ($(event.currentTarget).hasClass("collapsed")) {
                $(event.currentTarget).addClass("expanded");
                $(event.currentTarget).removeClass("collapsed");
                menu.slideDown(200); 
            } else {
                $(event.currentTarget).addClass("collapsed");
                $(event.currentTarget).removeClass("expanded");
                menu.slideUp(200); 
            }
        }
    );

    // Initially, load home page
    didoc.newpage("/didoc/homepage.html");

});

