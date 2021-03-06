// ==UserScript==
// @name         discuss.com.hk快捷回复
// @namespace    jm
// @version      1.0
// @description  延迟快捷回复
// @author       tsingchan
// @match        https://*.discuss.com.hk/viewthread.php?*
// @grant       GM_xmlhttpRequest
// ==/UserScript==

var gApiHost = "http://localhost:8088/";
var gHost = 'https://'+window.location.host+'/';
if(window.location.host != 'www.discuss.com.hk'){
    window.location.href = window.location.href.replace(window.location.host,"www.discuss.com.hk");
}
var gUsername = '';

var jmtool = {


    getCurrentTimestamp:function(){
        return parseInt(new Date().getTime()/1000);
    },
    getCurrentDate:function(){
        return this.convertTimesatmpToDate(this.getCurrentTimestamp());
    },
    convertTimesatmpToDate:function(time){
        if(typeof(time)=="undefined"){
            return "";
        }
        time = time * 1000;
        var oDate = new Date(time),  
        oYear = oDate.getFullYear(),  
        oMonth = oDate.getMonth()+1,  
        oDay = oDate.getDate(),  
        oHour = oDate.getHours(),  
        oMin = oDate.getMinutes(),  
        oSen = oDate.getSeconds(), 

        //补0操作,当时间数据小于10的时候，给该数据前面加一个0  
            
        oTime = oYear +'-'+ this.getzf(oMonth) +'-'+ this.getzf(oDay) +' '+ this.getzf(oHour) +':'+ this.getzf(oMin) +':'+this.getzf(oSen);//最后拼接时间  
                
        return oTime;          
    },

    getzf:function(num){  
        if(parseInt(num) < 10){  
            num = '0'+num;  
        }  
        return num;  
    },     


    

    //生成从minNum到maxNum的随机数
    randomNum:function(minNum,maxNum){ 
        switch(arguments.length){ 
            case 1: 
                return parseInt(Math.random()*minNum+1,10); 
            break; 
            case 2: 
                return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10); 
            break; 
                default: 
                    return 0; 
                break; 
        } 
    },  

    /**
     * 指定区域复制
     * @param {*} _domId 
     */
    copyText:function(_domId){
        const range = document.createRange();
        range.selectNode(document.getElementById(_domId));//需要复制的内容的ID
        const selection = window.getSelection();
        if(selection.rangeCount > 0) selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('copy');
    },
    addZero:function (i) {
        return i < 10 ? "0" + i: i + "";
    },    
    countDown:function (lefttime,_jqObj) {
        // var nowtime = new Date();
        // var endtime = new Date("2019/03/16,17:57:00");
        // var lefttime = parseInt((endtime.getTime() - nowtime.getTime()) / 1000);
        var d = parseInt(lefttime / (24*60*60))
        var h = parseInt(lefttime / (60 * 60) % 24);
        var m = parseInt(lefttime / 60 % 60);
        var s = parseInt(lefttime % 60);
        d = this.addZero(d)
        h = this.addZero(h);
        m = this.addZero(m);
        s = this.addZero(s);

        _jqObj.text(`倒计时  ${d}天 ${h} 时 ${m} 分 ${s} 秒`);
        if (lefttime <= 0) {
            _jqObj.text("倒计时结束，准备回复...");
            return true;
        }

        setTimeout(function(){
            jmtool.countDown((lefttime-1),_jqObj);
        }, 1000);
    },    
    tip:function(message){
        $$("#tips_jm").text(message);
    }

};

(function() {
    'use strict';

    initPage();

    function initPage(){
        getUsername();
        addBtnsTr();                
        bindKeyCode();
    }
    function getUsername(){
        gUsername = $$(".username").children("a").text();
    }

    function bindKeyCode(){
        $$("body").bind("keydown",function(e){    
            e=window.event||e; 
               
             //禁止空格键翻页  
             if(event.keyCode==32){ 
              return false;  
             } 
               
             //屏蔽F5刷新键  
             if(event.keyCode==116){ 
            //   e.keyCode = 0; //IE下需要设置为keyCode为false  
              return false;  
             }  
              
             //屏蔽 Alt+ 方向键 ←  
             //屏蔽 Alt+ 方向键 → 
             if ((event.altKey)&&((event.keyCode==37)||(event.keyCode==39)))  
             {  
              event.returnValue=false;  
              return false; 
             } 
             
             //屏蔽退格删除键  
             if(event.keyCode==8){ 
              return false;  
             } 
             
            //屏蔽ctrl+R  
            if((event.ctrlKey) && (event.keyCode==82)){ 
              e.keyCode = 0;  
              return false;  
            } 
           });        
    }
    
    function addBtnsTr(){
        let newBtnsTr = '<p class="btns">\
        <span>延时（随机*秒）</span><input style="margin-right:30px;" type="text" name="timeout_jm" id="timeout_jm" value="60" />\
        <button type="button" name="replysubmit-jm" id="postsubmit-jm" value="replysubmit-jm" tabindex="3" >\
            延時回帖\
        </button>\
        </p><p>结果：<span id="tips_jm"></span></p>';
        let _postform = $$("div.postform");
        _postform.children("p.btns").hide();
        _postform.append(newBtnsTr);      
        
        $$("#postsubmit-jm").on("click",function(){
            console.log("点击延时回帖...");
            doSubmit();                        
        });         

        // let _timeout = jmtool.randomNum(60,18000);
        let _timeout = jmtool.randomNum(1,10);        
        $$("#timeout_jm").val(_timeout);        

    }
    
    function enableSubmit(_boolean){                
        $$("#postsubmit-jm").prop("disabled",!_boolean);
    }

    function doSubmit(){        
        console.log("run doSubmit");                
        enableSubmit(false);
        let theform = $("postform");
        // console.log(theform);    

        //todo check message
        if(validateOnly(theform)){

            let theFormData = getFormData(theform);
            console.log(theFormData,"theFormData");            
            
            theFormData.timeout = parseInt($$("#timeout_jm").val()||60);
            theFormData.postAction = $$("#postform").attr("action");
            theFormData.referer = window.location.href;            
            // theFormData.time = jmtool.getCurrentTimestamp();//submit time
            // theFormData.date = jmtool.convertTimesatmpToDate(theFormData.time);            
            // theFormData.publishTime = jmtool.getCurrentTimestamp() + parseInt(theFormData.timeout||60);//publish time
            // theFormData.publishDate = jmtool.convertTimesatmpToDate(theFormData.publishTime);            
            // theFormData.author = gUsername;
            // storage.addToStorage(theFormData.subject,theFormData);
            // reloadThreadsList();
            // return true;
            
            console.log("已进入延时发布队列，请保留当前页面");   
            jmtool.tip("已进入延时发布队列，请保留当前页面");   
            //倒计时
            jmtool.countDown(theFormData.timeout,$$("#tips_jm"));                    
            //settimeout do submit
            setTimeout(() => {
                console.log("run settimeout");                
                submitFormdata(theFormData);                
            }, theFormData.timeout*1000);  
            
        }
            
            
    }
        
    function getFormData(theform){
        
        let _subject = theform.subject.value || "";
        // let _message = theform.message.value || "";        
        let _message = $$.trim($$("#message + div.autosave").text());
        let _formhash = theform.formhash.value||"";//$$("#formhash").val() || "";


        let formData = {            
            formhash:_formhash,            
            subject:_subject,             
            message:_message,            
        };
        return formData;

    }    

    function submitFormdata(theFormData){
        let _formData = new FormData();
        let postFields = ["formhash","subject","message"];

        for(let _key in theFormData){
            if(postFields.indexOf(_key)!==-1){
                _formData.append(_key,theFormData[_key]);
            }            
        }           
        
        console.log(postFields,"postFields");
        
        // return true;

        
        $$.ajax({
            url: theFormData.postAction,
            type: 'POST',
            // dataType: 'json',
            data:_formData,
            timeout:10000,            
            processData: false,
            contentType: false,//"application/x-www-form-urlencoded", //false时默认为：multipart/form-data            
            beforeSend: function (XHR) {
                // XHR.setRequestHeader("referer", theFormData.referer);
                // XHR.setRequestHeader("origin", gHost);
                // XHR.setRequestHeader("Host", _this.config._wwwDomain);
                // XHR.setRequestHeader("X-Requested-With", "XMLHttpRequest");                
            },
            success: function (res) {                
                backupToServer(theFormData.message);
                console.log("延时回帖成功...");                                
                jmtool.tip("延时回帖成功");
                // window.location.reload();
            },        
            error:function(e){
                enableSubmit(true);                
                console.log(e);
                if(e.status == 200 && e.statusText=='parsererror'){
                    console.log("回帖成功，但解析返回数据失败");  
                    jmtool.tip("回帖成功，但解析返回数据失败");                                                                      
                }else{
                    console.log("回帖失败:"+e.statusText+"，可以再次点击回复按钮，尝试回复");                                
                }
            }
        });        
    }

    function backupToServer(_message){        
        var _title = $$.trim($$("div.thread-subject").text());
        var _threadUrl = window.location.href;
        var _username = gUsername;
                
        _message = _message || '';
        console.log(_title,_threadUrl,_username,message);

        let _data = {
            action:"reply",
            url:_threadUrl,        
            title:_title,
            username:_username,
            message:_message
        };
    
        let _dataString = '';
        for(let _key in _data){
            _dataString += _key+"=" + encodeURIComponent(_data[_key])+"&";
        }
        GM_xmlhttpRequest({
            method: "POST",
            url: gApiHost+"hkbbs.php",
            headers:{'Content-type':'application/x-www-form-urlencoded'},
            responseType:"json",
            data:_dataString,
            onload: function(response) {
                console.log('backup...');
                console.log(response);       
                if(response.response.code == 1){
                    jmtool.tip("保存日志到本地成功");                                        
                }else{
                    jmtool.tip("保存日志到本地失败，确认是否已经开启web服务："+gApiHost);                                        
                }
            },
            onerror:function(e){
                jmtool.tip("保存日志到本地失败，确认是否已经开启web服务："+gApiHost);                                                        
                console.log("bakcup onerror...");
                console.log(e);
            }
        });        

    }
    
    function validateOnly(theform) {
        if (seccodecheck && theform.seccodeverify.value.length != 4) {
            alert("請輸入正確的驗證碼");
            theform.seccodeverify.focus();
            return false;
        }
        if (window.AtUser && window.AtUser.forQuickPost && window.AtUser.EditorInputDetector) {
            window.AtUser.EditorInputDetector.saveEditorText();
        }
        if (theform.message.value == "" && theform.subject.value == "") {
            alert("請完成標題或內容欄。");
            theform.message.focus();
            return false;
        } else if (theform.subject.value.length > 80) {
            alert("您的標題超過 80 個字符的限制。");
            theform.subject.focus();
            return false;
        }
        if (!disablepostctrl && ((postminchars != 0 && theform.message.value.length < postminchars) || (postmaxchars != 0 && theform.message.value.length > postmaxchars))) {
            alert("您的帖子長度不符合要求。\n\n當前長度: " + theform.message.value.length + " 字節\n系統限制: " + postminchars + " 發送到 " + postmaxchars + " 字節");
            return false;
        }
        if (!fetchCheckbox('parseurloff')) {
            theform.message.value = parseurl(theform.message.value, 'bbcode');
        }
        theform.replysubmit.disabled = true;
        return true;
    }    

    
})();