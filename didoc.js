$(function(){

    // Ajax-y behaviour for links
    $(document).on(
        'click',
        'a',
        function(event){

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

    me.slideUp(
        300,
        function(){
            me.html(data);
            me.slideDown(1000);
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
