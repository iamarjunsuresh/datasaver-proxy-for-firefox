/*
 * Data Compressor Proxy 0.0.1
 * License: MPL
 *
 * Based on
 * Data Compression Proxy Extension for Google Chrome on Desktop
 * (c) 2014 Jerzy Glowacki. License: Apache 2.0

 * and includes
 * JavaScript MD5 1.0.1
 * https://github.com/blueimp/JavaScript-MD5
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 *
 * JavaScript MD5 1.0.1 is Based on
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

var self = require('sdk/self');
var {Class} = require('sdk/core/heritage');
var {Unknown} = require('sdk/platform/xpcom');
var {Cc, Ci, Cu} = require("chrome");
var prefsvc = require("sdk/preferences/service");
var buttons = require("sdk/ui/button/toggle");
var panels = require("sdk/panel");
var data = require("sdk/self").data;
var ss = require("sdk/simple-storage");
var tabs = require("sdk/tabs");
var tablib = require("sdk/tabs/utils");
var events = require("sdk/system/events");
var { setInterval , clearInterval } = require("sdk/timers");

var button;
var proxy_http = "network.proxy.http";
var proxy_port = "network.proxy.http_port";
var proxy_type = "network.proxy.type";
var proxy_exclude = "network.proxy.no_proxies_on";
var google_proxy = {url: "proxy.googlezip.net", port: 80, type: 1}
var timerid=null;
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

exports.onUnload = function (reason) {

    if (reason == "uninstall" || reason == "disable") {
        httprequestobserver.unregister();
        
        ss.storage.enabled = 0;
        //  console.log("disabled");
        proxy_filter.unregister_filter();
    }
    if (reason == "shutdown") {
        httprequestobserver.unregister();
      
        proxy_filter.unregister_filter();
    }

}
exports.main = function (reason,callback) {
//console.error("install trigger worked:"+reason.loadReason);
    if (reason.loadReason == "install" || reason.loadReason == "enable") {
// setting storage
        if (ss.storage.version ==null ) {
            console.log("v1.5 completed");
            ss.storage.total_compressed = 0;
            ss.storage.enabled = 1;
            ss.storage.total_original = 0;
            ss.storage.total_saved = 0;

            ss.storage.monthly_savings = 0
            ss.storage.daily_savings = 0;
            ss.storage.current_day = -1;
            ss.storage.current_month = -1;

            ss.storage.version = "1.5";


        }
        if (ss.storage.version == "1.5") {
            console.log("v1.7 completed");
 // settings from older version
if(prefsvc.get(proxy_type,0)==1&&prefsvc.get(proxy_http,"")=="proxy.googlezip.net"){reset_proxy_state();}
            ss.storage.bypassurls = [];
            ss.storage.user_bypassurls = [];
            tabs.open("http://www.advancedbytes.in/version?ver=1.7&tmode=1");
            ss.storage.version = "1.7";
        }
        if(ss.storage.version=="1.7")
{
ss.storage.disable_reason="";
ss.storage.allowinprivate=0;
ss.storage.version="1.9";



}


      



        ss.storage.enabled = 1;
              private_browsing_hook();
//main
if(ss.storage.enabled)
{

    enable_saver();
if(ss.storage.allowinprivate==0)
{
enable_checking();


}
}
//("enabled");
    }
    if (reason.loadReason == "startup") {
console.log("called startup:");
       private_browsing_hook();
//main
if(ss.storage.enabled)
{

    enable_saver();
if(ss.storage.allowinprivate==0)
{
enable_checking();


}
}
    }


}


// if case install trigger failed


// setting storage
        if (ss.storage.version ==null ) {
            console.log("v1.5 completed");
            ss.storage.total_compressed = 0;
            ss.storage.enabled = 1;
            ss.storage.total_original = 0;
            ss.storage.total_saved = 0;

            ss.storage.monthly_savings = 0
            ss.storage.daily_savings = 0;
            ss.storage.current_day = -1;
            ss.storage.current_month = -1;

            ss.storage.version = "1.5";


        }
        if (ss.storage.version == "1.5") {
            console.log("v1.7 completed");
 // settings from older version
if(prefsvc.get(proxy_type,0)==1&&prefsvc.get(proxy_http,"")=="proxy.googlezip.net"){reset_proxy_state();}
            ss.storage.bypassurls = [];
            ss.storage.user_bypassurls = [];
            tabs.open("http://www.advancedbytes.in/version?ver=1.7&tmode=1");
            ss.storage.version = "1.7";
        }
        if(ss.storage.version=="1.7")
{
ss.storage.disable_reason="";
ss.storage.allowinprivate=0;
ss.storage.version="1.9";

    ss.storage.enabled = 1;

}


   //main
   


 function reset_proxy_state() {
        prefsvc.set(proxy_http, "");
        prefsvc.set(proxy_port,0);
        prefsvc.set(proxy_type, 0);

    }


var proxyfilter = Class(
    {
        pps: null,
        filter: null,
        registerd: false,
        init: function () {
            this.pps = Cc["@mozilla.org/network/protocol-proxy-service;1"]
                .getService(Ci.nsIProtocolProxyService);

        },
        register_filter: function () {
            if (this.pps == null) {
                this.init();
            }
           try{
                this.pps.registerFilter(this.get_filter(), 10);
              
            }
            catch(ex)
            {
            console.log("Proxy filter register failed");
            }

        },
        unregister_filter: function () {
            if (this.pps == null) {
                init();
            }
            try {
                this.pps.unregisterFilter(this.get_filter());
               
            }
            catch(ex)
            {
            console.log("Proxy filter unregister failed");}
        },
        get_filter: function () {
            if (this.filter != null) {
                return this.filter;
            }
            else {
                var google_proxy = this.pps.newProxyInfo("http", "proxy.googlezip.net", 80, 1, -1, null);

                this.filter= {

                    applyFilter: function (pps, uri, proxy) {

                   
           /*        
                    var winMediator = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
                    var mrw = winMediator.getEnumerator("navigator:browser");
                    while(mrw.hasMoreElements())
                    {
                    
                    var win =mrw.getNext();
                    gBrowser=win.gBrowser;
                       var num = gBrowser.browsers.length;
for (var i = 0; i < num; i++) {
  var b = gBrowser.getBrowserAtIndex(i);
if (require("sdk/private-browsing").isPrivate(b)){
    console.log("private:"+b.currentURI.spec); 
}}
                    
                  */ 
                 
                        //pac functions
                       // console.log("original proxy:"+proxy.host+":"+proxy.port);
                        function dnsDomainIs(host, domain) {
                            return (host.length >= domain.length &&
                            host.substring(host.length - domain.length) == domain);
                        }

                        function dnsDomainLevels(host) {
                            return host.split('.').length - 1;
                        }

                        function convert_addr(ipchars) {
                            var bytes = ipchars.split('.');
                            var result = ((bytes[0] & 0xff) << 24) |
                                ((bytes[1] & 0xff) << 16) |
                                ((bytes[2] & 0xff) << 8) |
                                (bytes[3] & 0xff);
                            return result;
                        }

                        function isInNet(ipaddr, pattern, maskstr) {
                            if(ipaddr==null)
                            {

                                return true;
                            }
                            var test = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ipaddr);
                            if (test == null) {
                                ipaddr = dnsResolve(ipaddr);
                                if (ipaddr == null)
                                    return false;
                            } else if (test[1] > 255 || test[2] > 255 ||
                                test[3] > 255 || test[4] > 255) {
                                return false;    // not an IP address
                            }
                            var host = convert_addr(ipaddr);
                            var pat = convert_addr(pattern);
                            var mask = convert_addr(maskstr);
                            return ((host & mask) == (pat & mask));

                        }

                        function isResolvable(host) {
                            var ip = dnsResolve(host);
                            return (ip != null);
                        }

                        function localHostOrDomainIs(host, hostdom) {
                            return (host == hostdom) ||
                                (hostdom.lastIndexOf(host + '.', 0) == 0);
                        }

                        function shExpMatch(url, pattern) {
                            pattern = pattern.replace(/\./g, '\\.');
                            pattern = pattern.replace(/\*/g, '.*');
                            pattern = pattern.replace(/\?/g, '.');
                            var newRe = new RegExp('^' + pattern + '$');
                            return newRe.test(url);
                        }

                        var wdays = {SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6};
                        var months = {
                            JAN: 0,
                            FEB: 1,
                            MAR: 2,
                            APR: 3,
                            MAY: 4,
                            JUN: 5,
                            JUL: 6,
                            AUG: 7,
                            SEP: 8,
                            OCT: 9,
                            NOV: 10,
                            DEC: 11
                        };

                        function weekdayRange() {
                            function getDay(weekday) {
                                if (weekday in wdays) {
                                    return wdays[weekday];
                                }
                                return -1;
                            }

                            var date = new Date();
                            var argc = arguments.length;
                            var wday;
                            if (argc < 1)
                                return false;
                            if (arguments[argc - 1] == 'GMT') {
                                argc--;
                                wday = date.getUTCDay();
                            } else {
                                wday = date.getDay();
                            }
                            var wd1 = getDay(arguments[0]);
                            var wd2 = (argc == 2) ? getDay(arguments[1]) : wd1;
                            return (wd1 == -1 || wd2 == -1) ? false
                                : (wd1 <= wday && wday <= wd2);
                        }

                        function dateRange() {
                            function getMonth(name) {
                                if (name in months) {
                                    return months[name];
                                }
                                return -1;
                            }

                            var date = new Date();
                            var argc = arguments.length;
                            if (argc < 1) {
                                return false;
                            }
                            var isGMT = (arguments[argc - 1] == 'GMT');

                            if (isGMT) {
                                argc--;
                            }
                            // function will work even without explict handling of this case
                            if (argc == 1) {
                                var tmp = parseInt(arguments[0]);
                                if (isNaN(tmp)) {
                                    return ((isGMT ? date.getUTCMonth() : date.getMonth()) ==
                                    getMonth(arguments[0]));
                                } else if (tmp < 32) {
                                    return ((isGMT ? date.getUTCDate() : date.getDate()) == tmp);
                                } else {
                                    return ((isGMT ? date.getUTCFullYear() : date.getFullYear()) ==
                                    tmp);
                                }
                            }
                            var year = date.getFullYear();
                            var date1, date2;
                            date1 = new Date(year, 0, 1, 0, 0, 0);
                            date2 = new Date(year, 11, 31, 23, 59, 59);
                            var adjustMonth = false;
                            for (var i = 0; i < (argc >> 1); i++) {
                                var tmp = parseInt(arguments[i]);
                                if (isNaN(tmp)) {
                                    var mon = getMonth(arguments[i]);
                                    date1.setMonth(mon);
                                } else if (tmp < 32) {
                                    adjustMonth = (argc <= 2);
                                    date1.setDate(tmp);
                                } else {
                                    date1.setFullYear(tmp);
                                }
                            }
                            for (var i = (argc >> 1); i < argc; i++) {
                                var tmp = parseInt(arguments[i]);
                                if (isNaN(tmp)) {
                                    var mon = getMonth(arguments[i]);
                                    date2.setMonth(mon);
                                } else if (tmp < 32) {
                                    date2.setDate(tmp);
                                } else {
                                    date2.setFullYear(tmp);
                                }
                            }
                            if (adjustMonth) {
                                date1.setMonth(date.getMonth());
                                date2.setMonth(date.getMonth());
                            }
                            if (isGMT) {
                                var tmp = date;
                                tmp.setFullYear(date.getUTCFullYear());
                                tmp.setMonth(date.getUTCMonth());
                                tmp.setDate(date.getUTCDate());
                                tmp.setHours(date.getUTCHours());
                                tmp.setMinutes(date.getUTCMinutes());
                                tmp.setSeconds(date.getUTCSeconds());
                                date = tmp;
                            }
                            return ((date1 <= date) && (date <= date2));
                        }

                        function timeRange() {
                            var argc = arguments.length;
                            var date = new Date();
                            var isGMT = false;

                            if (argc < 1) {
                                return false;
                            }
                            if (arguments[argc - 1] == 'GMT') {
                                isGMT = true;
                                argc--;
                            }

                            var hour = isGMT ? date.getUTCHours() : date.getHours();
                            var date1, date2;
                            date1 = new Date();
                            date2 = new Date();

                            if (argc == 1) {
                                return (hour == arguments[0]);
                            } else if (argc == 2) {
                                return ((arguments[0] <= hour) && (hour <= arguments[1]));
                            } else {
                                switch (argc) {
                                    case 6:
                                        date1.setSeconds(arguments[2]);
                                        date2.setSeconds(arguments[5]);
                                    case 4:
                                        var middle = argc >> 1;
                                        date1.setHours(arguments[0]);
                                        date1.setMinutes(arguments[1]);
                                        date2.setHours(arguments[middle]);
                                        date2.setMinutes(arguments[middle + 1]);
                                        if (middle == 2) {
                                            date2.setSeconds(59);
                                        }
                                        break;
                                    default:
                                        throw 'timeRange: bad number of arguments'
                                }
                            }

                            if (isGMT) {
                                date.setFullYear(date.getUTCFullYear());
                                date.setMonth(date.getUTCMonth());
                                date.setDate(date.getUTCDate());
                                date.setHours(date.getUTCHours());
                                date.setMinutes(date.getUTCMinutes());
                                date.setSeconds(date.getUTCSeconds());
                            }
                            return ((date1 <= date) && (date <= date2));
                        }

                        function isPlainHostName(host) {
                            if (host.indexOf(".") == -1) {
                                return true;
                            }
                            return false;

                        }

                        function dnsResolve(hos) {
                            var dnsService = Cc["@mozilla.org/network/dns-service;1"].getService(Ci.nsIDNSService);try{
                               var ipaddr=dnsService.resolve(hos, false).getNextAddrAsString();
                            return ipaddr;

                            }
                            catch (ex) {
                                return null;


                            }

                                                    }

                        function isproxyonfor(url, host) {


                            if (url.substring(0, 5) == 'http:' && !isPlainHostName(host) && !shExpMatch(host, '*.local') && !isInNet(dnsResolve(host), '10.0.0.0', '255.0.0.0') && !isInNet(dnsResolve(host), '172.16.0.0', '255.240.0.0') && !isInNet(dnsResolve(host), '192.168.0.0', '255.255.0.0') && !isInNet(dnsResolve(host), '127.0.0.0', '255.255.255.0')) {


                                return true;
                            }
                            //console.log("not http or may be it will localip");
                            return false;
                        }

                        function matchRuleShort(str, rule) {

                            return new RegExp("^" + rule.split("*").join(".*") + "$").test(str);
                        }

                        if (isproxyonfor(uri.spec,uri.host)==false) {
                            return proxy;
                        }
                        else {
                           // console.log(ss.storage.bypassurls);
                            var url = uri;
                            var path_url = url.path;
                            var page_url = url.host + "?" + path_url.substr(0, path_url.lastIndexOf('/') != -1 ? path_url.lastIndexOf('/') : path_url.length)
                            if (ss.storage.bypassurls.indexOf(page_url) != -1) {
                               // console.log("block effected");
                                return proxy;

                            }
                            //checking user bypass list
                           // console.log(ss.storage.user_bypassurls);

                            var i = 0;
                            for (i = 0; i < ss.storage.user_bypassurls.length; i++) {
                                if (matchRuleShort(uri.spec, ss.storage.user_bypassurls[i]) == true) {
                                   // console.log("user bypass in effect");
                                    return proxy;
                                }


                            }


                            return google_proxy;


                        }

                    }

                }
                return this.filter;
            }

        }


    }
);
function TracingListener() {
}
TracingListener.prototype = {
    onDataAvailable: function (request, context, inputStream, offset, count) {
       // console.log('data available');
        this.originalListener.onDataAvailable(request, context, inputStream, offset, count);
    },
    onStartRequest: function (request, context) {
        this.originalListener.onStartRequest(request, context);
    },
    onStopRequest: function (request, context, statusCode) {
        this.originalListener.onStopRequest(request, context, statusCode);
    },
    QueryInterface: function (aIID) {
        if (aIID.equals(Ci.nsIStreamListener) || aIID.equals(Ci.nsISupports)) {
            return this;
        }
        throw Cr.NS_NOINTERFACE;
    }
}
var httpRequestObserver = Class(
    {
        extends: Unknown,
        interfaces: ['nsIObserver'],
        topic: '*',
        getTabFromChannel: function (channel) {
            try {
                var noteCB = channel.notificationCallbacks ? channel.notificationCallbacks : channel.loadGroup.notificationCallbacks;

                if (!noteCB) {
                    return null;
                }
                var interfaceRequestor =
                    noteCB.QueryInterface(Ci.nsIInterfaceRequestor);
                var domWin = interfaceRequestor.getInterface(Ci.nsIDOMWindow);
                return {tab: tablib.getTabForContentWindow(domWin.top), tabbrowser: tablib.getTabBrowser(domWin.top)};
            } catch (e) {
                dump(e + "\n");
                return null;
            }
        },

        observe: function (subject, topic, data) {


            if (topic == "http-on-modify-request") {
           
                var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
                 /*var num = gBrowser.browsers.length;
for (var i = 0; i < num; i++) {
  var b = gBrowser.getBrowserAtIndex(i);
  try {
    dump(b.currentURI.spec); // dump URLs of all open tabs to console
  } catch(e) {
    Components.utils.reportError(e);
  }
}*/
                if (httpChannel.URI.spec.substr(0, 5) != "http:") {
                    return;
                }



                httpChannel.setRequestHeader("Chrome-Proxy", this.authHeader(), false);
            }
            else if (topic == "http-on-examine-response") {

                var http_response = subject.QueryInterface(Ci.nsIHttpChannel);
                subject.QueryInterface(Ci.nsIHttpChannel);
                var orig = 0, compressed = 0;
                var url = http_response.URI.spec;

                if (url.substr(0, 5) != "http:") {
                    return;
                }
                //console.log("rev:" + url);
                if (http_response.responseStatus == 502) {
                    //keep track of pages with errors
                    //Adding exceptions
                    url = http_response.URI;
                    var path_url = url.path;
                    var page_url = url.host + "?" + path_url.substr(0, path_url.lastIndexOf('/') != -1 ? path_url.lastIndexOf('/') : path_url.length)
                   // console.log("blocked:" + page_url);
                    if (ss.storage.bypassurls.indexOf(page_url) == -1) {
                        ss.storage.bypassurls.push(page_url);
                    }



                    return;

                }


                //console.log(url);
                try {

                    compressed = parseInt(http_response.getResponseHeader("Content-Length"));

                } catch (ex) {
                    compressed = 0;

                }

                try {
                    if (compressed == 0) {
                        orig = 0;
                    }
                    else {

                        orig = parseInt(http_response.getResponseHeader("X-Original-Content-Length"));

                    }
                } catch (ex) {

                    orig = compressed;


                }

                if (compressed != null && orig != null) {

                    /*ss.storage.compressed_data.push(compressed);
                     ss.storage.original_data.push(orig);
                     */
                    var d = new Date();
                    var cmonth = d.getMonth();
                    var cday = d.getDate();
                    if (ss.storage.current_day != cday) {
                        ss.storage.current_day = cday;
                        ss.storage.daily_savings = (orig - compressed);

                    }
                    else {

                        ss.storage.daily_savings += (orig - compressed);


                    }
                    if (ss.storage.current_month != cmonth) {
                        ss.storage.current_month = cmonth;
                        ss.storage.monthly_savings = (orig - compressed);

                    }
                    else {

                        ss.storage.monthly_savings += (orig - compressed);


                    }
                    ss.storage.total_compressed += compressed;
                    ss.storage.total_original += orig;
                    ss.storage.total_saved += (orig - compressed);
                }
            }
        },

        get observerService() {
            return Cc["@mozilla.org/observer-service;1"]
                .getService(Ci.nsIObserverService);
        },

        authHeader: function () {
            var authValue = 'ac4500dd3b7579186c1b0620614fdb1f7d61f944';
            var timestamp = Date.now().toString().substring(0, 10);
            return 'ps=' + timestamp + '-' + '0' + '-' + '0' + '-' + '0' + ', sid=' + md5(timestamp + authValue + timestamp) + ', b=2214' + ', p=115' + ', c=win';
        },

        register: function () {
            if (this.observerService) {
                try {
                    this.observerService.addObserver(this, "http-on-modify-request", false);

                }
                catch (ex) {

                }
                try {
                    this.observerService.addObserver(this, "http-on-examine-response", false)
                }
                catch (ex) {
                }
            }
        },

        unregister: function () {
            if (this.observerService) {
                try {
                    this.observerService.removeObserver(this, "http-on-modify-request");

                }
                catch (ex) {

                }
                try {

                    this.observerService.removeObserver(this, "http-on-examine-response");
                }
                catch (ex) {

                }
            }
        }
    });

var savingspanel = null;
var whitelistpanel = null;
var httprequestobserver = httpRequestObserver();
var proxy_filter = proxyfilter();

function enable_saver() {
   // console.log(ss.storage.quota);
    httprequestobserver.register();
    proxy_filter.register_filter();
    button.icon = "./ico1.png";
    /*save_proxy_state();
     g = google_proxy;
     g.excludelist = prefsvc.get(proxy_exclude, "127.0.0.1,localhost");
     set_proxy_state(g);
     */


    ss.storage.enabled = 1;


}
function enable_checking(){

 if(ss.storage.allowinprivate==0&&ss.storage.enabled==1&&timerid==null)
{console.log("checking enabled");
timerid=start_checking();}


}
function disable_checking(){
console.log("checking disabled");
if(timerid==null){
return;
}
 clearInterval(timerid);
		  timerid=null;
}

function restart_saver()
{
	if(ss.storage.disable_reason=="private")
	{	
		enable_saver();
		ss.storage.disable_reason="";
		
	}

}
function private_browsing_hook()
{

events.on("last-pb-context-exited", restart_saver);



}

function start_checking()
{
console.log("start_checking called");
return setInterval(function() {


 console.log("check working");	
	for (let tab of tabs){

		  if(require("sdk/private-browsing").isPrivate(tab))
		  {
		  disable_saver();
		  ss.storage.disable_reason="private";
		  disable_checking();
		  return;
		   }
	  }
}, 2000);
}
function toggle_private()
{

if(ss.storage.allowinprivate)
{ss.storage.allowinprivate=0;
enable_checking();


}
else{

ss.storage.allowinprivate=1;
disable_checking();
}


}
function disable_saver() {
	httprequestobserver.unregister();
    button.icon = "./ico2.png";
    proxy_filter.unregister_filter();
    /*reset_proxy_state();*/
    ss.storage.enabled = 0;
}

function toggle_data_saver() {
    if (ss.storage.enabled) {
        disable_saver();
        disable_checking();

    }
    else {
        enable_saver();
        enable_checking();
    }
}

//adding UI 
button = buttons.ToggleButton({
    id: "menu-select",
    label: "Data Saver Proxy",
    onClick: toolbar_button_click,
    icon: "./ico1.png"
});
function toolbar_button_click(state) {

    if (state.checked) {
        savingspanel = panels.Panel({
            contentScriptFile: [data.url("stats.js")],
            contentURL: data.url("savings.html"),
            position: button,
            onHide: handlehide,
            width: 300,
            height: 400
        }).show();
        savingspanel.port.on("toggle_status", function () {
            toggle_data_saver();
        });
        savingspanel.port.on("toggle_private",function(){
             toggle_private();
        });

        savingspanel.port.on("rateurl", function () {
            tabs.open("https://addons.mozilla.org/addon/google_datasaver_for_firefox?src=external-fromaddon");

        });
        savingspanel.port.on("learnurl", function () {
            tabs.open("http://www.advancedbytes.in");
        })
        savingspanel.port.on("reset_month", function () {
            ss.storage.monthly_savings = 0;
        });
        savingspanel.port.on("reset_daily", function () {
            ss.storage.daily_savings = 0;
        });
         savingspanel.port.on("addsite", function () {
         savingspanel.hide();
         /* These are TLDs that have an SLD */
var tlds = {
    "cy":true,
    "ro":true,
    "ke":true,
    "kh":true,
    "ki":true,
    "cr":true,
    "km":true,
    "kn":true,
    "kr":true,
    "ck":true,
    "cn":true,
    "kw":true,
    "rs":true,
    "ca":true,
    "kz":true,
    "rw":true,
    "ru":true,
    "za":true,
    "zm":true,
    "bz":true,
    "je":true,
    "uy":true,
    "bs":true,
    "br":true,
    "jo":true,
    "us":true,
    "bh":true,
    "bo":true,
    "bn":true,
    "bb":true,
    "ba":true,
    "ua":true,
    "eg":true,
    "ec":true,
    "et":true,
    "er":true,
    "es":true,
    "pl":true,
    "in":true,
    "ph":true,
    "il":true,
    "pe":true,
    "co":true,
    "pa":true,
    "id":true,
    "py":true,
    "ug":true,
    "ky":true,
    "ir":true,
    "pt":true,
    "pw":true,
    "iq":true,
    "it":true,
    "pr":true,
    "sh":true,
    "sl":true,
    "sn":true,
    "sa":true,
    "sb":true,
    "sc":true,
    "sd":true,
    "se":true,
    "hk":true,
    "sg":true,
    "sy":true,
    "sz":true,
    "st":true,
    "sv":true,
    "om":true,
    "th":true,
    "ve":true,
    "tz":true,
    "vn":true,
    "vi":true,
    "pk":true,
    "fk":true,
    "fj":true,
    "fr":true,
    "ni":true,
    "ng":true,
    "nf":true,
    "re":true,
    "na":true,
    "qa":true,
    "tw":true,
    "nr":true,
    "np":true,
    "ac":true,
    "af":true,
    "ae":true,
    "ao":true,
    "al":true,
    "yu":true,
    "ar":true,
    "tj":true,
    "at":true,
    "au":true,
    "ye":true,
    "mv":true,
    "mw":true,
    "mt":true,
    "mu":true,
    "tr":true,
    "mz":true,
    "tt":true,
    "mx":true,
    "my":true,
    "mg":true,
    "me":true,
    "mc":true,
    "ma":true,
    "mn":true,
    "mo":true,
    "ml":true,
    "mk":true,
    "do":true,
    "dz":true,
    "ps":true,
    "lr":true,
    "tn":true,
    "lv":true,
    "ly":true,
    "lb":true,
    "lk":true,
    "gg":true,
    "uk":true,
    "gn":true,
    "gh":true,
    "gt":true,
    "gu":true,
    "jp":true,
    "gr":true,
    "nz":true
}

function isSecondLevelDomainPresent(domainParts) {
    return typeof tlds[domainParts[domainParts.length-1]] != "undefined"&&typeof tlds[domainParts[domainParts.length-2]] != "undefined";
}
function getDomainFromHostname(url) {
  domainParts = url.split(".");
  var cutOff =2;
  if (isSecondLevelDomainPresent(domainParts)) {
    cutOff=3;
  }
  
  return domainParts.slice(domainParts.length-cutOff, domainParts.length).join(".");
}
/*
var url=tabs.activeTab.url;
var proto=url.substr(0,url.indexOf("//"))
var first=url.substr(url.indexOf("//")+2);
var sec=first.substr(0,first.lastIndexOf("/"));
var suffix=sec.substr(sec.lastIndexOf(".")+1);

var d=sec.substr(0,sec.lastIndexOf("."))

var domain;
if(d.lastIndexOf(".")==-1)
{
domain=d;

}else{domain=d.substr(d.lastIndexOf(".")+1);}*/

//console.log(proto+"//"+"*."+domain+"."+suffix+"/*");
var k=tabs.activeTab.url;
var proto=k.substr(0,k.indexOf("//")+2);
var first=k.substr(k.indexOf("//")+2);
var sec=first.substr(0,first.indexOf("/"));
var url=proto+"*."+getDomainFromHostname(sec)+"/*";
ss.storage.user_bypassurls.push(url);





        });
        savingspanel.port.on("edit-white-list", show_whitelistpanel);
        savingspanel.on("show", function () {
            savingspanel.port.emit("show",
                {
                    t: ss.storage.total_original,
                    s: ss.storage.total_saved,
                    enabled: ss.storage.enabled,
                    mbd: ss.storage.daily_savings,
                    mbm: ss.storage.monthly_savings,
                    allowprivate:ss.storage.allowinprivate,
                    dreason:ss.storage.disable_reason
                });
        });
    }

    return;
}
function show_whitelistpanel() {

    whitelistpanel = panels.Panel({
        contentScriptFile: [data.url("wlist.js")],
        contentURL: data.url("wlist.html"),
        width: 700,
        height: 500
    }).show();

    whitelistpanel.on("show", function () {
        whitelistpanel.port.emit("load", {list: ss.storage.user_bypassurls});


    });
    whitelistpanel.port.on("update-white-list", function (data) {
        ss.storage.user_bypassurls = data.list;
        whitelistpanel.hide();


    });

}
function handlehide() {
    button.state('window', {checked: false});

}

private_browsing_hook();
//main
if(ss.storage.enabled)
{

	    enable_saver();
	if(ss.storage.allowinprivate==0)
	{
	enable_checking();


	}   
}





// MD5 javascript library

!function (a) {
    "use strict";
    function b(a, b) {
        var c = (65535 & a) + (65535 & b), d = (a >> 16) + (b >> 16) + (c >> 16);
        return d << 16 | 65535 & c
    }

    function c(a, b) {
        return a << b | a >>> 32 - b
    }

    function d(a, d, e, f, g, h) {
        return b(c(b(b(d, a), b(f, h)), g), e)
    }

    function e(a, b, c, e, f, g, h) {
        return d(b & c | ~b & e, a, b, f, g, h)
    }

    function f(a, b, c, e, f, g, h) {
        return d(b & e | c & ~e, a, b, f, g, h)
    }

    function g(a, b, c, e, f, g, h) {
        return d(b ^ c ^ e, a, b, f, g, h)
    }

    function h(a, b, c, e, f, g, h) {
        return d(c ^ (b | ~e), a, b, f, g, h)
    }

    function i(a, c) {
        a[c >> 5] |= 128 << c % 32, a[(c + 64 >>> 9 << 4) + 14] = c;
        var d, i, j, k, l, m = 1732584193, n = -271733879, o = -1732584194, p = 271733878;
        for (d = 0; d < a.length; d += 16)i = m, j = n, k = o, l = p, m = e(m, n, o, p, a[d], 7, -680876936), p = e(p, m, n, o, a[d + 1], 12, -389564586), o = e(o, p, m, n, a[d + 2], 17, 606105819), n = e(n, o, p, m, a[d + 3], 22, -1044525330), m = e(m, n, o, p, a[d + 4], 7, -176418897), p = e(p, m, n, o, a[d + 5], 12, 1200080426), o = e(o, p, m, n, a[d + 6], 17, -1473231341), n = e(n, o, p, m, a[d + 7], 22, -45705983), m = e(m, n, o, p, a[d + 8], 7, 1770035416), p = e(p, m, n, o, a[d + 9], 12, -1958414417), o = e(o, p, m, n, a[d + 10], 17, -42063), n = e(n, o, p, m, a[d + 11], 22, -1990404162), m = e(m, n, o, p, a[d + 12], 7, 1804603682), p = e(p, m, n, o, a[d + 13], 12, -40341101), o = e(o, p, m, n, a[d + 14], 17, -1502002290), n = e(n, o, p, m, a[d + 15], 22, 1236535329), m = f(m, n, o, p, a[d + 1], 5, -165796510), p = f(p, m, n, o, a[d + 6], 9, -1069501632), o = f(o, p, m, n, a[d + 11], 14, 643717713), n = f(n, o, p, m, a[d], 20, -373897302), m = f(m, n, o, p, a[d + 5], 5, -701558691), p = f(p, m, n, o, a[d + 10], 9, 38016083), o = f(o, p, m, n, a[d + 15], 14, -660478335), n = f(n, o, p, m, a[d + 4], 20, -405537848), m = f(m, n, o, p, a[d + 9], 5, 568446438), p = f(p, m, n, o, a[d + 14], 9, -1019803690), o = f(o, p, m, n, a[d + 3], 14, -187363961), n = f(n, o, p, m, a[d + 8], 20, 1163531501), m = f(m, n, o, p, a[d + 13], 5, -1444681467), p = f(p, m, n, o, a[d + 2], 9, -51403784), o = f(o, p, m, n, a[d + 7], 14, 1735328473), n = f(n, o, p, m, a[d + 12], 20, -1926607734), m = g(m, n, o, p, a[d + 5], 4, -378558), p = g(p, m, n, o, a[d + 8], 11, -2022574463), o = g(o, p, m, n, a[d + 11], 16, 1839030562), n = g(n, o, p, m, a[d + 14], 23, -35309556), m = g(m, n, o, p, a[d + 1], 4, -1530992060), p = g(p, m, n, o, a[d + 4], 11, 1272893353), o = g(o, p, m, n, a[d + 7], 16, -155497632), n = g(n, o, p, m, a[d + 10], 23, -1094730640), m = g(m, n, o, p, a[d + 13], 4, 681279174), p = g(p, m, n, o, a[d], 11, -358537222), o = g(o, p, m, n, a[d + 3], 16, -722521979), n = g(n, o, p, m, a[d + 6], 23, 76029189), m = g(m, n, o, p, a[d + 9], 4, -640364487), p = g(p, m, n, o, a[d + 12], 11, -421815835), o = g(o, p, m, n, a[d + 15], 16, 530742520), n = g(n, o, p, m, a[d + 2], 23, -995338651), m = h(m, n, o, p, a[d], 6, -198630844), p = h(p, m, n, o, a[d + 7], 10, 1126891415), o = h(o, p, m, n, a[d + 14], 15, -1416354905), n = h(n, o, p, m, a[d + 5], 21, -57434055), m = h(m, n, o, p, a[d + 12], 6, 1700485571), p = h(p, m, n, o, a[d + 3], 10, -1894986606), o = h(o, p, m, n, a[d + 10], 15, -1051523), n = h(n, o, p, m, a[d + 1], 21, -2054922799), m = h(m, n, o, p, a[d + 8], 6, 1873313359), p = h(p, m, n, o, a[d + 15], 10, -30611744), o = h(o, p, m, n, a[d + 6], 15, -1560198380), n = h(n, o, p, m, a[d + 13], 21, 1309151649), m = h(m, n, o, p, a[d + 4], 6, -145523070), p = h(p, m, n, o, a[d + 11], 10, -1120210379), o = h(o, p, m, n, a[d + 2], 15, 718787259), n = h(n, o, p, m, a[d + 9], 21, -343485551), m = b(m, i), n = b(n, j), o = b(o, k), p = b(p, l);
        return [m, n, o, p]
    }

    function j(a) {
        var b, c = "";
        for (b = 0; b < 32 * a.length; b += 8)c += String.fromCharCode(a[b >> 5] >>> b % 32 & 255);
        return c
    }

    function k(a) {
        var b, c = [];
        for (c[(a.length >> 2) - 1] = void 0, b = 0; b < c.length; b += 1)c[b] = 0;
        for (b = 0; b < 8 * a.length; b += 8)c[b >> 5] |= (255 & a.charCodeAt(b / 8)) << b % 32;
        return c
    }

    function l(a) {
        return j(i(k(a), 8 * a.length))
    }

    function m(a, b) {
        var c, d, e = k(a), f = [], g = [];
        for (f[15] = g[15] = void 0, e.length > 16 && (e = i(e, 8 * a.length)), c = 0; 16 > c; c += 1)f[c] = 909522486 ^ e[c], g[c] = 1549556828 ^ e[c];
        return d = i(f.concat(k(b)), 512 + 8 * b.length), j(i(g.concat(d), 640))
    }

    function n(a) {
        var b, c, d = "0123456789abcdef", e = "";
        for (c = 0; c < a.length; c += 1)b = a.charCodeAt(c), e += d.charAt(b >>> 4 & 15) + d.charAt(15 & b);
        return e
    }

    function o(a) {
        return unescape(encodeURIComponent(a))
    }

    function p(a) {
        return l(o(a))
    }

    function q(a) {
        return n(p(a))
    }

    function r(a, b) {
        return m(o(a), o(b))
    }

    function s(a, b) {
        return n(r(a, b))
    }

    function t(a, b, c) {
        return b ? c ? r(b, a) : s(b, a) : c ? p(a) : q(a)
    }

    "function" == typeof define && define.amd ? define(function () {
        return t
    }) : a.md5 = t
}(this);
