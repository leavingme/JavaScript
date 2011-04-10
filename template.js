String.format = function(){
    if (arguments.length == 0) 
        return null;
    
    var str = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
        var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
        str = str.replace(re, arguments[i]);
    }
    return str;
}

/*
 * Template
 * 一个渲染简单模板的类
 */
var Template = function(t, json) {
	this.update(t);
};
Template.prototype = {
	/**
	 * 渲染一个URL格式的模板，json中的字段要么通过${FIELD}的匹配渲染，要么以query的形式加在url后面
	 * @param {Object} json
	 * @param {Boolean} is_cache
	 */
	render_for_url : function(json, is_cache) {
		if (this._t) {
			var url = this._t + '';
			var params = [];
			for (var key in json) {
				var val = json[key];
				if (typeof val == 'undefined') {
					val = '';
				};
				var reg = new RegExp('\\$\\{' + key + '\\}', 'ig');
				if (url.search(reg) > -1) {
					url = url.replace(reg, val + '');
				} else {
					params.push(key + '=' + val);
				}
			};
			params.push( '_t=' + new Date().getTime());
			if (url.indexOf('?') > -1) {
				url += '&' + params.join('&');
			} else {
				url += '?' + params.join('&');
			};
			return url;
		};
	},
	/**
	 * 渲染一个通过${FIELD}匹配的模板
	 * @param {Object} json
	 */
	render_for_json : function(json) {
		if (this._t) {
			var re = this._t + '';
			for (var key in json) {
				var val = json[key];
				if (typeof val == 'undefined') {
					val = '';
				};
				var reg = new RegExp('\\$\\{' + key + '\\}', 'ig');
				re = re.replace(reg, val + '');
			};
			return re;
		};
	},
	/**
	 * 更新当前的模板
	 */
	update : function() {
		var h = [];
		var args = arguments;
		for (var i = 0;i < args.length; i++) {
			var arg = args[i];
			if (arg instanceof Array) {
				h.push(arg.join(''));
			} else if (typeof arg == 'string') {
				h.push(arg);
			};
		};
		this._t = h.join('');
		return this;
	}
};
Template.prototype.constructor = Template;
