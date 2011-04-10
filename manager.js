/*
 * 加载文件的管理工具类
 */
var FileManager = new function(){
    var mem = {};
    /**
     * 获取文件缓存
     * @param {String} n
     */
    this.getCache = function(n){
        return mem[n];
    };
    /**
     * 设置文件缓存
     * @param {String} n
     * @param {String} v
     */
    this.setCache = function(n, v){
        mem[n] = v;
    };
    /**
     * 删除文件缓存
     * @param {String} n
     */
    this.deleteCache = function(n){
        delete mem[n];
        var el = document.getElementById(n);
        if (el) {
            try {
                el.innerHTML = '';
            } catch (e) {
            }
            try {
                el = el.parentNode.removeChild(el);
            } catch (e) {
                el = document.body.removeChild(el);
            } finally {
                delete el;
            }
        }
    };
    /**
     * 清空文件缓存
     */
    this.clearCache = function(){
        for (var n in mem) {
            this.deleteCache(n);
        }
    };
    
    
    var _t = function(){
        return '?_t=' + new Date().getTime();
    };
    /**
     * 加载一个文件
     * @param {String} name
     * @param {String} path
     * @param {Function} callback
     */
    this.load = function(name, path, callback){
        if (mem[name]) {
            callback(mem[name], name);
        } else {
            $.get(path + _t(), function(text){
                mem[name] = text;
                callback(text, name);
                text = null;
                delete text;
            });
        }
    };
    /**
     * 加载一个HTML文件
     * @param {String} name
     * @param {String} path
     * @param {Function} callback
     */
    this.loadHtml = function(name, path, callback){
        if (!mem[name]) {
            $.get(path + _t(), function(text, b){
                mem[name] = text;
                callback(mem[name], name);
                text = null;
                delete text;
            });
        } else {
            callback(mem[name], name);
        }
    };
    /**
     * 加载一个JS文件（script标签的方式）
     * @param {String} name
     * @param {String} path
     * @param {Function} callback
     */
    this.loadJs = function(name, path, callback){
        if (!mem[name]) {
            var _ready = false;
            var _script = document.createElement('script');
            _script.onload = _script.onreadystatechange = function(){
                if (!_ready &&
                (!this.readyState ||
                this.readyState == 'loaded' ||
                this.readyState == 'complete')) {
                    _ready = true;
                    mem[name] = _script;
                    callback(mem[name], name);
                };
                            };
            _script.id = name;
            _script.type = 'text/javascript';
            _script.src = path;
            document.getElementsByTagName('head')[0].appendChild(_script);
        } else {
            callback(mem[name], name);
        }
    };
    /**
     * 加载一个CSS文件（link标签的方式）
     * @param {String} name
     * @param {String} path
     * @param {Function} callback
     */
    this.loadCss = function(name, path, callback){
        if (!mem[name]) {
            var _style = document.createElement('link');
            _style.id = name;
            _style.type = 'text/css';
            _style.rel = 'stylesheet';
            _style.href = path + _t();
            document.getElementsByTagName('head')[0].appendChild(_style);
            mem[name] = _style;
        };
        callback(mem[name], name);
    };
};
$.fm = FileManager;

/*
 * 事件委托和监听的一个工具类
 */
var EventManager = new function(){
    var Event = function(name, handler){
        this._name = name;
        this._handler = handler ||
        function(){
        };
        this._delegate = [];
    };
    $.extend(Event.prototype, new function(){
        this.add = function(delegate){
            this._delegate.push(delegate);
        };
        this.handler = function(){
            return this._handler.apply(window, arguments);
        };
        this.trigger = function(){
            var args = arguments;
            for (var i = 0; i < this._delegate.length; i++) {
                var d = this._delegate[i];
                try {
                    d.apply(window, args);
                } catch (e) {
                }
            }
        };
    });
    
    var mem = {};
    /**
     * 定义一个以name命名的事件，opt对象需要提供event方法(声明事件触发的实际)和handler方法（可选，对事件响应进行全局处理）
     * @param {String} name
     * @param {Object} opt
     */
    this.bind = function(name, opt){
        var _this = this;
        mem[name] = new Event(name, opt.handler);
        opt.event &&
        opt.event(name, function(){
            var args = $.makeArray(arguments);
            _this.trigger(name, null, args);
        });
    };
    /**
     * 监听以name命名的一个事件，当改事件响应时会触发定义的delegate
     * @param {Object} name
     * @param {Object} delegate
     */
    this.delegate = function(name, delegate){
        var ev = mem[name];
        if (!ev) {
            ev = new Event(name);
            mem[name] = ev;
        }
        ev.add(delegate);
    };
    /**
     * 显式触发一个以name命名的事件，如果delegate为空，则将响应所有监听改事件的函数，如果delegate不为空，则只触发该函数，args为传入响应函数里的参数列表
     * @param {String} name
     * @param {Function} delegate
     * @param {Array} args
     */
    this.trigger = function(name, delegate, args){
        var ev = mem[name];
        if (!ev) {
            ev = new Event(name);
            mem[name] = ev;
        };
        args = args || [];
        ev.handler.apply(ev, args);
        if (delegate) {
            delegate.apply(window, args);
        } else {
            ev.trigger.apply(ev, args);
        }
    };
};
$.em = EventManager;

/*
 * 管理项目中应用的工具类
 */
var AppManager = new function(){
    /**
     * 创建一个APP
     * @param {String} name
     * @param {String} uid
     * @param {jQeury Object} wrapperEl
     * @param {jQeury Object} floatWrapperEl
     * @param {jQeury Object} containerEl
     * @param {jQeury Object} statusEl
     */
    var App = function(name, uid, wrapperEl, floatWrapperEl, containerEl, statusEl){
        this._mem = $.extend({
            html: {},
            css: {},
            js: {}
        });
        this._name = name;
        this._uid = uid;
        this._wrapperEl = wrapperEl;
        this._floatWrapperEl = floatWrapperEl;
        this._containerEl = containerEl;
        this._statusEl = statusEl;
        this._path = $.am.getAppPath() + name + '/';
        this._is_install = false;
        this._is_load = false;
        this._is_current = false;
        this._is_floating = false;
        this._is_error = false;
        this._is_history = true;
    };
    $.extend(App.prototype, new function(){
        var _addHtml = function(name, htmlPath, callback){
            name = name + '-html';
            $.fm.loadHtml(name, htmlPath, callback);
        };
        
        var _removeHtml = function(name){
            name = name + '-html';
            $.fm.deleteCache(name);
        };
        
        var _addCss = function(name, cssPath, callback){
            name = name + '-css';
            $.fm.loadCss(name, cssPath, callback);
        };
        
        var _removeCss = function(name){
            name = name + '-css';
            $.fm.deleteCache(name);
        };
        
        var _addJs = function(name, jsPath, callback){
            name = name + '-js';
            $.fm.loadJs(name, jsPath, callback);
        };
        
        var _removeJs = function(name){
            name = name + '-js';
            $.fm.deleteCache(name);
        };
        
        var _setWrapperClass = function(el, name){
            el && el.attr('class', name);
        };
        
        var _addWrapperClass = function(el, name){
            el && el.addClass(name);
        };
        
        var _removeWrapperClass = function(el, name){
            el && el.removeClass(name);
        };
        /**
         * 设置APP为loading的状态
         */
        this.loading = function(){
            _addWrapperClass(this._wrapperEl, 'loading');
        };
        /**
         * 取消APP的loading状态
         */
        this.unloading = function(){
            _removeWrapperClass(this._wrapperEl, 'loading');
        };
        /**
         * 设置APP为出错状态
         */
        this.fatalerror = function(){
            _setWrapperClass(this._wrapperEl, 'fatalerror');
        };
        /**
         * 设置APP的状态栏中的HTML代码
         * @param {String} status
         */
        this.status = function(status){
            this._statusEl && this._statusEl.find('#' + this._name + '-status').html(status || '');
        };
        /**
         * 显示离线页面
         */
        this.offline = function(seletor){
            var url = 'apps/homepage/offline.html';
            $(seletor).attr('src', url);
        };
        /**
         * 设置或返回APP中各个属性布尔值
         * @param {Object} name
         * @param {Object} b
         */
        this.is = function(name, b){
            if (typeof b == 'undefined') {
                return this['_is_' + name];
            } else {
                this['_is_' + name] = b;
            }
        };
        /**
         * 装载一个APP，仅会执行一次，第二次调用install直接返回该APP的对象
         */
        this.install = function(){
            var _this = this;
            if (!this._is_install) {
                var name = this._name;
                var html = null;
                var css = null;
                var js = null;
                if (_this._containerEl) {
                    this.loadHtml('main', function(text){
                        if (text) {
                            if (_this._containerEl) {
                                var e = document.createElement('div');
                                e.id = _this._name + '-app';
                                e.className = 'perapp';
                                e.innerHTML = text;
                                _this._containerEl[0].appendChild(e);
                            }
                            
                            if (_this._statusEl) {
                                e = document.createElement('div');
                                e.id = _this._name + '-status';
                                e.className = 'perstatus';
                                _this._statusEl[0].appendChild(e);
                            }
                        };
                        html = true;
                    });
                } else {
                    html = true;
                }
                this.loadCss('main', function(text){
                    css = true;
                });
                this.loadJs('main', function(text){
                    js = true;
                });
                var _id = setInterval(function(){
                    if (!_id) 
                        return;
                    if (html && css && js) {
                        clearInterval(_id);
                        _id = null;
                        _this._is_install = true;
                    }
                }, 100);
            };
            return this;
        };
        /**
         * 卸载一个APP
         * @deprecated 暂时不要使用
         */
        this.uninstall = function(){
            if (this._is_install) {
                for (var name in this_mem.html) {
                    _removeHtml(this_mem.html[name]);
                };
                for (var name in this_mem.css) {
                    _removeCss(this_mem.css[name]);
                };
                for (var name in this_mem.js) {
                    _removeJs(this_mem.js[name]);
                };
                this._is_install = false;
            }
            return this;
        };
        /**
         * 延时执行一些方法，可以是执行install后，也可以是执行load后
         * @param {Function} func
         * @param {Boolean} is_install
         * @param {Boolean} is_load
         * @param {Array} args
         */
        this._lazy = function(func, is_install, is_load, args){
            var _this = this;
            if (this._is_install == is_install && this._is_load == is_load) {
                func.apply(this, args);
            } else {
                var _id = setInterval(function(){
                    if (!_id) 
                        return;
                    if (_this._is_install == is_install && _this._is_load == is_load) {
                        clearInterval(_id);
                        _id = null;
                        func.apply(_this, args);
                    }
                }, 100);
            }
        };
        /**
         * 执行APP的load方法（在执行install完之后才会运行），同样只会执行一次
         */
        this.load = function(){
            if (!this._is_load) {
                this._lazy(function(){
                    this._mem.load && this._mem.load.apply(this, arguments);
                    this._is_load = true;
                }, true, false, arguments);
            }
            return this;
        };
        /**
         * 重新执行APP的load方法
         */
        this.reload = function(){
            this._is_load = false;
            return this.load();
        };
        /**
         * 执行APP的unload方法
         */
        this.unload = function(){
            if (this._is_load) {
                this._mem.unload && this._mem.unload.apply(this, arguments);
                this._is_load = false;
            }
            return this;
        };
        /**
         * 设置APP为可见状态，并执行APP的show方法(与其它APP的可见状态互斥)
         */
        this.show = function(){
            $.am.setCurrentApp(this);
            this._lazy(function(){
                _setWrapperClass(this._wrapperEl, this._name);
                _setWrapperClass(this._floatWrapperEl, '');
                this._mem.show && this._mem.show.apply(this, arguments);
            }, true, true, arguments);
            return this;
        };
        /**
         * 设置APP为浮动状态，并执行APP的floating方法
         */
        this.floating = function(){
            $.am.setFloatApp(this);
            this._lazy(function(){
                _setWrapperClass(this._floatWrapperEl, this._name + ' float-app');
                this._is_floating = true;
                this._mem.floating && this._mem.floating.apply(this, arguments);
            }, true, true, arguments);
            return this;
        };
        /**
         * 取消APP的浮动状态，并执行APP的unfloating方法
         */
        this.unfloating = function(){
            if (this._is_floating) {
                _setWrapperClass(this._floatWrapperEl, '');
                this._is_floating = false;
                this._mem.unfloating && this._mem.unfloating.apply(this, arguments);
            }
            return this;
        };
        
        var _gen_path = function(_this, name, type){
            if (name.indexOf('http://') == 0) {
                var path = name;
                var name = encodeURIComponent(name);
                var id = _this._uid + '-' + name;
            } else {
                var path = _this._path + name + '.' + type;
                var id = _this._uid + '-' + name;
            }
            _this._mem[type][name] = id;
            return {
                name: name,
                path: path,
                id: id
            };
        };
        /**
         * 在当前APP的目录下加载HTML文件
         * @param {String} name
         * @param {Function} callback
         */
        this.loadHtml = function(name, callback){
            var p = _gen_path(this, name, 'html');
            
            var _this = this;
            _addHtml(p.id, p.path, function(){
                callback && callback.apply(_this, arguments);
            });
            return this;
        };
        /**
         * 在当前APP的目录下加载CSS文件
         * @param {String} name
         * @param {Function} callback
         */
        this.loadCss = function(name, callback){
            var p = _gen_path(this, name, 'css');
            
            var _this = this;
            _addCss(p.id, p.path, function(){
                callback && callback.apply(_this, arguments);
            });
            return this;
        };
        /**
         * 在当前APP的目录下加载JS文件
         * @param {String} name
         * @param {Function} callback
         */
        this.loadJs = function(name, callback){
            var p = _gen_path(this, name, 'js');
            
            var _this = this;
            _addJs(p.id, p.path, function(){
                callback && callback.apply(_this, arguments);
            });
            return this;
        };
    });
    
    // manager
    var uid_count = 0;
    var _this = {
        apps: {},
        mem: {},
        appPath: './apps/',
        c_app: null,
        l_app: null,
        f_app: null,
        c_uid: 0
    };
    /**
     * 设置一个缓存数据
     * @param {String} name
     * @param {Object} o
     */
    this.setMem = function(name, o){
        _this.mem[name] = o;
    };
    /**
     * 获取一个缓存数据
     * @param {String} name
     */
    this.getMem = function(name){
        return _this.mem[name];
    };
    /**
     * 设置各个应用所处的根目录
     * @param {Object} path
     */
    this.setAppPath = function(path){
        _this.appPath = path;
    };
    /**
     * 获取各个应用所处的根目录
     */
    this.getAppPath = function(){
        return _this.appPath;
    };
    /**
     * 判断传入的APP是否是当前设置成可见状态的APP
     * @param {App Object} app
     */
    this.isCurrentApp = function(app){
        if (typeof app == 'string') {
            return _this.apps[app] && _this.apps[app].is('current');
        } else if (typeof app == 'object') {
            return app && app.is('current');
        }
    };
    /**
     * 设置APP为当前可见状态的APP
     * @param {App Object} app
     */
    this.setCurrentApp = function(app){
        if (_this.c_app == null || app._name != _this.c_app._name) {
            if (_this.c_app && _this.c_app._is_history) {
                _this.l_app = _this.c_app;
                _this.l_app.is('current', false);
            };
            _this.c_app = app;
            _this.c_app.is('current', true);
        }
    };
    /**
     * 获取当前可见状态的APP
     */
    this.getCurrentApp = function(){
        return _this.c_app;
    };
    /**
     * 设置上一个可见状态的APP
     * @param {APP Object} app
     */
    this.setLastApp = function(app){
        _this.l_app = app;
    };
    /**
     * 获取上一个可见状态的APP
     */
    this.getLastApp = function(){
        return _this.l_app;
    };
    /**
     * 设置当前浮动状态的APP
     * @param {Object} app
     */
    this.setFloatApp = function(app){
        _this.f_app = app;
    };
    /**
     * 获得当前浮动状态的APP
     */
    this.getFloatApp = function(){
        return _this.f_app;
    };
    /**
     * 根据name获得一个APP
     * @param {String} name
     */
    this.getApp = function(name){
        return _this.apps[name];
    };
    /**
     * 装载一个APP的工具方法
     * @param {String} name
     * @param {Object} els
     */
    this.installApp = function(name, els){
        if (_this.apps[name]) {
            var app = _this.apps[name];
        } else {
            els = els || {};
            var uid = new String(new Date().getTime()).replace(/(\d{4})(\d{4})(\d{5})/, '$1-$2-$3') + '-' + (_this.c_uid++);
            var app = new App(name, uid, els.wrapperEl, els.floatWrapperEl, els.containerEl, els.statusEl);
            _this.apps[name] = app;
            app.install();
        };
        return app;
    };
    /**
     * 卸载一个APP的工具方法
     * @deprecated 内存回收有问题，禁用
     */
    this.uninstallApp = function(name){
        var app = _this.apps[name];
        if (app) {
            delete _this.apps[name];
            if (app) 
                app.uninstall();
            delete app;
        }
    };
    /**
     * 扩展一个APP的工具方法
     * @param {String} name
     * @param {Object} mem
     */
    this.extendApp = function(name, mem){
        var app = this.getApp(name);
        for (var n in mem) {
            app._mem[n] = mem[n];
            if (typeof mem[n] == 'function' && !app[n]) {
                app[n] = (function(n){
                    return function(){
                        return app._mem[n].apply(app, arguments);
                        //app._lazy(app._mem[n], true, true, arguments);
                    };
                })(n);
            } else if (typeof mem[n] != 'function') {
                app[n] = app._mem[n];
            }
        };
        return app;
    };
    /**
     * 重新加载一个APP
     * @param {String} name
     */
    this.reloadApp = function(name){
        if (name) {
            var app = _this.apps[name];
        } else {
            var app = _this.c_app;
        }
        if (app) 
            app.reload();
        return app;
    };
};
$.am = AppManager;

var RunManager = {};
RunManager.run = function(type, option){
    var args = arguments;
    var app_name = option.app_name;
    var app_id = '';
    if (option.app_id) {
        app_id = option.app_id;
    } else if (option.kkrs) {
        app_id = option.kkrs.substr(option.kkrs.indexOf('appid=') + 6, 36);
    }
    
    switch (type) {
        case 'kkrs':
            client_api.kkrs(option.kkrs, option.mid, option.sid);
            break;
        case 'recent':
            client_api.run_recent_app(option.kkrs, option.mid, option.sid);
            break;
        case 'flash':
            client_api.run_flash(app_id, option.run_flash_base64, option.name_base64, option.mid, option.sid);
            break;
        case 'download':
            window.open(option.download_url);
            break;
        case 'normal':
        case '':
        default:
            client_api.run(app_id, option.shortcut_target, app_name, option.mid, option.sid);
            break;
    }
};
RunManager.cmd = function(option){
    try {
        var cmd = '';
        var opt = {};
        
        var isFunction = option.isFunction;
        var app = option.app;
        var shortcut = option.shortcut;
        var mid = option.mid;
        var sid = option.sid;
        
        var app_id = app.app_id;
        
        var shortcut_name = app.shortcut_name;
        var app_name = app.app_name;
        var name = app.name;
        app_name = (shortcut_name || app_name || name || '') + '';
        app_name = app_name.replace(/[(（].*[）)]/, '').replace('.lnk', '');
        
        var category_second_id = parseInt(app.category_second_id);
        var package_type = app.package_type;
        
        if (category_second_id == 300) {
            //小游戏
            var name_base64 = app.name_base64;
            var run_flash_base64 = app.run_flash_base64;
            
            opt = {
                app_id: app_id,
                app_name: app_name,
                name_base64: name_base64,
                run_flash_base64: run_flash_base64,
                mid: mid,
                sid: sid
            };
            
            if (isFunction) {
                cmd = function(){
                    RunManager.run('flash', opt);
                };
            } else {
                strOpt = JSON.stringify(opt);
                strOpt = strOpt.replace(/\"/g, '\'');
                cmd = "RunManager.run('flash', " + strOpt + ")";
            }
        } else {
            //因为网游不再使用实体包，和单机一样使用虚拟包
            var shortcut_target = app.shortcut_target;
            shortcut_target = (shortcut_target || (shortcut && shortcut.shortcut_target)) || '';
            opt = {
                app_id: app_id,
                app_name: app_name,
                shortcut_target: shortcut_target,
                mid: mid,
                sid: sid
            };
            if (isFunction) {
                cmd = function(){
                    RunManager.run('normal', opt);
                };
            } else {
                strOpt = JSON.stringify(opt);
                strOpt = strOpt.replace(/\"/g, '\'');
                cmd = "RunManager.run('normal', " + strOpt + ")";
            }
        }
    } catch (e) {
        alert('error cmd: ' + e.message);
    }
    return cmd;
};

