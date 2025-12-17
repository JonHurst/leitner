let SAVE_ID = "flashcard_v6" +
    (window.URL.parse(document.URL)?.pathname || "_default");
let BATCH_SIZE = 10;


function init(ids, clean, draw_func) {
    let saved_cards;
    if(!clean) {
        let json_str = window?.localStorage?.getItem(SAVE_ID);
        if(json_str) {
            saved_cards = new Map(JSON.parse(json_str));
        }
    }
    let cards = new Map();
    let c = 0;
    for(let id of ids) {
        if(saved_cards?.has(id)) {
            cards.set(id, saved_cards.get(id));
        }
        else {
            cards.set(id, {
                counter: 2 * Math.floor(c++ / BATCH_SIZE),
                increment: 1
            });
        }
    }
    return update.bind(null, cardOps(cards), draw_func);
}


function update(card_op, draw, msg) {
    let curr;
    let state;
    switch(msg?.type) {

    case "next":
        curr = card_op.next();
        state = "redacted";
        break;

    case "reveal":
        curr = card_op.current();
        state = "revealed";
        break;

    case "mark":  // {type: "mark", correct: true/false}
        curr = card_op.mark(msg.correct);
        state = msg.correct ? "correct" : "incorrect";
        break;
    }
    draw(curr.id, state, curr.status);
};


function cardOps(cards) {
    let iter = cards.entries();
    let current_id;
    function save() {
        window?.localStorage?.setItem(
            SAVE_ID,
            JSON.stringify([...cards.entries()]));
    };
    return {
        current() {
            return {id: current_id, status: status(cards)};
        },
        next() {
            while(true) {
                let res = iter.next();
                if(res.done) {
                    iter = cards.entries();
                    res = iter.next();
                }
                if(res.value[1].counter == 0) {
                    current_id = res.value[0];
                    break;
                }
                res.value[1].counter--;
            }
            save();
            return {id: current_id, status: status(cards)};
        },
        mark(correct) {
            let state = cards.get(current_id);
            state.increment = correct ?
                Math.min(state.increment * 2, 16) :
                Math.max(state.increment / 4, 1);
            state.counter = state.increment - 1;
            save();
            return {id: current_id, status: status(cards)};
        }
    };
}


function status(cards) {
    let counts = new Map([[1, 0], [2, 0], [4, 0], [8, 0], [16, 0]]);
    for(let [key, val] of cards) {
        counts.set(val.increment, counts.get(val.increment) + 1);
    }
    return [...counts.values()].join(" ");
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

export {init, shuffled};
