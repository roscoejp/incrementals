var mats = setInterval(function(){ 
    var x;
        for (x of ResourceManager.materials) {
            if (x.name != "Gold") {
                x.amt = 1000;
            }
    } 
}, 3000);
