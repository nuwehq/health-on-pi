$(document).ready(function() {
	/* Configuration Options */
	var width = 420;
	var height = 420;
	var innerRadius = 112;
	var radiusStep = 31;
	var strokeWidth = 29;
	var imageWidth = 33;
	var imageHeight = 19;
	

	/* Color Variables */
	var innerCircleFillColor = '#00b1e8';
	var innerCircleStrokeColor = '#00b1e8';

	var backCircleStrokeColor = '#eeeeee';

	// Data Value
	var amount = [];
	var textPS = [
		{
			size: 48,
			top: 0
		},
		{
			size: 32,
			top: 45
		}
	];

	var colorTable = ['#009D76', '#ff8300', '#cd3df6'];

	/* Private variables */
	var innerCircle;
	var backCircle = [], theArc = [], theInnerArc = [];
	var innerCircleAnim = [];
	var anim = [];

	// Rapahel Element Prepare.
	var paper = Raphael('canvas', width, height);

	paper.customAttributes.arc = function(xloc, yloc, value, total, R, direction, offset) {
		var alpha = 360 / total * (value-offset),
			a = ( 90 - alpha) * Math.PI / 180,
			x = xloc + R * direction * Math.cos(a),
			y = yloc - R * Math.sin(a),
			path;
		if (total == value) {
			path = [
				['M', xloc + offset, yloc - R],
				['A', R, R, 0, 1, 1, xloc - 0.01, yloc - R]
				];
		} else {
			path = [
				['M', xloc + offset * 4, yloc - R],
				['A', R, R, 0, +(alpha > 180), (1 + direction) / 2, x, y]
				];
		}
		return {
			path: path
		};
	};
   
    /* 
     * Function Definitions
     */

   	/* Raphael Circles Preparation */
	function drawMainElements() {
		// Rapahel Inner-most Circle
		innerCircle = paper.circle(width / 2, height / 2, innerRadius - strokeWidth / 2 - 3);
		innerCircle.attr('fill', innerCircleFillColor).attr('stroke', innerCircleStrokeColor);


		var i, j;
		for (i = 0; i < 3; i++) {
			// The Rails
			backCircle[i] = paper.circle(width / 2, height / 2, innerRadius + radiusStep * i).attr({
				'stroke': backCircleStrokeColor,
				'stroke-width': strokeWidth
			});

			theArc[i] = paper.path().attr({
				'stroke': colorTable[i],
				'stroke-width': strokeWidth,
				arc: [width / 2, height / 2, 1000, 1000, innerRadius + radiusStep * i, (i % 2 *2 - 1), 0]
			});	

		}
	}
	

	function loadingDial() {
		var amount = 1000;

		// We are going to have 6 animations, and prepare Raphael animation array.
		for (i = 0; i < 6; i++) {
			anim[i]	 = [];
		}
		
		for (i = 0; i < 3; i++) {
			
			if (i !== 0) {
				// Clockwise animation
				anim[0][i] = Raphael.animation({
					arc: [width / 2, height / 2, 0 , 1000, innerRadius + radiusStep * i, (i % 2 *2 - 1), 0]
				}, 900);

				// Counter-clockwise animation
				anim[1][i] = Raphael.animation({
					arc: [width / 2, height / 2, 1000, 1000, innerRadius + radiusStep * i, (i % 2 *2 - 1), 0]
				}, 900);
				// Enlarge Animation
				anim[2][i] = Raphael.animation({
					arc: [width / 2, height / 2, 1000 , 1000, innerRadius + radiusStep * (i + 1), (i % 2 *2 - 1), 0]
				}, 400, 'backOut');

			} else {
				// Clockwise animation
				anim[0][i] = Raphael.animation({
					arc: [width / 2, height / 2, 0 , 1000, innerRadius + radiusStep * i, (i % 2 *2 - 1), 0]
				}, 900, function () {
					// Sync Animations between.

					// Breakpoint to cancel the animation if the value loaded from server.
					theArc[0].animateWith(theArc[1], anim[1][1], anim[1][0].delay(300));
					theArc[1].animateWith(theArc[2], anim[1][2], anim[1][1].delay(300));
					theArc[2].animateWith(theArc[0], anim[1][0], anim[1][2].delay(300));
				});
				// Counter-clockwise animation
				anim[1][i] = Raphael.animation({
					arc: [width / 2, height / 2, 1000, 1000, innerRadius + radiusStep * i, (i % 2 *2 - 1), 0]
				}, 900, function() {
					// Another breakpoint to cancel the animation if the value loaded from server.
					theArc[0].animate(anim[2][0]).animate(anim[3][0].delay(400));
					theArc[1].animate(anim[2][1].delay(200)).animate(anim[3][1].delay(600));
					theArc[2].animate(anim[2][2].delay(400)).animate(anim[3][2].delay(800));
				});

				// Enlarge animation
				anim[2][i] = Raphael.animation({
					arc: [width / 2, height / 2, 1000, 1000, innerRadius + radiusStep * (i + 1), 1, 0]
				}, 400, 'backOut');

			}
			if (i === 2) {
				// Back to origin animation
				anim[3][i] = Raphael.animation({
					arc: [width / 2, height / 2, 1000, 1000, innerRadius + radiusStep * i, 1, 0]
				}, 500, 'bounce', function() {
					opacityRing.animate(opacityAnim.delay(300));
				});

				// Final Loading animation
				anim[5][i] = Raphael.animation({
					arc: [width / 2, height / 2, 1000, 1000, innerRadius + radiusStep * i, 1, 0]
				}, 400, 'bounce', function() {
					animating = false;
				});

			} else {
				// Back to origin animation
				anim[3][i] = Raphael.animation({
					arc: [width / 2, height / 2, 1000 , 1000, innerRadius + radiusStep * i, 1, 0]
				}, 500, 'backIn');
				anim[5][i] = Raphael.animation({
					arc: [width / 2, height / 2, 1000, 1000, innerRadius + radiusStep * i, 1, 0]
				}, 400, 'bounce');
			}

			// Shrink Animation Define
			anim[4][i] = Raphael.animation({
				arc: [width / 2, height / 2, 1000, 1000, innerRadius + radiusStep * (i - 1), 1, 0]
			}, 400, 'bounce');


		}

		innerCircleAnim[0] = Raphael.animation({
			r: innerRadius - strokeWidth * 3 / 2 - 5
		}, 400, 'bounce');

		innerCircleAnim[1] = Raphael.animation({
			r: innerRadius - strokeWidth / 2 - 5
		}, 400, 'bounce');

		// Opacity animation : Animation Step 3.5
		// Repeat animation 3 times
		var n = 0;
		var opacityAnim = Raphael.animation({
			'stroke-width': width / 2,
			arc: [width / 2, height / 2, 1000, 1000, width / 4, 1, 0]
		}, 600, 'ease', function() {
			opacityRing.animate(opacityAnim1);
		});
		var opacityAnim1 = Raphael.animation({
			'stroke-width': 0,
			arc: [width / 2, height / 2, 1000, 1000, width / 2, 1, 0]
		}, 600, 'ease', function() {
			opacityRing.attr({'arc': [width / 2, height / 2, 1000, 1000, 0, 1, 0]});
			n++;
			if (n > 4) {
				innerCircle.animate(innerCircleAnim[0]).animate(innerCircleAnim[1].delay(900));
				theArc[0].animate(anim[4][0].delay(300)).animate(anim[5][0].delay(900));
				theArc[1].animate(anim[4][1].delay(500)).animate(anim[5][1].delay(1100));
				theArc[2].animate(anim[4][2].delay(700)).animate(anim[5][2].delay(1300));
			} else {
				opacityRing.animate(opacityAnim.delay(200));
			}
		});

		var opacityRing = paper.path().attr({
			'stroke': '#FFFFFF',
			'opacity': 0.5,
			'stroke-width': 0,
			arc: [width / 2, height / 2, 1000, 1000, 0, (i % 2 *2 - 1), 0]
		});

		
		theArc[0].animateWith(theArc[1], anim[0][1], anim[0][0]);
		theArc[1].animateWith(theArc[2], anim[0][2], anim[0][1]);
		theArc[2].animateWith(theArc[0], anim[0][0], anim[0][2]);
	}




	/* 
	 * Call Functions to initialize and display elements
	 */
	drawMainElements();
	loadingDial();
});