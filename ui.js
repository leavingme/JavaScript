var Widget = {};

/*
 * 在某div中显示loading
 */
(function(){
    var TEMPLATE = '<div class="loading" style="width:48px;height:48px;position:relative;margin:auto;top:0px;"><img src="' + $var.css_path + 'images/loading.gif" width="48" height="48" /></div>';
    /**
     * 显示loading图
     * @param {Object} t
     * @param {Object} options
     */
    $.fn.loading = function(t, options){
        this.each(function(i){
            var e = $(this);
            var opt = {};
            var height = parseInt(e.offsetHeight || e.css('height'));
            opt = $.extend({
                top: height ? (height / 2 - 24) : 30
            }, options);
            if (typeof t == 'undefined') {
                var html = TEMPLATE;
            } else {
                var html = TEMPLATE.replace('loading.gif', 'loading_' + t + '.gif');
            }
            e.html(html);
            if (opt.top != null) {
                e.find('.loading').css('top', opt.top + 'px');
            }
            if (opt.left != null) {
                e.find('.loading').css('left', opt.left + 'px');
            }
        });
        return this;
    };
    /**
     * 取消显示loading图
     */
    $.fn.unloading = function(){
        this.each(function(i){
            $(this).find('.loading').remove();
        });
        return this;
    };
})();
/*
 * 游戏大厅树的展现和操作
 */
(function(){
    $.tree = {
        on_change: function(index, path){
        },
        on_slide: function(index, path){
        },
        slide: function(index, path){
            var el = $('#tree-' + index);
            var id = '#node-' + path;
            var e = el.find(id);
            var act_class = e.attr('act_class');
            el.find('.' + act_class).removeClass(act_class);
            e.attr('slide', 'true').addClass(act_class);
            this.on_slide(index, path);
            this.on_change(index, path);
        },
        on_toggle: function(index, path){
        },
        toggle: function(index, path){
            var el = $('#tree-' + index);
            var id = '#node-' + path;
            var e = el.find(id);
            var act_class = e.attr('act_class');
            e.toggleClass(act_class);
            this.on_toggle(index, path);
            this.on_change(index, path);
        },
        on_action: function(index, path){
        },
        action: function(index, path){
            var el = $('#tree-' + index);
            var id = '#node-' + path;
            var e = el.find(id);
            var act_class = e.attr('act_class');
            el.find('.' + act_class).removeClass(act_class);
            e.attr('action', 'true').addClass(act_class);
            this.on_action(index, path);
            this.on_change(index, path);
        }
    };
    $.fn.tree = function(arg1, arg2){
        if (arguments.length == 0) {
            return this.html();
        } else if (arguments.length == 1) {
            if (typeof arg1 == 'string') {
                var html = arg1;
                var options = null;
            } else if (typeof arg1 == 'object') {
                var html = null;
                var options = arg1;
            }
        } else if (arguments.length == 2) {
            var html = arg1;
            var options = arg2;
        } else {
            var html = null;
            var options = null;
        }
        var opt = $.extend({}, options || {});
        if (opt.on_toggle) {
            $.tree.on_toggle = opt.on_toggle;
        }
        if (opt.on_slide) {
            $.tree.on_slide = opt.on_slide;
        }
        if (opt.on_action) {
            $.tree.on_action = opt.on_action;
        }
        if (opt.on_change) {
            $.tree.on_action = opt.on_change;
        }
        $.tree.el = this;
        if (html != null) {
            this.html(html);
        }
        return this;
    }
})();
/*
 * 右键上下文菜单
 */
(function($){
    document.oncontextmenu = function(){
        return false;
    };
    
    var menu = {};
    var c_menu = null;
    var c_context = null;
    $.contextmenu = {
        is_open: false,
        is_hold: false,
        lazy_id: null,
        lazy_timeout: 1000 * 1.5,
        open: function(ev){
            var c_menu_width = 82;
            var c_menu_height = 98;
            var size = ui_api.get_window_size();
            var top = ev.pageY;
            var left = ev.pageX;
            if (top + c_menu_height > size.height) {
                top = top - c_menu_height;
            }
            
            if (left + c_menu_width > size.width) {
                left = size.width - c_menu_width - 2;
            }
            
            if (c_menu) {
                this.is_open = true;
                c_menu.css({
                    'top': top,
                    'left': left
                });
                c_menu.fadeIn('fast');
            }
        },
        close: function(){
            if (this.lazy_id) {
                clearTimeout(this.lazy_id);
                this.lazy_id = null;
            }
            if (c_menu) {
                this.is_open = false;
                c_menu.fadeOut('fast');
            }
        },
        hold: function(){
            this.is_hold = true;
        },
        unhold: function(){
            this.is_hold = false;
        },
        _lazyClose: function(){
            var _this = this;
            if (!this.is_hold) {
                $('#localgame .my-games-icon .game-item').attr('class', 'game-item');
                this.close();
            } else {
                this.lazy_id = setTimeout(function(){
                    _this._lazyClose();
                }, this.lazy_timeout);
            }
        },
        lazyClose: function(){
            var _this = this;
            this.lazy_id = setTimeout(function(){
                _this._lazyClose();
            }, this.lazy_timeout);
        }
    };
    $.fn.contextmenu = function(options){
        var opt = $.extend({
            el: null,
            callback: {}
        }, options || {});
        var el = opt.el;
        var init = function(sender){
            var $self = $(sender);
            var app_id = $self.attr('app_id');
            $('#localgame .my-games-icon .game-item[app_id!="' + app_id + '"]').attr('class', 'game-item');
        };
        if (el) {
            if (!menu[el]) {
                var m = $(el);
                m.hover(function(){
                    $.contextmenu.hold();
                }, function(){
                    $.contextmenu.unhold();
                }).find('.contextmenu-item').bind('click', function(ev){
                    var e = $(this);
                    var callback = e.attr('callback');
                    callback && opt.callback[callback] &&
                    opt.callback[callback].call(c_context, ev);
                    $.contextmenu.close();
                });
                menu[el] = m;
            }
            this.bind('contextmenu', function(ev){
                c_menu = menu[el];
                c_context = this;
                $.contextmenu.open(ev);
                $.contextmenu.lazyClose();
            });
            this.mousedown(function(){
                init(this);
            });
            this.mouseenter(function(){
                $(this).addClass('game-item-hover');
                init(this);
                c_menu = menu[el];
                if (c_context === this) {
                    $.contextmenu.hold();
                } else {
                    $.contextmenu.close();
                }
            });
            this.mouseleave(function(){
                if (!$.contextmenu.is_open) {
                    $(this).removeClass('game-item-hover');
                }
                c_menu = menu[el];
                if (c_context === this) {
                    $.contextmenu.unhold();
                } else {
                    $.contextmenu.close();
                }
            });
        };
        return this;
    };
})($jQuery);
/*
 * 对话框
 */
(function(){
    $.dialog = {
        CONFIRM_BTN: 0x1,
        CANCEL_BTN: 0x2,
        LOGIN_BTN: 0x4,
        _is_open: false,
        _opt: {},
        title: function(str){
            $('#dialog .title span').html(str);
        },
        content: function(h){
            $('#dialog .content').html(h);
        },
        open: function(options){
            if (!this._is_open) {
                this._opt = $.extend({
                    el: '',
                    width: 0,
                    height: 0,
                    btn: this.CONFIRM_BTN | this.CANCEL_BTN,
                    text_confirm: '',
                    text_cancel: '',
                    long_confirm: false,
                    long_cancel: false,
                    show_content: true,
                    on_open: function(d){
                    },
                    on_close: function(s, d){
                    }
                }, options || {});
                
                $('#dialog-overlay').show();
                
                var d = $('#dialog');
                d.css({
                    'width': (this._opt.width + 32) + 'px',
                    'height': (this._opt.height + 106) + 'px'
                }).show().find('.content').html(this._opt.el);
                
                if (this._opt.btn == 0) {
                    d.find('.action').hide();
                    d.css({
                        'height': (this._opt.height + 51) + 'px'
                    });
                } else {
                    d.find('.action').show();
                    
                    d.find('#dialog_btn_login').show();
                    d.find('#dialog_btn_confirm').show();
                    d.find('#dialog_btn_cancel').show();
                    if ((this._opt.btn & this.LOGIN_BTN) == 0) {
                        d.find('#dialog_btn_login').hide();
                    }
                    if ((this._opt.btn & this.CONFIRM_BTN) == 0) {
                        d.find('#dialog_btn_confirm').hide();
                    }
                    if ((this._opt.btn & this.CANCEL_BTN) == 0) {
                        d.find('#dialog_btn_cancel').hide();
                    }
                    
                    d.find('#dialog_btn_confirm').html(this._opt.text_confirm || '确定').removeClass('yes_btn_long').removeClass('yes_btn').addClass(this._opt.long_confirm ? 'yes_btn_long' : 'yes_btn');
                    d.find('#dialog_btn_cancel').html(this._opt.text_cancel || '取消').removeClass('no_btn_long').removeClass('no_btn').addClass(this._opt.long_cancel ? 'no_btn_long' : 'no_btn');
                    
                    if (!this._opt.show_content) {
                        d.css({
                            'height': (this._opt.height + 45) + 'px'
                        }).find('.content').hide();
                    } else {
                        d.css({
                            'height': (this._opt.height + 106) + 'px'
                        }).find('.content').show();
                    }
                }
                this._is_open = true;
                this._opt.on_open.call(this, d);
            }
        },
        center: function(offset_x, offset_y){
            if (this._is_open) {
                var d = $('#dialog');
                var width = parseInt(d.css('width'));
                var height = parseInt(d.css('height'));
                var size = ui_api.get_window_size();
                d.css('left', ((size.width - width) / 2 + (offset_x || 0)) + 'px');
                d.css('top', ((size.height - height) / 2 + (offset_y || 0)) + 'px');
            }
        },
        close: function(s){
            if (this._is_open) {
                $('#dialog-overlay').hide();
                var d = $('#dialog').hide();
                this._is_open = false;
                this._opt.on_close.call(this, s, d);
            }
        }
    };
    
    $.alert = new function(){
        var TEMPLATE = '<div class="alert"><div class="alert_text ${ICON}">${TEXT}</div></div>';
        
        this.title = function(str){
            $.dialog.title(str);
        };
        
        this.content = function(h){
            $('#dialog .content .alert').html(h);
        };
        
        this.open = function(options){
            options = $.extend({
                width: 300,
                height: 50,
                title: '提示'
            }, options || {});
            
            options.el = TEMPLATE.replace('${TEXT}', options.text || options.el || '').replace('${ICON}', options.icon || '');
            
            var on_close = options.on_close;
            options.on_close = function(s){
                if (s == 'login') {
                    client_api.login();
                }
                on_close && on_close(s);
            };
            
            $.dialog.open(options);
            $.dialog.title(options.title);
            $.dialog.center();
        };
        
        this.center = function(offset_x, offset_y){
            $.dialog.center(offset_x, offset_y);
        };
        
        this.close = function(s){
            $.dialog.close(s);
        };
    };
})();
/*
 * 信息提示
 */
(function(){
    $.lightips = new function(){
        var is_show = false;
        var lazy_hide = 3 * 1000;
        var lazy_id = null;
        
        this.COLOR = {
            LIGHT_GREEN: '#94C01D',
            DEEP_YELLOW: '#F88C0C',
            WHITE: '#FFF'
        };
        
        this.show = function(h, options){
            is_show = true;
            
            options = options || {};
            var bColor = options.bColor || this.COLOR.LIGHT_GREEN;
            var fColor = options.fColor || this.COLOR.WHITE;
            $('#light-tips').css({
                'backgroundColor': bColor,
                'color': fColor
            }).html(h).show();
            this.center();
            
            if (lazy_id) 
                clearTimeout(lazy_id);
            if (options.lazy_hide) {
                var _this = this;
                lazy_id = setTimeout(function(){
                    _this.hide();
                }, typeof options.lazy_hide == 'number' ? options.lazy_hide : lazy_hide);
            }
        };
        
        this.hide = function(){
            $('#light-tips').hide();
            is_show = false;
        };
        
        this.center = function(offset_x){
            if (is_show) {
                var size = ui_api.get_window_size();
                $('#light-tips').css('left', ((size.width - 320) / 2 + (offset_x || 0)) + 'px');
            }
        };
    };
})();

Widget.Knowledge = {};
Widget.Knowledge.iKnow = function(knowledgePoint){
    Widget.Knowledge.setKnowledge(knowledgePoint);
}
Widget.Knowledge.getKnowledge = function(knowledgePoint){
    var result = false;
    var strKnowledge = client_api.read_file('knowledge');
    var knowledge = {};
    if (strKnowledge != '') {
        try {
            knowledge = eval('(' + strKnowledge + ')');
        } catch (e) {
        }
    }
    
    if (knowledge[knowledgePoint]) {
        result = true;
    }
    return result;
}
Widget.Knowledge.setKnowledge = function(knowledgePoint){
    var strKnowledge = client_api.read_file('knowledge');
    var knowledge = {};
    if (strKnowledge != '') {
        try {
            knowledge = eval('(' + strKnowledge + ')');
        } catch (e) {
        }
    }
    knowledge[knowledgePoint] = true;
    strKnowledge = JSON.stringify(knowledge);
    client_api.write_file('knowledge', strKnowledge);
}

Widget.GameSound = {};
Widget.GameSound.show = function(operateHtml){
    Widget.GameSound.move();
    var $gameSound = $jQuery('.game-sound');
    $gameSound.fadeIn("slow");
};
Widget.GameSound.hide = function(){
    var $gameSound = $jQuery('.game-sound');
    $gameSound.fadeOut("slow");
    Widget.GameSound.onHide();
};
Widget.GameSound.onHide = function(){
}
Widget.GameSound.move = function(){
    var size = ui_api.get_window_size();
    var top = 40;
    var left = size.width - 215;
    var $gameSound = $jQuery('.game-sound');
    $gameSound.css({
        top: top,
        left: left
    });
};

Widget.GameOperate = {};
Widget.GameOperate.show = function(operateHtml){
    Widget.GameOperate.move();
    var $gameOperate = $jQuery('.game-operate');
    if (operateHtml && operateHtml != '') {
        $gameOperate.find('.content').html(operateHtml);
    }
    $gameOperate.fadeIn("slow");
};
Widget.GameOperate.hide = function(){
    var $gameOperate = $jQuery('.game-operate');
    $gameOperate.fadeOut("slow");
};
Widget.GameOperate.move = function(){
    var size = ui_api.get_window_size();
    var top = 65;
    var left = size.width - 215;
    var $gameOperate = $jQuery('.game-operate');
    $gameOperate.css({
        top: top,
        left: left
    });
};

Widget.GameFeedback = {};
Widget.GameFeedback.show = function(operateHtml){
    Widget.GameFeedback.move();
    var $gameFeedback = $jQuery('.game-feedback');
    $gameFeedback.fadeIn("slow");
};
Widget.GameFeedback.hide = function(){
    var $gameFeedback = $jQuery('.game-feedback');
    $gameFeedback.fadeOut("slow");
};
Widget.GameFeedback.move = function(){
    var size = ui_api.get_window_size();
    var top = size.height - 140;
    var left = size.width - 215;
    var $gameFeedback = $jQuery('.game-feedback');
    $gameFeedback.css({
        top: top,
        left: left
    });
};

Widget.AppTip = {};
Widget.AppTip.show = function(event, sender){
    G_SHOW_TIPS = true;
    var $sender = $jQuery(sender);
    var $gamelist_item = $sender.parents('.gamelist_item');
    var width = $sender.width();
    var offset = $sender.offset();
    var top = offset.top - 95;
    var left = offset.left - (168 - width) / 2;
    
    if (top < 0) {
        return;
    }
    
    if (left < 0) {
        left = 5;
    }
    
    var name = $gamelist_item.find('.name').html();
    var cate = $sender.attr('category_name');
    var size = $sender.attr('size');
    var time = $sender.attr('time');
    
    $jQuery('.fapp-name').html(name);
    $jQuery('.fapp-cate').html('所属分类: &nbsp;' + cate);
    $jQuery('.fapp-size').html('游戏大小: &nbsp;' + size);
    $jQuery('.fapp-time').html('首次加载时间: &nbsp;' + time);
    $jQuery('.flow-tips').css({
        top: top,
        left: left
    }).show();
};
Widget.AppTip.hide = function(){
    G_SHOW_TIPS = false;
    setTimeout(function(){
        if (G_SHOW_TIPS) {
            return;
        }
        $jQuery('.fapp-name').html('');
        $jQuery('.fapp-cate').html('');
        $jQuery('.fapp-size').html('');
        $jQuery('.fapp-time').html('');
        $jQuery('.flow-tips').hide();
        G_SHOW_TIPS = false;
    }, 50);
};

Widget.GameList = {};
Widget.GameList.gamelist = function(datas, mid, sid, type){
    var cur_mid, cur_sid, cur_type;
    var _cal_size = function(s){
        s = s / 1024;
        var unit = ['K', 'M', 'G', 'T'];
        var i = 0;
        for (i = 0; s >= 1024 && i < 3; i++) {
            s = s / 1024;
        };
        if (s > 0) 
            s = s.toFixed(1);
        else 
            s = 0;
        return s == 0 ? '小于10K' : s + unit[i];
    };
    
    var _cal_time = function(s){
        var strTime = '';
        if (s < 60) {
            strTime = '1分钟内';
        } else if (s >= 60 && s < 3600) {
            strTime = parseInt(s / 60) + '分钟';
        } else if (s >= 3600 && s < 3600 * 4) {
            strTime = parseInt(s / 3600) + '小时';
        } else if (s >= 3600 * 4) {
            strTime = '大于4小时';
        }
        return strTime;
    };
    
    var TEMPLATE = {
        LIST: ['<div class="gamelist_wrapper">', '${GAMELIST_ITEMS}', '<div style="clear:both;"></div></div>'].join(''),
        ITEM: ['<div class="gamelist_item">', '<div class="inneritem">', '<div class="icon" onmouseenter="Widget.AppTip.show(event, this);" onmouseleave="Widget.AppTip.hide();" category_name="${CATEGORY_NAME}" size="${SIZE}" time="${TIME}">', '<a href="javascript:;" onclick="${RUN_LINK}" class="img-link" title="就玩它">', '<img src="${SRC}" />', '</a>', '<div class="name_wrap">', '<a href="javascript:void(0);" onclick="${DETAIL_LINK}" title="查看 ${APP_NAME} 详情">', '<div class="name word-ellipsis">${APP_NAME}</div>', '<div class="detail">查看详情</div>', '</a>', '</div>', '</div>', '<div class="info">', '<div class="app_name word-ellipsis">${APP_NAME}</div>', '<div class="rate score_${SCORE_LEVEL}">', '评分:', '</div>', '<div class="run_count word-ellipsis">', '人气:${RUN_COUNT}', '</div>', '<div class="update_time">', '日期:<span class="${DATE_STYLE}">${UPDATE_DATE}</span>', '</div>', '<div class="type_icons">${TYPE_ICONS}</div>', '</div>', '</div>', '</div>'].join(''),
        TOP_ITEM: ['<div class="gamelist_item">', '<div class="inneritem">', '<div class="icon" onmouseenter="Widget.AppTip.show(event, this);" onmouseleave="Widget.AppTip.hide();" category_name="${CATEGORY_NAME}" size="${SIZE}" time="${TIME}">', '<a href="javascript:void(0);" onclick="${DETAIL_LINK}" class="img-link" title="就玩它">', '<img src="${SRC}" />', '</a>', '<div class="name_wrap">', '<a href="javascript:void(0);" onclick="${DETAIL_LINK}" title="查看 ${APP_NAME} 详情">', '<div class="name word-ellipsis">${APP_NAME}</div>', '<div class="detail">查看详情</div>', '</a>', '</div>', '</div>', '<div class="info">', '<div class="col_name">', '<div class="app_name word-ellipsis"><a href="javascript:void(0);" onclick="${DETAIL_LINK}" style="color: #fff;">${APP_NAME}&nbsp;</a></div>', '<div class="type_icons">${TYPE_ICONS}</div>', '</div>', '<div class="rate score_${SCORE_LEVEL}">评分:&nbsp;</div>', '<div class="run_count word-ellipsis">${RUN_COUNT}</div>', '</div>', '</div>', '</div>'].join(''),
        ALBUM_ITEM: ['<div class="gamelist_item">', '<div class="inneritem">', '<div class="icon" onmouseenter="Widget.AppTip.show(event, this);" onmouseleave="Widget.AppTip.hide();" category_name="${CATEGORY_NAME}" size="${SIZE}" time="${TIME}">', '<a href="javascript:void(0);" onclick="${DETAIL_LINK}" class="img-link" title="就玩它">', '<img src="${SRC}" />', '</a>', '<div class="name_wrap">', '<a href="javascript:void(0);" onclick="${DETAIL_LINK}" title="查看 ${APP_NAME} 详情">', '<div class="name word-ellipsis">${APP_NAME}</div>', '<div class="detail">查看详情</div>', '</a>', '</div>', '</div>', '<div class="info">', '<div class="title">', '<div class="app_name"><a href="javascript:void(0);" onclick="${DETAIL_LINK}" style="color: #fff;">${APP_NAME}&nbsp;</a></div>', '<div class="type_icons">${TYPE_ICONS}</div>', '</div>', '<div class="evaluation">', '<div class="rate score_${SCORE_LEVEL}">评分:&nbsp;</div>', '<div class="run_count word-ellipsis">人气:&nbsp;${RUN_COUNT}</div>', '</div>', '<div class="update_time">', '日期:<span class="${DATE_STYLE}">${UPDATE_DATE}</span>', '</div>', '<div class="app_desc">${DESC}</div>', '</div>', '<div class="action">', '<a href="${RUN_LINK}" class="btn" onclick="this.blur();">运&nbsp;行</a>', '</div>', '</div>', '</div>'].join(''),
        CATEGORY_ITEM: ['<div class="gamelist_item">', '<div class="inneritem">', '<div class="icon" onmouseenter="Widget.AppTip.show(event, this);" onmouseleave="Widget.AppTip.hide();" category_name="${CATEGORY_NAME}" size="${SIZE}" time="${TIME}">', '<a href="javascript:void(0);" onclick="${DETAIL_LINK}" class="img-link" title="就玩它">', '<img src="${SRC}" />', '</a>', '<div class="name_wrap">', '<a href="javascript:void(0);" onclick="${DETAIL_LINK}" title="查看 ${APP_NAME} 详情">', '<div class="name word-ellipsis">${APP_NAME}</div>', '<div class="detail">查看详情</div>', '</a>', '</div>', '</div>', '<div class="info">', '<div class="app_name word-ellipsis"><a href="javascript:void(0);" onclick="${DETAIL_LINK}" style="color: #fff;">${APP_NAME}&nbsp;</a></div>', '<div class="rate score_${SCORE_LEVEL}">评分:&nbsp;</div>', '<div class="run_count word-ellipsis">人气:&nbsp;${RUN_COUNT}</div>', '<div class="update_time">', '日期:<span class="${DATE_STYLE}">${UPDATE_DATE}</span>', '</div>', '<div class="type_icons">${TYPE_ICONS}</div>', '</div>', '</div>', '</div>'].join('')
    };
    
    
    var render = function(app){
        var app_id = app.app_id;
        var app_name = app.app_name.replace(/[(（].*[）)]/, '');
        var url_name = app.url_name;
        var run_count = app.run_count ? app.run_count : 0;
        var score = app.score || app.rating_avg_score;
        var score_level = score ? Math.ceil(score / 2) : 0;
        var run_link = RunManager.cmd({
            app: app,
            mid: cur_mid,
            sid: cur_sid
        });
        var strURLParam = 'apps/detail/main.html?appid=' + app_id + '&appname=' + encodeURIComponent(app_name) + '&entrance=' + cur_sid;
        var strKey = app_id;
        var strDisplayName = app_name;
        var detail_link = 'client_api.navTabForLocalUrl(\'' + strURLParam + '\', \'' + strKey + '\', \'' + strDisplayName + '\');';
        var src = '';
        if (cur_type != '') {
            src = client_api.get_app_resource(app_id, 'logo.jpg');
        } else {
            src = client_api.get_app_resource(app_id, 'w_m_cover.jpg');
        }
        
        var update_time = '';
        if (app.publish_update_time) {
            update_time = app.publish_update_time.slice(5, 10);
        }
        var d = new Date();
        var today = d.getMonth() + '-' + d.getDate();
        var type_icons = [];
        if (app.speed_4m) {
            type_icons.push('<span class="spd_icon"></span>');
        }
        if (app.category_second_id == '300') {
            type_icons.push('<span class="fla_icon"></span>');
        }
        if (app.category_second_id == '40') {
            type_icons.push('<span class="pc_icon"></span>');
        }
        if (app.category_second_id == '41') {
            type_icons.push('<span class="og_icon"></span>');
        }
        if (app.category_second_id == '335') {
            type_icons.push('<span class="web_icon"></span>');
        }
        if (app.category_second_id == '321') {
            type_icons.push('<span class="emu_icon"></span>');
        }
        if (app.language == '简体中文') {
            type_icons.push('<span class="cn_icon"></span>');
        }
        
        var category_name = '';
        var category = app.category.replace(/\|/g, '').split(',');
        category_name = category[1];
        
        var size = parseInt(app.package_size || app.initial_size);
        var strSize = _cal_size(size);
        
        var initial_size = parseInt(app.initial_size);
        var time = parseInt(initial_size / (128 * 1024));
        var strTime = _cal_time(time);
        
        var strDesc = '';
        if (app.brief_description) {
            strDesc = app.brief_description;
        }
        
        return {
            app_id: app_id,
            url_name: url_name,
            app_name: app_name,
            category_name: category_name,
            run_link: run_link,
            detail_link: detail_link,
            run_count: run_count,
            score_level: score_level,
            src: src,
            size: strSize,
            time: strTime,
            desc: strDesc,
            type_icons: type_icons.join(''),
            date_style: update_time == today ? 'today' : '',
            update_date: update_time
        }
    };
    
    cur_mid = mid;
    cur_sid = sid;
    cur_type = '';
    var wrapper = '';
    if (type && type != '') {
        cur_type = type;
        var template = (type + '_ITEM').toUpperCase();
        var items = data_api.render(TEMPLATE[template], datas, render);
        wrapper = new Template(TEMPLATE.LIST).render_for_json({
            gamelist_items: items
        });
    } else {
        var items = data_api.render(TEMPLATE.ITEM, datas, render);
        wrapper = new Template(TEMPLATE.LIST).render_for_json({
            gamelist_items: items
        });
    }
    return wrapper;
};




