$(function(){

    didoc = new Didoc($("#content"));
    var menu = $("nav");

    // Ajax-y behaviour for local links
    $(document).on( 'click',
        'a:not([href^=http])',
        function(event){
            var url = event.currentTarget.pathname;
            didoc.go(url);
            history.pushState(null, null, url);
            event.preventDefault();
    });

    // Handle 'back' navigation
    $(window).on('popstate', function(){
        // handle the initial onload popstate event
        didoc.go(
            '/didoc/' + (location.pathname.split('/').pop() 
            || 
            'homepage.html'));
    });

    // Clicking the header takes you home
    $('header').on( 'click', function(event){
        location.href = '/didoc/';
    });

    $(menu).collapsible({
        symbolshow: "▶",
        symbolhide: "▼",
    });

    // Clicking the menu name expands/collapses it (instead of insisting on
    // targeting the little symbol)
    $('nav li>p').click(function(event){
        $(event.currentTarget).prev('.jcollapsible').click();
    });

});
