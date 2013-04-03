jQuery(function(){

	var $container   = $('.container'),
		$title       = $('header span'),
		$main        = $('.main'),
		$nav         = $('nav'),
		$footer      = $('footer'),
		$autopilot   = $('.autopilot'),
		$cite        = $('cite'),
		$author      = $('.author'),
		$attribution = $('.attribution'),
		$info        = $('#info');

	var poetry = window.poetry = {
		init: init,
		loadPassage: loadPassage,
		getPassages: getPassages
	};


	////// Start it all off //////

	getPassages(init);



	///// FUNCTIONS ///////


	function init(){

		/////// Put info text in the info box
		var converter = new Markdown.Converter();
		$.get("README.md").then(function(text){
			$info.append( converter.makeHtml(text) ).show();
			$("body").on('click', '.open_info', openInfo)
				.on('click', '#info .close', closeInfo);
		});

		/////// Put some initial content in /////
		var passages = poetry.passages;
		var i = Lorem.random(0, passages.length - 1);
		var passage = passages[i];

		$cite.text(passage.title);
		$author.text(passage.author);
		$main.html(passage.text);

		/////// Start Lorem ///////
		var lorem = poetry.lorem = Lorem.init({
			element: $main,
			remaining: 25
		});

		/////// Bind Events //////
		var dictionary = {
			move       : "moveWords",
			blackout   : "blackout",
			startMotion: "startMotion",
			stopMotion : "stopMotion",
			reset      : "resetWords"
		};

		$nav.on('click', 'button', function(e) {
			var name = $(this).attr("name");
			if (!name) return;
			var method = dictionary[name];
			lorem[method]();
		});

		$(window.document).keyup(function(e){
			if (e.keyCode === 192) { lorem.saunter(); }
			if (e.keyCode === 13) {
				lorem.toggleMotion(4000);
				toggleAutopilot();
			}
			if (e.keyCode === 37 ||
				e.keyCode === 38 ||
				e.keyCode === 39 ||
				e.keyCode === 40) { poetry.loadPassage(); }
		});

		///// Draw the Curtains //////
		lorem.saunter(1500, function(){
			$footer.fadeIn(1500);
			$title.fadeIn(1500);
		});

	}

	function getPassages(callback) {
		$.getJSON('passages.json', function(data) {
			poetry.passages = data;
			if (callback) { callback(); }
		});
	}

	function loadPassage() {
		var passages = poetry.passages;
		var i = Lorem.random(0, passages.length - 1);
		var passage = passages[i];

		$attribution.fadeOut();
		$main.fadeOut(function(){
			$cite.text(passage.title);
			$author.text(passage.author);

			poetry.lorem.revert();
			$main.html(passage.text);

			poetry.lorem.spanify(function(){
				$main.fadeIn();
				$attribution.fadeIn();
			});
		});
	}

	function toggleAutopilot() {
		var display = $autopilot.css('display');
		if (display !== "none") {
			$autopilot.fadeOut();
			return;
		}
		$autopilot.fadeIn();
	}

	function openInfo() {
		$('#info').addClass('open');
	}

	function closeInfo() {
		$('#info').removeClass('open');
	}
});