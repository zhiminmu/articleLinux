/*
 * noVNC: HTML5 VNC client
 * Copyright (C) 2012 Joel Martin
 * Copyright (C) 2013 Samuel Mannehed for Cendio AB
 * Licensed under MPL 2.0 (see LICENSE.txt)
 *
 * See README.md for usage and integration instructions.
 */

/* jslint white: false, browser: true */
/* global window, $D, Util, WebUtil, RFB, Display */
document.write("<script src='JS/Adapter.js'></script>");


(function () {
    "use strict";

    // Load supporting scripts
    //window.onscriptsload = function () { UI.load(); };
  //  window.onload = function () {/* UI.keyboardinputReset();*/ };
    Util.load_scripts(["webutil.js", "base64.js", "websock.js", "des.js",
                       "keysymdef.js", "keyboard.js", "input.js", "display.js",
                       "jsunzip.js", "rfb.js", "keysym.js"]);

     UI = {

        rfb_state : 'loaded',
        settingsOpen : false,
        connSettingsOpen : false,
        popupStatusOpen : false,
        clipboardOpen: false,
        keyboardVisible: false,
        hideKeyboardTimeout: null,
        lastKeyboardinput: null,
        defaultKeyboardinputLen: 100,
        extraKeysVisible: false,
        ctrlOn: false,
        altOn: false,
        isTouchDevice: false,

        // Setup rfb object, load settings from browser storage, then call
        // UI.init to setup the UI/menus
        load: function (callback) {
            WebUtil.initSettings(UI.start, callback);
        },

        // Render default UI and initialize settings menu
        start: function(callback) {
            UI.isTouchDevice = 'ontouchstart' in document.documentElement;

            // Stylesheet selection dropdown

            // Logging selection dropdown

            // Settings with immediate effects

            // call twice to get around webkit bug

            // if port == 80 (or 443) then it won't be present and should be
            // set manually
            var port = window.location.port;
            if (!port) {
                if (window.location.protocol.substring(0,5) == 'https') {
                    port = 443;
                }
                else if (window.location.protocol.substring(0,4) == 'http') {
                    port = 80;
                }
            }



            UI.rfb = new RFB({'target': $D('noVNC_canvas'),
                              'onUpdateState': UI.updateState,
                              'onXvpInit': UI.updateXvpVisualState,
                              'onClipboard': UI.clipReceive,
                              'onDesktopName': UI.updateDocumentTitle});

            var autoconnect = WebUtil.getQueryVar('autoconnect', false);
            if (autoconnect === 'true' || autoconnect == '1') {
                autoconnect = true;
                UI.connect();
            } else {
                autoconnect = false;
            }

            UI.updateVisualState();

            // Show mouse selector buttons on touch screen devices


            //iOS Safari does not support CSS position:fixed.
            //This detects iOS devices and enables javascript workaround.
            if ((navigator.userAgent.match(/iPhone/i)) ||
                (navigator.userAgent.match(/iPod/i)) ||
                (navigator.userAgent.match(/iPad/i))) {
                //UI.setOnscroll();
                //UI.setResize();
            }
            UI.setBarPosition();


            Util.addEvent(window, 'resize', UI.setViewClip);

            Util.addEvent(window, 'beforeunload', function () {
                if (UI.rfb_state === 'normal') {
                    return "You are currently connected.";
                }
            } );

            // Show description by default when hosted at for kanaka.github.com

            // Add mouse event click/focus/blur event handlers to the UI
            UI.addMouseHandlers();

            if (typeof callback === "function") {
                callback(UI.rfb);
            }
        },

        addMouseHandlers: function() {
            // Setup interface handlers that can't be inline


        },

        // Read form control compatible setting from cookie
        getSetting: function(name) {
            var ctrl = $D('noVNC_' + name);
            var val = WebUtil.readSetting(name);
            if (val !== null && ctrl.type === 'checkbox') {
                if (val.toString().toLowerCase() in {'0':1, 'no':1, 'false':1}) {
                    val = false;
                } else {
                    val = true;
                }
            }
            return val;
        },

        // Update cookie and form control setting. If value is not set, then
        // updates from control to current cookie setting.
        updateSetting: function(name, value) {

            // Save the cookie for this session
            if (typeof value !== 'undefined') {
                WebUtil.writeSetting(name, value);
            }

            // Update the settings control
            value = UI.getSetting(name);

            var ctrl = $D('noVNC_' + name);
            if (ctrl.type === 'checkbox') {
                ctrl.checked = value;

            } else if (typeof ctrl.options !== 'undefined') {
                for (var i = 0; i < ctrl.options.length; i += 1) {
                    if (ctrl.options[i].value === value) {
                        ctrl.selectedIndex = i;
                        break;
                    }
                }
            } else {
                /*Weird IE9 error leads to 'null' appearring
                in textboxes instead of ''.*/
                if (value === null) {
                    value = "";
                }
                ctrl.value = value;
            }
        },

        // Save control setting to cookie
        saveSetting: function(name) {
            var val, ctrl = $D('noVNC_' + name);
            if (ctrl.type === 'checkbox') {
                val = ctrl.checked;
            } else if (typeof ctrl.options !== 'undefined') {
                val = ctrl.options[ctrl.selectedIndex].value;
            } else {
                val = ctrl.value;
            }
            WebUtil.writeSetting(name, val);
            //Util.Debug("Setting saved '" + name + "=" + val + "'");
            return val;
        },

        // Initial page load read/initialization of settings
        initSetting: function(name, defVal) {
            // Check Query string followed by cookie
            var val = WebUtil.getQueryVar(name);
            if (val === null) {
                val = WebUtil.readSetting(name, defVal);
            }
            //UI.updateSetting(name, val);
            return val;
        },

        // Force a setting to be a certain value
        forceSetting: function(name, val) {
          //  UI.updateSetting(name, val);
            return val;
        },



        sendCtrlAltDel: function() {
            UI.rfb.sendCtrlAltDel();
        },

        xvpShutdown: function() {
            UI.rfb.xvpShutdown();
        },

        xvpReboot: function() {
            UI.rfb.xvpReboot();
        },

        xvpReset: function() {
            UI.rfb.xvpReset();
        },

        updateState: function(rfb, state, oldstate, msg) {
            UI.rfb_state = state;
            var klass;
            switch (state) {
                case 'failed':
                case 'fatal':
                  //  klass = "noVNC_status_error";
                    break;
                case 'normal':
                  //  klass = "noVNC_status_normal";
                    break;
                case 'disconnected':
                   // $D('noVNC_logo').style.display = "block";
                    /* falls through */
                case 'loaded':
                    klass = "noVNC_status_normal";
                    break;
                case 'password':
                  //  UI.toggleConnectPanel();

                  //  klass = "noVNC_status_warn";
                    break;
                default:
                    klass = "noVNC_status_warn";
                    break;
            }

            if (typeof(msg) !== 'undefined') {
              /*  $D('noVNC-control-bar').setAttribute("class", klass);
                $D('noVNC_status').innerHTML = msg;*/
            }

            UI.updateVisualState();
        },

        // Disable/enable controls depending on connection state
        updateVisualState: function() {
            var connected = UI.rfb_state === 'normal' ? true : false;
            // State change disables viewport dragging.
            // It is enabled (toggled) by direct click on the button
            UI.setViewDrag(false);

            switch (UI.rfb_state) {
                case 'fatal':
                case 'failed':
                case 'loaded':
                case 'disconnected':
                //    $D('connectButton').style.display = "";
                //    $D('disconnectButton').style.display = "none";
                    break;
                default:
                 //   $D('connectButton').style.display = "none";
                 //   $D('disconnectButton').style.display = "";
                    break;
            }

            //Util.Debug("<< updateVisualState");
        },

        // Disable/enable XVP button
        updateXvpVisualState: function(ver) {
            if (ver >= 1) {
             //   $D('xvpButton').style.display = 'inline';
            } else {
             //   $D('xvpButton').style.display = 'none';
                // Close XVP panel if open
                if (UI.xvpOpen === true) {
                    UI.toggleXvpPanel();
                }
            }
        },

        // Display the desktop name in the document title
        updateDocumentTitle: function(rfb, name) {
            document.title = name + " - noVNC";
        },

        clipReceive: function(rfb, text) {
            Util.Debug(">> UI.clipReceive: " + text.substr(0,40) + "...");
          // $D('noVNC_clipboard_text').value = text;
            Util.Debug("<< UI.clipReceive");
        },

        connect: function() {

            var host =adapter.hostip;// $D('noVNC_host').value;
            var port =adapter.hostport; //$D('noVNC_port').value;
            var password ='';// $D('noVNC_password').value;
            var path = 'websockify';//$D('noVNC_path').value;
            if ((!host) || (!port)) {
                throw new Error("Must set host and port");
            }

            UI.rfb.set_encrypt(false);//UI.getSetting('encrypt'));
            UI.rfb.set_true_color(true);//UI.getSetting('true_color'));
            UI.rfb.set_local_cursor(false);//UI.getSetting('cursor'));
            UI.rfb.set_shared(true);//UI.getSetting('shared'));
            UI.rfb.set_view_only(true);//UI.getSetting('view_only'));
            UI.rfb.set_repeaterID(false);//UI.getSetting('repeaterID'));

            UI.rfb.connect(host, port, password, path);

            //Close dialog.
           // setTimeout(UI.setBarPosition, 100);
          //  $D('noVNC_connect_button').style.display = "none";

        },

        disconnect: function() {
         //   UI.closeSettingsMenu();
            UI.rfb.disconnect();

            //$D('noVNC_logo').style.display = "block";
            UI.connSettingsOpen = false;
         //   UI.toggleConnectPanel();
        },

        displayBlur: function() {
            UI.rfb.get_keyboard().set_focused(false);
            UI.rfb.get_mouse().set_focused(false);
        },

        displayFocus: function() {
            UI.rfb.get_keyboard().set_focused(true);
            UI.rfb.get_mouse().set_focused(true);
        },

        clipClear: function() {
           // $D('noVNC_clipboard_text').value = "";
            UI.rfb.clipboardPasteFrom("");
        },

        clipSend: function() {
          //  var text = $D('noVNC_clipboard_text').value;
            Util.Debug(">> UI.clipSend: " + text.substr(0,40) + "...");
            UI.rfb.clipboardPasteFrom(text);
            Util.Debug("<< UI.clipSend");
        },

        // Enable/disable and configure viewport clipping
        setViewClip: function(clip) {
            var display;
            if (UI.rfb) {
                display = UI.rfb.get_display();
            } else {
                return;
            }

            var cur_clip = display.get_viewport();

            if (typeof(clip) !== 'boolean') {
                // Use current setting
               // clip = UI.getSetting('clip');
            }

            if (clip && !cur_clip) {
                // Turn clipping on
              //  UI.updateSetting('clip', true);
            } else if (!clip && cur_clip) {
                // Turn clipping off
              //  UI.updateSetting('clip', false);
                display.set_viewport(false);
                $D('noVNC_canvas').style.position = 'static';
                display.viewportChange();
            }
            if (/*UI.getSetting('clip')*/false) {
                // If clipping, update clipping settings
                $D('noVNC_canvas').style.position = 'absolute';
                var pos = Util.getPosition($D('noVNC_canvas'));
                var new_w = window.innerWidth - pos.x;
                var new_h = window.innerHeight - pos.y;
                display.set_viewport(true);
                display.viewportChange(0, 0, new_w, new_h);
            }
        },

        // Toggle/set/unset the viewport drag/move button
        setViewDrag: function(drag) {
          //  var vmb = $D('noVNC_view_drag_button');
            if (!UI.rfb) { return; }

            if (UI.rfb_state === 'normal' &&
                UI.rfb.get_display().get_viewport()) {
               // vmb.style.display = "inline";
            } else {
              //  vmb.style.display = "none";
            }

            if (typeof(drag) === "undefined" ||
                typeof(drag) === "object") {
                // If not specified, then toggle
                drag = !UI.rfb.get_viewportDrag();
            }
            if (drag) {
              //  vmb.className = "noVNC_status_button_selected";
                UI.rfb.set_viewportDrag(true);
            } else {
             //   vmb.className = "noVNC_status_button";
                UI.rfb.set_viewportDrag(false);
            }
        },



        // When normal keyboard events are left uncought, use the input events from
        // the keyboardinput element instead and generate the corresponding key events.
        // This code is required since some browsers on Android are inconsistent in
        // sending keyCodes in the normal keyboard events when using on screen keyboards.
        keyInput: function(event) {
            var newValue = event.target.value;
            var oldValue = UI.lastKeyboardinput;

            var newLen;
            try {
                // Try to check caret position since whitespace at the end
                // will not be considered by value.length in some browsers
                newLen = Math.max(event.target.selectionStart, newValue.length);
            } catch (err) {
                // selectionStart is undefined in Google Chrome
                newLen = newValue.length;
            }
            var oldLen = oldValue.length;

            var backspaces;
            var inputs = newLen - oldLen;
            if (inputs < 0) {
                backspaces = -inputs;
            } else {
                backspaces = 0;
            }

            // Compare the old string with the new to account for
            // text-corrections or other input that modify existing text
            var i;
            for (i = 0; i < Math.min(oldLen, newLen); i++) {
                if (newValue.charAt(i) != oldValue.charAt(i)) {
                    inputs = newLen - i;
                    backspaces = oldLen - i;
                    break;
                }
            }

            // Send the key events
            for (i = 0; i < backspaces; i++) {
                UI.rfb.sendKey(XK_BackSpace);
            }
            for (i = newLen - inputs; i < newLen; i++) {
                UI.rfb.sendKey(newValue.charCodeAt(i));
            }

            // Control the text content length in the keyboardinput element
            if (newLen > 2 * UI.defaultKeyboardinputLen) {
             //   UI.keyboardinputReset();
            } else if (newLen < 1) {
                // There always have to be some text in the keyboardinput
                // element with which backspace can interact.
            //    UI.keyboardinputReset();
                // This sometimes causes the keyboard to disappear for a second
                // but it is required for the android keyboard to recognize that
                // text has been added to the field
                event.target.blur();
                // This has to be ran outside of the input handler in order to work
                setTimeout(function() { UI.keepKeyboard(); }, 0);
            } else {
                UI.lastKeyboardinput = newValue;
            }
        },

        keyInputBlur: function() {
           // $D('showKeyboard').className = "noVNC_status_button";
            //Weird bug in iOS if you change keyboardVisible
            //here it does not actually occur so next time
            //you click keyboard icon it doesnt work.
            UI.hideKeyboardTimeout = setTimeout(function() { UI.setKeyboard(); },100);
        },

        showExtraKeys: function() {
            UI.keepKeyboard();
            if(UI.extraKeysVisible === false) {
               /* $D('toggleCtrlButton').style.display = "inline";
                $D('toggleAltButton').style.display = "inline";
                $D('sendTabButton').style.display = "inline";
                $D('sendEscButton').style.display = "inline";
                $D('showExtraKeysButton').className = "noVNC_status_button_selected";*/
                UI.extraKeysVisible = true;
            } else if(UI.extraKeysVisible === true) {
             /*   $D('toggleCtrlButton').style.display = "";
                 $D('toggleAltButton').style.display = "";
                 $D('sendTabButton').style.display = "";
                 $D('sendEscButton').style.display = "";
                 $D('showExtraKeysButton').className = "noVNC_status_button";*/
                UI.extraKeysVisible = false;
            }
        },

        toggleCtrl: function() {
            UI.keepKeyboard();
            if(UI.ctrlOn === false) {
                UI.rfb.sendKey(XK_Control_L, true);
              //  $D('toggleCtrlButton').className = "noVNC_status_button_selected";
                UI.ctrlOn = true;
            } else if(UI.ctrlOn === true) {
                UI.rfb.sendKey(XK_Control_L, false);
             //   $D('toggleCtrlButton').className = "noVNC_status_button";
                UI.ctrlOn = false;
            }
        },

        toggleAlt: function() {
            UI.keepKeyboard();
            if(UI.altOn === false) {
                UI.rfb.sendKey(XK_Alt_L, true);
            //    $D('toggleAltButton').className = "noVNC_status_button_selected";
                UI.altOn = true;
            } else if(UI.altOn === true) {
                UI.rfb.sendKey(XK_Alt_L, false);
            //    $D('toggleAltButton').className = "noVNC_status_button";
                UI.altOn = false;
            }
        },

        sendTab: function() {
         //   UI.keepKeyboard();
            UI.rfb.sendKey(XK_Tab);
        },

        sendEsc: function() {
         //   UI.keepKeyboard();
            UI.rfb.sendKey(XK_Escape);
        },

        setKeyboard: function() {
            UI.keyboardVisible = false;
        },

        // iOS < Version 5 does not support position fixed. Javascript workaround:
        setOnscroll: function() {
            window.onscroll = function() {
                UI.setBarPosition();
            };
        },

        setResize: function () {
            window.onResize = function() {
                UI.setBarPosition();
            };
        },

        //Helper to add options to dropdown.
        addOption: function(selectbox, text, value) {
            var optn = document.createElement("OPTION");
            optn.text = text;
            optn.value = value;
            selectbox.options.add(optn);
        },

        setBarPosition: function() {
        //    $D('noVNC-control-bar').style.top = (window.pageYOffset) + 'px';
        //    $D('noVNC_mobile_buttons').style.left = (window.pageXOffset) + 'px';

          //  var vncwidth = $D('noVNC_screen').style.offsetWidth;
          //  $D('noVNC-control-bar').style.width = vncwidth + 'px';
        }

    };
})();
