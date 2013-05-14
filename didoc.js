$(function(){

    // Ajax-y behaviour for links
    $("a").on(
        'click',
        function(event){

            $.get( 
                event.currentTarget.href,

                function(data, status, xhr){
                    $(".content").html(data);
                }
            );

            return false; // Elide normal link behaviour
        }
    );


    // Load initial home page
    $.get(
        "homepage.html",
        function(data){
            $(".content").html(data);
        }
    );

});
