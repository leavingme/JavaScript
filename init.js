// 设置框架中定义各种应用入口代码的路径
$.am.setAppPath($var.app_path);
$(function(){
    var search = location.search;
    //search = 'app=manager&app_id=46FCAC58-D288-480D-B198-001DC5C3332C&app_name=' + encodeURIComponent('实况2010');	//调试用的代码
    var q = $var.from_query(search);
    var app_name = q.app || 'gamestore';
    
    var app = $.am.installApp(app_name, {
        wrapperEl: $('#wrapper'),
        containerEl: $('#apps'),
        statusEl: $('#status')
    });
    app.load().show();
    
    document.onkeydown = function(){
        var evt = window.event;
        if (evt.srcElement.tagName != 'INPUT' && evt.srcElement.tagName != 'TEXTAREA' && (evt.keyCode == 8 || evt.ctrlKey)) {
            evt.returnValue = false;
        }
    };
});
