/*
    Javascript for jquery
*/

$(function(){
    $("a.back").on(
        'click',
        function(){
            window.history.back();
            return false;
        }
    );
});
