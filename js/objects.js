var VerticalProgress = function(stage) {
    this.stage = stage;

    this.padding = 10;
    this.width = 50;
    this.min = 0;
    this.max = this.stage.game.world.height;
    this.resize(this.stage.game.width, this.stage.game.height);
}
VerticalProgress.prototype.update = function() {
    var value = this.stage.game.camera.y;
    var offset = (value-this.min) / (this.max - this.min) * this.bgSprite.height;
    this.handleSprite.cameraOffset.y = offset + this.padding;
}
VerticalProgress.prototype.resize = function(width, height) {
    if (this.bgSprite) 
        this.bgSprite.destroy();
    if (this.handleSprite)
        this.handleSprite.destroy();

    var bgGraphics = this.stage.game.add.bitmapData(this.width, height - 2*this.padding);
    bgGraphics.ctx.rect(0, 0, bgGraphics.width, bgGraphics.height);
    bgGraphics.ctx.fillStyle = "#F3EDDF";
    bgGraphics.ctx.fill();
    bgGraphics.ctx.strokeStyle = "#252122";
    bgGraphics.ctx.lineWidth = this.stage.GFX_STROKE_WIDTH;
    bgGraphics.ctx.stroke();

    this.bgSprite = this.stage.game.add.sprite(0, 0, bgGraphics);
    this.bgSprite.fixedToCamera = true;
    this.bgSprite.anchor.set(0);
    this.bgSprite.alpha = 0.9;

    this.bgSprite.cameraOffset.x = width - this.width - this.padding;
    this.bgSprite.cameraOffset.y = this.padding;

    var iconHeight = this.bgSprite.height * (height / this.stage.game.world.height);

    var handleGraphics = this.stage.game.add.bitmapData(this.bgSprite.width, iconHeight);
    handleGraphics.ctx.rect(0, 0, this.bgSprite.width, iconHeight);
    handleGraphics.ctx.fillStyle = "#F1AB53";
    handleGraphics.ctx.fill();
    handleGraphics.ctx.strokeStyle = "#252122";
    handleGraphics.ctx.lineWidth = this.stage.GFX_STROKE_WIDTH;
    handleGraphics.ctx.stroke();

    this.handleSprite = this.stage.game.add.sprite(this.bgSprite.x, this.bgSprite.y, handleGraphics);
    this.handleSprite.fixedToCamera = true;
    this.handleSprite.anchor.set(0);
    this.handleSprite.alpha = 0.9;
    this.handleSprite.cameraOffset.x = width - this.width - this.padding;
    this.handleSprite.cameraOffset.y = this.padding;
}

var Ball = function(radius, stage) {
    var graphics = stage.game.add.bitmapData(2*radius, 2*radius);
    graphics.ctx.arc(radius, radius, radius - stage.GFX_STROKE_WIDTH/2, 0, 2*Math.PI, false);
    graphics.ctx.fillStyle = "#F1AB53";
    graphics.ctx.fill();
    graphics.ctx.lineWidth = stage.GFX_STROKE_WIDTH;
    graphics.ctx.strokeStyle = "#D74641";
    graphics.ctx.stroke();

    Phaser.Sprite.call(this, stage.game, 0, 0, graphics);

    stage.game.physics.p2.enable(this, DEBUG);
    this.body.dynamic = true;
    this.body.fixedRotation = true;
    this.body.collideWorldBounds = true;
    this.body.setCircle(radius);
    this.body.setCollisionGroup(stage.ballCollisionGroup);

    var self = this;
    this.body.collides(stage.platformCollisionGroup, function() {
        var vx = self.body.velocity.x;
        var vy = self.body.velocity.y;
        var force = vx*vx+vy*vy;

        var volume = Math.sqrt(force) / 800;
        self.game.sound.play('pong', Math.min(volume, 1.0));
    });

    stage.game.add.existing(this);
}
Ball.prototype = Object.create(Phaser.Sprite.prototype);
Ball.prototype.constructor = Ball;


var Platform = function(width, stage) {
    var graphics = stage.game.add.bitmapData(width, stage.PLATFORM_HEIGHT);
    graphics.ctx.rect(0, 0, width, stage.PLATFORM_HEIGHT);
    graphics.ctx.fillStyle = "#252122";
    graphics.ctx.fill();

    Phaser.Sprite.call(this, stage.game, 0, 0, graphics);

    stage.game.physics.p2.enable(this, DEBUG);
    this.body.kinematic = true;
    this.body.fixedRotation = true;
    this.body.collideWorldBounds = false;
    this.body.setRectangle(width, stage.PLATFORM_HEIGHT);
    this.body.setCollisionGroup(stage.platformCollisionGroup);

    this.body.collides(stage.ballCollisionGroup);

    stage.game.add.existing(this);
}
Platform.prototype = Object.create(Phaser.Sprite.prototype);
Platform.prototype.constructor = Platform;


var PlatformLayer = function(totalWidth, stage) {
    Phaser.Group.call(this, stage.game, null, 'platforms', false);

    var x = 0;
    while (x < totalWidth) {
        var width = stage.game.rnd.realInRange(
            stage.platformWidth - stage.platformWidth*0.7, 
            stage.platformWidth + stage.platformWidth*0.7
        );
        var platform = new Platform(width, stage);
        platform.body.x = platform.relativeX = x + width/2; // - (totalWidth - stage.game.world.width)/2;
        platform.body.setMaterial(stage.platformMaterial);
        this.add(platform);

        x += (width + stage.GAP_WIDTH);
    }
    this.totalWidth = totalWidth;

    this.x -= (this.totalWidth-stage.game.world.width) / 2

    stage.game.add.existing(this);
}
PlatformLayer.prototype = Object.create(Phaser.Group.prototype);
PlatformLayer.prototype.constructor = PlatformLayer;

PlatformLayer.prototype.update = function() {
    this.x = Math.min(this.x, 0);
    this.x = Math.max(this.x, -this.totalWidth + this.game.world.width);

    for (var i=0;i<this.children.length;i++) {
        var child = this.children[i];

        // workaround, reverse apply offsetX, offsetY
        child.anchor.x = (child.x-child.relativeX) / child.width + 0.5;
        child.anchor.y = child.body.y / child.height + 0.5;

        child.body.x = this.x + child.relativeX;
        child.body.y = this.y;

    }
}