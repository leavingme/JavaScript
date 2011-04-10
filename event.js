/*
 * ie.resize
 * 创建一个浏览器改变改变窗口大小的事件
 */
$.em.bind('ie.resize', new function(){
    var w = 0, h = 0, is_handle = false;
    
    this.event = function(name, trigger){
        $(window).bind('resize', trigger);
    };
    this.handler = function(){
        if (!is_handle) {
            is_handle = true;
            
            var size = ui_api.get_window_size();
            var full_w = size.width;
            var full_h = size.height;
            var content_w = full_w;
            var content_h = full_h - 46;
            if (w != full_w || h != full_h) {
                w = full_w;
                h = full_h;
                
                // dialog
                $('#dialog-overlay').css({
                    'width': full_w + 'px',
                    'height': full_h + 'px'
                });
                $.dialog.center();
                
                // loading and error
                $('#loading, #fatalerror').css({
                    'width': content_w + 'px',
                    'height': content_h + 'px'
                });
                
                // esc tip
                $('#esc-tip').hide();
                
                // light tips
                $.lightips.center();
                
                // trigger ie.resize.ok
                $.em.trigger('ie.resize.ok');
            };
            
            is_handle = false;
        }
    };
});

/*
 * net.status
 * 创建一个响应网络状态改变的事件
 */
$.em.bind('net.status', new function(){
    this.event = function(name, trigger){
        web_api.register_callback(web_api.callback_type.NET_STATUS, trigger);
    };
    
    this.handler = function(status){
        status = parseInt(status);
        if (status) {
            $.em.trigger('net.status.good');
        } else {
            $.em.trigger('net.status.bad');
        }
    };
});

/*
 * kgms.callback
 * 创建一个响应核心服务回调的事件
 */
$.em.bind('kgms.callback', new function(){
    this.event = function(name, trigger){
        web_api.register_callback(web_api.callback_type.KGMS_CORE, trigger);
    };
    
    this.handler = function(json_text){
        var json = eval('(' + json_text + ')');
        $.em.trigger('kgms.callback.' + json.type, null, [json]);
    };
});

/*
 * ajax global callback
 * 创建一个响应ajax全局回调的事件
 */
$.em.bind('ajax.callback', new function(){
    this.event = function(name, trigger){
        $.ajaxSetup({
            success: trigger,
            error: trigger
        });
    };
    
    this.handler = function(resq, is_success){
        if (is_success) {
            $.em.trigger('ajax.callback.success', null, [resq]);
        } else {
            $.em.trigger('ajax.callback.error', null, [resq]);
        }
    };
});

/*
 * recall.web
 * 创建一个接受在线页面经由客户端访问离线页面服务的事件
 */
$.em.bind('recall.web', new function(){
    this.event = function(name, trigger){
        web_api.register_callback(web_api.callback_type.RECALL_WEB, trigger);
    };
    
    this.handler = function(type, params){
        var params_obj = $var.from_query(params);
        $.em.trigger('recall.web.' + type, null, [params_obj]);
    };
});

/*
 * fullscreen
 * 创建一个响应全屏的事件
 */
$.em.bind('fullscreen', new function(){
    this.event = function(name, trigger){
        web_api.register_callback(web_api.callback_type.FULLSCREEN, trigger);
    };
    
    this.handler = function(){
        var size = ui_api.get_window_size();
        var full_w = size.width;
        var full_h = size.height;
        
        // esc tip
        var $esc = $('#esc-tip').removeClass('big');
        var esc_w = 0;
        var esc_h = 0;
		
        if (get_knowledge('fullscreen')) {
            esc_w = 236;
            esc_h = 65;
            $esc.html('');
            setTimeout(function(){
                $esc.hide();
            }, 2000);
        } else {
            esc_w = 236;
            esc_h = 95;
            $esc.addClass('big').html('<a href="javascript:void(0);" hidefocus="true" class="iknow" onclick="$.am.getApp(\'iknow\').iknow(\'fullscreen\'); $(\'#esc-tip\').hide();"></a>');
        }
        
        $esc.css({
            width: esc_w + 'px',
            height: esc_h + 'px',
            left: (full_w - esc_w) / 2,
            top: (full_h - esc_h) / 2
        });
        $esc.show();
    };
    
    var get_knowledge = function(knowledge_point){
        var result = false;
        var strKnowledge = client_api.read_file('knowledge');
        var knowledge = {};
        if (strKnowledge != '') {
            try {
                knowledge = eval('(' + strKnowledge + ')');
            } catch (e) {
            }
        }
        
        if (knowledge[knowledge_point]) {
            result = true;
        }
        return result;
    }
    
    var set_knowledge = function(knowledge_point){
        var strKnowledge = client_api.read_file('knowledge');
        var knowledge = {};
        if (strKnowledge != '') {
            try {
                knowledge = eval('(' + strKnowledge + ')');
            } catch (e) {
            }
        }
        knowledge[knowledge_point] = true;
        strKnowledge = JSON.stringify(knowledge);
        client_api.write_file('knowledge', strKnowledge);
    }
});

/*
 * user.login
 * 创建一个响应用户登录的事件
 */
$.em.bind('user.login', new function(){
    this.event = function(name, trigger){
        web_api.register_login_callback(trigger);
    };
});

/*
 * user.logout
 * 创建一个响应用户注销的事件
 */
$.em.bind('user.logout', new function(){
    this.event = function(name, trigger){
        web_api.register_logout_callback(trigger);
    };
});
