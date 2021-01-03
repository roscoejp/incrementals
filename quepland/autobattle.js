var targets = ["Mapinguari", 
    "Kappa",
    "Mercurial Knight",
    "Mercurial Warrior",
    "Mercurial Beast",
    "Mercurial Giant",
    "Baobhan Sith"];

var bob=window.setInterval(function(){
    var find = $("button:contains('Find Battle')");
    var auto = $("button:contains('Auto Battle')");
    if (targets.includes(auto.next().children()[0].textContent)) {
        var start = $("button:contains('Start Battle')");
        start.click();
    }
    find.click();
}, 200);
