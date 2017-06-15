function Game() { };
var screenWidth = window.innerWidth;
var screenHeight = window.innerHeight;

var c = document.getElementById('cvs');
var radarCvs = document.getElementById('radar');
var graph = c.getContext('2d');
var graphRada = radarCvs.getContext('2d');
c.width = screenWidth; c.height = screenHeight;
radarCvs.width =global.radarWidth; radarCvs.height = global.radarHeight;

var foodConfig = {
    border: 0,
};

var playerConfig = {
    border: 6,
    textColor: '#FFFFFF',
    textBorder: '#000000',
    textBorderSize: 3,
    defaultSize: 30
};

var player = {
    id: -1,
    x: global.screenWidth / 2,
    y: global.screenHeight / 2,
    screenWidth: global.screenWidth,
    screenHeight: global.screenHeight,
    target: {x: global.screenWidth / 2, y: global.screenHeight / 2}
};
global.player = player;

var foods = [];
var booms = [];
var jellyFish = [];
var viruses = [];
var enemies = [];
var airBubbles = [];
var radarUser = [];
var fireFood = [];
var users = [];
var leaderboard = [];
var bots = [];
var target = {x: player.x, y: player.y};
global.target = target;
var imageItemBoom = document.getElementById("itemBoom");
var imageBoom = document.getElementById("boom");
var imageBlasting = document.getElementById("blasting");
var imageShock = document.getElementById("shock");
var imageFood = [
    document.getElementById("food"),
    document.getElementById("food2"),
    document.getElementById("food3"),
    document.getElementById("food4")
    ];
var imageAirBubble = [
    document.getElementById("airBubble"),
    document.getElementById("airBubble2"),
    document.getElementById("airBubble3"),
    document.getElementById("airBubble4")
    ];
var imageShark = document.getElementById("shark");
var imageJellyFish = document.getElementById("jellyFish");
var imageEat = document.getElementById("eating");
function resize(socket) {
    if (!socket) return;

    player.screenWidth = c.width = global.screenWidth = global.playerType == 'player' ? window.innerWidth : global.gameWidth;
    player.screenHeight = c.height = global.screenHeight = global.playerType == 'player' ? window.innerHeight : global.gameHeight;

    if (global.playerType == 'spectate') {
        player.x = global.gameWidth / 2;
        player.y = global.gameHeight / 2;
    }

    socket.emit('windowResized', { screenWidth: global.screenWidth, screenHeight: global.screenHeight });
}
Game.prototype.handleNetwork = function(socket, socketServer,room) {
window.canvas = new Canvas();
  console.log('Game connection process here');
  // console.log(socket);
  socket.on('pongcheck', function () {
        var latency = Date.now() - global.startPingTime;
        // debug('Latency: ' + latency + 'ms');
        // window.chat.addSystemLine('Ping: ' + latency + 'ms');
    });

    // Handle error.
    socket.on('connect_failed', function () {
        socket.close();
        global.disconnected = true;
    });

    socket.on('disconnect', function () {
        socket.close();
        global.disconnected = true;
    });

    // Handle connection.
    socket.on('welcome', function (playerSettings) {
        player = playerSettings;
        player.name = global.playerName;
        player.screenWidth = global.screenWidth;
        player.screenHeight = global.screenHeight;
        player.target = window.canvas.target;
        global.player = player;
        socket.emit('gotit', player);
        global.gameStart = true;
        c.focus();
    });

    socket.on('gameSetup', function(data) {
        global.gameWidth = data.gameWidth;
        global.gameHeight = data.gameHeight;
        resize(socket);
    });

    socket.on('leaderboard', function (data) {
        leaderboard = data.leaderboard;
        var status = '<span class="title">Leaderboard</span>';
        for (var i = 0; i < leaderboard.length; i++) {
            status += '<br />';
            if (leaderboard[i].id == player.id){
                if(leaderboard[i].name.length !== 0)
                    status += '<div class="me" style="float:left;">' + (i + 1) + '. ' + leaderboard[i].name + '</div><div style="float:right">'+ leaderboard[i].kill+ "</div>";
                else
                    status += '<div class="me" style="float:left">' + (i + 1) + '. An unnamed fish</div><div style="float:right">'+ leaderboard[i].kill+ "</div>";
            } else {
                if(leaderboard[i].name.length !== 0)
                    status += '<div style="float:left;">' + (i + 1) + '. ' + leaderboard[i].name + '</div><div style="float:right">'+ leaderboard[i].kill+ "</div>";
                else
                    status += '<div style="float:left">' + (i + 1) + '. An unnamed fish</div><div style="float:right">'+ leaderboard[i].kill+ "</div>";
            }

        }
        document.getElementById('status').innerHTML = status;
    });

    // Handle movement.
    socket.on('serverTellPlayerMove', function (userData, foodsList, virusList, massList, airbbleList, jellyFishList, boomList, visibleEnemy, botVisible, radarUsr) {
        var playerData;
        for(var i =0; i< userData.length; i++) {
            if(typeof(userData[i].id) == "undefined") {
                playerData = userData[i];
                i = userData.length;
            }
        }
        //if(global.playerType == 'player') {
            // console.log(playerData);
            // var xoffset = player.x - playerData.x;
            // var yoffset = player.y - playerData.y;
            if(playerData != undefined){
            player.x = playerData.x;
            player.y = playerData.y;
            player.width = playerData.width;
            player.height = playerData.height;
            player.hue = playerData.hue;
            player.massTotal = playerData.massTotal;
            player.radius = playerData.radius;
            player.numberBoom = playerData.numberBoom;
            player.timeAcceleration = playerData.timeAcceleration;
            player.timeSpeed = playerData.timeSpeed;
            player.levelUp = playerData.levelUp;
            // player.xoffset = isNaN(xoffset) ? 0 : xoffset;
            // player.yoffset = isNaN(yoffset) ? 0 : yoffset;
        }
        users = userData;
        foods = foodsList;
        radarUser = radarUsr;
        viruses = virusList;
        fireFood = massList;
        airBubbles = airbbleList;
        jellyFish = jellyFishList;
        booms = boomList;
        enemies = visibleEnemy;
        bots = botVisible;

    });

    // Death.
    socket.on('RIP', function () {
        global.gameStart = false;
        global.died = true;
        // socketServer.emit('leaveRoom', room);
        window.setTimeout(function() {
            document.getElementById('gameAreaWrapper').style.opacity = 0;
            document.getElementById('startMenuWrapper').style.maxHeight = '1000px';
            global.died = false;
            if (global.animLoopHandle) {
                window.cancelAnimationFrame(global.animLoopHandle);
                global.animLoopHandle = undefined;
            }
        }, 2500);
    });
    
}

Game.prototype.handleLogic = function() {
  console.log('Game is running');
  // This is where you update your game logic
}

function drawCircle(centerX, centerY, radius, sides) {
    var theta = 0;
    var x = 0;
    var y = 0;

    graph.beginPath();

    for (var i = 0; i < sides; i++) {
        theta = (i / sides) * 2 * Math.PI;
        x = centerX + radius * Math.sin(theta);
        y = centerY + radius * Math.cos(theta);
        graph.lineTo(x, y);
    }

    graph.closePath();
    graph.stroke();
    graph.fill();
}

function drawRada(centerX, centerY, radius, color, sides) {
    var theta = 0;
    var x = 0;
    var y = 0;

    graphRada.strokeStyle = color;
    graphRada.fillStyle = color;
    graphRada.lineWidth = foodConfig.border;
    graphRada.beginPath();

    for (var i = 0; i < sides; i++) {
        theta = (i / sides) * 2 * Math.PI;
        x = centerX + radius * Math.sin(theta);
        y = centerY + radius * Math.cos(theta);
        graphRada.lineTo(x, y);
    }

    graphRada.closePath();
    graphRada.stroke();
    graphRada.fill();
}
function drawRadar(radarData){
    graphRada.clearRect(0,0,global.radarWidth, global.radarHeight);
    drawRada(Math.floor(player.x / global.gameWidth * global.radarWidth) ,
        Math.floor(player.y / global.gameHeight * global.radarHeight),
        4, global.colorPlayerRadar, global.foodSides);

    radarData.forEach(function(item){
        drawRada(Math.floor(item.x / global.gameWidth * global.radarWidth) ,
        Math.floor(item.y / global.gameHeight * global.radarHeight),
        global.radiusRadar, global.colorUserRadar, global.foodSides);

    });

}


function drawAirBubble(obj) {
 graph.beginPath();

    var i = obj.level;

    graph.drawImage(imageAirBubble[i],obj.x - player.x + global.screenWidth / 2,obj.y - player.y + global.screenHeight / 2);

}


function drawEnemy(obj) {
 graph.beginPath();

    var i = 0;
    //drawSprite(imageShark, global.jellyFish[i].begin, global.jellyFish[i].column, global.jellyFish[i].right, global.jellyFish[i].width, global.jellyFish[i].height,obj.frameAnimation, obj, player);
    if(obj.jellyCollision.status){
        graph.drawImage(imageShock, global.screenWidth / 2 -80 + obj.x - player.x , global.screenHeight / 2 -100 + obj.y - player.y);
    }
    if(obj.direction == global.direct.RIGHT){
            drawSprite(imageShark, global.enemy[i].begin, global.enemy[i].column, global.enemy[i].right, global.enemy[i].width, global.enemy[i].height,obj.frameAnimation, obj, player);
        } else {
            drawSprite(imageShark, global.enemy[i].begin, global.enemy[i].column, global.enemy[i].left, global.enemy[i].width, global.enemy[i].height,obj.frameAnimation, obj, player);
    }

 graph.closePath();
}

function drawJellyFish(obj) {
 graph.beginPath();

    var i = obj.level;
    drawSprite(imageJellyFish, global.jellyFish[i].begin, global.jellyFish[i].column, global.jellyFish[i].right, global.jellyFish[i].width, global.jellyFish[i].height,obj.frameAnimation, obj, player);

 graph.closePath();
}

function drawFood(food) {
 graph.beginPath();

    var i = food.level;
    if(food.direction == global.direct.RIGHT){
            drawSprite(imageFood[i], global.food[i].begin, global.food[i].column, global.food[i].right, global.food[i].width, global.food[i].height,food.frameAnimation, food, player);
        } else {
            drawSprite(imageFood[i], global.food[i].begin, global.food[i].column, global.food[i].left, global.food[i].width, global.food[i].height,food.frameAnimation, food, player);
    }

     //graph.closePath();
}

function drawFireFood(mass) {
    graph.strokeStyle = 'hsl(' + mass.hue + ', 100%, 45%)';
    graph.fillStyle = 'hsl(' + mass.hue + ', 100%, 50%)';
    graph.lineWidth = playerConfig.border+10;
    drawCircle(mass.x - player.x + global.screenWidth / 2,
               mass.y - player.y + global.screenHeight / 2,
               mass.radius-5, 18 + (~~(mass.masa/5)));
}

function drawBoom(virus) {
    if(virus.status == global.status.LIVE)
        graph.drawImage(imageBoom,virus.x - player.x + global.screenWidth / 2,virus.y - player.y + global.screenHeight / 2);
    else graph.drawImage(imageBlasting,virus.x - player.x + global.screenWidth / 2,virus.y - player.y + global.screenHeight / 2);
}

function drawVirus(virus) {
    graph.drawImage(imageItemBoom,virus.x - player.x + global.screenWidth / 2,virus.y - player.y + global.screenHeight / 2);
}

function getFishSpriteData(level){
    var fishSprite = {};
    // var colorIco = document.getElementsByClassName('img-color');
    // for (var i = 0; i < colorIco.length; i++) {
    //     colorIco[i].style.backgroundColor=global.colorBlur;
    // }
    // colorIco[fish["state"] - 1].style.backgroundColor = global.colorFocus;
    var fish = {
        type: global.fishType[level],
        state: level + 1
    };

    // if(mass < global.fishType[0].mass) {
    //     fish.type = global.fishType[0];
    //     fish.state = 1;
    // }
    // else if(mass < global.fishType[1].mass) {
    //     fish.type = global.fishType[1];
    //     fish.state = 2;
    // } else if(mass < global.fishType[2].mass) {
    //     fish.type = global.fishType[2];
    //     fish.state = 3;
    // } else if(mass < global.fishType[3].mass) {
    //     fish.type = global.fishType[3];
    //     fish.state = 4;
    // } else if(mass < global.fishType[4].mass){
    //     fish.type = global.fishType[4];
    //     fish.state = 5;
    // } else if(mass < global.fishType[5].mass){
    //     fish.type = global.fishType[5];
    //     fish.state = 6;
    // } else if(mass < global.fishType[6].mass){
    //     fish.type = global.fishType[6];
    //     fish.state = 7;
    // } else {
    //     fish.type = global.fishType[7];
    //     fish.state = 8;
    // }

    fishSprite.type = fish["state"];
    fishSprite.state = document.getElementById("state" + fish["state"]);
    fishSprite.colBegin = 0;
    fishSprite.rawLeftBegin = 1;
    fishSprite.rawRightBegin = 0;
    fishSprite.colCount = fish["type"].column;
    fishSprite.rowCount = fish["type"].row;
    fishSprite.width = fish["type"].width;
    fishSprite.height = fish["type"].height;
    
    return fishSprite;
}

function drawSprite(sprite, beginCol, col, beginRow, width, height, posSprite, user, player){
    graph.drawImage(sprite,(posSprite % col + beginCol)*width,height*(parseInt(posSprite / col) + beginRow), width, height, ((global.screenWidth / 2) - width /2) + (user.x - player.x), ((global.screenHeight / 2) - height / 2) + (user.y - player.y), width, height);

}

var tmp = 0;

function distance2Points(x1, y1, x2, y2){
    return (Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)));
}

var prevPositionPlayer = {
    x: 0,
    y: 0
};

const maxDistanceMove = 20;
var positionQueue = [];

var prevPositionUsers = [];
var curPositionUsers = [];

function getNextPosition(cusPos, finalPos){
    var result = {};
    var dis = 0;
    // console.log("cusPos: ", cusPos);
    // console.log("finalPos: ", finalPos);

    dis = distance2Points(cusPos.x, cusPos.y, finalPos.x, finalPos.y);

    // console.log("Distance: ", dis);

    if(dis <= maxDistanceMove){
        return finalPos;
    }

    var ratio = maxDistanceMove / dis;

    // console.log("ratio: ", ratio);

    result.x = cusPos.x - (cusPos.x - finalPos.x)*ratio;
    result.y = cusPos.y - (cusPos.y - finalPos.y)*ratio;

    // console.log("result return :", result);
    console.log("Distance split has effected.")

    return result;
}

function getPosition(user){
    var result = {};
    result.id = user.id;
    result.x = user.x;
    result.y = user.y;

    return result;
}

function updateStateFish(){
    var items = document.getElementsByClassName('img-color-2');
    
    if(player.timeSpeed.status){
        items[0].style.backgroundColor = global.colorFocus;
    }else items[0].style.backgroundColor = global.colorBlur;

    if(player.timeAcceleration.status){    
        items[1].style.backgroundColor = global.colorFocus;
    }else items[1].style.backgroundColor = global.colorBlur;

    if(player.numberBoom.status){
        items[2].style.backgroundColor = global.colorFocus;
    }else items[2].style.backgroundColor = global.colorBlur;

    document.getElementById('numberBoom').innerHTML = player.numberBoom.number;

    var colorIco = document.getElementsByClassName('img-color');
    for (var i = 0; i < colorIco.length; i++) {
        colorIco[i].style.backgroundColor=global.colorBlur;
    }
    colorIco[player.levelUp.level].style.backgroundColor = global.colorFocus;
}
function drawPlayersNew(order) {

    curPositionUsers.splice(0, curPositionUsers.length);
    for(var i = 0; i < order.length; i++){
        var posTmp = getPosition(order[i]);
        curPositionUsers.push(posTmp);
    }

    for(var j = 0; j < curPositionUsers.length; j++){

        for(var k = 0; k < prevPositionUsers.length; k++){

            if(prevPositionUsers[k].id == curPositionUsers[j].id){
                var nextPos = getNextPosition(prevPositionUsers[k], curPositionUsers[j]);
                // console.log("Next position: ", nextPos);
                curPositionUsers[j].x = nextPos.x;
                curPositionUsers[j].y = nextPos.y;
            }
        }
    }

    
    if(distance2Points(prevPositionPlayer.x, prevPositionPlayer.y, player.x, player.y) > 20){
        // console.log("Distance :", distance2Points(prevPositionPlayer.x, prevPositionPlayer.y, player.x, player.y));
    }
    
    // console.log("prevPosition: ", prevPosition);
    // console.log("player x: ", player.x);
    // console.log("player y: ", player.y);

    prevPositionPlayer.x = player.x;
    prevPositionPlayer.y = player.y;
    // tmp++;
    

    var start = {
        x: player.x - (global.screenWidth / 2),
        y: player.y - (global.screenHeight / 2)
    };

    for(var z=0; z<order.length; z++)
    {
        var userCurrent = order[z];
        

        var currentSprite = getFishSpriteData(order[z].levelUp.level);
        
        var circle = {
            x: userCurrent.x - start.x,
            y: userCurrent.y - start.y
        };

        graph.lineWidth = 1;
        graph.strokeStyle = global.lineColor;
        graph.globalAlpha = 1;
        graph.beginPath();
    
        if(userCurrent.jellyCollision.status){
           graph.drawImage(imageShock, global.screenWidth / 2 - global.imageShock.x/2 + userCurrent.x - player.x , global.screenHeight / 2 - global.imageShock.y + userCurrent.y - player.y);
        }
        graph.fillStyle = global.red;
        graph.fillRect(circle.x +(- 100)/2 ,circle.y + currentSprite.height/2 + 10,100,10);
        graph.fillStyle = global.yellow;
        var massPercent = Math.min(100,(userCurrent.massTotal - userCurrent.levelUp.minMass )/ userCurrent.levelUp.targetMass* 100);
        graph.fillRect(circle.x + (- 100)/2,circle.y + currentSprite.height/2 + 10,massPercent,10);
        if(userCurrent.levelUp.status)
            graph.drawImage(imageEat,userCurrent.levelUp.level * 103 ,0,103, 100,circle.x, circle.y - 150,103,100);

        if(order[z].direction == global.direct.RIGHT){
            drawSprite(currentSprite.state, currentSprite.colBegin, currentSprite.colCount, currentSprite.rawRightBegin, currentSprite.width, currentSprite.height, order[z].frameAnimation, curPositionUsers[z], player);
        } else {
            drawSprite(currentSprite.state, currentSprite.colBegin, currentSprite.colCount, currentSprite.rawLeftBegin , currentSprite.width, currentSprite.height, order[z].frameAnimation, curPositionUsers[z], player);
        }

        graph.stroke();
        graph.globalAlpha = 1;

        graph.lineJoin = 'round';
        graph.lineCap = 'round';
        graph.fill();
        graph.stroke();
        var nameCell = "";
        if(typeof(userCurrent.id) == "undefined")
            nameCell = player.name;
        else
            nameCell = userCurrent.name;

        var fontSize = Math.max(54 / 3, 12);
        graph.lineWidth = playerConfig.textBorderSize;
        graph.fillStyle = playerConfig.textColor;
        graph.strokeStyle = playerConfig.textBorder;
        graph.miterLimit = 1;
        graph.lineJoin = 'round';
        graph.textAlign = 'center';
        graph.textBaseline = 'middle';
        graph.font = 'bold ' + fontSize + 'px sans-serif';

        if (global.toggleMassState === 0) {
            graph.strokeText(nameCell, circle.x, circle.y);
            graph.fillText(nameCell, circle.x, circle.y);
        } else {
            graph.strokeText(nameCell, circle.x, circle.y);
            graph.fillText(nameCell, circle.x, circle.y);
            graph.font = 'bold ' + Math.max(fontSize / 3 * 2, 10) + 'px sans-serif';
            if(nameCell.length === 0) fontSize = 0;
            graph.strokeText(Math.round(userCurrent.massTotal), circle.x, circle.y+fontSize);
            graph.fillText(Math.round(userCurrent.massTotal), circle.x, circle.y+fontSize);
        }
    }

    prevPositionUsers.splice(0, prevPositionUsers.length);

    for(var i = 0; i < curPositionUsers.length; i++){
        prevPositionUsers.push(Object.assign({},curPositionUsers[i]));
    }

    // curPositionUsers = [];
}


function valueInRange(min, max, value) {
    return Math.min(max, Math.max(min, value));
}

var i = 0;
var seaweedSpritePos = 0;
var s = 0;
const speed_seaweed = 10;

var seaweedSprite = {
  colLeftBegin : 0,
  colRightBegin : 0,
  colCount : 8,
  rawLeftBegin : 0,
  rawRightBegin : 1,
  rawCount : 1,
  width : 80,
  height : 164/2
}

function drawSeaweed(sprite, beginCol, col, beginRaw, raw, width, height, posSprite, player){

    graph.drawImage(sprite, (posSprite % col + beginCol)*width, height*(parseInt(posSprite / col) + beginRaw), width, height, (global.gameWidth / 2 - (player.x - global.screenWidth / 2)), ((global.gameHeight - 50) - (player.y - global.screenHeight / 2)), width, height);

}

function drawgrid() {
     graph.lineWidth = 1;
     graph.strokeStyle = global.lineColor;
     graph.globalAlpha = 0.75;
     graph.beginPath();

    graph.fillStyle="white";
    graph.clearRect(0, 0, global.gameWidth, global.gameHeight);
    var img = document.getElementById("bgImg");
   // var seaweed = document.getElementById("seeweed");
    graph.drawImage(img, (img.width-img.width*(global.screenWidth/global.gameWidth))*((player.x) / global.gameWidth), (img.height-img.height*(global.screenHeight/global.gameHeight))*((player.y)/global.gameHeight), img.width*(global.screenWidth/global.gameWidth), img.height*(global.screenHeight/global.gameHeight), 0, 0, global.screenWidth, global.screenHeight);
    graph.stroke();
    graph.globalAlpha = 1;
}

function drawgrid1() {
     graph.lineWidth = 1;
     graph.strokeStyle = global.lineColor;
     graph.globalAlpha = 0.75;
     graph.beginPath();

    graph.fillStyle="white";
    graph.clearRect(0, 0, global.gameWidth, global.gameHeight);
    var img = document.getElementById("water");
    for (var x = global.xoffset - player.x; x < global.gameWidth; x += img.width) {
        for (var y = global.yoffset - player.y ; y < global.gameHeight; y += img.height) {
            graph.drawImage(img,x,y);
        }
    }

    graph.stroke();
    graph.globalAlpha = 1;
}

function drawborder() {
    graph.lineWidth = 1;
    graph.strokeStyle = playerConfig.borderColor;

    // Left-vertical.
    if (player.x <= global.screenWidth/2) {
        graph.beginPath();
        graph.moveTo(global.screenWidth/2 - player.x, 0 ? player.y > global.screenHeight/2 : global.screenHeight/2 - player.y);
        graph.lineTo(global.screenWidth/2 - player.x, global.gameHeight + global.screenHeight/2 - player.y);
        graph.strokeStyle = global.lineColor;
        graph.stroke();
    }

    // Top-horizontal.
    if (player.y <= global.screenHeight/2) {
        graph.beginPath();
        graph.moveTo(0 ? player.x > global.screenWidth/2 : global.screenWidth/2 - player.x, global.screenHeight/2 - player.y);
        graph.lineTo(global.gameWidth + global.screenWidth/2 - player.x, global.screenHeight/2 - player.y);
        graph.strokeStyle = global.lineColor;
        graph.stroke();
    }

    // Right-vertical.
    if (global.gameWidth - player.x <= global.screenWidth/2) {
        graph.beginPath();
        graph.moveTo(global.gameWidth + global.screenWidth/2 - player.x,
                     global.screenHeight/2 - player.y);
        graph.lineTo(global.gameWidth + global.screenWidth/2 - player.x,
                     global.gameHeight + global.screenHeight/2 - player.y);
        graph.strokeStyle = global.lineColor;
        graph.stroke();
    }

    // Bottom-horizontal.
    if (global.gameHeight - player.y <= global.screenHeight/2) {
        graph.beginPath();
        graph.moveTo(global.gameWidth + global.screenWidth/2 - player.x,
                     global.gameHeight + global.screenHeight/2 - player.y);
        graph.lineTo(global.screenWidth/2 - player.x,
                     global.gameHeight + global.screenHeight/2 - player.y);
        graph.strokeStyle = global.lineColor;
        graph.stroke();
    }
}

Game.prototype.handleGraphics = function() {
  if (global.died) {
        graph.fillStyle = '#333333';
        graph.fillRect(0, 0, global.screenWidth, global.screenHeight);

        graph.textAlign = 'center';
        graph.fillStyle = '#FFFFFF';
        graph.font = 'bold 30px sans-serif';
        graph.fillText('You died!', global.screenWidth / 2, global.screenHeight / 2);
        document.getElementById('gameAreaWrapper').style.display = 'none';
        document.getElementById('baner-icon').style.display = "none";
        document.getElementById('skill-icon').style.display = "none";
        document.getElementById('startMenuWrapper').style.display = 'block';
    }
    else if (!global.disconnected) {
        if (global.gameStart) {
            graph.fillStyle = global.backgroundColor;
            graph.fillRect(0, 0, global.screenWidth, global.screenHeight);

            drawgrid();
            drawRadar(radarUser);
            foods.forEach(drawFood);
            fireFood.forEach(drawFireFood);
            airBubbles.forEach(drawAirBubble);
            enemies.forEach(drawEnemy);

            jellyFish.forEach(drawJellyFish);
            viruses.forEach(drawVirus);
            booms.forEach(drawBoom);
            if (global.borderDraw) {
                drawborder();
            }
            //drawCircle(global.screenWidth / 2, global.screenHeight / 2, player.width/2, 10);
            updateStateFish();
            drawPlayersNew(users);
            drawPlayersNew(bots);

            socket.emit('0', window.canvas.target); // playerSendTarget "Heartbeat".

        } else {
            graph.fillStyle = '#333333';
            graph.fillRect(0, 0, global.screenWidth, global.screenHeight);

            graph.textAlign = 'center';
            graph.fillStyle = '#FFFFFF';
            graph.font = 'bold 30px sans-serif';
            graph.fillText('Game Over!', global.screenWidth / 2, global.screenHeight / 2);
        }
    } else {
        graph.fillStyle = '#333333';
        graph.fillRect(0, 0, global.screenWidth, global.screenHeight);

        graph.textAlign = 'center';
        graph.fillStyle = '#FFFFFF';
        graph.font = 'bold 30px sans-serif';
        if (global.kicked) {
            if (reason !== '') {
                graph.fillText('You were kicked for:', global.screenWidth / 2, global.screenHeight / 2 - 20);
                graph.fillText(reason, global.screenWidth / 2, global.screenHeight / 2 + 20);
            }
            else {
                graph.fillText('You were kicked!', global.screenWidth / 2, global.screenHeight / 2);
            }
        }
        else {
              graph.fillText('Disconnected!', global.screenWidth / 2, global.screenHeight / 2);
        }
    }
}
