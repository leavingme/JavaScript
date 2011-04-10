var $var = new function(){
    // 项目相关的参数
    this.is_debug = false;
    this.css_path = './common/css/';
    this.js_path = './common/js/';
    this.app_path = './apps/';
    
    // 网络资源访问的相关参数
    this.web_host = 'http://www.kuaikuai.cn/';
    this.cdn_host = 'http://cw002.kuaikuai.cn/website/site_media/';
    this.account_host = 'http://accounts.kuaikuai.cn/';
    this.data_host = 'http://cw002.kuaikuai.cn/cwkk/apps/';
    this.usres_host = 'http://webdata.kuaikuai.cn/image/';
    this.flash_host = 'http://cf002.kuaikuai.cn/cfkk/flash/';
    
    // 来源统计的相关参数
    this.kkrs_mid = '1010';
    this.kkrs_sid = {
        localgame: '15',
        manager: '16',
        fav: '17',
        hall: '18',
        search: '19',
        recommend: '20',
        editor: '21',
        qna: '22'
    };
    
    // 工具方法
    this.get_user_info = function(){
        var user_info = client_api.get_user_info();
        try {
            if (user_info) {
                user_info = eval('(' + user_info.replace(/\\/g, '\\\\') + ')');
            }
        } catch (e) {
            user_info = null;
        }
        return user_info;
    };
    this.bind_user_info = function(url){
        var user_info = this.get_user_info();
        if (user_info) {
            var t = new Template(url);
            url = t.render_for_url({
                token: user_info.token,
                token_secret: user_info.token_secret,
                kk: user_info.kkid
            });
        }
        return url;
    };
    var version = null;
    this.get_ct_version = function(){
        version = version || client_api.get_version();
        try {
            if (typeof version == 'string') {
                version = eval('(' + version + ')');
            }
        } catch (e) {
            version = null;
        }
        return version;
    };
    var channel = null;
    this.get_ct_channel = function(){
        channel = channel || client_api.get_channel();
        try {
            if (typeof channel == 'string') {
                channel = eval('(' + channel + ')');
            }
        } catch (e) {
            channel = null;
        }
        return channel;
    };
    this.from_query = function(str){
        str = decodeURIComponent(str || location.search || '');
        var obj_query = {};
        var re = '([^&?=]+)=([^&?=]*)';
        var m = str.match(new RegExp(re, 'ig'));
        if (m) {
            for (var i = 0; i < m.length; i++) {
                var mm = new RegExp(re, 'ig').exec(m[i]);
                if (mm && mm[1]) {
                    obj_query[mm[1]] = mm[2] || '';
                }
            }
        };
        return obj_query;
    };
    this.to_query = function(obj){
        var str = [];
        for (var k in obj) {
            str.push(k + '=' + obj[k]);
        };
        return str.join('&');
    };
};

