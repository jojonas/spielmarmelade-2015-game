Drop.Main = function (game) {
    this.GFX_STROKE_WIDTH = 10;

    this.LEVEL_HEIGHT = 10000;
    this.LEVEL_GRAVITY = 800;

    this.BALL_COUNT = 1;
    this.BALL_RADIUS = 20;

    this.GAP_WIDTH = 80;

    this.PLATFORM_HEIGHT = 30;
    this.PLATFORM_DISTANCE = 100;

    this.PLATFORM_SIZE_INITIAL = 200;
    this.PLATFORM_SIZE_SPEEDUP = 5;

    this.PLATFORM_TOTAL_WIDTH_FACTOR = 2;

    this.PLATFORM_SPEED_INITIAL = 80;
    this.PLATFORM_SPEED_SPEEDUP = 1;

    this.MOUSE_SENSITIVITY = 0.3;

    this.game = game;
};
Drop.Main.prototype = 
{  
    preload: function()
    {
        if (DEBUG) {
            this.game.time.advancedTiming = true;
        }
    },

    create: function()
    {       
        //this.game.rnd.sow([5]);
        
        this.game.stage.backgroundColor = '#F3EDDF';
        this.game.world.setBounds(0, 0, this.game.width, this.LEVEL_HEIGHT);

        this.game.sound.stopAll();
        this.game.sound.play('music', 0.9, true);

        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.p2.gravity.y = this.LEVEL_GRAVITY;
        this.game.physics.p2.restitution = 0.5;
        this.game.physics.p2.applyDamping = true;
        this.game.physics.p2.setImpactEvents(true);

        this.cursorKeys = this.game.input.keyboard.createCursorKeys();
    
        this.platformCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.ballCollisionGroup = this.game.physics.p2.createCollisionGroup();

        this.platformLayerGroup = this.game.add.group();

        this.ball = new Ball(this.BALL_RADIUS, this);
        this.ball.body.x = this.game.world.width/2;
        this.ball.body.y = this.BALL_RADIUS;
        this.ball.body.velocity.y = 10;
    
        this.platformWidth = this.PLATFORM_SIZE_INITIAL;
        this.ySpeed = this.PLATFORM_SPEED_INITIAL;
        this.yPosition = 0;

        this.yLast = this.PLATFORM_DISTANCE * 3;

        this.ballMaterial = this.game.physics.p2.createMaterial('ballMaterial', this.ball.body);
        this.platformMaterial = this.game.physics.p2.createMaterial('platformMaterial');
        
        var contactMaterial = this.game.physics.p2.createContactMaterial(this.ballMaterial, this.platformMaterial);
        contactMaterial.friction = 0.4; 
        contactMaterial.restitution = 0.2;
        contactMaterial.stiffness = 1e3;
        contactMaterial.relaxation = 1;
        contactMaterial.frictionStiffness = 1e7;
        contactMaterial.frictionRelaxation = 1;
        contactMaterial.surfaceVelocity = 0.0;

        this.progressBar = new VerticalProgress(this);
    },

    update: function()
    {    
        // difficulty
        var dt = this.game.time.physicsElapsed;
        
        this.ySpeed += this.PLATFORM_SPEED_SPEEDUP*dt;
        this.platformWidth += this.PLATFORM_SIZE_SPEEDUP*dt;

        // scrolling
        this.yPosition += this.ySpeed * dt;
        this.game.camera.y = this.yPosition;
     
        // inputs / movement 

        var dx = 0;
        if (this.game.input.mouse.locked) {
            dx = this.game.input.activePointer.movementX * this.MOUSE_SENSITIVITY;
            this.game.input.activePointer.resetMovement();
        } else {
            var x = this.game.input.activePointer.isDown ? this.game.input.activePointer.position.x : null;
            if (x && this.lastX) {
                dx = x - this.lastX;
            }
            this.lastX = x;
        }

        if (isNaN(dx)) {
            dx = 0;
        }

        if (dx != 0) {
            for(var i=0; i<this.platformLayerGroup.children.length;i++) {
                var layer = this.platformLayerGroup.children[i];
                if ((layer.y > this.ball.body.y) && (layer.y - this.PLATFORM_DISTANCE < this.ball.body.y)) {
                    layer.x += dx; 
                }
            }
        }

        // progress bar
        this.progressBar.update();
   
        // update platforms
        for(var i=0; i<this.platformLayerGroup.children.length;i++) {
            var layer = this.platformLayerGroup.children[i];
            if (layer.y + layer.height/2 < this.game.camera.y) {
                layer.destroy(true);
            }
        }
        while(this.yLast < this.game.camera.y + this.game.camera.height + this.PLATFORM_HEIGHT) {
            var layer = new PlatformLayer(this.game.world.width*this.PLATFORM_TOTAL_WIDTH_FACTOR, this);
            layer.y = this.yLast;
            this.platformLayerGroup.add(layer);
            this.yLast += this.PLATFORM_DISTANCE;
        }

        // check win/lose conditions
        if (this.ball.body.y + this.ball.height/2 < this.game.camera.y) {
            this.game.state.start('Menu', true, false, 'Game Over.', 'Click to try again.');
        } else if (this.ball.body.y + this.ball.height/2 >= this.game.world.height) {
            this.game.state.start('Menu', true, false, 'Congrats!', 'Click to go again.');
        }

        if (this.ball.body.y + this.ball.height/2 > this.game.camera.y + this.game.camera.height) {
            this.ball.body.y = this.game.camera.y + this.game.camera.height - this.ball.height/2;
            this.ball.body.setZeroVelocity();
        } 
        if (this.ball.body.x - this.ball.width/2 < 0) {
            this.ball.body.x = this.ball.width/2;
        } else if (this.ball.body.x + this.ball.width/2 > this.game.world.width) {
            this.ball.body.x = this.game.world.width - this.ball.width/2;
        }
    },

    render: function()
    {
        //this.game.paused = ! (this.game.device.touch || this.game.input.mouse.locked);

        if (DEBUG) {
            this.game.debug.text("FPS: " + (this.game.time.fps || '--'), 2, 15, "#ffffff");
            this.game.debug.text("Layers: " + this.platformLayerGroup.total , 2, 30, "#ffffff");
        }
    },

    resize: function(width, height)
    {
        this.progressBar.resize(width, height);
        this.game.physics.p2.updateBoundsCollisionGroup();
    },

    shutdown: function() {
        this.game.sound.stopAll();
    }
}