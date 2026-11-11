/*
Valid from Ver4.50 onward
This file configures the key configuration for TyranoScript.
You can assign TyranoScript actions (such as starting skip mode) to specific keyboard, mouse, or gesture operations.

<Configurable Actions>
    
    next        : Proceed to the next text
    auto        : Start/stop auto mode
    skip        : Start/stop skip mode
    holdskip    : Skip only while holding down a key or button
    hidemessage : Toggle the display of the message window
    fullscreen  : Toggle fullscreen mode
    save        : Open the save screen
    load        : Open the load screen
    menu        : Open/close the menu screen
    title       : Return to the title
    backlog     : Open the backlog
    qsave       : Execute quick save
    qload       : Execute quick load
    focus_index : Focus a specific numbered button (an index must be specified)
    focus_next  : Move focus to the next button
    focus_prev  : Move focus to the previous button
    focus_up    : Move focus upward
    focus_down  : Move focus downward
    focus_left  : Move focus to the left
    focus_right : Move focus to the right
    scroll_up   : Scroll up
    scroll_down : Scroll down
    close       : Close the menu
    ok          : General confirmation actions (※1)
    cancel      : General cancel actions (※2)
    sleepgame   : Execute [sleepgame] (see details below)
    
    ※1: Proceed to the next text, click the OK button on a confirmation window,
         click the virtual mouse, click the button that is focused, etc.
    
    ※2: Remove focus from a button, cancel a confirmation window,
         close the menu, or cancel auto/skip modes.
    
    
    ★ Actions for keyboard operations only
    
    default      : Execute the browser’s default action when that key is pressed
    default_debug: Execute the browser’s default action only when Config.tjs’s debugMenu is true
    vmouse_up    : Move the virtual mouse cursor upward
    vmouse_down  : Move the virtual mouse cursor downward
    vmouse_left  : Move the virtual mouse cursor to the left
    vmouse_right : Move the virtual mouse cursor to the right
    
    
    ★ The -a Option
    
    By appending " -a" (with a preceding space) after the action name, the action becomes an always action.
    Always actions can be used even when key configuration is disabled via [stop_keyconfig].
    
    (Example)
    
    32: "focus_next -a",
    
    
    ★ The -h Option
    
    This option is effective only for actions assigned to the keyboard or gamepad.
    Adding the -h option makes the action a hold action,
    meaning that holding down a key or button is interpreted as repeated input (hold-repeat).
    You can also specify a delay parameter to set the delay before the hold-repeat begins.
    
    (Example)
    
    UP: "scroll_up -h delay=300",
    
    
    ★ About sleepgame
    
    You can trigger [sleepgame] via the key configuration.
    Specify it as follows:
    
    sleepgame storage=config.ks target=start
    
    (The label (target=...) is optional. For example: sleepgame storage=config.ks)
    
    
    ★ Directly Specifying a Function
    
    Instead of the keywords above, you can specify a JavaScript function.
    
    (Example)
    
    "Enter": function () {
        alert("Hello!")
    },
    
    
    ★ Specifying Multiple Actions
    
    You can list multiple actions separated by commas.
    If multiple actions are specified, the first action that can be executed is performed.
    
    (Example)
    
    "Enter": "close, next",
    
    In this case, if the close action is executable, only close is executed.
    If close cannot be executed, then next is performed.
    
    ※ Note: If a comma is included in an action name, it is interpreted as multiple actions.
         Therefore, commas cannot be used unless you intend to specify multiple actions.
    
    
    
<Specifying Keyboard Operations> 
    
    
    ★ Specifying by Key Type
    
    You can configure key settings by mapping a "key type" to its corresponding "action" as follows.
    
    (Example)
    
    key: {
        " "         : "hidemessage",
        "Enter"     : "next",
    },
    
    
    ★ Specifying by Key Code (Traditional Method)
    
    Instead of a key type, you can also define using a key code.
    For example, the following specification is equivalent to the above.
    
    (Example using key codes)
    
    key: {
        "32" : "hidemessage",
        "13" : "next",
    },
    
    
    ★ Hint
    
    You can check the key type or key code by pressing a key at the following site:
    https://ogihara88sai.github.io/display-keydown-event/
    (On the site, the displayed "key" is the key type and "keyCode" is the key code.)
    
    
    
<Mouse Operations>
    
    You can configure key settings by mapping a "keyword representing a mouse operation" to its corresponding "action".
    
    
    ★ List of Keywords for Mouse Operations
    
    right      : Action when the right mouse button is pressed
    center     : Action when the center mouse button (wheel) is pressed
    wheel_up   : Action when the mouse wheel is scrolled up
    wheel_down : Action when the mouse wheel is scrolled down
    next       : Action when the mouse "forward" button is pressed
    prev       : Action when the mouse "back" button is pressed
    right_swipe_up     : Action when holding the right mouse button and moving upward
    right_swipe_down   : Action when holding the right mouse button and moving downward
    right_swipe_left   : Action when holding the right mouse button and moving leftward
    right_swipe_right  : Action when holding the right mouse button and moving rightward
    center_swipe_up    : Action when holding the center mouse button (wheel) and moving upward
    center_swipe_down  : Action when holding the center mouse button (wheel) and moving downward
    center_swipe_left  : Action when holding the center mouse button (wheel) and moving leftward
    center_swipe_right : Action when holding the center mouse button (wheel) and moving rightward
    prev_swipe_up      : Action when holding the "back" mouse button and moving upward
    prev_swipe_down    : Action when holding the "back" mouse button and moving downward
    prev_swipe_left    : Action when holding the "back" mouse button and moving leftward
    prev_swipe_right   : Action when holding the "back" mouse button and moving rightward
    next_swipe_up      : Action when holding the "forward" mouse button and moving upward
    next_swipe_down    : Action when holding the "forward" mouse button and moving downward
    next_swipe_left    : Action when holding the "forward" mouse button and moving leftward
    next_swipe_right   : Action when holding the "forward" mouse button and moving rightward
    
    
<Gesture Operations>
    
    You can assign key configurations to swipe or hold operations on smartphones and tablets.
    
    
    ★ List of Keywords for Gestures
    
    swipe_up_1    : Action when swiped upward with one finger
    swipe_left_1  : Action when swiped leftward with one finger
    swipe_right_1 : Action when swiped rightward with one finger
    swipe_down_1  : Action when swiped downward with one finger
    
    hold          : Action when the screen is touched and held for a certain time
    
    mash_right_2  : Action when double-tapping the right edge of the screen
    mash_right_3  : Action when triple-tapping the right edge of the screen
    mash_left_2   : Action when double-tapping the left edge of the screen
    mash_left_3   : Action when triple-tapping the left edge of the screen
    
    
    ★ Hint
    
    The suffix _1 (as in swipe_up_1) indicates the number of fingers.
    For example, swipe_up_1 means "action when swiped upward with one finger".
    
    To specify an action for a two-finger swipe, define an action with a name like swipe_up_2.
    
    
    
<Gamepad Operations>


    ★ Buttons
    
    There are two ways to set up gamepad button configurations. Both methods are acceptable and can be mixed.
    
    (1) Map "keywords representing buttons" such as A, LEFT, START, etc., to their corresponding "actions".
    
    The available keywords for buttons are as follows:
    
    A      : A button (bottom button in the right area)
    B      : B button (right button in the right area)
    X      : X button (left button in the right area)
    Y      : Y button (top button in the right area)
    LB     : Left bumper (L button, the one on the front)
    LT     : Left trigger (ZL button, the one on the back)
    RB     : Right bumper (R button, the one on the front)
    RT     : Right trigger (ZR button, the one on the back)
    START  : Start button (right button in the center area)
    SELECT : Select button (left button in the center area)
    HOME   : Home button (center button in the center area)
    LS     : Left stick pressed
    RS     : Right stick pressed
    UP     : D-pad up
    DOWN   : D-pad down
    LEFT   : D-pad left
    RIGHT  : D-pad right
    
    ※ It is assumed that the gamepad’s button layout is the same as that of a standard Xbox controller.
    ※ Note that on Nintendo controllers, the positions of A and B, and X and Y, are reversed.
    
    (Example)
    
    gamepad: {
        button: {
            B: "next",
        },
        ...
    
    
    (2) Map the numerical value corresponding to a button (e.g., 0, 1, 2) to an action.
    
    For example, on a standard Xbox controller, B = 0 and A = 1.
    Each button has a corresponding numerical value.
    You can define the key configuration using those numbers.
    
    (Example)
    
    gamepad: {
        button: {
            1: "next",
        },
        ...
    
    
    ★ Digital Input for Sticks
    
    You can interpret analog stick operations as digital up/down/left/right inputs
    and assign actions corresponding to those directions.
    
    (Example)
    
    gamepad: {
        ...
        stick_digital: {
            L_UP: "",
            L_DOWN: "",
            L_LEFT: "",
            L_RIGHT: "",
            R_UP: "vmouse_wheelup -a -h",
            R_DOWN: "vmouse_wheeldown -a -h",
            R_LEFT: "",
            R_RIGHT: "",
        },
        ...
    
    
    ★ Stick Input
    
    You can assign virtual mouse cursor operations to stick input.
    You can specify either "vmouse_move" or "vmouse_aim".
    
    vmouse_move : Moves the virtual mouse cursor relatively (this is the default).
    vmouse_aim  : Moves the virtual mouse cursor to an absolute position on the screen
                  corresponding to the stick’s angle and tilt.
    
    (Example)

    stick: {
        L: "vmouse_move",
        R: "",
    }

*/

window.__tyrano_key_config = {
    
    // ◆ system_key_event
    //
    // Whether to allow the browser’s default actions when various keys are pressed.
    // (e.g. refresh with F5, open developer tools with F12, etc.)
    //
    // "true"  : Allow all default browser actions.
    // "false" : Disable all default browser actions.
    // "debug" : Allow all default browser actions only if Config.tjs’s debugMenu.visible is true.
    //
    // Even if "false" or "debug" is specified here, you can allow default browser actions
    // for individual keys by assigning the "default" or "default_debug" action.
    //
    // Note: Due to browser limitations, some default actions cannot be disabled from TyranoScript.
    // (Example of an action that cannot be disabled: Ctrl + W closes the tab)
    //
    // Disable browser’s default actions.
    system_key_event: "false",
    
    // ◆ system_mouse_event
    // Whether to allow page navigation when pressing the mouse’s forward or back buttons.
    // "true"  : Allow
    // "false" : Disable
    system_mouse_event: "false",

    // Keyboard operations
    key: {
        
        "Enter"      : "ok     -a",
        "Escape"     : "cancel -a",
        " "          : "hidemessage",
        "Meta"       : "holdskip", // For Mac: the Command key
        "Control"    : "holdskip",
        "m"          : "menu",
        
        // Allow virtual mouse cursor control with w, a, s, d
        "w"          : "vmouse_up    -a -h",
        "s"          : "vmouse_down  -a -h",
        "a"          : "vmouse_left  -a -h",
        "d"          : "vmouse_right -a -h",
        
        // Enable button focus using the Tab key
        "Tab"        : "focus_next -a",
        
        // Move button focus using arrow keys (up, down, left, right)
        "ArrowUp"    : "focus_up    -a -h delay=300",
        "ArrowDown"  : "focus_down  -a -h delay=300",
        "ArrowLeft"  : "focus_left  -a -h delay=300",
        "ArrowRight" : "focus_right -a -h delay=300",
        
        // Scroll the backlog using PageUp and PageDown
        "PageUp"     : "scroll_up",
        "PageDown"   : "scroll_down",
        
        // Focus specific buttons using number keys
        "1"          : "focus_index -a index=1",
        "2"          : "focus_index -a index=2",
        "3"          : "focus_index -a index=3",
        "4"          : "focus_index -a index=4",
        "5"          : "focus_index -a index=5",
        "6"          : "focus_index -a index=6",
        "7"          : "focus_index -a index=7",
        "8"          : "focus_index -a index=8",
        "9"          : "focus_index -a index=9",
        
        // Enable F12 default action (opening developer tools) only if debugMenu.visible is true
        "F12"        : "default_debug",
        
    },

    // Mouse operations
    mouse: {
        
        "right"      : "hidemessage",
        "center"     : "menu",
        "wheel_up"   : "backlog",
        "wheel_down" : "next",
        "next"       : "holdskip",
        "prev"       : "auto",
        
        "right_swipe_up"     : "",
        "right_swipe_down"   : "",
        "right_swipe_left"   : "",
        "right_swipe_right"  : "",
        "center_swipe_up"    : "",
        "center_swipe_down"  : "",
        "center_swipe_left"  : "",
        "center_swipe_right" : "",
        "prev_swipe_up"      : "",
        "prev_swipe_down"    : "",
        "prev_swipe_left"    : "",
        "prev_swipe_right"   : "",
        "next_swipe_up"      : "",
        "next_swipe_down"    : "",
        "next_swipe_left"    : "",
        "next_swipe_right"   : "",
        
    },

    // Smartphone/Tablet gesture operations
    gesture: {
        
        "swipe_up_1"    : "backlog",
        "swipe_down_1"  : "load",
        "swipe_left_1"  : "auto",
        "swipe_right_1" : "menu",
        "hold"          : "holdskip",
        
        // Double-tap or triple-tap on the right edge of the screen
        "mash_right_2"  : "auto",
        "mash_right_3"  : "skip",
        
        // Double-tap or triple-tap on the left edge of the screen
        "mash_left_2"  : "",
        "mash_left_3"  : "",
        
    
    },
    
    // Gamepad operations
    gamepad: {
        
        button: {
        
            A       : "cancel -a",
            B       : "ok     -a",
            X       : "auto",
            Y       : "backlog",
            LB      : "save",
            LT      : "load",
            RB      : "skip",
            RT      : "holdskip",
            START   : "menu",
            SELECT  : "",
            HOME    : "title",
            LS      : "",
            RS      : "",
            UP      : "focus_up    -a -h delay=300",
            DOWN    : "focus_down  -a -h delay=300",
            LEFT    : "focus_left  -a -h delay=300",
            RIGHT   : "focus_right -a -h delay=300",
        
        },
        
        stick_digital: {
            
            L_UP    : "",
            L_DOWN  : "",
            L_LEFT  : "",
            L_RIGHT : "",
            R_UP    : "vmouse_wheelup   -a -h",
            R_DOWN  : "vmouse_wheeldown -a -h",
            R_LEFT  : "",
            R_RIGHT : "",
            
        },
        
        stick: {
            
            L       : "vmouse_move",
            R       : "",
        
        }
    },
};
