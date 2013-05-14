$(function(){

    var mkd = new Markdown.Converter();

    // Ajax-y behaviour for links
    $("a").on(
        'click',
        function(event){
            console.log("Link %s clicked!", $(event.currentTarget).html());

            $.get( 
                event.currentTarget.href,

                function(data, status, xhr){
                    console.log("Success!");
                    $(".content").html(mkd.makeHtml(data));
                }
            );

            return false; // Elide normal link behaviour
        }
    );
});
