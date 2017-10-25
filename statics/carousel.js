var animate = function() {
	var liner = function(ele, prop, next) {
		var speed = (next - ele[prop]) / 5,
		i = 0;
		ele.animating = true;
		(function() {
			ele[prop] += speed;
			i++;
			if (i < 5) {
				setTimeout(arguments.callee, 60);
			}
			else {
				ele.animating = false;
			}
		})();	
	}
	return {
		liner: liner
	}
}();

var carouselProto = {};
var carousel1;
carouselProto.light = function(index) {
	removeClass(this.active, "active");
	this.active = $(this.wrapSelec + " " + "[index=" + index + "]");
	addClass(this.active, "active");
};

carouselProto.go = function(dire) {
	var index = this.active.getAttribute("index") - 0,
		len = this.len,
		width = this.width,
		nextIndex,
		nextPosition;
	if (dire === "next") {
		nextIndex = (index + 1) % len;
		nextPosition = (this.ele.scrollLeft + width) % (width * len);
	} 
	else {
		nextIndex = index === 0 ? len-1 : index-1,
		nextPosition = this.ele.scrollLeft === 0 ? width * len : this.ele.scrollLeft - width;
	}
	if (!this.ele.animating) {
		this.light(nextIndex);
		animate.liner(this.ele, "scrollLeft", nextPosition);
	}
};

carouselProto.circle = function() {
	var that = this;
	this.count++;
	if (this.loop || this.count < this.len) {
		if (this.direction === "forward") {
			this.go("next");
		} else {
			this.go("prev");
		}
		this.begin = setTimeout(function() {
			that.circle();
		}, that.t);
	}
};

carouselProto.createBtn = function() {
	var div = document.createElement("div"),
		btns = '';
	for(var i = 0; i < this.len; i++) {
		btns += '<a index="' + i + '"></a>';
	}
	div.innerHTML = btns;
	addClass(div, "carousel-btn");
	this.container.appendChild(div);
};

carouselProto.createArrow = function() {
	var prev = document.createElement("div"),
		next = document.createElement("div"),
		that = this;
	prev.appendChild(document.createTextNode("<"));
	next.appendChild(document.createTextNode(">"));
	prev.className = "arrow prev";
	next.className = "arrow next";	
	this.container.appendChild(prev);
	this.container.appendChild(next);
	addClass(this.container, "hide");
	$.add(next, "click", function() {
		that.go("next");
	});
	$.add(prev, "click", function() {
		that.go("prev");
	});
};

carouselProto.init = function() {
	var that = this;
	this.createBtn();
	this.createArrow();
	$.delegateTag(this.wrapSelec + " " + ".carousel-btn", "a", "click", function(e,target) {
		$.prevent(e);
		var index = target.getAttribute("index");
		if (index === that.active.getAttribute("index")) {
			return;
		}
		if (!that.ele.animating) {
			that.light(index);
			animate.liner(that.ele, "scrollLeft", target.getAttribute("index") * that.width);
		}
	});
	$.add(this.container, "mouseenter", function() {
		that.stop();
		removeClass(that.container, "hide");
	});
	$.add(this.container, "mouseleave", function() {
		addClass(that.container, "hide");
		that.begin = setTimeout(function() {
			that.circle();
		}, that.t); 
	});
	if (this.direction === "forward") {
		this.light(0);
	}
	else {
		this.light(this.len - 1);
		this.ele.scrollLeft = this.width * (this.len - 1);
	}
	this.haveStart = true;
};

carouselProto.start = function(dir, th, lo) {
	var that = this;
	this.stop();
	this.count = 0;
	this.direction = dir;
	this.t = th * 1000;
	this.loop = lo;
	if (!this.haveStart) {
		this.init();
	}
	this.begin = setTimeout(function() {
		that.circle();
	}, that.t);
};

carouselProto.stop = function() {
	clearTimeout(this.begin);
};

var carousel = function(eleSelec, wrapSelec) {
	var that = Object.create(carouselProto);
	that.wrapSelec = wrapSelec;
	that.ele = $(eleSelec);
	that.container = $(wrapSelec);
	that.len = that.ele.getElementsByTagName("img").length;
	that.width = 10 * parseInt(document.getElementById("carousel").clientWidth / 10.5263);
	document.getElementsByClassName("horizontal")[0].style.width = that.width + "px";
	document.getElementsByClassName("horizontal-box")[0].style.width = that.width + "px";
	document.getElementsByClassName("clearfix")[0].style.width = that.width * that.len + "px";
	for(var i = 0; i < that.len; ++i) {
		that.ele.getElementsByTagName("img")[i].style.width = that.width + "px";
	}
	return that;
}

window.onload = function() {
	carousel1 = carousel(".horizontal", ".horizontal-box");
	carousel1.start("forward", 2, true);
}

window.onresize = function() {
	carousel1.stop();
	var container = document.getElementsByClassName("horizontal-box")[0];
	container.removeChild(document.getElementsByClassName("carousel-btn")[0]);
	container.removeChild(document.getElementsByClassName("arrow prev")[0]);
	container.removeChild(document.getElementsByClassName("arrow next")[0]);
	carousel1 = carousel(".horizontal", ".horizontal-box");
	carousel1.ele.scrollLeft = 0;
	carousel1.start("forward", 2, true);
}
