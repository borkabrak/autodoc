$(function(){

    // Ajax-y behaviour for links
    $(document).on(
        'click',
        'a',
        function(event){

            // If the link goes off-site, don't interfere.
            // FIXME: This is a really hacky way to do it..
            if (event.currentTarget.href.match("ushen048w") === null){;
                return true;
            }

            $.ajax({ 

                url: 
                    event.currentTarget.href,

                success: 
                    function(data, status, xhr){
                    $("#content").change_to(data); },

                error:
                    function(xhr){
                        console.log("XHR: %o",xhr);
                        $("#content").change_to(errmsg(xhr)); }
            });

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
    console.log(xhr.getAllResponseHeaders());
    switch (xhr.status){
    case 404:
        return $("<p><span class='error'>That file does not seem to exist</span>");
        break;
    default:
        return $("<p><span class='error'>There was an error handling that click.  My fault.  Yell at me about it at jcarter@str.com</span>")
    }
}
