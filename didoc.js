$(function(){

    // Ajax-y behaviour for links
    $(document).on( 'click',

        'a:not([href^=http])',

        function(event){
            navigate(event.currentTarget.pathname);
            return false; // Elide normal link behaviour
        }
    );

    // Load initial home page
    $.get(
        "homepage.html",
        function(data){
            $("#content").html(data);
        }
    );

});

$.prototype.change_to = function(data){
    // Change content of an element in a groovy way.
    var me = this;

    me.fadeOut(
        0,
        function(){
            me.html(data);
            me.fadeIn();
        }
    );
};

errmsg = function(xhr){
    switch (xhr.status){
    case 404:
        return $("<p><span class='error'>That file does not seem to exist</span>");
        break;
    default:
        return $("<p><span class='error'>There was an error handling that click.  My fault.  Yell at me about it at jcarter@str.com</span>")
    }
}

function navigate(pagename) {

    $.ajax({ 

        url: 
            pagename,

        success: 
            function(data, status, xhr){
            $("#content").change_to(data); },

        error:
            function(xhr){
                $("#content").change_to(errmsg(xhr)); }
    });
}
