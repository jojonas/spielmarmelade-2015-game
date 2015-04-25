Drop.Main = function (game) {
    this.GFX_STROKE_WIDTH = 10;

    this.LEVEL_HEIGHT = 1000;
    this.LEVEL_GRAVITY = 400;
    this.LEVEL_RESTITUTION = 0.3;

    this.BALL_COUNT = 1;
    this.BALL_RADIUS = 20;

    this.GAP_WIDTH = 60;

    this.PLATFORM_HEIGHT = 30;
    this.PLATFORM_DISTANCE = 100;
    this.PLATFORM_MIN_WIDTH = 50;
    this.PLATFORM_MAX_WIDTH = 300;

    this.PLATFORM_SPEED = 10;
    this.PLATFORM_DAMPING = 0.9;
};
Drop.MainLoop.prototype = 
{  
    preload: function()
    {
        game.time.advancedTiming = true;
    },

    create: function()
    {            
        game.rnd.sow([5]);

        game.stage.backgroundColor = '#F3EDDF';
        game.world.setBounds(0, 0, game.width, this.LEVEL_HEIGHT);

        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.gravity.y = this.LEVEL_GRAVITY;
        game.physics.p2.restitution = this.LEVEL_RESTITUTION;
        game.physics.p2.applyDamping = true;

        game.physics.p2.updateBoundsCollisionGroup();

        this.cursorKeys = game.input.keyboard.createCursorKeys();
    
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
            this.createPlatformLayer(y);
        }

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

        var layer = this.platformGroup.filter(function(child, index, children) {
            return (child.body.y - child.height > self.ball.body.y) 
                && (child.body.y - child.height - self.PLATFORM_DISTANCE < self.ball.body.y);
        });

        for (var platform=layer.first; platform; platform=layer.next) {
            platform.body.x += game.input.activePointer.movementX;
        }
        game.input.activePointer.resetMovement();

        if (game.time.fps) 
            window.document.title = game.time.fps + " FPS - Drop";

        game.camera.y += 1;
        if (this.ball.body.y+this.ball.height < game.camera.y) {
            console.log("GAME OVER");
        }
    },

    render: function()
    {
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


        return sprite;
    },

    createPlatformLayer: function(y)
    {
        var x = 0;
        while (x < game.world.width) 
        {
            var width = game.rnd.realInRange(this.PLATFORM_MIN_WIDTH, this.PLATFORM_MAX_WIDTH);
            var restWidth = game.world.width - (x + width + this.GAP_WIDTH);
            if (restWidth < this.PLATFORM_MIN_WIDTH) {
                width = game.world.width - x;
            }

            var platform = this.createPlatform(width);
            platform.body.x = x + width/2; // anchor on physics.p2 objects is fixed to 0.5
            platform.body.y = y;
    
            x += (width + this.GAP_WIDTH);
        }
    },
}
game.state.add('Main', Drop.Main);
