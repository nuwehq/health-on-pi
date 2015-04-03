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

    Object.deepExtend = function(destination, source) {
      for (var property in source) {
        if (typeof source[property] === "object") {
          destination[property] = destination[property] || {};
          arguments.callee(destination[property], source[property]);
        } else {
          destination[property] = source[property];
        }
      }
      return destination;
    };

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
            var args = Array.prototype.slice.call(arguments, 0);
            // the first argument is the container id 
            if (args.length > 0) {
                nuwe_charts.containerID = args[0];
            }

            var callback = null;
            // second argument option
            if (args.length > 1) {
                nuwe_charts.prepareOption(args[1]);
                callback = args[2];
            }
            nuwe_charts.init(callback);
            nuwe_charts.drawMainElements();
            // nuwe_charts.loadingDial();
            nuwe_charts.animateWithValues();

        }
    }

    nuwe_charts.version = version;
    nuwe_charts.option = {
        backCircleStrokeColor: '#eeeeee',
        textPS: [
            {
                size: 48,
                top: 0
            },
            {
                size: 20,
                top: 40
            }
        ],
        syncAnimationDelay:  400
    };
    
    /* Private variables */
    nuwe_charts.svgElements = {
        _innerCircle: {},
        _backCircle: [], 
        _theArc: [], 
        _theInnerArc: [],
        _innerCircleAnim: [],
        _anim: [],
        _valueAnim: [],
        _scoreText: [],
        _optionalText: null,

        _basePath: null,
    };

    
    /*
     * Init function
     * - Prepare Raphael paper element
     * - Define 
     */
    nuwe_charts.init = function(callback) {
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

    // option object manipulation
    nuwe_charts.prepareOption = function(option) {
        if (option == null) option = {};
        var margin = 30;
        option.width = parseInt(getComputedStyle(document.getElementById(nuwe_charts.containerID)).width, 10) || nuwe_charts.option.width;
        option.height = parseInt(getComputedStyle(document.getElementById(nuwe_charts.containerID)).height, 10) || nuwe_charts.option.height;

        axis =  Math.min(option.width, option.height);
        option.ringCount = option.data.length - 1;
        option.innerRadius = axis / 5 - option.ringCount;
        option.radiusStep = Math.floor((axis / 2 - option.innerRadius) / (option.ringCount + 1));
        option.strokeWidth = option.radiusStep - 2;
        
        nuwe_charts.option = Object.deepExtend(nuwe_charts.option, option);
    };

    /* Raphael Circles Preparation */
    nuwe_charts.drawMainElements = function() {
        // Rapahel Inner-most Circle
        nuwe_charts.svgElements._innerCircle = nuwe_charts._paper.circle(
            nuwe_charts.option.width / 2, 
            nuwe_charts.option.height / 2, 
            nuwe_charts.option.innerRadius - nuwe_charts.option.strokeWidth / 2 - 3);
        nuwe_charts.svgElements._innerCircle.attr('fill', nuwe_charts.option.data[0].color)
            .attr('stroke', nuwe_charts.option.data[0].color);

        // The main elements
        var i, j;
        for (i = 0; i < nuwe_charts.option.ringCount; i++) {
            // The Rails
            nuwe_charts.svgElements._backCircle[i] = nuwe_charts._paper.circle(nuwe_charts.option.width / 2, nuwe_charts.option.height / 2, nuwe_charts.option.innerRadius + nuwe_charts.option.radiusStep * i)
            .attr({
                'stroke': nuwe_charts.option.backCircleStrokeColor,
                'stroke-width': nuwe_charts.option.strokeWidth
            });
            // Main animation arcs
            nuwe_charts.svgElements._theArc[i] = nuwe_charts._paper.path().attr({
                'stroke': nuwe_charts.option.data[i + 1].color,
                'stroke-width': nuwe_charts.option.strokeWidth,
                'stroke-linecap': 'round',
                arc: [nuwe_charts.option.width / 2, nuwe_charts.option.height / 2, 1000, 1000, nuwe_charts.option.innerRadius + nuwe_charts.option.radiusStep * i, (i % 2 *2 - 1), 0]
            }); 
            nuwe_charts.applyLabelToArc(nuwe_charts.option.width / 2, nuwe_charts.option.height / 2,  nuwe_charts.option.innerRadius + nuwe_charts.option.radiusStep * i, nuwe_charts.option.data[i + 1].textLabel);
        }

        // And the text
        nuwe_charts.svgElements._scoreText[0] = nuwe_charts._paper.text(
            nuwe_charts.option.width / 2, 
            nuwe_charts.option.height / 2 - nuwe_charts.option.textPS[0].top,
            nuwe_charts.option.data[0].amount
        ).attr({
            'font-size': nuwe_charts.option.textPS[0].size,
            'fill': '#FFFFFF',
            'anchor': 'center'
        });

        nuwe_charts.svgElements._scoreText[1] = nuwe_charts._paper.text(
            nuwe_charts.option.width / 2, 
            nuwe_charts.option.height / 2 + nuwe_charts.option.textPS[1].top,
            "/ " + nuwe_charts.option.data[0].maxValue
        ).attr({
            'font-size': nuwe_charts.option.textPS[1].size,
            'fill': '#FFFFFF',
            'anchor': 'center'
        });


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
            },
            // For Animate With value animation, we are going to use clockwise transition
            animateWithValue: function(params, callback) {
                return Raphael.animation({
                    arc: [nuwe_charts.option.width / 2, nuwe_charts.option.height / 2, params.value, params.maxValue, 
                    params.radius, 1, 0]
                }, params.duration, callback);  
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
    };

    /* 
    ** Data Loading Helper function
    */
    nuwe_charts.animateWithValues = function () {
        var option = nuwe_charts.option;
        for (i = 0; i < option.ringCount; i++) {
            // First initialize arcs to the initial position.
            nuwe_charts.svgElements._theArc[i].attr({
                arc: [option.width / 2, option.height / 2, 0, getDataValue(i).maxValue, option.innerRadius + option.radiusStep * i, 1, 0]
            });

            nuwe_charts.svgElements._valueAnim[i] = nuwe_charts.animation.createAnimation(
                "animateWithValue",
                {
                    radius: option.innerRadius + option.radiusStep * i,
                    duration: 900,
                    value: getDataValue(i).value,
                    maxValue: getDataValue(i).maxValue
                }, function() {
                    console.log("Ended!", i);
                });
        }

       
        for (i = 0; i < option.ringCount; i++) {
            nuwe_charts.svgElements._theArc[i].animateWith(nuwe_charts.svgElements._theArc[(i + 1) % option.ringCount],
                 nuwe_charts.svgElements._valueAnim[(i + 1) % option.ringCount], 
                 nuwe_charts.svgElements._valueAnim[i]);
        }

        // Helper function to prevent no value error.
        function getDataValue (index) {
            return {
                value: option.data[index].amount,
                maxValue: option.data[index].maxValue
            };
            /* var defaultValue = {
                value: option.dataDefaultValue,
                maxValue: option.dataDefaultMax
            };
            
            if (option.amount[index]) {
                var record = option.amount[index];
                return Object.deepExtend(defaultValue, record);
            } else
                return defaultValue;
            */
        }
    };


    nuwe_charts.applyLabelToArc = function(x, y, r, message) {
        var textFill = "#4A5256";
        var darkBlueFill = "#ffffff";
        var path11 = nuwe_charts._paper.path(getCircletoPath(x, y, r)).attr({stroke:""});
        textOnPath(message, path11, 15, 1.5, 3, 3, 0, darkBlueFill, "light");

        /* Helpers for drawing rounded arcs*/
        function getCircletoPath(x, y, r) { // x and y are center and r is the radius
       
           var s = "M";
           s = s + "" + (x-r) + "," + (y) + "A"+r+","+r+",0,1,1,"+(x+r)+","+(y)+"z";
       
           return s;
        }

        function textOnPath(message, path, fontSize, letterSpacing, kerning, geckoKerning, angle, fontColor, fontWeight) {
          
            var gecko = /rv:([^\)]+)\) Gecko\/\d{8}/.test(navigator.userAgent||'') ? true : false;
            var letters = [], places = [], messageLength = 0;
          
            for (var c=0; c < message.length; c++) {
              
              var letter = nuwe_charts._paper.text(0, 0, message[c]).attr({"text-anchor" : "middle", "fill" : fontColor, "font-weight" : fontWeight});      
                var character = letter.attr('text'), kern = 0;        
                letters.push(letter);

                if (kerning) {
                  
                    if(gecko && geckoKerning) {
                        kerning = geckoKerning;
                    }
                  
                    var predecessor = letters[c-1] ? letters[c-1].attr('text') : '';
                  
                    if (kerning[c]) {
                      
                        kern = kerning[c];
                      
                    } else if (kerning[character]) {
                      
                        if( typeof kerning[character] === 'object' ) {
                            kern = kerning[character][predecessor] || kerning[character]['default'] || 0;
                        } else {
                            kern = kerning[character];
                        }
                    }
                  
                    if(kerning['default'] ) {
                        kern = kern + (kerning['default'][predecessor] || 0);
                    }            
                }

                messageLength += kern;
                places.push(messageLength);
                //spaces get a width of 0, so set min at 4px
                messageLength += Math.max(4.5, letter.getBBox().width);
            }

            if( letterSpacing ){
                if (gecko) {
                    letterSpacing = letterSpacing * 0.83;
                }
            } else {
                letterSpacing = letterSpacing || path.getTotalLength() /  messageLength;
            }
            fontSize = fontSize || 10 * letterSpacing;
              
            for (c = 0; c < letters.length; c++) {
                letters[c].attr("font-size", fontSize + "px");
                p = path.getPointAtLength(places[c] * letterSpacing + r * 1.75);
                var transformAngle = p.alpha + angle;
                var rotate = 'R' + (transformAngle < 180 ? transformAngle + 180 : transformAngle > 360 ? transformAngle - 360 : transformAngle )+','+p.x+','+p.y;
                letters[c].attr({ x: p.x, y: p.y, transform: rotate });
            }
        }
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