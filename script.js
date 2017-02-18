/*jslint browser: true*/
/*global $*/
(function () {

    "use strict";

    var ctx,
        direction = function () {
            this.cx = Math.cos(this.angle * (Math.PI / 180)) * this.speed / 10;
            this.cy = Math.sin(this.angle * (Math.PI / 180)) * this.speed / 10;
        };

    /**
     * return radians from degrees
     * @param   {number} angle in degrees
     * @returns {number} angle in radians
     */

    function getRadians(angle){
        if(arguments !== 0){
            return angle * Math.PI / 180;
        } else {
            return null;
        }
    }

    /**
     * Creating Circle instance
     * @constructor
     * @this {Circle}
     * @param {number} x     x-coordinate of circle center
     * @param {number} y     y-coordinate of circle center
     * @param {number} r     radius of circle
     * @param {number} angle angle of circle
     * @param {number} speed relative speed of circle
     */

    function Circle(x, y, r, angle, speed) {

        this.x = x;
        this.y = y;
        this.r = r;

        this.active = false; // flag wether circle is selected of not
        this.debug = false; // flag wether circle parameters can be modified or not

        this.weight = Math.PI * Math.pow(this.r, 2); // mass of circle

        this.direction = getRadians(angle); // direction of circle movement depending on angle
        this.speed = speed; // spped of a circle

        // speed projection on x- and y-coordinates
        this.velX = this.speed * Math.cos(this.direction);
        this.velY = this.speed * Math.sin(this.direction);

        // calculating balls next x- and y-position
        this.nextX = this.x + this.velX;
        this.nextY = this.y + this.velY;

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
        ctx.fillStyle = '#EDEDED';
        if (!this.active) {
            ctx.strokeStyle = 'darkgrey';
            ctx.shadowColor = 'red';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        } else {
            ctx.strokeStyle = 'red';
            ctx.shadowColor = 'red';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.fill();
        ctx.lineWidth = 1;
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
        ctx.lineWidth = 1;
        ctx.stroke();
    };

    Circle.prototype.drawSpeed = function () {
        // the interval velocity is [2,32]
        var angle = 0,
            curAngle = 0,
            n = 20;
        ctx.beginPath();
        angle = (this.speed - 1) * 360 / 31;
        ctx.lineWidth = 2;
        ctx.moveTo(this.x + this.r, this.y);
        ctx.arc(this.x, this.y, this.r, 0, angle * Math.PI / 180);
        ctx.strokeStyle = 'blue';
        ctx.shadowColor = 'black';
	    ctx.shadowBlur = 5;
	    ctx.shadowOffsetX = 0;
	    ctx.shadowOffsetY = 0;
        ctx.stroke();
    };

    Circle.prototype.move = function () {
        this.x += this.cx;
        this.y += this.cy;
    };

    Circle.prototype.setAngle = function () {
        // atan is in interval [-Pi/2; Pi/2]
        this.angle = Math.atan(this.cy / this.cx) * 180 / Math.PI;
        if(((this.cy < 0)&&(this.cx < 0))||((this.cy > 0)&&(this.cx < 0))){
           this.angle += 180;
        } else if((this.cy < 0)&&(this.cx > 0)){
            this.angle += 360;
        }
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

    Circle.prototype.isCursorInsideRadiusSetter = function (x, y, r) {
        if ( (Math.pow((this.x + this.r * Math.cos(this.angle * Math.PI / 180) - x), 2) + Math.pow((this.y + this.r * Math.sin(this.angle * Math.PI / 180) - y), 2)) <= Math.pow(r, 2) ) {
            return true;
        } else {
            return false;
        }
    };


    function roundPlus(x, n){
        if(isNaN(x) || isNaN(n)) return false;
        var m = Math.pow(10,n);
        return Math.round(x*m)/m;
    }

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
            circle.cx *= -1;
        }

        if((circle.y >= ctx.canvas.height - circle.r) || (circle.y <= circle.r)) {
            circle.cy *= -1;
        }

        circle.setAngle();

    }

    function proximitySensor(circles) {
        var db = [],
            newCx1 = 0,
            newCy1 = 0,
            newCx2 = 0,
            newCy2 = 0;

outer:  for(var i = 0; i < circles.length; i++) {
            db[i] = [];
            for(var j = 0; j < circles.length; j++) {
                db[i].push(( Math.pow(circles[i].x - circles[j].x, 2) + Math.pow(circles[i].y - circles[j].y, 2) ));
                if( (db[i][j] <= Math.pow((circles[i].r + circles[j].r), 2))&&(db[i][j] !== 0) ) {

                    newCx1 = (2*circles[j].weight*circles[j].cx + (circles[i].weight - circles[j].weight)*circles[i].cx)/(circles[i].weight + circles[j].weight);
                    newCy1 = (2*circles[j].weight*circles[j].cy + (circles[i].weight - circles[j].weight)*circles[i].cy)/(circles[i].weight + circles[j].weight);

                    newCx2 = (2*circles[i].weight*circles[i].cx + (circles[j].weight - circles[i].weight)*circles[j].cx)/(circles[i].weight + circles[j].weight);
                    newCy2 = (2*circles[i].weight*circles[i].cy + (circles[j].weight - circles[i].weight)*circles[j].cy)/(circles[i].weight + circles[j].weight);

                    circles[i].cx = newCx1;
                    circles[i].cy = newCy1;
                    circles[j].cx = newCx2;
                    circles[j].cy = newCy2;

                    circles[i].setAngle();
                    circles[j].setAngle();

                    break outer;

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

    function ShowCircleInfo(circle){
        // drawing info of current circle
        $("#circle-cx").text(roundPlus(circle.cx, 2));
        $("#circle-cy").text(roundPlus(circle.cy, 2));
        $("#circle-x").text(roundPlus(circle.x, 2));
        $("#circle-y").text(roundPlus(circle.y, 2));
        $("#circle-r").text(circle.r);
        $("#circle-angle").text(roundPlus(circle.angle, 2));
        $("#circle-speed").text(circle.speed);
    }

    function showShortInfo(x, y, r){
        if($("#circle-cx").text !== "" || $("#circle-cy").text() !== "" || $("#circle-angle").text() || $("#circle-speed").text()){
            $("#circle-cx").text("");
            $("#circle-cy").text("");
            $("#circle-angle").text("");
            $("#circle-speed").text("");
        }
        // drawing info of x, y, r
        $("#circle-x").text(roundPlus(x, 2));
        $("#circle-y").text(roundPlus(y, 2));
        $("#circle-r").text(r);
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
            curCircle = 0;

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
            proximitySensor(circles);

            // drawing info of current circle
            ShowCircleInfo(circles[curCircle]);

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

        $("#step").on('click',function(){

            if (started) {
                $('#stop').prop('disabled', true);
                $('#start').prop('disabled', false);
                cancelAnimationFrame(startStep);
                startStep = undefined;
                started = false;
            }

            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, boardWidth, boardHeight);

            for(var i = 0; i < circles.length; i++){
                bordersCross(circles[i]);
                circles[i].move();
                circles[i].draw();
            }

            proximitySensor(circles);

            // drawing info of current circle
            ShowCircleInfo(circles[curCircle]);

        });

        $('#debug').change(function(){
            for(var i = 0; circles.length; i++){
                circles[i].drawSpeed();
            }
        });





        var mouseDown = {x : 0, y : 0},
            mousePos = {x : 0, y : 0},
            boardPos = findOffset(board),
            curRadius,
            newRadius,
            drawingNewCircle = false,
            mouseKeyDown = false,
            inCircle = false,
            little_circle = false;

        $('#Board').dblclick(function(e){
            if(!started){
                for(var i = 0; i < circles.length; i++){
                    if(circles[i].isCursorInside(e.pageX - boardPos.x, e.pageY - boardPos.x)){
                        circles.splice(i,1);
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
                            showShortInfo(mouseDown.x, mouseDown.y, curRadius);
                            drawInfo('x = ' + Math.round(mouseDown.x), 2, 11);
                            drawInfo('y = ' + Math.round(mouseDown.y), 2, 23);

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
                        ShowCircleInfo(circles[i]);

                        curCircle = i;

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
