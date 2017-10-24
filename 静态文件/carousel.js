var animate = function() {
	var liner = function(ele, prop, next) {
		var speed = (next - ele[prop]) / 10,
		i = 0;
		ele.animating = true;
		(function() {
			ele[prop] += speed;
			i++;
			if (i < 10) {
				setTimeout(arguments.callee, 60);
			} else {
				ele.animating = false;
			}
		})();	
	}
	return {
		liner: liner
	}
}();

var carouselProto = {};
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
	} else {
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
	for (var i=0;i<this.len;i++) {
		btns += '<a href="" index="' + i + '"></a>';
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
	} else {
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
/*	alert(document.body.style.width);
	document.getElementsByClassName("horizontal-box")[0].style.width = document.body.style.width;
	alert(document.getElementsByClassName("horizontal-box")[0].style.width);*/
	var that = Object.create(carouselProto);
	that.wrapSelec = wrapSelec;
	that.ele = $(eleSelec);
	that.container = $(wrapSelec);
	that.len = that.ele.getElementsByTagName("img").length;
	that.width = parseInt(getCSS(that.ele.getElementsByTagName("img")[0], "width"));
//	document.getElementsByClassName("clearfix")[0].style.width = that.width * that.len + "px";
//	alert(document.getElementsByClassName("horizontal-box")[0].style.width);
	return that;
}

window.onload = function() {
	var carousel1 = carousel(".horizontal", ".horizontal-box");
		carousel1.start("forward", 2, true);
}
