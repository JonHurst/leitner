import {init} from "./expo.js";
let assert = chai.assert;

// mocks

let draw_parameters;

function draw(id, state, status) {
    console.log(`Draw called with (${id}, ${state}, ${status})`);
    draw_parameters = {id, state, status};
};


// tests

describe("Initialisation", function() {

    it("Initialise three ids", function() {
        let update = init(["id1", "id2", "id3"], true, draw);
        update({type: "next"});
        assert.deepEqual(
            draw_parameters,
            {
                id: "id1",
                state: "redacted",
                status: "3 0 0 0 0"
            }
        );
    });


    it("Initialise from storage", function() {
        let update = init(["id1", "id2", "id3"], true, draw);
        update({type: "next"});
        update({type: "mark", correct: true});
        update = init(["id1", "id2", "id3"], false, draw);
        update({type: "next"});
        assert.deepEqual(
            draw_parameters,
            {
                id: "id2",
                state: "redacted",
                status: "2 1 0 0 0"
            }
        );
        update({type: "next"});
        update({type: "mark", correct: true});
        assert.deepEqual(
            draw_parameters,
            {
                id: "id3",
                state: "correct",
                status: "1 2 0 0 0"
            }
        );

        console.log(draw_parameters);
        update = init(["id3", "id4"], false, draw);
        update({type: "next"});
        assert.deepEqual(
            draw_parameters,
            {
                id: "id4",
                state: "redacted",
                status: "1 1 0 0 0"
            }
        );
        update({type: "next"});
        assert.deepEqual(
            draw_parameters,
            {
                id: "id3",
                state: "redacted",
                status: "1 1 0 0 0"
            }
        );
    });

});


describe("Redact Management", function() {

    it("Correct calling of draw after redact message sent", function() {
        let update = init(["id1", "id2", "id3"], true, draw);
        update({type: "next"});
        assert.deepEqual(
            draw_parameters,
            {
                id: "id1",
                state: "redacted",
                status: "3 0 0 0 0"
            }
        );
        update({type: "reveal"});
        assert.deepEqual(
            draw_parameters,
            {
                id: "id1",
                state: "revealed",
                status: "3 0 0 0 0"
            }
        );
    });
});


describe("Marking", function() {

    it("Correct behaviour in response to mark messages", function() {
        let update = init(["id1", "id2", "id3"], true, draw);
        update({type: "next"});
        assert.deepEqual(
            draw_parameters,
            {
                id: "id1",
                state: "redacted",
                status: "3 0 0 0 0"
            }
        );
        update({type: "reveal"});
        assert.deepEqual(
            draw_parameters,
            {
                id: "id1",
                state: "revealed",
                status: "3 0 0 0 0"
            }
        );
        update({type: "mark", correct: true});
        assert.deepEqual(
            draw_parameters,
            {
                id: "id1",
                state: "correct",
                status: "2 1 0 0 0"
            }
        );
        update({type: "next"});
        assert.deepEqual(
            draw_parameters,
            {
                id: "id2",
                state: "redacted",
                status: "2 1 0 0 0"
            }
        );
        update({type: "mark", correct: false});
        assert.deepEqual(
            draw_parameters,
            {
                id: "id2",
                state: "incorrect",
                status: "2 1 0 0 0"  // id1: 2 2, id2: 1 1, id3: 0 1
            }
        );
        update({type: "next"});
        assert.deepEqual(
            draw_parameters,
            {
                id: "id3",
                state: "redacted",
                status: "2 1 0 0 0"
            }
        );
        update({type: "mark", correct: false});
        assert.deepEqual(
            draw_parameters,
            {
                id: "id3",
                state: "incorrect",
                status: "2 1 0 0 0"  // id1: 2 2, id2: 1 1, id3: 1 1
            }
        );
        update({type: "next"});
        assert.deepEqual(
            draw_parameters,
            {
                id: "id2",
                state: "redacted",
                status: "2 1 0 0 0"  // id1: 1 2, id2: 0 1, id3: 0 1

            }
        );
        update({type: "mark", correct: true});
        assert.deepEqual(
            draw_parameters,
            {
                id: "id2",
                state: "correct",
                status: "1 2 0 0 0"  // id1: 1 2, id2: 2 2, id3: 0 1

            }
        );
        update({type: "next"});
        assert.deepEqual(
            draw_parameters,
            {
                id: "id3",
                state: "redacted",
                status: "1 2 0 0 0"  // id1: 1 2, id2: 2 2, id3: 0 1

            }
        );
        update({type: "mark", correct: false});
        assert.deepEqual(
            draw_parameters,
            {
                id: "id3",
                state: "incorrect",
                status: "1 2 0 0 0"  // id1: 1 2, id2: 2 2, id3: 1 1

            }
        );
        update({type: "next"});
        assert.deepEqual(
            draw_parameters,
            {
                id: "id1",
                state: "redacted",
                status: "1 2 0 0 0"  // id1: 0 2, id2: 1 2, id3: 0 1
            }
        );
        update({type: "mark", correct: false});
        assert.deepEqual(
            draw_parameters,
            {
                id: "id1",
                state: "incorrect",
                status: "2 1 0 0 0"  // id1: 1 1, id2: 1 2, id3: 0 1
            }
        );
        update({type: "next"});
        assert.deepEqual(
            draw_parameters,
            {
                id: "id3",
                state: "redacted",
                status: "2 1 0 0 0"  // id1: 1 1, id2: 1 2, id3: 0 1
            }
        );
    });

    it("Introduction of new cards", function() {
        let ids = [];
        for(let c = 0; c < 20; c++) {
            ids.push(`id_${c}`);
        }
        let update = init(ids, true, draw);
        for(let c = 0 ; c < 10; c++) {
            update({type: "next"});
            assert.equal(draw_parameters.id, ids[c]);
            update({type: "mark", correct: false});
            assert.equal(draw_parameters.id, ids[c]);
        }
        // since all marked incorrect, should repeat first 10
        for(let c = 0 ; c < 10; c++) {
            update({type: "next"});
            assert.equal(draw_parameters.id, ids[c]);
            update({type: "mark", correct: true});
            assert.equal(draw_parameters.id, ids[c]);
        }
        // since all marked correct, should get second 10
        for(let c = 0 ; c < 10; c++) {
            update({type: "next"});
            assert.equal(draw_parameters.id, ids[c + 10]);
            update({type: "mark", correct: true});
            assert.equal(draw_parameters.id, ids[c + 10]);
        }
        // since all marked correct, should get all 20
        for(let c = 0 ; c < 20; c++) {
            update({type: "next"});
            assert.equal(draw_parameters.id, ids[c]);
            update({type: "mark", correct: true});
            assert.equal(draw_parameters.id, ids[c]);
        }
    });
});
