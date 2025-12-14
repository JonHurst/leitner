let SAVE_ID = "flashcard_v5" +
    (window.URL.parse(document.URL)?.pathname || "_default");
let BATCH_SIZE = 10;

let state = {};
function draw(id, redact, status) {}


function init(ids, clean, draw_func) {
    draw = draw_func;
    let saved_cards;
    if(!clean) {
        let json_str = window?.localStorage?.getItem(SAVE_ID);
        if(json_str) {
            let json = JSON.parse(json_str);
            saved_cards = new Map(json.cards);
        }
    }
    state.cards = new Map();
    let c = 0;
    for(let id of ids) {
        if(saved_cards?.has(id)) {
            state.cards.set(id, saved_cards.get(id));
        }
        else {
            state.cards.set(id, {
                counter: Math.floor(c++ / BATCH_SIZE),
                increment: 1
            });
        }
    }
    update({type: "init"});
}


function next_card() {
    while(true) {
        for(let [key, val] of state.cards) {
            if(val.counter == 0) {
                return key;
            }
        }
        // if no counters are at zero, subtract 1 from all counters and retry
        for(let [key, val] of state.cards) {
            state.cards.set(
                key,
                {
                    counter: val.counter - 1,
                    increment: val.increment
                });
        }
    }
}


function update(msg) {
    switch(msg?.type) {

    case "init":
        state.redact = true;
        state.current_id = next_card();
        break;

    case "reveal":
        state.redact = false;
        break;

    case "mark":  // {"mark", correct: bool}
        let current = state.cards.get(state.current_id);
        let new_increment = msg.correct ?
            Math.min(current.increment * 2, 16) :
            Math.max(current.increment / 2, 1);
        state.cards.set(
            state.current_id,
            {
                counter: new_increment,
                increment: new_increment
            });
        state.redact = true;
        state.current_id = next_card();
        break;
    }
    let status = [];
    for(let c of [1, 2, 4, 8, 16]) {
        status.push([...state.cards.values().filter(v => v.increment == c)].length);
    }
    draw(state.current_id, state.redact, status);
    let json_str = JSON.stringify({
        cards: [...state.cards.entries()]
    });
    window?.localStorage?.setItem(SAVE_ID, json_str);
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


// for testing

const _TESTING = {
    get_state: () => state,
};

//
export {init, update, shuffled, _TESTING};
