// Lorem.js

(function($, window, undefined){

	var Lorem = window.Lorem = {

		init: function( opts ) {

			return (function(){

				// Set options
				if (!opts || !opts.element) { throw new Error("You must pass in a container element"); }

				// Local object to hold values
				var lorem = {
					options : opts,
					$el     : $(opts.element)
				};

				opts.speed || (opts.speed = 1500);
				opts.fadeOpacity || (opts.fadeOpacity = 0.15);
				opts.offset || (opts.offset = 100);
				opts.remaining || (opts.remaining = 0);

				// Variables to keep track of when animations are occuring
				var blackedOut = false;
				var moved = false;
				var inMotion = false;
				var spanified = false;
				var sauntering = false;

				// hide while making changes
				lorem.$el.css({ visibility: "hidden" });

				cacheCSS();
				spanify();

				// show after making changes
				lorem.$el.hide();
				lorem.$el.css({ visibility: "visible" });
				lorem.$el.show();
				// lorem.$el.fadeIn(opts.speed);


				//////// FUNCTIONS /////////

				var random = Lorem.random;

				function cacheCSS() {
					$el = lorem.$el.find('p').length ? lorem.$el.find('p') : lorem.$el;

					lorem.cssCache = {
						lineHeight: $el.css('line-height'),
						opacity: $el.css('opacity'),
						fontSize: $el.css('font-size'),
						color: $el.css('color')
					};
				}

				function spanify(callback) {
					var ps, $p, text, words, html, k, l, $words;

					lorem.cache = lorem.$el.html();

					ps = lorem.$el.find('p');
					if (ps.length) {
						$.each(ps, function(i, p) {
							$p = $(p),
							text = $p.text(),
							words = text.split(" "),
							html = "";

							for (k = 0, l = words.length; k < l; k++) {
								
								if (words[k] === "") continue;
								html += "<span class='word " + k + "'>" +
										words[k] + "</span>";
							}

							$(p).html(html).addClass("clearfix");
						});
					} else {
						text = lorem.$el.text(),
						words = text.split(" "),
						html = "";

						for (k = 0, l = words.length; k < l; k++) {
							html += "<span class='word'>" +
									words[k] + "</span>";
						}

						lorem.$el.html(html);
					}

					$words = lorem.words = $('.word');

					// replace line-height with margins (makes blackout look nicer)
					var line_height = parseInt(lorem.cssCache.lineHeight, 10),
						font_size   = parseInt(lorem.cssCache.fontSize, 10),
						ratio = line_height / font_size / 5,
						// offset = line_height - font_size,
						// margin = offset / 2,
						attrs = {
							lineHeight: '1em',
							marginTop: ratio + "em",
							marginBottom: ratio + "em",
							marginRight: ".25em",
							float: "left",
							position: "relative",
							opacity: 1,
							transition: "all " + opts.speed/1000 + "s cubic-bezier(.67,.02,.29,.99)"
						};
						
					$words.css(attrs);

					spanified = true;

					if (callback) { callback(); }

				}

				function options( newOpts ) {
					if (!newOpts) { return clone(opts); }

					for (var opt in newOpts) {
						if (opt === "element") { continue; }
						opts[opt] = newOpts[opt];
						if (opt === "speed") {
							lorem.words.css("transition", "all " + opts.speed/1000 + "s cubic-bezier(.67,.02,.29,.99)");
						}
					}
				}

				function revert() {
					lorem.$el.html( lorem.cache );
					spanified = false;
				}

				function moveWords(numRemaining, offset) {
					if (!spanified) { throw new Error("Not spanified!"); }

					if (blackedOut) {
						resetWords(function(){
							moveWords(numRemaining, offset);
						});
						return;
					}

					var reps, i, attrs, word;

					offset || (offset = opts.offset);
					numRemaining || (numRemaining = opts.remaining);

					var words =	lorem.words;

					reps = words.length - numRemaining;
					shuffleDeck( words );

					for (i = 0; i < reps; i++) {

						attrs = {
						//	top: random(-offset, offset),
						//	left: random(-offset, offset),
							opacity: random(0, opts.fadeOpacity)
						};
						// Move either vertically OR horizontally
						var topOrLeft = random(0,1) ? "top" : "left";
						attrs[topOrLeft] = random(-offset, offset);

						word = drawCard();
						$(word).css(attrs);
					}

					// Leaving this out gives "sauntering" a cool effect
					if (!sauntering) {
						attrs = { top: 0, left: 0, opacity: 1 };	
						while (word = drawCard()) {
							$(word).css(attrs);
						}
					}

					moved = true;
				}

				function resetWords(callback) {

					if (inMotion) { stopMotion(); }

					var words =	lorem.words;

					for (var i = 0, l = words.length; i < l; i++) {
							attrs = {
								top: 0,
								left: 0,
								opacity: 1,
								background: "none"
							};

						$(words[i]).css(attrs);
					}

					blackedOut = false;
					moved = false;

					if (callback) { window.setTimeout(callback, opts.speed); }
				}

				function shuffleDeck(cards) {
					if (!cards) { throw new Error("You must pass in an array to shuffle"); }
					lorem.cards = cards;
					lorem.deck = (function(){
						var array = [];
						for (var i = 0, l = cards.length; i < l; i++) {
							array[i] = i;
						}
						return array;
					})();
				}

				function drawCard() {
					var deck = lorem.deck;
					var i = random(0, deck.length - 1);
					var drawn = deck.splice(i, 1);
					return lorem.cards[drawn];
				}

				function blackout(numRemaining) {
					if (!spanified) { throw new Error("Not spanified!"); }

					if (moved) {
						resetWords(function() {
							blackout(numRemaining);
						});
						return;
					}
					if (inMotion) {
						stopMotion(function() {
							blackout(numRemaining);
						});
						return;
					}

					numRemaining || (numRemaining = opts.remaining);
					var i, word, attrs,
						reps = lorem.words.length - numRemaining;

					shuffleDeck( lorem.words );
					for (i = 0; i < reps; i++) {
						word = drawCard();
						attrs = { backgroundColor: lorem.cssCache.color };
						$(word).css(attrs);
					}

					attrs = { background: "none" };
					while (word = drawCard()) {
						$(word).css(attrs);
					}

					blackedOut = true;
				}

				// BUG: NEED TO KEEP FROM CALLING TOO MANY TIMES
				// BUG: not maintaining count when called repeatedly.
				function startMotion(delay, count) {
					if (!spanified) { throw new Error("Not spanified!"); }

					count || (count = 20);
					delay || (delay = opts.speed * 0.9);
					// delay > opts.speed ? delay : (delay = opts.speed);

					moveWords(count);
					inMotion || ( inMotion = true );
					lorem.motionLoop = window.setTimeout(function(){
						startMotion(delay, count);
					}, delay);
				}

				function stopMotion(callback) {
					if (!spanified) { throw new Error("Not spanified!"); }
					if (!inMotion) { throw new Error("Not currently in motion"); }
					window.clearTimeout( lorem.motionLoop );
					inMotion = false;
					resetWords(callback);
				}

				function toggleMotion(delay, count) {
					if (inMotion) { stopMotion(); return; }
					startMotion(delay, count);
				}

				function clone(obj) {
					var copy = {};
					for (var attr in obj) {
						copy[attr] = obj[attr];
					}
					return copy;
				}

				function saunter(speed, callback){
					var _optionsCache = options();

					speed || (speed = opts.speed);

					options({speed: speed, opacity: 0});
					lorem.words.css('opacity', '0');
					
					sauntering = true;

					window.setTimeout(function(){
						moveWords(0, 100);
						startMotion();
					}, speed);
					window.setTimeout(function(){
						options({fadeOpacity: 0.45, offset: 0});
					}, speed * 1.1);

					window.setTimeout(function(){
						stopMotion(function(){
							options(_optionsCache);
							sauntering = false;
							if (callback) { callback(); }
						});
					}, speed * 8);
				}

				////// API //////

				return {
					revert: revert,
					startMotion: startMotion,
					stopMotion: stopMotion,
					blackout: blackout,
					moveWords: moveWords,
					resetWords: resetWords,
					spanify: spanify,
					options: options,
					saunter: saunter,
					toggleMotion: toggleMotion

				};
			})();
		},

		// Picks a random int between min and max (including both)
		// Also works: random(max), min will be set to 0
		random: function(min, max) {
			var round, diff = max - min;
			(diff < 1) || (round = true);
			max || (max = min, min = 0);
			if (round) { return min + Math.floor( Math.random() * diff + 0.5 ); }
			return min + ( Math.random() * diff );
		}

	};

}(jQuery, window));

