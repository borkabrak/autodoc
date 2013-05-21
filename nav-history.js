var NavHistory = function(){
    my = this;
    my.history = [];   

    // index into history representing current site
    my.current = 0;

    // private
    var go = function(url, success){

        $.ajax({ url: url,

            success: function(data, status, xhr){
                    $("#content").change_to(data); 
                    if (success){
                        success.call();
                    }
            },

            error: function(xhr){
                    $("#content").change_to(errmsg(xhr)); 
            } });

    }

    my.back = function(){
        my.current = (my.current > 0 ? my.current - 1 : my.current);
        go(my.history[my.current]);
    };

    my.forward = function(){
        my.current = (my.current <= my.history.length - 1 ? my.current + 1 : my.current);
        go(my.history[my.current])
    };

    my.newpage = function(url){
        go(url,function(){
            my.history = my.history.slice(0,my.current + 1);
            my.history.push(url);
            my.current = my.history.length - 1;
        })
    }
};
