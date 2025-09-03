const SESSION_BOXES = [
    [1, "current", 0, 5, 8],
    [2, "current", 1, 6, 9],
    [3, "current", 2, 7, 0],
    [4, "current", 3, 8, 1],
    [5, "current", 4, 9, 2],
    [6, "current", 5, 0, 3],
    [7, "current", 6, 1, 4],
    [8, "current", 7, 2, 5],
    [9, "current", 8, 3, 6],
    [0, "current", 9, 4, 7]
];

let SAVE_ID = "flashcard_v3" +
    (window.URL.parse(document.URL)?.pathname || "_default");

let state = {session: -1, cards: new Map(), draw: null};


let ID = e => document.getElementById(e);


function init(ids, clean, draw_func) {
    state = { session: -1, cards: new Map()};
    ids = new Set(ids);
    if(clean) {
        window?.localStorage.removeItem(SAVE_ID);
    }
    else {
        let json_str = window?.localStorage?.getItem(SAVE_ID);
        if(json_str) {
            let json = JSON.parse(json_str);
            state = {session: json.session, cards: new Map(json.cards)};
        }
    }
    for(let [key, val] of state.cards) {
        if(!ids.has(key)) state.cards.delete(key);
    }
    for(let id of ids) {
        if(!state.cards.has(id)){
            state.cards.set(id, "new");
        }
    }
    state.draw = draw_func;
    state.current_id = next_card(state);
    update();
}


function next_card(state) {
    if(!state.cards.size) return null;
    if(state?.active?.length) {
        state.redact = true;
        return state.active.pop();
    } else {
        state.session = (state.session + 1) % 10;
        state.active = new_session(state);
        return next_card(state);
    }
}


function shuffled(a) {
    let s = [...a];
    let cur = s.length;
    while (cur !== 0) {
        let rand = Math.floor(Math.random() * cur);
        cur--;
        let temp = s[cur];
        s[cur] = s[rand];
        s[rand] = temp;
    }
    return s;
}

function new_session(state) {
    // move "new" to "current" to get 10 in "current" if possible
    let current = [...state.cards].filter(e => e[1] == "current").length;
    for(let [k, v] of state.cards) {
        if(current >= 10) break;
        if(v == "new") {
            state.cards.set(k, "current");
            current++;
        }
    }
    // build array
    let session_ids = [];
    const session_boxes = SESSION_BOXES[state.session];
    for(let [key, value] of state.cards) {
        if(session_boxes.includes(value)) {
            session_ids.push(key);
        }
    }
    return shuffled(session_ids);
}


function dump_state(state) {
    console.log("Session: ", state.session);
    console.log(state);
}



function update(msg) {
    switch(msg?.type) {

    case "reveal":
        state.redact = false;
        break;

    case "mark":  // {"mark", correct: bool}
        if(state.current_id === null) break;  // shouldn't happen
        if(msg.correct) {
            if(state.cards.get(state.current_id) == "current") {
                state.cards.set(state.current_id, state.session);
            }
            else if(state.cards.get(state.current_id) ==
                    SESSION_BOXES[state.session][0]) {
                state.cards.delete(state.current_id);
            }
        }
        else {  // incorrect
            state.cards.set(state.current_id, "current");
        }
        state.current_id = next_card(state);
        break;
    }

    let [n_new, n_current] = ["new", "current"].map(t =>
        [...state.cards].filter(e => e[1] == t).length);
    const status = {
        new: n_new,
        current: n_current,
        boxed: state.cards.size - n_new - n_current
    };
    if(state.draw) {
        state.draw(state.current_id, state.redact, status);
    }
    let json_str = JSON.stringify({
        session: state.session,
        cards: [...state.cards.entries()]
    });
    window?.localStorage?.setItem(SAVE_ID, json_str);
}


// for testing

const _TESTING = {
    new_session,
    next_card,
    get_state: () => state,
    set_shuffled: (func) => {shuffled = func;}
};

//
export {init, update, _TESTING};
