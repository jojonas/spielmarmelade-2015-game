var DEBUG = false;
var TITLE = "Drop";

var Drop = function(game) {};

function runGame() {
    var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'container');

    game.state.add('Main', Drop.Main);
    game.state.add('Menu', Drop.Menu);
    game.state.add('GameEnd', Drop.GameEnd);

    game.state.start('Menu', true, false, 
                TITLE, "Click to begin.\nAllow your browser to capture the mouse.");
    
}

window.onerror = function(message, file, line) {
    alert("Error! " + file + ":" + line + " " + message);
}