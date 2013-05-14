$(function(){

    // Ajax-y behaviour for links
    $("a").on(
        'click',
        function(event){

            $.get( 
                event.currentTarget.href,

                function(data, status, xhr){
                    $("#content").change_to(data);
                }
            );

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
