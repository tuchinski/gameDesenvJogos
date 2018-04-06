
class Player extends Phaser.Sprite {
    constructor(game, x, y, img, tint, bullets, keys) {
        super(game, x, y, img)
        this.tint = tint
        this.health = config.PLAYER_HEALTH
        this.anchor.setTo(0.5, 0.5)
        game.physics.arcade.enable(this)
        this.body.drag.set(config.PLAYER_DRAG)
        this.body.maxVelocity.set(config.PLAYER_MAX_VELOCITY)
        this.body.isCircle = true
        this.body.mass = 0.1
        this.body.friction.setTo(0,0)
        this.body.bounce.setTo(1,1)
        this.nextFire = 0
    
        this.cursors = {
            left: game.input.keyboard.addKey(keys.left),
            right: game.input.keyboard.addKey(keys.right),
            up: game.input.keyboard.addKey(keys.up),
            down: game.input.keyboard.addKey(keys.down),        
            fire: game.input.keyboard.addKey(keys.fire)
        }
    
        this.bullets = bullets
    }        

    // move e rotaciona, como em Asteroids
    moveAndTurn() {
        // define aceleracao pela rotacao (radianos) do sprite
        if (this.cursors.up.isDown) {
            game.physics.arcade.accelerationFromRotation(
                this.rotation, config.PLAYER_ACCELERATION, this.body.acceleration
            )
        } else {
            // precisa anular campo "acceleration" caso nao pressione UP
            this.body.acceleration.set(0)
        }

        // rotaciona
        if (this.cursors.left.isDown) {
            this.body.angularVelocity = -config.PLAYER_TURN_VELOCITY
        } else
        if (this.cursors.right.isDown) {
            this.body.angularVelocity = config.PLAYER_TURN_VELOCITY
        } else {
            this.body.angularVelocity = 0
        }

        // atravessa bordas da tela (usando phaser built-in)
        game.world.wrap(this, 0, true)
    }   
    
    fireBullet() {
        if (!this.alive)
            return;
    
        if (this.cursors.fire.isDown) {
            if (this.game.time.time > this.nextFire) {
                var bullet = this.bullets.getFirstExists(false)
                if (bullet) {
                    bullet.reset(this.x, this.y)
                    bullet.lifespan = config.BULLET_LIFE_SPAN
                    bullet.rotation = this.rotation
                    bullet.body.bounce.setTo(1,1)
                    bullet.body.friction.setTo(0,0)
                    game.physics.arcade.velocityFromRotation(
                        bullet.rotation + game.rnd.realInRange(-config.BULLET_ANGLE_ERROR, config.BULLET_ANGLE_ERROR), 
                        config.BULLET_VELOCITY, bullet.body.velocity
                    )
                    // fire rate
                    this.nextFire = this.game.time.time + config.BULLET_FIRE_RATE
                }
            }
        }    
    } 
    
    update() {
        this.moveAndTurn()
        this.fireBullet()
    }
}