import {init} from "./expo.js";
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
        let update = init(["id1", "id2", "id3"], true, draw);
        update({type: "start"});
        assert.deepEqual(
            draw_parameters,
            {
                id: "id1",
                redact: true,
                status: "3 0 0 0 0"
            }
        );
    });


    // it("Initialise fifteen ids", function() {
    //     let ids = [];
    //     for(let c = 0; c < 15; c++) {
    //         ids.push(`id_${c}`);
    //     }
    //     init(ids, true, draw);
    //     assert.deepEqual($.get_state().cards.get("id_9"), {counter: 0, increment: 1});
    //     assert.deepEqual($.get_state().cards.get("id_10"), {counter: 1, increment: 1});
    // });


    // it("Initialise from storage", function() {
    //     init(["id1", "id2", "id3"], true, draw);
    //     update({type: "mark", correct: true});
    //     init(["id1", "id2", "id3"], false, draw);
    //     assert.deepEqual($.get_state().cards.get("id1"), {counter: 2, increment: 2});
    //     init(["id2", "id3", "id4"], false, draw);
    //     assert.isFalse($.get_state().cards.has("id1"));
    //     assert.deepEqual($.get_state().cards.get("id4"), {counter: 0, increment: 1});
    // });
});


describe("Redact Management", function() {

    it("Correct calling of draw after redact message sent", function() {
        let update = init(["id1", "id2", "id3"], true, draw);
        update({type: "start"});
        assert.deepEqual(
            draw_parameters,
            {
                id: "id1",
                redact: true,
                status: "3 0 0 0 0"
            }
        );
        update({type: "reveal"});
        assert.deepEqual(
            draw_parameters,
            {
                id: "id1",
                redact: false,
                status: "3 0 0 0 0"
            }
        );
    });
});


describe("Marking", function() {

    it("Correct behaviour in response to mark messages", function() {
        let update = init(["id1", "id2", "id3"], true, draw);
        update({type: "start"});
        update({type: "mark", correct: true});
        // id1: 2 2, id2: 0 1, id3 0 1
        assert.deepEqual(
            draw_parameters,
            {
                id: "id2",
                redact: true,
                status: "2 1 0 0 0"
            }
        );
        update({type: "mark", correct: false});
        // id1: 2 2, id2: 1 1, id3: 0 1
        assert.deepEqual(
            draw_parameters,
            {
                id: "id3",
                redact: true,
                status: "2 1 0 0 0"
            }
        );
        update({type: "mark", correct: false});
        // id1: 1 2, id2: 0 1, id3: 0 1
        assert.deepEqual(
            draw_parameters,
            {
                id: "id2",
                redact: true,
                status: "2 1 0 0 0"
            }
        );
        update({type: "mark", correct: true});
        // id1: 1 2, id2: 2 2, id3: 0 1
        assert.deepEqual(
            draw_parameters,
            {
                id: "id3",
                redact: true,
                status: "1 2 0 0 0"
            }
        );
        update({type: "mark", correct: false});
        // id1: 0 2, id2: 1 2, id3: 0 1
        assert.deepEqual(
            draw_parameters,
            {
                id: "id1",
                redact: true,
                status: "1 2 0 0 0"
            }
        );
        update({type: "mark", correct: false});
        // id1: 1 1, id2: 1 2, id3: 0 1
        assert.deepEqual(
            draw_parameters,
            {
                id: "id3",
                redact: true,
                status: "2 1 0 0 0"
            }
        );
    });

});
