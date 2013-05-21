var NavHistory = function(elem){
    my = this;

    my.elem = $(elem);  // Content container

    my.history = [];   
    my.current = 0;

    my.back = function(){
        (my.current > 0) && (my.current -= 1);
        go(my.history[my.current]);
    };

    my.forward = function(){
        (my.current <= my.history.length - 1) && (my.current += 1);
        go(my.history[my.current])
    };

    my.newpage = function(url){
        go(url,function(){
            my.history = my.history.slice(0,my.current + 1);
            my.history.push(url);
            my.current = my.history.length - 1;
        })
    }

    // private
    var go = function(url, success){

        $.ajax({ url: url,

            success: function(data, status, xhr){
                change_to(data); 
                if (success){
                    success.call();
                }
            },

            error: function(xhr){
                change_to(errmsg(xhr)); 
            } });

    };

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
            return $("<p><span class='error'>That file does not seem to exist</span>");
            break;
        default:
            return $("<p><span class='error'>There was an error handling that click.  My fault.  Yell at me about it at jcarter@str.com</span>")
        }
    }

};
