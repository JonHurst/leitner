let SAVE_ID = "flashcard_v6" +
    (window.URL.parse(document.URL)?.pathname || "_default");
let BATCH_SIZE = 10;


function next_card() {};
function draw(id, redact, status) {}


let update = (function() {
    let current;
    return (msg) => {
        let redact = true;
        switch(msg?.type) {

        case "init":
            current = next_card();
            break;

        case "reveal":
            redact = false;
            break;

        case "mark":  // {"mark", correct: bool}
            current = next_card(msg.correct);
            break;
        }
        draw(current.id, redact, current.status);
    };
})();


function init(ids, clean, draw_func) {
    draw = draw_func;
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
    // create card iterator
    let iter = card_iterator(cards);
    next_card = (correct) => iter.next(correct).value;
    // display first card
    update({type: "init"});
}


function status(cards) {
    let counts = new Map([[1, 0], [2, 0], [4, 0], [8, 0], [16, 0]]);
    for(let [key, val] of cards) {
        counts.set(val.increment, counts.get(val.increment) + 1);
    }
    return [...counts.values()].join(" ");
}


function* card_iterator(cards) {
    while(true) {
        for(let [key, val] of cards) {
            if(val.counter == 0) {
                const res = yield {id: key, status: status(cards)};
                val.counter = val.increment =  res ?
                    Math.min(val.increment * 2, 16) :
                    Math.max(val.increment / 4, 1);
                window?.localStorage?.setItem(
                    SAVE_ID,
                    JSON.stringify([...cards.entries()]));
            }
        }
        cards.values().forEach(v => v.counter--);
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

export {init, update, shuffled};
