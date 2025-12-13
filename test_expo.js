import {init, update, _TESTING as $} from "./expo.js";
let assert = chai.assert;

// mocks

let draw_parameters;

function draw(id, redact, status) {
    console.log(`Draw called with (${id}, ${redact}, ${status})`);
    draw_parameters = {id, redact, status};
};


// tests

describe("Initialisation", function() {

    it("Initialise three ids", function() {
        init(["id1", "id2", "id3"], true, draw);
        assert.deepEqual(
            $.get_state(),
            {
                cards: new Map([
                    ["id1", {counter: 0, increment: 1}],
                    ["id2", {counter: 0, increment: 1}],
                    ["id3", {counter: 0, increment: 1}]
                ]),
                draw: draw,
                redact: true,
                current_id: "id1",
                slice: 10
            }
        );
        assert.deepEqual(
            draw_parameters,
            {
                id: "id1",
                redact: true,
                status: {}
            }
        );
    });


    it("Initialise from storage", function() {
        init(["id1", "id2", "id3"], true, draw);
        update({type: "mark", correct: true});
        init(["id1", "id2", "id3"], false, draw);
        assert.deepEqual($.get_state().cards.get("id1"), {counter: 2, increment: 2});
        init(["id2", "id3", "id4"], false, draw);
        assert.isFalse($.get_state().cards.has("id1"));
        assert.deepEqual($.get_state().cards.get("id4"), {counter: 0, increment: 1});
    });
});


describe("Redact Management", function() {

    it("Correct calling of draw after redact message sent", function() {
        init(["id1", "id2", "id3"], true, draw);
        assert.deepEqual(
            draw_parameters,
            {
                id: "id1",
                redact: true,
                status: {}
            }
        );
        update({type: "reveal"});
        assert.deepEqual(
            draw_parameters,
            {
                id: "id1",
                redact: false,
                status: {}
            }
        );
    });
});


describe("Marking", function() {

    it("Correct behaviour in response to mark messages", function() {
        init(["id1", "id2", "id3"], true, draw);
        update({type: "mark", correct: true});
        assert.deepEqual($.get_state().cards.get("id1"), {counter: 2, increment: 2});
        update({type: "mark", correct: false});
        assert.deepEqual($.get_state().cards.get("id2"), {counter: 1, increment: 1});
        assert.deepEqual($.get_state().cards.get("id3"), {counter: 0, increment: 1});
        update({type: "mark", correct: false});
        assert.deepEqual($.get_state().cards.get("id2"), {counter: 0, increment: 1});
        assert.deepEqual($.get_state().cards.get("id3"), {counter: 0, increment: 1});
    });

});
