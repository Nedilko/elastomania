/*jslint browser: true*/
/*global $*/

function Circle(x, y, r) {
    "use strict";

    this.x = x;
    this.y = y;
    this.r = r;

    this.draw = function (ctx) {

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.strokeStyle = 'black';
        ctx.stroke();
    };

    this.clearDraw = function (ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.strokeStyle = 'lightgrey';
        ctx.stroke();
    };

    this.move = function (cx, cy) {
        this.x += cx;
        this.y += cy;
    };

}

var
    boardWidth = 1200,
    boardHeight = 600,
    fps = 50,
    direction = {
        cx: 1,
        cy: 1
    };

$(document).ready(function () {
    "use strict";
    //рисуем поле
    var board = document.getElementById("Board"),
        ctx     = board.getContext('2d');

    ctx.canvas.width = boardWidth;
    ctx.canvas.height = boardHeight;
    ctx.fillStyle = "lightgrey";
    ctx.fillRect(0, 0, boardWidth, boardHeight);

    var testCircle = new Circle(100, 40, 50);
    testCircle.draw(ctx);

    var timer = setInterval(function () {
        if ((testCircle.x > boardWidth) || (testCircle.x < 0)) {
            direction.cx *= -1;
            if (testCircle.x > boardWidth) {
                testCircle.x = boardWidth;
            } else {
                testCircle.x = 0;
            }
        } else if ((testCircle.y > boardHeight) || (testCircle.y < 0)) {
            direction.cy *= -1;
            if (testCircle.y > boardHeight) {
                testCircle.y = boardHeight;
            } else {
                testCircle.y = 0;
            }
        } else {
            testCircle.clearDraw(ctx);
            testCircle.move(direction.cx, direction.cy);
            testCircle.draw(ctx);
        }
    }, 1000 / fps);

    $('#Board').click(function () {
        clearInterval(timer);
    });

});
