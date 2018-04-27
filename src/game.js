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

config.PLAYER_ACCELERATION = 300
// config.PLAYER_TURN_VELOCITY = 350
config.PLAYER_MAX_VELOCITY = 300
config.PLAYER_HEALTH = 3
config.PLAYER_MAX_HEALTH = 5
config.PLAYER_DRAG = 300
config.PLAYER_JUMP = 750

config.BULLET_FIRE_RATE = 20
config.BULLET_ANGLE_ERROR = 0.05
config.BULLET_LIFE_SPAN = 750
config.BULLET_VELOCITY = 700

config.SPIDER_HEALTH = 2
config.PACMAN_HEALTH = 5
config.ROCKET_HEALTH = 10

var sky
var fog
var medkit                  //Medkit do lado esquerdo
var medkit2                 //Medkit do lado direito
var shield
var shield2
var rocket
var qtdeRockets = 4
var tweenRocket
var player1
var player2
var player1Name = 'Player1'
var player2Name = 'Player2'
var startX_P1 = 50
var startY_P1
var startX_P2
var startY_P2
var hud                     //HUD da tela, mostra a vida dos personagens, num da wave, etc
var map                     //recebe o map.txt
var obstacles
// var spiderEnemy
// var pacmanEnemy
var numberEnemies = 2       //controla quantos inimigos serão gerados
var canSpawnEnemy = true
var canSpawnRockets = true
var enemy_wave              //grupo que contém os inimigos
var enemiesAlive = 0        //verifica quantos inimigos estão vivos
var waveNumber = 0          //controla o número da wave
var flagFollowPlayer = -1        //flag que define qual player o inimigo tem que seguir
var gameState
var timerEnemy
var nextWaveTimer
var rocketGroup = []
var timerRocket
var countRocket
var tweenRocket
var tween
var tween2
var tween3
var tween4
var controlTween

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
    game.load.image('rocket', 'assets/rocket.png')
    game.load.image('ghost', 'assets/ghost_mario.png')
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
    gameState = 'Start'
    game.physics.startSystem(Phaser.Physics.ARCADE)

    var skyWidth = game.cache.getImage('sky').width
    var skyHeight = game.cache.getImage('sky').height
    sky = game.add.tileSprite(
        0, 0, skyWidth, skyHeight, 'sky')
    sky.scale.x = game.width / sky.width
    sky.scale.y = game.height / sky.height

    fog = game.add.tileSprite(
        0, 0, game.width, game.height, 'fog')
    fog.tileScale.setTo(7, 7)
    fog.alpha = 0.4



    obstacles = game.add.group()
    createMap()

    startX_P1 = 50
    startY_P1 = game.height - 34
    startX_P2 = game.width - 50
    startY_P2 = game.height - 34

    player1 = new PlayerTeste(game, startX_P1, startY_P1,
        'playerImg', 0xff0000, createBullets(), player1Name, {
            left: Phaser.Keyboard.A,
            right: Phaser.Keyboard.D,
            up: Phaser.Keyboard.W,
            down: Phaser.Keyboard.S,
            fire: Phaser.Keyboard.G
        })
    game.add.existing(player1)
    player1.shield = 0

    player2 = new PlayerTeste(game, startX_P2, startY_P2,
        'playerImg', 0x00ff00, createBullets(), player2Name, {
            left: Phaser.Keyboard.LEFT,
            right: Phaser.Keyboard.RIGHT,
            up: Phaser.Keyboard.UP,
            down: Phaser.Keyboard.DOWN,
            fire: Phaser.Keyboard.L
        })
    game.add.existing(player2)
    player2.shield = 0

    medkit = game.add.sprite(0, 0, 'medkit')
    medkit.x = 32 + 20
    medkit.y = 160 - 20
    medkit.anchor.setTo(0.5, 0.5)
    medkit.scale.setTo(0.05, 0.05)
    game.physics.arcade.enable(medkit)
    medkit.body.immovable = true

    medkit2 = game.add.sprite(0, 0, 'medkit')
    medkit2.x = 1280 - 52
    medkit2.y = 160 - 20
    medkit2.anchor.setTo(0.5, 0.5)
    medkit2.scale.setTo(0.05, 0.05)
    game.physics.arcade.enable(medkit2)
    medkit2.body.immovable = true


    shield = game.add.sprite(0, 0, 'shield')
    shield.scale.setTo(0.15, 0.15)
    shield.x = 32
    shield.y = 224
    game.physics.arcade.enable(shield)

    // var g = game.add.sprite(0,0,'ghost')
    // g.x = 500
    // g.y = 500
    // g.scale.setTo(0.25,0.25)

    shield2 = game.add.sprite(0, 0, 'shield')
    shield2.scale.setTo(0.15, 0.15)
    shield2.x = 1220
    shield2.y = 224
    game.physics.arcade.enable(shield2)

    

    // rocketGroup = game.add.group()

    // // var enemy
    // // posX = -50
    // // posY = game.rnd.integerInRange(32, 700)
    // // create_enemy_body(enemy)
    // // enemy.name = 'rocketEnemy'
    // // enemy.scale.setTo(0.10, 0.10)
    // // enemy.health = config.ROCKET_HEALTH
   

    for(var i=0;i<qtdeRockets;i++){
        var enemy
        enemy = game.add.sprite(0,0,'rocket')
        var posX = -50
        var posY = game.rnd.integerInRange(32,700)
        create_enemy_body(enemy)
        enemy.name = 'rocketEnemy'
        enemy.scale.setTo(0.10,0.10)
        enemy.health = config.ROCKET_HEALTH
        enemy.x = posX
        enemy.y = posY
        enemy.collideWorldBounds = true
        rocketGroup[i] = enemy
    }

    controlTween = 0
    tween = game.add.tween(rocketGroup[0]).to({ x: 1400 }, 3000, 'Linear', false, 0, -1, true)
    tween2 = game.add.tween(rocketGroup[1]).to({ x: 1400 }, 3000, 'Linear', false, 0, -1, true)
    tween3 = game.add.tween(rocketGroup[2]).to({ x: 1400 }, 3000, 'Linear', false, 0, -1, true)
    tween4 = game.add.tween(rocketGroup[3]).to({ x: 1400 }, 3000, 'Linear', false, 0, -1, true)
    //startTween()

    timerRocket = game.time.create(true)
    timerRocket.repeat(8000,4,startTween,this)
    timerRocket.start()






    hud = {
        text1: createText(game.width * 1 / 9, 50, 'PLAYER 1: 20'),
        text2: createText(game.width * 8 / 9, 50, 'PLAYER 2: 20'),
        text3: createText(game.width * 1 / 9, 75, 'SHIELD: 0'),
        text4: createText(game.width * 8 / 9, 75, 'SHIELD: 0'),
        wave: createWaveText((game.width / 2), 50, 'Wave 1'),
        nextWaveTimer: createTimerText(game.width / 2, game.height / 2, '3')
    }




    //var fps = new FramesPerSecond(game, game.width*3/9, 50)
    //game.add.existing(fps)

    var fullScreenButton = game.input.keyboard.addKey(Phaser.Keyboard.ONE)
    fullScreenButton.onDown.add(toggleFullScreen)

    game.time.advancedTiming = true;

    enemy_wave = game.add.group()
    updateHud()

    timerEnemy = game.time.create(false)
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
            if (col + 1 < mapData[row].length) {
                param = mapData[row][col + 1]
            }
            if (tipo == 'X') {
                var wall = map.create(col * 32, row * 32, 'wall')
                wall.scale.setTo(0.5, 0.5)
                game.physics.arcade.enable(wall)
                wall.body.immovable = true
                wall.tag = 'wall'
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

function createText(x, y, text) {
    var style = { font: 'bold 16px Arial', fill: 'white' }
    var text = game.add.text(x, y, text, style)
    //text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2)
    text.stroke = '#000000';
    text.strokeThickness = 2;
    text.anchor.setTo(0.5, 0.5)
    return text
}

function createGameOverText(x, y, text) {
    var style = { font: 'bold 64px Arial', fill: 'white' }
    var text = game.add.text(x, y, text, style)
    text.stroke = '#000000';
    text.strokeThickness = 2;
    text.anchor.setTo(0.5, 0.5)
    return text
}

function createWaveText(x, y, text) {
    var style = { font: 'bold 32px Arial', fill: 'white' }
    var text = game.add.text(x, y, text, style)
    text.stroke = '#000000';
    text.strokeThickness = 2;
    text.anchor.setTo(0.5, 0.5)
    return text
}


function createTimerText(x, y, text) {
    var style = { font: 'bold 64px Arial', fill: 'white' }
    var text = game.add.text(x, y, text, style)
    text.stroke = '#000000';
    text.strokeThickness = 2;
    text.anchor.setTo(0.5, 0.5)
    return text
}

function updateBullets(bullets) {
    bullets.forEach(function (bullet) {
        game.world.wrap(bullet, 0, true)
    })
}

function spawnEnemies() {
    canSpawnEnemy = false
    var i = 0
    var posX
    var posY
    var rand

    for (i = 0; i < numberEnemies; i++) {
        var enemy
        rand = game.rnd.integerInRange(0,1)
        if (rand == 0){
            posX = game.rnd.integerInRange(-200, 0)
            posY = game.rnd.integerInRange(0, 232)
        }else{
            posX = game.rnd.integerInRange(1250, 1300)
            posY = game.rnd.integerInRange(0, 300)
        }        
        enemy = enemy_wave.create(posX, posY, 'ghost')
        create_enemy_body(enemy)
        enemy.name = 'enemySpider'
        enemy.scale.setTo(0.25, 0.25)
        enemy.health = config.SPIDER_HEALTH
        enemy.playerToFollow = flagFollowPlayer
        flagFollowPlayer = flagFollowPlayer * (-1)
    }

    for (i = 0; i < (numberEnemies / 2); i++) {
        var enemy
        if (rand == 0){
            posX = game.rnd.integerInRange(-200, 0)
            posY = game.rnd.integerInRange(0, 232)
        }else{
            posX = game.rnd.integerInRange(1250, 1300)
            posY = game.rnd.integerInRange(0, 300)
        }
        enemy = enemy_wave.create(posX, posY, 'pacmanEnemy')
        create_enemy_body(enemy)
        enemy.name = 'pacmanEnemy'
        enemy.scale.setTo(0.10, 0.10)
        enemy.health = config.SPIDER_HEALTH
        enemy.playerToFollow = flagFollowPlayer
        flagFollowPlayer = flagFollowPlayer * (-1)
    }

    var valor = parseInt(waveNumber)
    // for(i=0;i<valor;i++){
    //     var enemy
    //     posX = -50
    //     posY = game.rnd.integerInRange(32,700)
    //     enemy = enemy_wave.create(posX,posY, 'rocket')
    //     create_enemy_body(enemy)
    //     enemy.name = 'rocketEnemy'
    //     enemy.scale.setTo(0.10,0.10)
    //     enemy.health = config.ROCKET_HEALTH
    //     enemy.playerToFollow = 2
    //     console.log(valor)
    // }

    enemiesAlive = numberEnemies + (numberEnemies / 2)
    numberEnemies = numberEnemies * 2
}

function followPlayer(enemy) {
    /*if(enemy.name == 'rocketEnemy'){
        var rocketX = enemy.x
        var rockety = enemy.y
        tweenRocket = game.add.tween(enemy).to({x:rocketX + 1450})
                                         .to({x:-50})
                                         
    }
    else*/ if (!player1.alive) {
        game.physics.arcade.moveToObject(enemy, player2, 6000, 1000)
    } else if (!player2.alive) {
        game.physics.arcade.moveToObject(enemy, player1, 6000, 1000)
    } else if (enemy.playerToFollow < 0) {
        game.physics.arcade.moveToObject(enemy, player1, 6000, 1000)
    } else {
        game.physics.arcade.moveToObject(enemy, player2, 6000, 1000)
    }
}





// da pra usar essa funcao se precisar que apenas um inimigo colida com o chão
// function checkCollisionMapEnemies(enemy,map){
//     if(enemy.name === 'spiderEnemy'){
//         game.physics.arcade.collide(enemy,map)
//     }
// }

// function verifyGameState(){
//     if (gameState == 'Start'){
//         spawnEnemies()
//         gameState = 'Running'
//     }else if(gameState == 'GameOver'){
//         var gameOver = createGameOverText(game.width/2, game.height/2, 'GAME OVER')
//         game.paused = true
//     }
// }

function showTimeToWave() {
    if (!timerEnemy.expired) {
        hud.nextWaveTimer.text = 'Next wave in: ' + (parseInt(timerEnemy.duration / 1000) + 1)
    } else {
        hud.nextWaveTimer.text = ''
    }
}

function tweenRockets(){
       tweenRocket = game.add.tween(rocketGroup[countRocket]).to({ x: 1400 }, 2000, 'Linear', true, 0, -1, true)
       countRocket++
       console.log(countRocket)
       canSpawnRockets = true
}

function startTween(){ 
    if(controlTween == 0){
        tween.start()
        controlTween++
    }else if(controlTween == 1){
        tween2.start()
        controlTween++
    }else if(controlTween == 2){
        tween3.start()
        controlTween++
    }else if(controlTween == 3){
        tween4.start()
        controlTween++
    }

}

function update() {
    //verifyGameState()
    // timerRocket.start()
    
    showTimeToWave()
    if (canSpawnEnemy == true) {
        canSpawnEnemy = false
        //timerEnemy = game.time.create(true)
        timerEnemy.add(3 * (Phaser.Timer.SECOND), spawnEnemies, this)
        //spawnEnemies()
        waveNumber = waveNumber + 1
        timerEnemy.start()
    } else if ((enemy_wave.countLiving() == 0 && timerEnemy.expired)) {
        canSpawnEnemy = true
    }
   

    enemy_wave.forEachAlive(followPlayer)

    // game.physics.arcade.moveToObject(spiderEnemy,player2,6000,1500)
    // game.physics.arcade.moveToObject(pacmanEnemy,player2,6000,1000)
    // game.physics.arcade.moveToObject(enemy_wave.getAt(0),player2,6000,1000)
    // game.physics.arcade.moveToObject(enemy_wave.getAt(1),player2,6000,1000)
    // game.physics.arcade.moveToObject(enemy_wave.getAt(2),player2,6000,1000)


    hud.wave.text = `Wave ${waveNumber}`

    sky.tilePosition.x += 0.5
    fog.tilePosition.x += 0.3

    game.physics.arcade.collide(player1, map)
    game.physics.arcade.collide(player2, map)
    game.physics.arcade.collide(medkit, map)
    game.physics.arcade.collide(medkit2, map)
    game.physics.arcade.collide(shield, map)
    game.physics.arcade.collide(shield2, map)
    // game.physics.arcade.collide(spiderEnemy, map)   



    //moveAndStop(player1)
    updateBullets(player1.bullets)
    updateBullets(player2.bullets)

    game.physics.arcade.collide(player1, player2)

    game.physics.arcade.collide(player1, medkit, addHealth)
    game.physics.arcade.collide(player1, medkit2, addHealth)
    game.physics.arcade.collide(player2, medkit, addHealth)
    game.physics.arcade.collide(player2, medkit2, addHealth)

    game.physics.arcade.collide(player1, shield, enableShield)
    game.physics.arcade.collide(player1, shield2, enableShield)
    game.physics.arcade.collide(player2, shield, enableShield)
    game.physics.arcade.collide(player2, shield2, enableShield)

    game.physics.arcade.collide(player1.bullets, map, killBullet)
    game.physics.arcade.collide(player2.bullets, map, killBullet)

    game.physics.arcade.collide(player1, enemy_wave, hitPlayer)
    game.physics.arcade.collide(player2, enemy_wave, hitPlayer)

    game.physics.arcade.collide(player1.bullets, enemy_wave, hitEnemy)
    game.physics.arcade.collide(player2.bullets, enemy_wave, hitEnemy)

    game.physics.arcade.collide(player1, rocketGroup[0], hitPlayer)
    game.physics.arcade.collide(player1, rocketGroup[1], hitPlayer)
    game.physics.arcade.collide(player1, rocketGroup[2], hitPlayer)
    game.physics.arcade.collide(player1, rocketGroup[3], hitPlayer)

    game.physics.arcade.collide(player2, rocketGroup[0], hitPlayer)
    game.physics.arcade.collide(player2, rocketGroup[1], hitPlayer)
    game.physics.arcade.collide(player2, rocketGroup[2], hitPlayer)
    game.physics.arcade.collide(player2, rocketGroup[3], hitPlayer)

    // verifySideRocket()
    
    // console.log(rocketGroup[0].body.angularVelocity)

    // if((!player1.alive) && (!player2.alive)){
    //     gameState = 'GameOver'
    // }

    verifyGameOver()
    updateHud()



    // game.physics.arcade.collide(enemy_wave, map, checkCollisionMapEnemies)
    // game.physics.arcade.collide(player2,player1.bullets, hitPlayer)
    // game.physics.arcade.collide(player1,player2.bullets, hitPlayer)  
}

function verifySideRocket(){
   for(var i=0;i<qtdeRockets;i++){
       
      // var prev = game.physics.arcade.prev(rocketGroup[i])
       if(prev.x > rocketGroup[i].x){
           rocketGroup[i].scale.setTo(-0.10,0.10)
        }else{
            rocketGroup[i].scale.setTo(0.10,0.10)
       }
   }
}


function hitPlayer(player, enemy) {
    if (!player.shield) {
        player.damage(1)
        if (player.name == player1Name) {
            player.x = startX_P1
            player.y = startY_P1
        } else {
            player.x = startX_P2
            player.y = startY_P2 + 10

        }
    }
}

function hitEnemy(bullet, enemy) {
    bullet.kill()
    enemy.damage(1)
    enemy.events.onKilled.add(function () {
        enemy.destroy()
    })
}

function verifyGameOver() {
    if ((!player1.alive) && (!player2.alive)) {
        var gameOver = createGameOverText(game.width / 2, game.height / 2, '     GAME OVER\nPress F5 to restart')
        game.paused = true
    }
}


function create_enemy_body(enemy) {
    enemy.anchor.setTo(0.5, 0.5);
    game.physics.enable(enemy, Phaser.Physics.ARCADE);
    enemy.body.collideWorldBounds = false;
    return enemy
}

function killBullet(bullet, wall) {
    //wall.kill()
    bullet.kill()
}

function hitPacman(pacmanEnemy, bullet) {
    if (pacmanEnemy.alive) {
        pacmanEnemy.damage(1)
        bullet.kill()
        updateHud()
    }
}

function disableShield(player) {
    player.shield = 0
}

function enableShield(player, shield) {
    shield.kill()
    player.shield = 1
    var timerShield = game.time.create(true)
    var timerToReviveShield = game.time.create(true)
    timerShield.add(5 * (Phaser.Timer.SECOND), disableShield, this, player)
    timerToReviveShield.add(10 * (Phaser.Timer.SECOND), reviveBooster, this, shield)
    timerShield.start()
    timerToReviveShield.start()
}

function addHealth(player, medkit) {
    player.heal(1)

    var timer = game.time.create(true)
    timer.add(8 * (Phaser.Timer.SECOND), reviveBooster, this, medkit)
    medkit.kill()

    timer.start()
}

function reviveBooster(m) {
    m.revive(1)
    m.immovable = true
}

function updateHud() {
    hud.text1.text = `PLAYER 1: ${player1.health}`
    hud.text2.text = 'PLAYER 2: ' + player2.health
    if(player1.shield == 1){
        hud.text3.text = 'SHIELD: ENABLE '  
    }else{
        hud.text3.text = 'SHIELD: DISABLE' 
    }
    if(player2.shield == 1){
        hud.text4.text = 'SHIELD: ENABLE '  
    }else{
        hud.text4.text = 'SHIELD: DISABLE' 
    }
    // hud.text4.text = 'SHIELD: ' + rocketGroup.countLiving()
}

function render() {
    // game.debug.body(player1)

    obstacles.forEach(function (obj) {
        game.debug.body(obj)
    })

    //  game.debug.body(pacmanEnemy)
    // game.debug.body(medkit2)
    // game.debug.body(shield)
    // game.debug.body(shield2)
    // game.debug.body(rocket)
    // game.debug.body(enemy_wave.getAt(0))

}

