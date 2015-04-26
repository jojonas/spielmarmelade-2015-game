WebFontConfig = {
    //active: function() { game.time.events.add(Phaser.Timer.SECOND, createText, this); },
    google: {
      families: ['Open Sans']
    }
};

Drop.Menu = function (game) {
    this.game = game;
};
Drop.Menu.prototype = 
{  
    init: function(text, instructions) 
    {
        this.text = text;
        this.subtext = instructions;
    },

    preload: function() {
        this.game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

        this.game.load.audio('music', ['media/music.ogg', 'media/music.mp3', 'media/music.xm', 'media/music.wav']);
    },

    create: function()
    {
        var self = this;

        window.document.title = this.text;

        this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
        var lockPointer = function() {
            if (!self.game.input.mouse.locked) {
                self.game.input.mouse.requestPointerLock();
                //self.game.scale.startFullScreen();
                //self.game.scale.refresh();
            }
        };
        this.game.canvas.addEventListener('mousedown', lockPointer);
        this.game.canvas.addEventListener('touchstart', lockPointer);        
        
        this.game.sound.play('music', 0.9, true);


        this.game.stage.backgroundColor = '#F3EDDF';

        this.resize(this.game.width, this.game.height);
    },

    drawText: function(width, height) {
        var text = this.game.add.text(width/2, height*0.4, this.text, {
            fontSize: 200 * (width/1300),
            align: "center",
            font: "Open Sans",
            fontWeight: "bold",
        });
        text.fixedToCamera = true;
        text.anchor.set(0.5);
        return text;
    },

    update: function() {
        if (this.game.input.activePointer.isDown) {
            this.game.state.start('Main');
        }  
    },

    resize: function(width, height) {
        var horizon = height*0.6;

        if (this.graphics) 
            this.graphics.destroy();
        this.graphics = this.game.add.graphics(0, 0);
        this.graphics.beginFill(0x252122);
        this.graphics.drawRect(0, horizon, width, height - horizon);
        this.graphics.endFill();

        if (this.bottomMask)
            this.bottomMask.destroy();
        this.bottomMask = this.game.add.graphics(0, 0);
        this.bottomMask.beginFill(0xFFFFFF);
        this.bottomMask.drawRect(0, 0, width, horizon);
        this.bottomMask.endFill();

        if (this.bottomText)
            this.bottomText.destroy();
        this.bottomText = this.drawText(width, height);
        this.bottomText.mask = this.bottomMask;
        this.bottomText.fill = "#252122";

        if (this.topMask)
            this.topMask.destroy();
        this.topMask = this.game.add.graphics(0, 0);
        this.topMask.beginFill(0xFFFFFF);
        this.topMask.drawRect(0, horizon, width, height - horizon);
        this.topMask.endFill();

        if (this.topText)
            this.topText.destroy();
        this.topText = this.drawText(width, height);
        this.topText.fill = "#F3EDDF";
        this.topText.mask = this.topMask;

        if (this.instructions)
            this.instructions.destroy();
        this.instructions = this.game.add.text(width/2, height*0.8, this.subtext, 
        {
            fill: "#F3EDDF",
            align: "center",
            fontSize: 40 * (width/1300),
            font: "Open Sans",
        });
        this.instructions.fixedToCamera = true;
        this.instructions.anchor.set(0.5);
    },

    shutdown: function() 
    {
        window.document.title = TITLE;
        this.game.sound.stopAll();
    }
}
