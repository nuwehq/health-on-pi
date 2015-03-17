(function (glob) {
    var version = "0.0.1",
        loaded = false,
        Str = String,
        lowerCase = Str.prototype.toLowerCase,
        objectToString = Object.prototype.toString,
        nu = "number",
        string = "string",
        array = "array",
        toString = "toString";

    /* 
    ** nuwe_charts constructor function
    **
    ** Most Common Type and this is what is only supported at the moment.
    ** nuwe_charts("canvas", {width: 300, height: 300})
    **
    */
    function nuwe_charts(first) {
        if (nuwe_charts.is(first, "function")) {
            return loaded ? first() : eve.on("raphael.DOMload", first);
        } else if (nuwe_charts.is(first, array)) {
            console.log(first);
            // return nuwe_charts._engine.create[apply](nuwe_charts, first.splice(0, 3 + nuwe_charts.is(first[0], nu))).add(first);
        } else {
            console.log(first);
            var args = Array.prototype.slice.call(arguments, 0);
            // the first argument is the container id 
            if (args.length > 0) {
                nuwe_charts.containerID = args[0];
            }
            // second argument option
            if (args.length > 1) {
                var option = args[1];
                // overwrite default nuwe_charts options
                for (var propertyName in option) {
                    nuwe_charts.option[propertyName] = option[propertyName];
                }
            }
            nuwe_charts.init();
            nuwe_charts.drawMainElements();
            nuwe_charts.loadingDial();
        }
    }

    nuwe_charts.version = version;
    nuwe_charts.option = {
        width: 420,
        height: 420,
        innerRadius: 81,
        radiusStep: 31,
        strokeWidth: 29,
        imageWidth: 33,
        imageHeight: 19,
    

        /* Color Variables */
        innerCircleFillColor: '#00b1e8',
        innerCircleStrokeColor: '#00b1e8',

        backCircleStrokeColor: '#eeeeee',

        // Data Value
        amount: [],
        textPS: [
            {
                size: 48,
                top: 0
            },
            {
                size: 32,
                top: 45
            }
        ],
        colorTable: ['#009D76', '#ff8300', '#cd3df6'],

        // Element and Animation Options
        ringCount: 3,
        syncAnimationDelay:  400,

    }
        /* Private variables */
    nuwe_charts.svgElements = {
        _innerCircle: {},
        _backCircle: [], 
        _theArc: [], 
        _theInnerArc: [],
        _innerCircleAnim: [],
        _anim: []
    };

    
    // Init function
    nuwe_charts.init = function() {
        nuwe_charts._paper = Raphael(nuwe_charts.containerID, nuwe_charts.option.width, nuwe_charts.option.height);

        nuwe_charts._paper.customAttributes.arc = function(xloc, yloc, value, total, R, direction, offset) {
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
       
    };

    /* Raphael Circles Preparation */
    nuwe_charts.drawMainElements = function() {
        // Rapahel Inner-most Circle
        nuwe_charts.svgElements._innerCircle = nuwe_charts._paper.circle(
            nuwe_charts.option.width / 2, 
            nuwe_charts.option.height / 2, 
            nuwe_charts.option.innerRadius - nuwe_charts.option.strokeWidth / 2 - 3);
        nuwe_charts.svgElements._innerCircle.attr('fill', nuwe_charts.option.innerCircleFillColor).attr('stroke', nuwe_charts.option.innerCircleStrokeColor);


        var i, j;
        for (i = 0; i < 3; i++) {
            // The Rails
            nuwe_charts.svgElements._backCircle[i] = nuwe_charts._paper.circle(nuwe_charts.option.width / 2, nuwe_charts.option.height / 2, nuwe_charts.option.innerRadius + nuwe_charts.option.radiusStep * i).attr({
                'stroke': nuwe_charts.option.backCircleStrokeColor,
                'stroke-width': nuwe_charts.option.strokeWidth
            });

            nuwe_charts.svgElements._theArc[i] = nuwe_charts._paper.path().attr({
                'stroke': nuwe_charts.option.colorTable[i],
                'stroke-width': nuwe_charts.option.strokeWidth,
                arc: [nuwe_charts.option.width / 2, nuwe_charts.option.height / 2, 1000, 1000, nuwe_charts.option.innerRadius + nuwe_charts.option.radiusStep * i, (i % 2 *2 - 1), 0]
            }); 

        }
    };

    nuwe_charts.animation = {

        /*
        ** Take Care of Raphael Animation Creation
        ** Every animation is going to take different params, 
        ** which will be specified in that particular function.
        ** 
        ** Here are common params
        **   animationName: Animation Type
        **      'clockwise':      The arc is supposed to be changed in clockwise way
        **      'counterwise':    The arc is supposed to be changed in counterwise way
        **      'fixed':          The arc is supposed to transition to certian radius
        **   radius:        Raphael Arc radius
        **   duration:      Raphael Chart duration
        **   direction:     Fill or empty ( 1: fill, empty: -1 )
        **   
        */
        createAnimation: function(animationName, params, callback) {
            return this.animations[animationName].apply(null, [params, callback]);
        },

        /*
        ** Take Care of Raphael Animation Chaining
        ** It is used on callback function to define what behavior we expect.
        ** 
        ** Here are common params
        **   idx:           Next Animation index
        **   type:          Chaining type
        **       'sync':    All elements in next animation should be working at the same time.
        **       'after':   
        */
        nextAnimation: function(idx, type, initialDelay) {
            initialDelay = (typeof initialDelay === 'undefined') ? 0 : initialDelay;
            if (type == 'sync') {
                // loop through all elements and make sync animation.
                var ringCount = nuwe_charts.option.ringCount;
                for (i = 0; i < nuwe_charts.option.ringCount; i ++) {
                    nuwe_charts.svgElements._theArc[i].animateWith(nuwe_charts.svgElements._theArc[(i + 1) % ringCount], nuwe_charts.svgElements._anim[idx][(i + 1) % ringCount], nuwe_charts.svgElements._anim[idx][i].delay(nuwe_charts.option.syncAnimationDelay));
                }
                
            }

            if (type == 'after') {
                // This animation is indicating animations occuring one after another.
                // Like Shrink and enlarge animation
                for (i = 0; i < nuwe_charts.option.ringCount; i ++) {
                    nuwe_charts.svgElements._theArc[i].animate(nuwe_charts.svgElements._anim[idx][0][i].delay(initialDelay + i * 200)).animate(nuwe_charts.svgElements._anim[idx][1][i].delay( initialDelay + i * 200 + 400));
                }
            }

        },


        animations: {
            clockwise: function(params, callback) {
                console.log(params);
                return Raphael.animation({
                    arc: [nuwe_charts.option.width / 2, nuwe_charts.option.height / 2, 0 , 1000, 
                    params.radius, params.direction, 0]
                }, params.duration, callback);
            },
            counterwise: function(params, callback) {
                return Raphael.animation({
                    arc: [nuwe_charts.option.width / 2, nuwe_charts.option.height / 2, 1000 , 1000, 
                    params.radius, params.direction, 0]
                }, params.duration, callback);
            },
            radius: function(params, callback) {
                return Raphael.animation({
                    arc: [nuwe_charts.option.width / 2, nuwe_charts.option.height / 2, 1000 , 1000, 
                    params.radius, 1, 0]
                }, params.duration, params.easing, callback);
            }
        }


    };


    nuwe_charts.loadingDial = function() {
        // For now we will fix it with 1000
        var amount = 1000;
        var option = nuwe_charts.option;
        
        // We are going to have 6 animations, and prepare Raphael animation array.
        for (i = 0; i < 6; i++) {
            nuwe_charts.svgElements._anim[i]  = [];
        }
        
        // for enlarge animation or shrink, we need special data structure.
        nuwe_charts.svgElements._anim[2][0] = [];
        nuwe_charts.svgElements._anim[2][1] = [];
        nuwe_charts.svgElements._anim[3][0] = [];
        nuwe_charts.svgElements._anim[3][1] = [];

        for (i = 0; i < option.ringCount; i++) {
            
            if (i !== 0) {
                nuwe_charts.svgElements._anim[0][i] = nuwe_charts.animation.createAnimation(
                    "clockwise",
                    {
                        radius: option.innerRadius + option.radiusStep * i,
                        duration: 900,
                        direction: (i % 2 *2 - 1)
                    }, 
                null);
                // Counter-clockwise animation
                nuwe_charts.svgElements._anim[1][i] = nuwe_charts.animation.createAnimation(
                    "counterwise" , 
                    {
                        radius: option.innerRadius + option.radiusStep * i,
                        duration: 900,
                        direction: (i % 2 *2 - 1)
                    }, 
                null);

            } else {
                // Clockwise animation
                nuwe_charts.svgElements._anim[0][i] = nuwe_charts.animation.createAnimation(
                    "clockwise",
                    {
                        radius: option.innerRadius + option.radiusStep * i,
                        duration: 900,
                        direction: (i % 2 *2 - 1)
                    }, function () {

                        // Sync animations
                        nuwe_charts.animation.nextAnimation(1, 'sync');
                    }
                );

                // Counter-Clockwise animation
                nuwe_charts.svgElements._anim[1][i] = nuwe_charts.animation.createAnimation(
                    "counterwise",
                    {
                        radius: option.innerRadius + option.radiusStep * i,
                        duration: 900,
                        direction: (i % 2 *2 - 1)
                    }, function () {

                        // Sync animations
                        nuwe_charts.animation.nextAnimation(2, 'after');

                    }
                );
                
            }
            
            // Counter-clockwise animation
            nuwe_charts.svgElements._anim[2][0][i] = nuwe_charts.animation.createAnimation(
                "radius",
                {
                    radius: option.innerRadius + option.radiusStep * (i + 1),
                    duration: 400,
                    easing: 'backOut'
                }, null);
            nuwe_charts.svgElements._anim[2][1][i] = nuwe_charts.animation.createAnimation(
                "radius",
                {
                    radius: option.innerRadius + option.radiusStep * i,
                    duration: 400,
                    easing: 'backOut'
                }, null);
            // Shrink Animation Define
            nuwe_charts.svgElements._anim[3][0][i] = nuwe_charts.animation.createAnimation(
                "radius",
                {
                    radius: option.innerRadius + option.radiusStep * (i - 1),
                    duration: 400,
                    easing: 'bounce'
                }, null);
            nuwe_charts.svgElements._anim[3][1][i] = nuwe_charts.animation.createAnimation(
                "radius",
                {
                    radius: option.innerRadius + option.radiusStep * i,
                    duration: 400,
                    easing: 'bounce'
                }, null);


            if (i === 2) {
                // Back to origin animation
                nuwe_charts.svgElements._anim[2][1][i] = nuwe_charts.animation.createAnimation(
                "radius",
                {
                    radius: option.innerRadius + option.radiusStep * i,
                    duration: 400,
                    easing: 'backout'
                }, function() {
                    opacityRing.animate(opacityAnim.delay(300));
                });

                // Final Loading animation
                nuwe_charts.svgElements._anim[3][1][i] = nuwe_charts.animation.createAnimation(
                "radius",
                {
                    radius: option.innerRadius + option.radiusStep * i,
                    duration: 400,
                    easing: 'bounce'
                }, function() {
                    animating = false;
                });
            }

        }

        nuwe_charts.svgElements._innerCircleAnim[0] = Raphael.animation({
            r: nuwe_charts.option.innerRadius - nuwe_charts.option.strokeWidth * 3 / 2 - 5
        }, 400, 'bounce');

        nuwe_charts.svgElements._innerCircleAnim[1] = Raphael.animation({
            r: nuwe_charts.option.innerRadius - nuwe_charts.option.strokeWidth / 2 - 5
        }, 400, 'bounce');

        // Opacity animation : Animation Step 3.5
        // Repeat animation 3 times
        var n = 0;
        var opacityAnim = Raphael.animation({
            'stroke-width': nuwe_charts.option.width / 2,
            arc: [nuwe_charts.option.width / 2, nuwe_charts.option.height / 2, 1000, 1000, nuwe_charts.option.width / 4, 1, 0]
        }, 600, 'ease', function() {
            opacityRing.animate(opacityAnim1);
        });
        var opacityAnim1 = Raphael.animation({
            'stroke-width': 0,
            arc: [nuwe_charts.option.width / 2, nuwe_charts.option.height / 2, 1000, 1000, nuwe_charts.option.width / 2, 1, 0]
        }, 600, 'ease', function() {
            opacityRing.attr({'arc': [nuwe_charts.option.width / 2, nuwe_charts.option.height / 2, 1000, 1000, 0, 1, 0]});
            n++;
            if (n > 4) {
                nuwe_charts.svgElements._innerCircle.animate(nuwe_charts.svgElements._innerCircleAnim[0]).animate(nuwe_charts.svgElements._innerCircleAnim[1].delay(1000));
                nuwe_charts.animation.nextAnimation(3, 'after', 300);
            } else {
                opacityRing.animate(opacityAnim.delay(200));
            }
        });

        var opacityRing = nuwe_charts._paper.path().attr({
            'stroke': '#FFFFFF',
            'opacity': 0.5,
            'stroke-width': 0,
            arc: [nuwe_charts.option.width / 2, nuwe_charts.option.height / 2, 1000, 1000, 0, (i % 2 *2 - 1), 0]
        });

        nuwe_charts.animation.nextAnimation(0, 'sync');
    }

    nuwe_charts.prototype.getPaper = function() {
        return nuwe_charts.paper;
    };

    eve.on("raphael.DOMload", function () {
        loaded = true;
    });
    /*\
     * Nuwe Chart
     [ method ]
     **
     * Handful of replacements for `typeof` operator.
     > Parameters
     - o (…) any object or primitive
     - type (string) name of the type, i.e. “string”, “function”, “number”, etc.
     = (boolean) is given value is of given type
    \*/
    nuwe_charts.is = function (o, type) {
        type = lowerCase.call(type);
        if (type == "finite") {
            return !isnan[has](+o);
        }
        if (type == "array") {
            return o instanceof Array;
        }
        return  (type == "null" && o === null) ||
                (type == typeof o && o !== null) ||
                (type == "object" && o === Object(o)) ||
                (type == "array" && Array.isArray && Array.isArray(o)) ||
                objectToString.call(o).slice(8, -1).toLowerCase() == type;
    };
    nuwe_charts.toString = function () {
        return "You are running Nuwe Charts Library " + version;
    };
    (typeof module != "undefined" && module.exports) ? (module.exports = nuwe_charts) : (typeof define != "undefined" ? (define("nuwe_charts", [], function() { return nuwe_charts; })) : (glob.nuwe_charts = nuwe_charts));
})(window || this);