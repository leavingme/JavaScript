/*
 * 模仿jquery的风格和API规范定义的一套兼容jquery部分API的工具类
 */
(function(jq, sz, undefined){
    if (!sz) {
        sz = function(selector){
            return [document.getElementById(selector.replace('#', ''))];
        };
    };
    if (!jq) {
        var _bindEvent = function(e, name, func, capture){
            if (!e) 
                return;
            if (e.addEventListener) {
                e.addEventListener(name, function(ev){
                    func.call(e, ev || window.event)
                }, capture);
            } else {
                e.attachEvent('on' + name, function(ev){
                    func.call(e, ev || window.event)
                });
            }
        };
        
        /**
         * $主函数，行为同jquery的$，下同
         */
        jq = (function(){
            var _LOADER = [];
            window.onload = function(){
                while (_LOADER.length > 0) {
                    var loader = _LOADER.pop();
                    setTimeout(loader, 1);
                }
            };
            
            return function(selector){
                if (selector == null || selector == window) 
                    selector = window;
                if (typeof selector == 'string') {
                    return jq.fn.$__wrapped(sz(selector));
                } else if (typeof selector == 'function') {
                    _LOADER.push(selector);
                } else if (selector instanceof Array) {
                    return jq.fn.$__wrapped(selector);
                } else if (typeof selector == 'object') {
                    return jq.fn.$__wrapped([selector]);
                }
            };
        })();
        
        
        /**
         * 去掉字符串左右的空白
         * @param {String} str
         */
        jq.trim = function(str){
            return str.replace(/^\s+/, '').replace(/\s+$/, '');
        };
        
        
        /**
         * 用对象t来扩展对象r
         * @param {Object} r
         * @param {Object} t
         */
        jq.extend = function(r, t){
            for (var k in t) {
                if (typeof t[k] != 'undefined') {
                    r[k] = t[k];
                }
            };
            return r;
        };
        
        /**
         * 把一个类数组（拥有length属性，可以进行索引遍历）的对象转换成数组
         * @param {Object} a
         */
        jq.makeArray = function(a){
            if (typeof a.length != 'undefined') {
                var aa = [];
                for (var i = 0; i < a.length; i++) {
                    aa.push(a[i]);
                }
                return aa;
            }
        };
        
        /*
         * 扩展jquery的函数集
         */
        jq.fn = {
            /**
             * 通过delegate来遍历this对象
             * @param {Function} delegate
             */
            each: function(delegate){
                if (delegate && typeof delegate == 'function') {
                    for (var i = 0; i < this.length; i++) {
                        var e = this[i];
                        var b = delegate.call(e, i);
                        if (b == false) 
                            break;
                    }
                }
                return this;
            },
            /**
             * 给this对象绑定DOM事件
             * @param {String} name
             * @param {Function} func
             */
            bind: function(name, func){
                this.each(function(i){
                    _bindEvent(this, name, func, true);
                });
                return this;
            },
            /**
             * 获得this对象的夫结点
             */
            parent: function(){
                if (this[0]) 
                    return $(this[0].parentElement || this[0].parentNode);
                else 
                    return undefined;
            },
            /**
             * 从DOM树中移除this对象
             */
            remove: function(){
                this.each(function(i){
                    var p = $(this).parent()[0];
                    if (p) {
                        p.removeChild(this);
                    } else {
                        document.body.removeChild(this);
                    }
                });
                return this;
            },
            /**
             * 借由选择器在this对象的子结点中寻找结点
             * @param {String} selector
             */
            find: function(selector){
                var r = [];
                this.each(function(i){
                    var we = sz(selector, this);
                    r = r.concat(we);
                });
                return this.$__wrapped(r);
            },
            /**
             * 给this对象添加类名
             * @param {String} c
             */
            addClass: function(c){
                this.each(function(i){
                    var className = this.className;
                    if (className.indexOf(c) < 0) {
                        this.className = jq.trim((className + ' ' + c).replace(/\s+/, ' '));
                    }
                });
                return this;
            },
            /**
             * 移除this对象上的某个类名
             * @param {String} c
             */
            removeClass: function(c){
                this.each(function(i){
                    var className = this.className;
                    if (className.indexOf(c) > -1) {
                        this.className = jq.trim((className.replace(c, '')).replace(/\s+/, ' '));
                    }
                });
                return this;
            },
            /**
             * 判断this对象上是否存在某个类名
             * @param {String} c
             */
            hasClass: function(c){
                var b = false;
                this.each(function(i){
                    var className = this.className;
                    b = (className.indexOf(c) > -1);
                    if (b) {
                        return false;
                    }
                });
                return b;
            },
            /**
             * 切换this对象上的某个类名
             * @param {String} c
             */
            toggleClass: function(c){
                this.each(function(i){
                    var className = this.className;
                    if (className.indexOf(c) > -1) {
                        this.className = jq.trim((className.replace(c, '')).replace(/\s+/, ' '));
                    } else {
                        this.className = jq.trim((className + ' ' + c).replace(/\s+/, ' '));
                    }
                });
                return this;
            },
            /**
             * 设置或返回this对象上的属性值
             * @param {String} attrName
             * @param {String} attrValue
             */
            attr: function(attrName, attrValue){
                if (attrValue != null) {
                    this.each(function(i){
                        if (attrName == 'class') {
                            this.className = attrValue;
                        } else {
                            this.setAttribute(attrName, attrValue);
                        }
                    });
                } else {
                    if (this.length > 0) {
                        if (attrName == 'class') {
                            return this[0].className;
                        } else {
                            return this[0].getAttribute(attrName);
                        }
                    } else {
                        return;
                    }
                };
                return this;
            },
            /**
             * 设置或返回this对象上的样式值
             * @param {String} attrName
             * @param {String} attrValue
             */
            css: function(cssName, cssValue){
                if (cssValue) {
                    this.each(function(i){
                        this.style[cssName] = cssValue;
                    });
                } else {
                    if (typeof cssName == 'string') {
                        if (this.length > 0) {
                            return this[0].style[cssName];
                        } else {
                            return;
                        }
                    } else if (typeof cssName == 'object') {
                        this.each(function(i){
                            jq.extend(this.style, cssName);
                        });
                    }
                }
                return this;
            },
            /**
             * 设置或返回this对象中的HTML代码
             * @param {String} h
             */
            html: function(h){
                if (h == null) {
                    if (this.length > 0) {
                        return this[0].innerHTML;
                    } else {
                        return;
                    }
                } else {
                    this.each(function(i){
                        this.innerHTML = h;
                    });
                }
                return this;
            },
            /**
             * 设置或返回this对象中的纯文本代码
             * @param {String} h
             */
            text: function(h){
                if (h == null) {
                    if (this.length > 0) {
                        return this[0].innerText;
                    } else {
                        return;
                    }
                } else {
                    this.each(function(i){
                        this.innerText = h;
                    });
                }
                return this;
            },
            /**
             * 设置或返回this对象value属性的值
             * @param {String} h
             */
            val: function(v){
                if (v == null) {
                    if (this.length > 0) {
                        return this[0].value;
                    } else {
                        return;
                    }
                } else {
                    this.each(function(i){
                        this.value = v;
                    });
                }
                return this;
            },
            /**
             * 为this对象绑定mouseover和mouseout事件
             * @param {Function} over_func
             * @param {Function} out_func
             */
            hover: function(over_func, out_func){
                this.bind('mouseover', over_func);
                this.bind('mouseout', out_func);
                return this;
            },
            /**
             * 显示this对象
             */
            show: function(){
                this.each(function(i){
                    this.style.display = 'block';
                });
                return this;
            },
            /**
             * 隐藏this对象
             */
            hide: function(){
                this.each(function(i){
                    this.style.display = 'none';
                });
                return this;
            },
            
            /**
             * 包装this对象，为this对象添加扩展函数
             * @param {Object} e
             */
            $__wrapped: function(e){
                e = e || [];
                if (e['$__wrapped']) {
                    return e;
                } else {
                    jq.extend(e, jq.fn);
                    return e;
                }
            }
        };
        
        /*
         * Ajax相关的API，行为同jquery，下同
         */
        (function(){
            var OPTIONS = {
                timeout: 20 * 1000
            };
            var XHR = function(){
                try {
                    this._xmlhttp = new ActiveXObject('Msxml2.XMLHTTP');
                } catch (e) {
                    try {
                        this._xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
                    } catch (e) {
                        try {
                            this._xmlhttp = new XMLHttpRequest();
                        } catch (e) {
                            this._xmlhttp = null;
                        }
                    }
                }
                var self = this;
                this._xmlhttp.onreadystatechange = function(){
                    self._on_ready_state_change.apply(self);
                };
            };
            jq.extend(XHR.prototype, {
                init: function(){
                    this._is_timeout = false;
                    this._is_complete = false;
                    this._timeout_id = null;
                },
                
                _on_ready_state_change: function(){
                    if (this._xmlhttp) {
                        switch (this._xmlhttp.readyState) {
                            case 1:
                                break;
                            case 2:
                                break;
                            case 3:
                                break;
                            case 4:
                                this._load_complete();
                                break;
                            default:
                                break;
                        }
                    } else {
                        return;
                    }
                },
                
                _callback: function(resq, is_success){
                    this._complete && this._complete(resq, is_success);
                    if (is_success) {
                        OPTIONS.success && OPTIONS.success(resq, is_success);
                    } else {
                        OPTIONS.error && OPTIONS.error(resq, is_success);
                    }
                },
                
                _load_complete: function(){
                    if (!this._is_complete && typeof this._complete == 'function') {
                        this._is_complete = true;
                        var is_success = false;
                        if (this._xmlhttp.status == 0 || (this._xmlhttp.status >= 200 && this._xmlhttp.status < 300)) {
                            is_success = true;
                        };
                        var text = this._xmlhttp.responseText;
                        if (this._resq_type == 'json') {
                            try {
                                var resq = eval('(' + text + ')');
                            } catch (e) {
                                var resq = null;
                                is_success = false;
                            }
                        } else {
                            var resq = text;
                        }
                        if (!this._is_timeout) {
                            this._callback(resq, is_success);
                        }
                        text = null;
                        resq = null;
                        delete text;
                        delete resq;
                    }
                },
                
                _timeout: function(){
                    this._is_timeout = true;
                    if (this._timeout_id) {
                        clearTimeout(this._timeout_id);
                    }
                    if (!this._is_complete) {
                        this._callback(null, false);
                    }
                },
                
                open: function(method, url){
                    var self = this;
                    this._xmlhttp.open(method, url, true);
                    this._timeout_id = setTimeout(function(){
                        self._timeout();
                    }, OPTIONS.timeout);
                },
                
                setRequestHeader: function(header){
                    for (var key in header) {
                        this._xmlhttp.setRequestHeader(key, header[key]);
                    }
                },
                
                on_complete: function(fn, response_type){
                    this._complete = fn;
                    this._resq_type = response_type;
                },
                
                send: function(data){
                    this._xmlhttp.send();
                }
            });
            
            var _get_xhr = function(){
                xhr = new XHR();
                xhr.init();
                return xhr;
            };
            
            var _bind_params = function(params){
                var p = [];
                params = params || {};
                for (var key in params) {
                    p.push([key, encodeURIComponent(params[key])].join('='));
                }
                p.push(['_t', new Date().getTime()].join('='));
                return p.join('&');
            };
            
            var _load = function(method, url, data, callback, response_type, header){
                var xhr = _get_xhr();
                xhr.open(method, url);
                if (header) {
                    xhr.setRequestHeader(header);
                }
                xhr.on_complete(callback, response_type);
                xhr.send(data);
            };
            /**
             * 设置Ajax全局参数
             * @param {Object} options
             */
            jq.ajaxSetup = function(options){
                $.extend(OPTIONS, options);
            };
            /**
             * get方式的ajax请求，回调函数将返回ajax响应数据以及ajax请求成功与否的布尔值
             * @param {String} url
             * @param {Object} params
             * @param {Function} callback
             * @param {String} response_type
             * @param {Object} header
             */
            jq.get = function(url, params, callback, response_type, header){
                if (params != null && typeof params == 'function') {
                    header = response_type;
                    response_type = callback;
                    callback = params;
                    params = {};
                }
                var p = _bind_params(params);
                if (url.indexOf('?') > -1) {
                    url += '&' + p;
                } else {
                    url += '?' + p;
                }
                _load('get', url, null, callback, response_type, header);
            };
            /**
             * post方式的ajax请求，回调函数将返回ajax响应数据以及ajax请求成功与否的布尔值
             * @param {String} url
             * @param {Object} params
             * @param {Function} callback
             * @param {String} response_type
             * @param {Object} header
             */
            jq.post = function(url, params, callback, response_type, header){
                if (params != null && typeof params == 'function') {
                    header = response_type;
                    response_type = callback;
                    callback = params;
                    params = {};
                }
                var p = _bind_params(params);
                _load('post', url, p, callback, response_type, header);
            };
            /**
             * get方式的ajax请求，回调函数将返回执行过后的json代码以及ajax请求成功与否的布尔值
             * @param {String} url
             * @param {Object} params
             * @param {Function} callback
             * @param {Object} header
             */
            jq.getJSON = function(url, params, callback, header){
                if (params != null && typeof params == 'function') {
                    header = callback;
                    callback = params;
                    params = {};
                }
                var p = _bind_params(params);
                if (url.indexOf('?') > -1) {
                    url += '&' + p;
                } else {
                    url += '?' + p;
                }
                _load('get', url, null, callback, 'json', header);
            };
        })();
        window['$'] = jq;
        window['jQuery'] = jq;
    };
})(window['jQuery'], window['Sizzle']);
