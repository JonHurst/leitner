let BATCH_SIZE = 10;


function save_id() {
    return "flashcard_v6" +
        (window.URL.parse(document.URL)?.pathname || "_default");
}


function init(ids, clean, draw_func) {
    let saved_cards;
    if(!clean) {
        let json_str = window?.localStorage?.getItem(save_id());
        if(json_str) {
            saved_cards = new Map(JSON.parse(json_str));
        }
    }
    let cards = new Map();
    for(let id of ids) {
        cards.set(id, saved_cards?.has(id) ?
                  saved_cards.get(id) :
                  {counter: 1, increment: 1});
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
    let new_ = 0;
    let current_id;
    function save() {
        window?.localStorage?.setItem(
            save_id(),
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
                    cards.values().forEach(v => v.counter--);
                    iter = cards.entries();
                    new_ = 0;
                } else if(res.value[1].counter == 0) {
                    res.value[1].counter = 1;
                    // take at most BATCH_SIZE new cards per round
                    if(res.value[1].increment == 1 && ++new_ > BATCH_SIZE)
                        continue;
                    current_id = res.value[0];
                    break;
                }
            }
            save();
            return {id: current_id, status: status(cards)};
        },
        mark(correct) {
            let state = cards.get(current_id);
            state.increment = correct ?
                Math.min(state.increment * 2, 16) :
                Math.max(state.increment / 4, 1);
            state.counter = state.increment;
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


export {init};
