/*jslint browser: true*/
/*global $*/
(function () {

    "use strict";

    var ctx,
        direction = function () {
            this.cx = Math.cos(this.angle * (Math.PI / 180)) * this.speed / 10;
            this.cy = Math.sin(this.angle * (Math.PI / 180)) * this.speed / 10;
        };

    function Circle(x, y, r, angle, speed) {

        this.x = x;
        this.y = y;
        this.r = r;

        this.active = false;
        this.debug = false;

        this.weight = Math.PI * Math.pow(this.r, 2);

        this.angle = angle;
        this.speed = speed;

        direction.call(this);

    }

    Circle.prototype.setRadius = function (radius) {
        this.r = radius;

    };

    Circle.prototype.setDirection = function (angle, speed) {
        this.angle = angle;
        this.speed = speed;
        direction.call(this);
    };

    Circle.prototype.draw = function () {
        if (!this.active) {
            ctx.strokeStyle = 'black';
        } else {
            ctx.strokeStyle = 'red';
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.stroke();
    };

    Circle.prototype.drawSetRadius = function (r) {
        ctx.beginPath();
        ctx.moveTo(this.x +  Math.round(this.r * Math.cos(this.angle * Math.PI / 180)),
                       this.y + Math.round(this.r * Math.sin(this.angle * Math.PI / 180)));
        ctx.lineTo(this.x, this.y);
    //    ctx.lineTo(this.x + this.r * 0.6, this.y);
    //    ctx.moveTo(this.x + this.r * 0.3, this.y);
    //    ctx.arc(this.x, this.y, this.r * 0.3, 0, this.angle * Math.PI / 180);
    //    ctx.strokeStyle = 'black'
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x +  Math.round(this.r * Math.cos(this.angle * Math.PI / 180)),
                this.y + Math.round(this.r * Math.sin(this.angle * Math.PI / 180)),
                r, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = 'red';
        ctx.stroke();
    };

    Circle.prototype.move = function () {
        this.x += this.cx;
        this.y += this.cy;
    };

    Circle.prototype.setAngle = function (angle) {
        this.angle = angle;
        direction.call(this);
    };

    Circle.prototype.setSpeed = function (speed) {
        this.speed = speed;
        direction.call(this);
    };

    Circle.prototype.disactivate = function () {
        this.active = false;
    };

    Circle.prototype.isCursorInside = function (x, y) {
        if (Math.pow(this.r, 2) >= (Math.pow((this.x - x), 2) + Math.pow((this.y - y), 2))) {
            return true;
        } else {
            return false;
        }
    };
    // TODO must be done this prototype!!!
    Circle.prototype.isCursorInsideRadiusSetter = function (x, y, r) {
        if (Math.pow(this.r, 2) >= (Math.pow((this.x - x), 2) + Math.pow((this.y - y), 2))) {
            return true;
        } else {
            return false;
        }
    };

    function drawImagineCircle(x, y, r) {
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.stroke();
    }

    function isInsideAnyCircle(circles, x, y) {

        for (var i = 0; i < circles.length; i++){
            if(circles[i].isCursorInside(x, y)){
                return true;
            }
        }

        return false;

    }

    function crossCircles(circles, x, y, r){
        var proximity = 0;
        for(var i = 0; i < circles.length; i++){
            // calculating current proximity = √( (x1 - x2)² + (y1 - y2)² )
            proximity = ( Math.pow(circles[i].x - x, 2) + Math.pow(circles[i].y - y, 2) );
            if(proximity <= Math.pow((circles[i].r + r),2)){
                return true;
            }
        }

        return false;
    }

    function bordersCross(circle) {

        if((circle.x >= ctx.canvas.width - circle.r) || (circle.x <= circle.r)) {

            if(circle.angle > 180) {
                circle.setAngle(180 + 360 - circle.angle);
            } else {
                circle.setAngle(180 - circle.angle);
            }
        }

        if((circle.y >= ctx.canvas.height - circle.r) || (circle.y <= circle.r)) {
           circle.setAngle(360 - circle.angle);
        }

    }

    function proximitySensor(circles) {
        var db = [];
        for(var i = 0; i < circles.length; i++) {
            db[i] = [];
            for(var j = 0; j < circles.length; j++) {
                db[i].push(( Math.pow(circles[i].x - circles[j].x, 2) + Math.pow(circles[i].y - circles[j].y, 2) ));
                if( (db[i][j] <= Math.pow((circles[i].r + circles[j].r), 2))&&(db[i][j] !== 0) ) {
                    circles[i].setAngle( 2 * Math.atan( (circles[i].y - circles[j].y)/(circles[i].x - circles[j].x) ) * 180 / Math.PI + circles[i].angle );
                }
            }
        }

        return db;

    }

    function drawLines(circles) {
        ctx.beginPath();
        for(var i = 0; i < circles.length; i++) {
            for(var j = i + 1; j < circles.length; j++) {
                ctx.moveTo(circles[i].x, circles[i].y);
                ctx.lineTo(circles[j].x, circles[j].y);
            }
        }
        ctx.stroke();
    }

    function drawInfo(text, x, y) {
        ctx.fillStyle = "#000000";
        ctx.font = "10pt Arial";
        ctx.fillText(text, x, y);
    }

    function drawDirection(circles) {
        ctx.beginPath();
        ctx.strokeStyle = 'red';
        for(var i = 0; i < circles.length; i++) {
            ctx.moveTo(circles[i].x, circles[i].y);
            ctx.lineTo(circles[i].x +  Math.round(circles[i].r * Math.cos(circles[i].angle * Math.PI / 180)),
                       circles[i].y + Math.round(circles[i].r * Math.sin(circles[i].angle * Math.PI / 180)));

            ctx.lineTo(circles[i].x +  Math.round((circles[i].r - 5) * Math.cos((circles[i].angle - 5) * Math.PI / 180)),
                       circles[i].y + Math.round((circles[i].r - 5) * Math.sin((circles[i].angle - 5) * Math.PI / 180)));

            ctx.moveTo(circles[i].x +  Math.round(circles[i].r * Math.cos(circles[i].angle * Math.PI / 180)),
                       circles[i].y + Math.round(circles[i].r * Math.sin(circles[i].angle * Math.PI / 180)));

            ctx.lineTo(circles[i].x +  Math.round((circles[i].r - 5) * Math.cos((circles[i].angle + 5) * Math.PI / 180)),
                       circles[i].y + Math.round((circles[i].r - 5) * Math.sin((circles[i].angle + 5) * Math.PI / 180)));
        }
        ctx.closePath();
        ctx.stroke();
    }

    function createRandom(arr, num, boardWidth, boardHeight) {
        for(var i = 0; i < num; i++) {
            arr[i] = new Circle(Math.round(Math.random()*(boardWidth-200))+100,     // x
                                Math.round(Math.random()*(boardHeight-200))+100,    // y
                                Math.round(Math.random()*60)+10,                    // r
                                Math.round(Math.random()*360),                      // angle
                                Math.round(Math.random()*30) + 2);                  // speed
        }
    }

    function createOne(arr, x, y, r) {
        arr.push(new Circle(x, y, r,
                            Math.round(Math.random()*360),                      // angle
                            Math.round(Math.random()*30) + 2)                  // speed
                 );
    }

    function findOffset(obj) {
        var curX = 0,
            curY = 0;

        if (obj.offsetParent) {
            while (obj.offsetParent) {
                curX += obj.offsetLeft;
                curY += obj.offsetTop;
                obj = obj.offsetParent;
            }

        return {x:curX,y:curY};

        }
    }

    function disactiveAll(arr) {
        for (var i = 0; i < arr.length; i++) {
            arr[i].disactivate();
        }
    }

    function isAnyInDebugMode(arr){
        for(var i = 0; i < arr.length; i++){
            if(arr[i].debug === true){
                return true;
            }
        }
        return false;
    }

    function disactiveAllDebugMode(arr){
        arr.forEach(function(item){
            item.debug = false;
        });
    }

    var
        boardWidth = 800,
        boardHeight = 600;

    $(document).ready(function () {
        //рисуем поле
        var board = document.getElementById("Board");
            ctx     = board.getContext('2d');

        ctx.canvas.width = boardWidth;
        ctx.canvas.height = boardHeight;

        var circles = [],
            startStep,
            started = false,
            debug = false;

    //    for(var i = 0; i < 4; i++) {
    //        circles[i] = new Circle(Math.round(Math.random()*(boardWidth-200))+100,     // x
    //                                Math.round(Math.random()*(boardHeight-200))+100,    // y
    //                                Math.round(Math.random()*60)+10,                    // r
    //                                Math.round(Math.random()*360),                      // angle
    //                                Math.round(Math.random()*30) + 2);                  // speed
    //    }

//        createRandom(circles, 5, boardWidth, boardHeight);

        function step() {

            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, boardWidth, boardHeight);

            for(var i = 0; i < circles.length; i++){
                bordersCross(circles[i]);
                circles[i].move();
                circles[i].draw();
            }

    //        drawLines(circles);
//            proximitySensor(circles);

    //        drawInfo('circle[0].x = ' + Math.round(circles[0].x), 2, 11);
    //        drawInfo('circle[0].y = ' + Math.round(circles[0].y), 2, 23);
    //        drawInfo('circle[0].r = ' + Math.round(circles[0].r), 2, 35);
    //        drawInfo('circle[0].angle = ' + Math.round(circles[0].angle), 2, 47);

    //        drawInfo('circle[1].x = ' + Math.round(circles[1].x), 2, 69);
    //        drawInfo('circle[1].y = ' + Math.round(circles[1].y), 2, 81);
    //        drawInfo('circle[1].r = ' + Math.round(circles[1].r), 2, 93);
    //        drawInfo('circle[1].angle = ' + Math.round(circles[1].angle), 2, 105);

    //        drawDirection(circles);

            startStep = requestAnimationFrame(step);
        }

        $('#start').click(function(){

            if (!started) {
                $(this).prop('disabled', true);
                $('#stop').prop('disabled', false);
                startStep = requestAnimationFrame(step);
                started = true;
            } else {
                alert('already started!');
            }

        });

        $('#stop').click(function(){

            if (started) {
                $(this).prop('disabled', true);
                $('#start').prop('disabled', false);
                cancelAnimationFrame(startStep);
                startStep = undefined;
                started = false;
            } else {
                alert('already stopped!');
            }

        });

        $("#reload").click(function(){

            $('#start').prop('disabled', false);
            $('#stop').prop('disabled', true);

            if (started) {
                cancelAnimationFrame(startStep);
                startStep = undefined;
                started = false;
            }

            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, boardWidth, boardHeight);

            circles.splice(0, circles.length);

            createRandom(circles, 4, boardWidth, boardHeight);

        });

        $("#restart").click(function(){

            $('#start').prop('disabled', true);
            $('#stop').prop('disabled', false);

            if (started) {
                cancelAnimationFrame(startStep);
                startStep = undefined;
                started = false;
            }

            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, boardWidth, boardHeight);

            circles.splice(0, circles.length);

            createRandom(circles, 4, boardWidth, boardHeight);

            startStep = requestAnimationFrame(step);
            started = true;

        });

        $('#debug').change(function(){
            debug = !debug;
        });





        var mouseDown = {x : 0, y : 0},
            mousePos = {x : 0, y : 0},
            boardPos = findOffset(board),
            curRadius,
            newRadius,
            drawingNewCircle = false,
            mouseKeyDown = false,
            inCircle = false;

        $('#Board').dblclick(function(e){
            if(!started){
                for(var i = 0; i < circles.length; i++){
                    if(circles[i].isCursorInside(e.pageX - boardPos.x, e.pageY - boardPos.x)){
                        circles.splice(i,1);
                        // clearing canvas content with white color
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(0, 0, boardWidth, boardHeight);
                        //drawing circles
                        circles.forEach(function(item){
                            item.draw();
                        });
                        break;
                    }
                }
            }

        });

        $('#Board').mousedown(function(e){

            if (!started && !isInsideAnyCircle(circles, e.pageX - boardPos.x, e.pageY - boardPos.y)) {

                if(mouseKeyDown !== true){
                    mouseKeyDown = true;
                }

                // curent mouse position over canvas
                mouseDown.x = e.pageX - boardPos.x;
                mouseDown.y = e.pageY - boardPos.y;

                // binding mousemove event when mousemove is is binded
                $(this).mousemove(function(e){
                    if(mouseKeyDown === true){
                        // current mouse pointer position
                        mousePos.x = e.pageX - boardPos.x;
                        mousePos.y = e.pageY - boardPos.y;
                        // calculating current floating radius - r = √( (x1 - x2)² + (y1 - y2)² )
                        curRadius = Math.round(Math.sqrt( Math.pow((mouseDown.x - mousePos.x), 2) + Math.pow((mouseDown.y - mousePos.y), 2)));

                        // cheking wether radius is between [20,120] intervaland and not inside any exiting circle. Then redrawing all canvas content
                        if ((curRadius >= 20)&&(curRadius <= 120)&&!crossCircles(circles, mouseDown.x, mouseDown.y, curRadius)&&((mouseDown.x - curRadius) > 0)&&((mouseDown.x + curRadius) < boardWidth)&&((mouseDown.y - curRadius) > 0)&&((mouseDown.y + curRadius) < boardHeight)) {
                            // clearing canvas content with white color
                            ctx.fillStyle = '#FFFFFF';
                            ctx.fillRect(0, 0, boardWidth, boardHeight);

                            newRadius = curRadius;

                            if(drawingNewCircle !== true){
                                drawingNewCircle = true;
                            }

                            drawImagineCircle(mouseDown.x, mouseDown.y, newRadius);

                            // drawing all circles
                            for(var i = 0; i < circles.length; i++){
                                circles[i].draw();
                            }
                            // drawing directions to all circles
        //                    drawDirection(circles);
                            // drawing info for last circle
                            drawInfo('x = ' + Math.round(mouseDown.x), 2, 11);
                            drawInfo('y = ' + Math.round(mouseDown.y), 2, 23);
                            drawInfo('r = ' + Math.round(curRadius), 2, 35);

                        }
                    }

                    // cheking if mouse pointer inside any circle and is not started -> them highlight this circle
                    if(!started&&!isAnyInDebugMode(circles)&&!mouseKeyDown){

                        for(var i = 0; i < circles.length; i++){
                            if (circles[i].isCursorInside(e.pageX - boardPos.x, e.pageY - boardPos.x)) {
                                disactiveAllDebugMode(circles);
                                // clearing canvas content with white color
                                ctx.fillStyle = '#FFFFFF';
                                ctx.fillRect(0, 0, boardWidth, boardHeight);
                                // drawing all circles
                                for(var j = 0; j < circles.length; j++){
                                    circles[j].draw();
                                }
                                circles[i].debug = true;
                                circles[i].drawSetRadius(5);
                                break;
                            }
                        }
                    } else if(!started&&isAnyInDebugMode(circles)&&!isInsideAnyCircle(circles, e.pageX - boardPos.x, e.pageY - boardPos.y)){
                        disactiveAllDebugMode(circles);
                        // clearing canvas content with white color
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(0, 0, boardWidth, boardHeight);
                        // drawing all circles
                        for(var j = 0; j < circles.length; j++){
                            circles[j].draw();
                        }
                    }

                });

            }

        }).mouseup(function(e){
            // cheking wether our circle was placed or not
            mouseKeyDown = false;
            if(drawingNewCircle !== false){
                drawingNewCircle = false;
                // creating one circle centered with mouse pointer and default minimum radius
                createOne(circles, mouseDown.x, mouseDown.y, newRadius);
                // clearing canvas content with white color
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, boardWidth, boardHeight);
                // drawing all circles
                for(var i = 0; i < circles.length; i++){
                            circles[i].draw();
                        }
                // drawing an arrows of circles directions
    //            drawDirection(circles);
                // drawing info of the las circle
                drawInfo('circle['+(circles.length - 1)+'].x = ' + Math.round(circles[(circles.length - 1)].x), 2, 11);
                drawInfo('circle['+(circles.length - 1)+'].y = ' + Math.round(circles[(circles.length - 1)].y), 2, 23);
                drawInfo('circle['+(circles.length - 1)+'].r = ' + Math.round(circles[(circles.length - 1)].r), 2, 35);
                drawInfo('circle['+(circles.length - 1)+'].angle = ' + Math.round(circles[(circles.length - 1)].angle), 2, 47);

            } else {
                for(var i = 0; i < circles.length; i++){
                    if (circles[i].isCursorInside(e.pageX - boardPos.x, e.pageY - boardPos.x)) {
                        if (!inCircle) {
                            inCircle = true;
                        }
                        // clearing canvas content with white color
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(0, 0, boardWidth, boardHeight);
                        // deselecting all circles
                        disactiveAll(circles);
                        //selecting this circle in diffent color
                        circles[i].active = true;
                        // drawing all circles
                        for(var j = 0; j < circles.length; j++){
                            circles[j].draw();
                        }
                        // drawing direction of all circles
//                            drawDirection(circles);
                        // drawing info of selected circle
                        drawInfo('circle['+i+'].x = ' + Math.round(circles[i].x), 2, 11);
                        drawInfo('circle['+i+'].y = ' + Math.round(circles[i].y), 2, 23);
                        drawInfo('circle['+i+'].r = ' + Math.round(circles[i].r), 2, 35);
                        drawInfo('circle['+i+'].angle = ' + Math.round(circles[i].angle), 2, 47);
                        break;
                    } else {
                        if (inCircle) {
                            inCircle = false;
                        }
                    }
                }

                if (!inCircle){
                    // clearing canvas content with white color
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, boardWidth, boardHeight);
                    // deselecting all circles
                    disactiveAll(circles);
                    // drawing all circles
                    for(var j = 0; j < circles.length; j++){
                        circles[j].draw();
                    }
                }
            }
        });

        $('#Board').on('mousemove',function(e){
//            console.log('moved');
//            if(circles.length !== 0) {
//                for(var i = 0; i < circles.length; i++){
//                        if (circles[i].isCursorInside(e.pageX - boardPos.x, e.pageY - boardPos.x)) {
//                                console.log(circles[i].x);
//
//                            circles[i].drawSetRadius(5);
//                        }
//                }
//            }
        });



        $('#Board').contextmenu(function(){
            if (startStep) {
                cancelAnimationFrame(startStep);
                startStep = undefined;
            } else {
                startStep = requestAnimationFrame(step);
            }
        });

    });
}());
