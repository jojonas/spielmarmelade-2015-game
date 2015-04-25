var game = new Phaser.Game(
    window.innerWidth, 
    window.innerHeight, 
    Phaser.AUTO, 'container');

var TITLE = "Drop";
var DEBUG = false;

var Drop = function(game) {};
Drop.Main = function (game) {
    this.GFX_STROKE_WIDTH = 10;

    this.LEVEL_HEIGHT = 5000;
    this.LEVEL_GRAVITY = 800;
    this.LEVEL_RESTITUTION = 0.3;

    this.BALL_COUNT = 1;
    this.BALL_RADIUS = 20;

    this.GAP_WIDTH = 60;

    this.PLATFORM_HEIGHT = 30;
    this.PLATFORM_DISTANCE = 100;
    this.PLATFORM_MIN_WIDTH = 100;
    this.PLATFORM_MAX_WIDTH = 400;
    this.PLATFORM_TOTAL_WIDTH_FACTOR = 2;

    this.PLATFORM_INITIAL_SPEED = 1;
    this.PLATFORM_MAXIMUM_SPEED = 5;
    this.PLATFORM_SPEEDUP = 10;

    this.PLATFORM_DAMPING = 0.9;

    this.MOUSE_SENSITIVITY = 0.3;
};
Drop.Main.prototype = 
{  
    preload: function()
    {
        game.time.advancedTiming = true;
    },

    create: function()
    {            
        //game.rnd.sow([5]);

        game.stage.backgroundColor = '#F3EDDF';
        game.world.setBounds(0, 0, game.width, this.LEVEL_HEIGHT);

        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.gravity.y = this.LEVEL_GRAVITY;
        game.physics.p2.restitution = this.LEVEL_RESTITUTION;
        game.physics.p2.applyDamping = true;

        game.physics.p2.updateBoundsCollisionGroup();

        this.cursorKeys = game.input.keyboard.createCursorKeys();
        //this.timer = game.add.timer();
    
        this.platformCollisionGroup = game.physics.p2.createCollisionGroup();
        this.ballCollisionGroup = game.physics.p2.createCollisionGroup();

        this.platformGroup = game.add.group();
        this.platformGroup.enableBody = true;
        this.platformGroup.physicsBodyType = Phaser.Physics.P2JS;

        this.ballGroup = game.add.group();
        this.ballGroup.enableBody = true;
        this.ballGroup.physicsBodyType = Phaser.Physics.P2JS;

        this.ball = this.createBall(this.BALL_RADIUS);
        this.ball.body.x = game.rnd.realInRange(0, game.world.width);
        this.ball.body.y = this.BALL_RADIUS;
        this.ball.body.velocity.x = game.rnd.realInRange(-500, 500);
        
        for (var y=this.PLATFORM_DISTANCE*1.5;y<game.world.height;y+=this.PLATFORM_DISTANCE) {
            this.createPlatformLayer(y, game.world.width*this.PLATFORM_TOTAL_WIDTH_FACTOR);
        }
    
        this.progressbar = this.createProgressbar();
        //game.camera.follow(this.ball, Phaser.Camera.FOLLOW_PLATFORMER);
    },

    update: function()
    {        
        var self = this;

        if (this.ball.body.x - this.ball.width > game.world.width) {
            this.ball.body.x = -this.ball.width;
        } else if (this.ball.body.x+this.ball.width < 0) {
            this.ball.body.x = game.world.width + this.ball.width;
        }

        this.platformGroup.forEach(function(platform) {
            if ((platform.body.y > self.ball.body.y) && (platform.body.y - self.PLATFORM_DISTANCE < self.ball.body.y)) 
            {
                platform.body.x += game.input.activePointer.movementX * self.MOUSE_SENSITIVITY;  
            }
        });
        game.input.activePointer.resetMovement();

        if (game.time.fps) 
            window.document.title = game.time.fps + " FPS - Drop";


        game.camera.y += 1; //this.timer.ms * this.PLATFORM_INITIAL_SPEED + 0.5*Math.pow(this.timer.ms,2) * this.PLATFORM_SPEEDUP;

        this.progressbar.updateValue(game.camera.y);

        if (this.ball.body.y + this.ball.height < game.camera.y) {
            game.state.start('GameEnd', true, false, 'Game Over.');
        } else if (this.ball.body.y + this.ball.height >= game.world.height) {
            game.state.start('GameEnd', true, false, 'Congrats!');
        }
    },

    render: function()
    {
        game.paused = !game.input.mouse.locked;

        game.debug.text(game.time.fps || '--', 2, 14, "#ffffff");   
    },


    // #################

    createBall: function(radius) 
    {
        var graphics = game.add.bitmapData(2*radius, 2*radius);
        graphics.ctx.arc(radius, radius, radius-this.GFX_STROKE_WIDTH/2, 0, 2*Math.PI, false);
        graphics.ctx.fillStyle = "#F1AB53";
        graphics.ctx.fill();
        graphics.ctx.lineWidth = this.GFX_STROKE_WIDTH;
        graphics.ctx.strokeStyle = "#D74641";
        graphics.ctx.stroke();

        var sprite = this.ballGroup.create(0, 0, graphics);

        game.physics.p2.enable(sprite, DEBUG);
        sprite.body.dynamic = true;
        sprite.body.fixedRotation = true;
        sprite.body.collideWorldBounds = true;
        sprite.body.setCircle(radius);
        sprite.body.setCollisionGroup(this.ballCollisionGroup);
     
        //sprite.body.setCircle(radius);

        sprite.body.collides(this.platformCollisionGroup);
        sprite.body.collides(this.ballCollisionGroup);

        return sprite;
    },

    createPlatform: function(width) 
    {   
        var graphics = game.add.bitmapData(width, this.PLATFORM_HEIGHT);
        graphics.ctx.rect(0, 0, width, this.PLATFORM_HEIGHT);
        graphics.ctx.fillStyle = "#252122";
        graphics.ctx.fill();
        graphics.ctx.lineWidth = this.GFX_STROKE_WIDTH;
        graphics.ctx.strokeStyle = "#252122";
        graphics.ctx.stroke();

        var sprite = this.platformGroup.create(0, 0, graphics);

        game.physics.p2.enable(sprite, DEBUG);
        sprite.body.kinematic = true;
        sprite.body.fixedRotation = true;
        sprite.body.collideWorldBounds = false;
        sprite.body.setRectangle(width, this.PLATFORM_HEIGHT);
        sprite.body.setCollisionGroup(this.platformCollisionGroup);

        sprite.body.collides(this.ballCollisionGroup);
        sprite.autoCull = true;

        return sprite;
    },

    createPlatformLayer: function(y, totalWidth)
    {
        var x = 0;
        while (x < totalWidth) 
        {
            var width = game.rnd.realInRange(this.PLATFORM_MIN_WIDTH, this.PLATFORM_MAX_WIDTH);
            var restWidth = totalWidth - (x + width + this.GAP_WIDTH);
            if (restWidth < this.PLATFORM_MIN_WIDTH) {
                width = totalWidth - x;
            }

            var platform = this.createPlatform(width);
            platform.body.x = x + width/2 - (totalWidth - game.world.width)/2; // anchor on physics.p2 objects is fixed to 0.5
            platform.body.y = y;
    
            x += (width + this.GAP_WIDTH);
        }
    },

    createProgressbar: function() 
    {
        var self = this;

        var padding = 10;
        var width = 50;

        var bgGraphics = game.add.bitmapData(width, game.height-2*padding);
        bgGraphics.ctx.rect(0, 0, width, game.height - 2*padding);
        bgGraphics.ctx.fillStyle = "#F3EDDF";
        bgGraphics.ctx.fill();
        bgGraphics.ctx.strokeStyle = "#252122";
        bgGraphics.ctx.lineWidth = this.GFX_STROKE_WIDTH;
        bgGraphics.ctx.stroke();

        var bgSprite = game.add.sprite(game.width-width-padding, padding, bgGraphics);
        bgSprite.fixedToCamera = true;
        bgSprite.anchor.set(0);
        bgSprite.alpha = 0.9;

        var iconHeight = bgSprite.height / game.world.height * game.camera.height;

        var graphics = game.add.bitmapData(bgSprite.width, iconHeight);
        graphics.ctx.rect(0, 0, bgSprite.width, iconHeight);
        graphics.ctx.fillStyle = "#F1AB53";
        graphics.ctx.fill();
        graphics.ctx.strokeStyle = "#252122";
        graphics.ctx.lineWidth = this.GFX_STROKE_WIDTH;
        graphics.ctx.stroke();

        var sprite = game.add.sprite(bgSprite.x, bgSprite.y, graphics);
        sprite.fixedToCamera = true;
        sprite.anchor.set(0);
        sprite.alpha = 0.9;

        sprite.updateValue = function(y) {
            var max = game.world.height - game.camera.height;
            var offset = y/max * (bgSprite.height-sprite.height);
            sprite.cameraOffset.y = offset+padding;
        }

        return sprite;
    }
}
game.state.add('Main', Drop.Main);


Drop.Menu = function (game) {};
Drop.Menu.prototype = 
{  
    preload: function() {
        //game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
    },

    create: function()
    {                 
        window.document.title = TITLE;
        game.stage.backgroundColor = '#F3EDDF';
         
        game.canvas.addEventListener('mousedown', function() {
            if (!game.input.mouse.locked) {
                game.input.mouse.requestPointerLock();
                game.input.activePointer.resetMovement();
            } 
            if (game.state.current != 'Main') {
                game.state.start('Main');
            }
        });

        var graphics = game.add.graphics(0, 0);
        graphics.beginFill(0x252122);
        graphics.drawRect(0, game.height*0.6, game.width, game.height);
        graphics.endFill();

        var text = game.add.text(0, 0, TITLE);
        text.anchor.set(0.5);
        text.x = game.width / 2;
        text.y = game.height*0.4;
        text.fill = "#252122";
        text.fontSize = 500;        
        text.align = "center";

        var instructions = game.add.text(0, 0, "Click to begin.\nAllow your browser to capture the mouse.");
        instructions.anchor.set(0.5);
        instructions.x = game.width / 2;
        instructions.y = game.height*0.8;
        instructions.fill = "#F3EDDF";
        instructions.align = "center";
        instructions.fontSize = 50;
    },
}
game.state.add('Menu', Drop.Menu);

Drop.GameEnd = function (game) {};
Drop.GameEnd.prototype = 
{  
    init: function(text) 
    {
        this.text = text;
    },

    preload: function()
    {
      
    },

    create: function()
    {            

        var graphics = game.add.graphics(0, 0);
        graphics.beginFill(0x252122);
        graphics.drawRect(0, game.height*0.6, game.width, game.height);
        graphics.endFill();
        
        var text = game.add.text(0, 0, this.text);
        text.anchor.set(0.5);
        text.x = game.width / 2;
        text.y = game.height * 0.5;
        text.fill = "#252122";
        text.fontSize = 200;
        text.align = "center";

        var instructions = game.add.text(0, 0, "Click to go again.");
        instructions.anchor.set(0.5);
        instructions.x = game.width / 2;
        instructions.y = game.height*0.8;
        instructions.fill = "#F3EDDF";
        instructions.align = "center";
        instructions.fontSize = 50;
    },

    update: function()
    {        
        if (game.input.keyboard.isDown(Phaser.Keyboard.ESC)) {
            game.state.start('Menu');
        }
    },

    render: function()
    {
        
    },
}
game.state.add('GameEnd', Drop.GameEnd);

game.state.start('Menu');