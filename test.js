import {init, update, _TESTING as $} from "./leitner.js";
let assert = chai.assert;

// mocks

let draw_parameters;

function draw(id, redact, status) {
    console.log(`Draw called with (${id}, ${redact}, ${status})`);
    draw_parameters = {id, redact, status};
};

$.set_shuffled(a => [...a]);

// tests

describe("Initialisation", function() {

    it("Initialise three ids", function() {
        init(["id1", "id2", "id3"], true, draw);
        console.log($.get_state());
        assert.deepEqual(
            $.get_state(),
            {
                active: ["id1", "id2"],
                cards: new Map([
                    ["id1", "current"],
                    ["id2", "current"],
                    ["id3", "current"]
                ]),
                current_id: "id3",
                draw: draw,
                redact: true,
                session: 0
            }
        );
        assert.deepEqual(
            draw_parameters,
            {
                id: "id3",
                redact: true,
                status: { new: 0, current: 3, boxed: 0}
            }
        );
    });

    it("Initialise fifteen ids", function() {
        let ids = [];
        for(let c = 0; c < 15; c++) {
            ids.push(`id_${c}`);
        }
        init(ids, true, draw);
        assert.deepEqual(
            draw_parameters,
            {
                id: "id_9",
                redact: true,
                status: { new: 5, current: 10, boxed: 0}
            }
        );
    });
});


describe("Redact Management", function() {

    it("Correct calling of draw after redact message sent", function() {
        init(["id1", "id2", "id3"], true, draw);
        assert.deepEqual(
            draw_parameters,
            {
                id: "id3",
                redact: true,
                status: { new: 0, current: 3, boxed: 0}
            }
        );
        update({type: "reveal"});
        assert.deepEqual(
            draw_parameters,
            {
                id: "id3",
                redact: false,
                status: { new: 0, current: 3, boxed: 0}
            }
        );
    });
});


describe("Marking", function() {

    it("Correct behaviour in response to mark messages", function() {
        init(["id1", "id2", "id3"], true, draw);
        update({type: "mark", correct: true});
        console.log($.get_state());
    });

});
