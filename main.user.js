// ==UserScript==
// @name         桂电校园网 终极自动重连
// @namespace    https://tampermonkey.net/
// @version      2.0.0
// @description  断网后自动跳转认证页并完成登录，登录后保持心跳检测
// @match        http://10.0.1.5/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    /************** 用户配置区 **************/
    const USERNAME = '学号';
    const PASSWORD = '密码';

    // '@telecom'    电信
    // '@unicom'     联通
    // '@cmcc'       移动
    // ' '           校园网
    const ISP_TYPE = '@unicom'; 
    const HEARTBEAT_INTERVAL = 60000; // 检查周期：60秒
    /***************************************/

    let hasTriedLogin = false;

    function log(msg) {
        // 打印带时间的日志
        const time = new Date().toLocaleTimeString();
        console.log(`[自动重连 ${time}] ${msg}`);
    }

    // 核心逻辑：判断当前是“登录页”还是“已在线页”
    function checkStatus() {
        // 1. 尝试寻找登录框
        const loginBtn = document.querySelector('input[type="submit"], input[type="button"], button');
        const passInput = document.querySelector('input[type="password"]');

        // 情况A：如果你能看到密码框，说明断网了，需要登录
        if (passInput && loginBtn) {
            log('检测到登录框，准备执行登录...');
            performLogin(passInput, loginBtn);
        }
        // 情况B：如果看不到密码框，说明已经在线（显示的是注销按钮或状态页）
        else {
            log(`当前网络已连接，${HEARTBEAT_INTERVAL/1000}秒后刷新页面进行下一次检测...`);
            setTimeout(() => {
                location.reload(); // 刷新页面，触发下一次检测
            }, HEARTBEAT_INTERVAL);
        }
    }

    function performLogin(passInput, loginBtn) {
        if (hasTriedLogin) return;

        const userInput = document.querySelector('input[type="text"]');
        const ispSelect = document.querySelector('select');

        if (userInput) userInput.value = USERNAME;
        passInput.value = PASSWORD;

        if (ispSelect) {
            ispSelect.value = ISP_TYPE;
            // 触发change事件以防网页有联动逻辑
            ispSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }

        hasTriedLogin = true;
        loginBtn.click();
    }

    window.addEventListener('load', () => {
        // 稍微延迟一点执行，确保页面元素加载完毕
        setTimeout(checkStatus, 1000);
    });

})();
