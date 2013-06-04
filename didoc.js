var Didoc = function(elem){
    var my = this;

    my.elem = $(elem);  // Content container

    my.go = function(url, success){

        $.ajax({ url: url,

            success: function(data, status, xhr){
                change_to(data); 
            },

            error: function(xhr){
                change_to(errmsg(xhr)); 
            } });

    };

    // private
    var change_to = function(data){
        // Manage content transistion
        my.elem.fadeOut(
            0,
            function(){
                my.elem.html(data);
                my.elem.fadeIn();
            }
        );
    };

    var errmsg = function(xhr){
        switch (xhr.status){
        case 404:
            return $("<p><span class='error'>404 Error -- That file does not seem to exist.</span>");
            break;
        default:
            return $("<p><span class='error'>There was an error handling that click.  My fault.  Yell at me about it at jcarter@str.com</span>")
        }
    }

};
