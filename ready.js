$(function(){

    didoc = new Didoc($("#content"));
    var menu = $("nav");

    function current_page(){
        // Parse out the page from the querystring here and return it.
        match = location.href.match(/\?.*page=(.*)/);
        return match ? match[1] : 'homepage.html';
    };

    // Ajax-y behaviour for local links
    $(document).on( 'click',
        'a:not([href^=http])',
        function(event){
            // For local links, fetch the pages via AJAX, but push onto the
            // history a URL that will bring the resulting layout back
            var url = event.currentTarget.pathname;
            didoc.fetch(url);
            
            history.pushState(null, null, url.replace(/didoc\/(.*)/, "didoc/index.erb?page=$1"));

            event.preventDefault();
    });

    // Handle 'back' navigation
    $(window).on('popstate', function(){
        // handle the initial onload popstate event
        var page = '/didoc/' + current_page();
        didoc.fetch(page);
    });

    // Clicking the header takes you home
    $('header').on( 'click', function(event){
        location.href = '/didoc/?page=homepage.html';
    });

});
