'use strict'

/**
 * Exemplo de jogo com miscelanea de elementos:
 * - control de personagem por rotacionar e mover usando arcade physics
 * - dois players PVP
 * - pool e tiros
 * - colisao de tiros e players
 * - taxa de tiros e variancia de angulo
 * - HUD simples
 * - mapa em TXT
 */

const config = {}
config.RES_X = 1280 // resolucao HD
config.RES_Y = 720

config.GRAVITY_VALOR = 2000

config.PLAYER_ACCELERATION  = 300
// config.PLAYER_TURN_VELOCITY = 350
config.PLAYER_MAX_VELOCITY  = 300
config.PLAYER_HEALTH        = 30
config.PLAYER_MAX_HEALTH    = 50
config.PLAYER_DRAG          = 300
config.PLAYER_JUMP          = 750

config.BULLET_FIRE_RATE     = 20
config.BULLET_ANGLE_ERROR   = 0.05
config.BULLET_LIFE_SPAN     = 750
config.BULLET_VELOCITY      = 700

config.SPIDER_HEALTH        = 5
config.PACMAN_HEALTH        = 10

var sky
var fog
var medkit
var medkit2
var shield
var shield2
var player1
var player2
var hud
var map
var obstacles
var spiderEnemy
var pacmanEnemy
var numberEnemies = 2
var canSpawnEnemy = true
var enemy_wave
var enemiesAlive = 0
var waveNumber = 1

var game = new Phaser.Game(config.RES_X, config.RES_Y, Phaser.CANVAS, 
    'game-container',
    {   
        preload: preload,
        create: create,
        update: update,
        render: render
    })

function preload() {
    game.load.image('saw', 'assets/saw.png')
    game.load.image('sky', 'assets/sky.png')
    game.load.image('plane1', 'assets/airplane1.png')
    game.load.image('shot', 'assets/shot.png')
    game.load.image('wall', 'assets/wall.png')
    game.load.image('fog', 'assets/fog.png')
    game.load.text('map1', 'assets/map1.txt')  // arquivo txt do mapa
    game.load.image('playerImg', 'assets/wabbit.png')
    game.load.image('medkit', 'assets/medkit.png')
    game.load.image('shield', 'assets/shield.png')
    game.load.image('pacmanEnemy', 'assets/pacman_enemy.png')
    game.load.image('spiderEnemy', 'assets/spider_enemy.png')
}

function createBullets() {
    var bullets = game.add.group()
    bullets.enableBody = true
    bullets.physicsBodyType = Phaser.Physics.ARCADE
    bullets.createMultiple(10, 'shot')
    bullets.setAll('anchor.x', 0.5)
    bullets.setAll('anchor.y', 0.5)
    return bullets
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE)

    var skyWidth = game.cache.getImage('sky').width
    var skyHeight = game.cache.getImage('sky').height
    sky = game.add.tileSprite(
        0, 0, skyWidth, skyHeight, 'sky')
    sky.scale.x = game.width/sky.width
    sky.scale.y = game.height/sky.height

    fog = game.add.tileSprite(
        0, 0, game.width, game.height, 'fog')
    fog.tileScale.setTo(7,7)
    fog.alpha = 0.4

   
    
    obstacles = game.add.group()
    createMap()

    player1 = new PlayerTeste(game, 50, game.height - 34,
                                'playerImg', 0xff0000, createBullets(), {   
            left: Phaser.Keyboard.A,
            right: Phaser.Keyboard.D,
            up: Phaser.Keyboard.W,
            down: Phaser.Keyboard.S,
            fire: Phaser.Keyboard.G
            })
    game.add.existing(player1)

    player2 = new PlayerTeste(game, game.width - 50, game.height - 34,
                                'playerImg', 0x00ff00, createBullets(), {   
            left: Phaser.Keyboard.LEFT,
            right: Phaser.Keyboard.RIGHT,
            up: Phaser.Keyboard.UP,
            down: Phaser.Keyboard.DOWN,
            fire: Phaser.Keyboard.L
            })
    game.add.existing(player2)

    medkit = game.add.sprite(0,0, 'medkit')
    medkit.x = 32+20
    medkit.y = 160-20
    medkit.anchor.setTo(0.5,0.5)
    medkit.scale.setTo(0.05,0.05)
    game.physics.arcade.enable(medkit)
    medkit.body.immovable = true
    
    medkit2 = game.add.sprite(0,0, 'medkit')
    medkit2.x = 1280-52
    medkit2.y = 160-20
    medkit2.anchor.setTo(0.5,0.5)
    medkit2.scale.setTo(0.05,0.05)
    game.physics.arcade.enable(medkit2)
    medkit2.body.immovable = true

    // spiderEnemy = game.add.sprite(0,0,'spiderEnemy')
    // spiderEnemy.x = 0
    // spiderEnemy.y = 232
    // spiderEnemy.anchor.setTo(0.5,0.5)
    // spiderEnemy.scale.setTo(0.10,0.10)
    // spiderEnemy.health = 20
    // game.physics.arcade.enable(spiderEnemy)


    // pacmanEnemy = game.add.sprite(0,0,'pacmanEnemy')
    // pacmanEnemy.x = 1250
    // pacmanEnemy.y = 232
    // pacmanEnemy.anchor.setTo(0.5,0.5)
    // pacmanEnemy.scale.setTo(0.10,0.10)
    // pacmanEnemy.health = 30
    // pacmanEnemy.tint = 0x0000ff
    // game.physics.arcade.enable(pacmanEnemy)
    


    // shield = game.add.sprite(0,0, 'shield')
    // shield.scale.setTo(0.15,0.15)
    // shield.x = 32 
    // shield.y = 224
    // game.physics.arcade.enable(shield)
    
    
    hud = {
        text1: createHealthText(game.width*1/9, 50, 'PLAYER 1: 20'),
        text2: createHealthText(game.width*8/9, 50, 'PLAYER 2: 20'),
        text3: createHealthText(game.width*1/9, 75, 'SHIELD: 0'),
        text4: createHealthText(game.width*8/9, 75, 'SHIELD: 0'),
        wave: createHealthText((game.width/2), 50, 'Wave 1'),
    }
    
    

    //var fps = new FramesPerSecond(game, game.width*3/9, 50)
    //game.add.existing(fps)

    var fullScreenButton = game.input.keyboard.addKey(Phaser.Keyboard.ONE)
    fullScreenButton.onDown.add(toggleFullScreen)

    game.time.advancedTiming = true;

    enemy_wave = game.add.group()
    updateHud()

   }

function loadFile() {
    var text = game.cache.getText('map1');
    return text.split('\n');
}

function createMap() {
    // carrega mapa de arquivo texto
    var mapData = loadFile()

    map = game.add.group()
    for (var row = 0; row < mapData.length; row++) {
        for (var col = 0; col < mapData[row].length; col++) {
            var tipo = mapData[row][col]
            var param = ''
            if (col+1 < mapData[row].length) {
                param = mapData[row][col+1]
            }
            if (tipo == 'X') {
                var wall = map.create(col*32, row*32, 'wall')
                wall.scale.setTo(0.5, 0.5)
                game.physics.arcade.enable(wall)
                wall.body.immovable = true
                wall.tag = 'wall'
            } else
            if (tipo == 'S') {
                var saw = new Saw(game, col*32, row*32, 'saw', param) 
                //game.add.existing(saw)
                obstacles.add(saw)
            }
        }
    }
}

function toggleFullScreen() {
    game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL
    if (game.scale.isFullScreen) {
        game.scale.stopFullScreen()
    } else {
        game.scale.startFullScreen(false)
    }
}

function createHealthText(x, y, text) {
    var style = {font: 'bold 16px Arial', fill: 'white'}
    var text = game.add.text(x, y, text, style)
    //text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2)
    text.stroke = '#000000';
    text.strokeThickness = 2;
    text.anchor.setTo(0.5, 0.5)
    return text
}

function updateBullets(bullets) {
    bullets.forEach(function(bullet) {
        game.world.wrap(bullet, 0, true)
    })
}

function spawnEnemies(){
    //canSpawnEnemy = false
    //enemy_wave = game.add.group();
    var i = 0
    var posX
    var posY

    for(i=0; i<numberEnemies; i++){
        var enemy
        posX = game.rnd.integerInRange(-200,0)
        posY = game.rnd.integerInRange(0,232)
        console.log(posY)
        enemy = enemy_wave.create(0,posY,'spiderEnemy')
        create_enemy_body(enemy)
        enemy.name = 'enemySpider'
        enemy.scale.setTo(0.10,0.10)
        enemy.health = config.SPIDER_HEALTH        
    }

    for(i=0; i<(numberEnemies/2); i++){
        var enemy
        enemy = enemy_wave.create(1250,232,'pacmanEnemy')
        create_enemy_body(enemy)
        enemy.name = 'pacmanEnemy'
        enemy.scale.setTo(0.10, 0.10)
        enemy.health = config.SPIDER_HEALTH
    }
    enemiesAlive = numberEnemies + (numberEnemies/2)
    numberEnemies = numberEnemies * 2
}

function followPlayer(enemy){
    if(enemy.name == 'enemySpider'){
        game.physics.arcade.moveToObject(enemy,player2,6000,1500)
    }else{
        game.physics.arcade.moveToObject(enemy,player1,6000,1000)      
    }
}



function hitPlayer(player,enemy) {
    player.damage(5)
    
}

function hitEnemy(bullet,enemy) {
    bullet.kill()
    enemy.damage(5)
    enemy.events.onKilled.add(function(){
        enemy.destroy()
    })
}

// da pra usar essa funcao se precisar que apenas um inimigo colida com o chão
// function checkCollisionMapEnemies(enemy,map){
//     if(enemy.name === 'spiderEnemy'){
//         game.physics.arcade.collide(enemy,map)
//     }
// }

function checkWave(){
    if(enemy_wave.countLiving() == 0){
        waveNumber = waveNumber+1 
    }
}

function update() {
    if(enemy_wave.countLiving() == 0){
        spawnEnemies()
    }
    
    
    enemy_wave.forEachAlive(followPlayer)

    // game.physics.arcade.moveToObject(spiderEnemy,player2,6000,1500)
    // game.physics.arcade.moveToObject(pacmanEnemy,player2,6000,1000)
    // game.physics.arcade.moveToObject(enemy_wave.getAt(0),player2,6000,1000)
    // game.physics.arcade.moveToObject(enemy_wave.getAt(1),player2,6000,1000)
    // game.physics.arcade.moveToObject(enemy_wave.getAt(2),player2,6000,1000)
    
    
    updateHud()
    hud.wave.text = `Wave ${waveNumber}`
    
    sky.tilePosition.x += 0.5
    fog.tilePosition.x += 0.3
    
    game.physics.arcade.collide(player1, map)
    game.physics.arcade.collide(player2, map)
    game.physics.arcade.collide(medkit, map)   
    game.physics.arcade.collide(medkit2, map)   
    // game.physics.arcade.collide(spiderEnemy, map)   
    
    
 
    //moveAndStop(player1)
    updateBullets(player1.bullets)
    updateBullets(player2.bullets)
   
    game.physics.arcade.collide(player1, player2)   
       
    game.physics.arcade.collide(player1, medkit,addHealth)      
    game.physics.arcade.collide(player1, medkit2,addHealth)      
    game.physics.arcade.collide(player2, medkit,addHealth)      
    game.physics.arcade.collide(player2, medkit2,addHealth)      
  
    game.physics.arcade.collide(player1.bullets, map, killBullet)
    game.physics.arcade.collide(player2.bullets, map, killBullet)

    game.physics.arcade.collide(player1,enemy_wave,hitPlayer)
    game.physics.arcade.collide(player2,enemy_wave,hitPlayer)

    game.physics.arcade.collide(player1.bullets,enemy_wave,hitEnemy)
    game.physics.arcade.collide(player2.bullets,enemy_wave,hitEnemy)
    checkWave() 
    
    
    
    

    // game.physics.arcade.collide(enemy_wave, map, checkCollisionMapEnemies)
    
    
    
   
    

    // game.physics.arcade.collide(player2,player1.bullets, hitPlayer)
    // game.physics.arcade.collide(player1,player2.bullets, hitPlayer)
        
}


function create_enemy_body(enemy){
    enemy.anchor.setTo(0.5, 0.5);
    game.physics.enable(enemy, Phaser.Physics.ARCADE);
    enemy.body.collideWorldBounds = false;
    return enemy
}

function killBullet(bullet, wall) {
    //wall.kill()
    bullet.kill()
}

function hitPacman(pacmanEnemy, bullet){
    if(pacmanEnemy.alive){
        pacmanEnemy.damage(1)
        bullet.kill()
        updateHud()
    }
}

function addHealth(player, medkit){
    player.heal(10)

    var timer = game.time.create(true)
    timer.add(2*(Phaser.Timer.SECOND), reviveMedkit, this, medkit)
    medkit.kill()
    
    timer.start()
}

function reviveMedkit(m){
    m.revive(1)
    m.immovable = true
}

function updateHud() {
    hud.text1.text = `PLAYER 1: ${player1.health}`
    hud.text2.text = 'PLAYER 2: ' + player2.health
    hud.text3.text = 'SHIELD: ' + enemy_wave.countLiving()
    //hud.text4.text = 'SHIELD: ' + player2.shield
}

function render() {
   // game.debug.body(player1)

    obstacles.forEach( function(obj) {
        game.debug.body(obj)
    })
    
    //  game.debug.body(pacmanEnemy)
    // game.debug.body(medkit2)
    //game.debug.body(shield)
    // game.debug.body(shield2)
    game.debug.body(enemy_wave.getAt(0))
    
}

