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
        var horizon = this.game.height*0.6;

        if (this.graphics) 
            this.graphics.destroy();
        this.graphics = this.game.add.graphics(0, 0);
        this.graphics.beginFill(0x252122);
        this.graphics.drawRect(0, horizon, this.game.width, this.game.height - horizon);
        this.graphics.endFill();

        if (this.bottomText)
            this.bottomText.destroy();
        var bottomMask = this.game.add.graphics(0, 0);
        bottomMask.beginFill(0xFFFFFF);
        bottomMask.drawRect(0, 0, this.game.width, horizon);
        bottomMask.endFill();
        this.bottomText = this.drawText();
        this.bottomText.mask = bottomMask;
        this.bottomText.fill = "#252122";

        if (this.topMask)
            this.topMask.destroy();
        var topMask = this.game.add.graphics(0, 0);
        topMask.beginFill(0xFFFFFF);
        topMask.drawRect(0, horizon, this.game.width, this.game.height - horizon);
        topMask.endFill();
        this.topText = this.drawText();
        this.topText.fill = "#F3EDDF";
        this.topText.mask = topMask;

        if (this.instructions)
            this.instructions.destroy();
        this.instructions = this.game.add.text(this.game.width/2, this.game.height*0.8, this.subtext, 
        {
            fill: "#F3EDDF",
            align: "center",
            fontSize: 30 / (this.game.width/1300),
            font: "Open Sans",
        });
        this.instructions.fixedToCamera = true;
        this.instructions.anchor.set(0.5);
    },

    drawText: function() {
        var text = this.game.add.text(this.game.width/2, this.game.height*0.4, this.text, {
            fontSize: 200 / (this.game.width/1300),
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

    resize: function(height, width) {
        this.create();
    },

    shutdown: function() 
    {
        window.document.title = TITLE;
        this.game.sound.stopAll();
    }
}
