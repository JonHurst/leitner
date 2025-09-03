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

    it("Initialise from storage", function() {
        init(["id1", "id2", "id3"], true, draw);
        update({type: "mark", correct: true});
        init(["id1", "id2", "id3"], false, draw);
        assert.equal($.get_state().cards.get("id3"), 0);
        init(["id2", "id3", "id4"], false, draw);
        assert.equal($.get_state().cards.get("id3"), 0);
        assert.isFalse($.get_state().cards.has("id1"));
        assert.equal($.get_state().cards.get("id4"), "current");
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
        // move id3 to box 0
        update({type: "mark", correct: true});
        assert.equal($.get_state().cards.get("id3"), 0);
        // id1 and id2 stay in current
        update({type: "mark", correct: false});
        update({type: "mark", correct: false});
        assert.equal($.get_state().cards.get("id1"), "current");
        assert.equal($.get_state().cards.get("id2"), "current");
        // session should now be 1, and should be drawing id2
        assert.equal($.get_state().session, 1);
        assert.equal(draw_parameters.id, "id2");
        // move id2 to box 1
        update({type: "mark", correct: true});
        // id1 stays in current
        update({type: "mark", correct: false});
        // session should now be 2, which includes box 0, so should be
        // drawing id3
        assert.equal(draw_parameters.id, "id3");
        // move id3 to current
        update({type: "mark", correct: false});
        assert.equal($.get_state().cards.get("id3"), "current");
        // should be drawing id1
        assert.equal(draw_parameters.id, "id1");
        // move id1 to box 2
        update({type: "mark", correct: true});
        assert.equal($.get_state().cards.get("id1"), 2);
    });

    it("Card exhaustion", function() {
        init(["id1", "id2", "id3"], true, draw);
        for(let c = 0; c < 11; c++) {
            update({type: "mark", correct: true});
        }
        assert.deepEqual($.get_state().cards, new Map([["id1", 0]]));
        assert.equal(draw_parameters.id, "id1");
        update({type: "mark", correct: true});
        assert.isNull(draw_parameters.id);
    });
});
