/**
 * 输出script标签
 * @param {String} url
 * @param {Boolean} is_debug
 */
var write_script = (function(){
    var _t = new Date().getTime();
    
    return function(url, is_debug){
        if (is_debug == false) {
            url = url.replace('.js', '.min.js');
        };
        url = url + '?_t=' + _t;
        document.write('<scr' + 'ipt src="' + url + '" type="text/javascript"></scr' + 'ipt>');
    };
})();
/**
 * 输出css标签
 * @param {String} url
 * @param {Boolean} is_debug
 */
var write_css = (function(){
    var _t = new Date().getTime();
    
    return function(url, is_debug){
        if (is_debug == false) {
            url = url.replace('.css', '.min.css');
        };
        url = url + '?_t=' + _t;
        document.write('<li' + 'nk href="' + url + '" type="text/css" rel="stylesheet" />');
    };
})();
