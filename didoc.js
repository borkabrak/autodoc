$(function(){

    var nav = new NavHistory();

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

    $.prototype.change_to = function(data){
        // Change content of an element in a groovy way.
        var elem = this;

        elem.fadeOut(
            0,
            function(){
                elem.html(data);
                elem.fadeIn();
            }
        );
    };

    var errmsg = function(xhr){
        switch (xhr.status){
        case 404:
            return $("<p><span class='error'>That file does not seem to exist</span>");
            break;
        default:
            return $("<p><span class='error'>There was an error handling that click.  My fault.  Yell at me about it at jcarter@str.com</span>")
        }
    }

});

