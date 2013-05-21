$(function(){

    var nav = new NavHistory($("#content"));

    // Ajax-y behaviour for links
    $(document).on( 'click',

        'a:not([href^=http])',

        function(event){
            nav.newpage(event.currentTarget.pathname);
            return false; // Elide normal link behaviour
        }
    );

    $(document).on( 'click',

        'button#back',

        function(){ nav.back(); }
    );

    // Load initial home page
    nav.newpage("/didoc/homepage.html");


});

