
class PlayerTeste extends Phaser.Sprite {
    constructor(game, x, y, img, tint, bullets, keys){
        super(game,x,y,img)
        var flagSide = 0 // 0 == Direita , 1 == Esquerda  Guarda o lado do sprite, pra que ele atire para o lado que está apontando
        var shield
        this.tint = tint // Define a cor do Player
        this.health = config.PLAYER_HEALTH //Define o valor inicial do player
        this.maxHealth = config.PLAYER_MAX_HEALTH  //Define o valor máximo da vida do player
        this.anchor.setTo(0.5, 0.5)
        game.physics.arcade.enable(this) 
        this.body.gravity.y = config.GRAVITY_VALOR
        this.body.bounce.y = 0.1
        //colide com as bordas da tela
        this.body.collideWorldBounds = true
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

    walk(){
        this.body.velocity.x = 0;
        //var jumpTimer = 0

        if(this.cursors.left.isDown){
            this.body.velocity.x = -config.PLAYER_ACCELERATION
            this.flagSide = 1
        }else if(this.cursors.right.isDown){
            this.body.velocity.x = config.PLAYER_ACCELERATION
            this.flagSide = 0 
        }
        

        if(this.cursors.up.isDown && this.body.touching.down){
            this.body.velocity.y = -config.PLAYER_JUMP
        }
        
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
                    if(this.flagSide){
                        bullet.rotation = 3.14
                    }else{
                        bullet.rotation = 0
                    }                    
                    //bullet.body.bounce.setTo(1,1)
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

    update(){
        this.walk()
        this.fireBullet()
    }
}