
class PlayerTeste extends Phaser.Sprite {
    constructor(game, x, y, img, tint, bullets, keys){
        super(game,x,y,img)
        this.tint = tint
        this.health = config.PLAYER_HEALTH
        this.anchor.setTo(0.5, 0.5)
        game.physics.arcade.enable(this)
        this.body.gravity.y = config.GRAVITY_VALOR
        this.body.bounce.y = 0.1
        //colide com as bordas da tela
        this.body.collideWorldBounds = true



        this.cursors = {
            left: game.input.keyboard.addKey(keys.left),
            right: game.input.keyboard.addKey(keys.right),
            up: game.input.keyboard.addKey(keys.up),
            down: game.input.keyboard.addKey(keys.down),        
            fire: game.input.keyboard.addKey(keys.fire)
        }
    }

    walk(){
        this.body.velocity.x = 0;
        var jumpTimer = 0

        if(this.cursors.left.isDown){
            this.body.velocity.x = -config.PLAYER_ACCELERATION
        }else if(this.cursors.right.isDown){
            this.body.velocity.x = config.PLAYER_ACCELERATION 
        }

        if(this.cursors.up.isDown && this.body.touching.down){
            this.body.velocity.y = -750
            //jumpTimer = game.time.now + 750
        }

        // if(this.cursors.up.isDown && game.time.now > jumpTimer){
        //     this.body.velocity.y = -250
        //     jumpTimer = game.time.now + 750
        // }
    }

    update(){
        this.walk()
    }
}