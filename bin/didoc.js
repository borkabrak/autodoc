
$(function(){
    $("a.back").on(
        'click',
        function(){
            window.history.back();
            return false;
        }
    );


    //periodic_reload();

});

var periodic_reload = function(){
    // DEBUG: reload the page every few seconds.
    return setTimeout(function(){window.location.reload()},3000);
};

