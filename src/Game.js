import { resizeCanvas } from 'webgl-helper';

import createProgram from './shaders/js/program';
import Player from './models/Player';

class Game {
    /** @type {WebGL2RenderingContext} */
    #gl;

    /** @type {Player} */
    #player;

    gameType = 'pvp';

    /** @type {WebGLProgram} */
    #program;

    constructor() {
        const canvas = document.getElementById("c");
        this.#gl = canvas.getContext("webgl2");

        if (!this.#gl) alert("Seu navegador não suporta WebGL2.");

        this.#program = createProgram(this.#gl);

        const { player1Spawn } = this.setRobotSpawn();

        this.#player = new Player(this.#gl, this.#program, 'player1', 'Lucy', player1Spawn);
    }

    setRobotSpawn() {
        if (this.gameType === 'pvp') {
            return {
                player1Spawn: {
                    start: { x: -0.1, y: -0.98 },
                    width: 0.15,
                    height: 0.15,
                },
            };
        }
    }

    // Fill the buffer with the values that define a robot.
    setRobot({ position }) {
        this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array([
            // first triangle
            position.leftDown.x, position.leftDown.y,
            position.leftUp.x, position.leftUp.y,
            position.rightDown.x, position.rightDown.y,
            // second triangle
            position.rightUp.x, position.rightUp.y,
            position.leftUp.x, position.leftUp.y,
            position.rightDown.x, position.rightDown.y
        ]), this.#gl.STATIC_DRAW);
    }

    init() {
        // set the buff we want to work with
        this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#player.buffer);

        // and make it the one we're currently working with
        this.#gl.bindVertexArray(this.#player.vao);

        // turn on the attribute
        this.#gl.enableVertexAttribArray(this.#player.positionAttributeLocation);

        this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#player.buffer);

        this.setRobot(this.#player);

        // how to pull the data out of the buffer
        let size = 2;             // 2 components per iteration
        let type = this.#gl.FLOAT;// the data is 32 bit floats
        let normalize = false;    // don't normalize the data
        let stride = 0;           // 0 = move forward size * sizeof(type) each iteration to get the next position
        let offset = 0;           // start at the beginning of the buffer
        this.#gl.vertexAttribPointer(
            this.#player.positionAttributeLocation, size, type,
            normalize, stride, offset
        );

        window.addEventListener('keydown', e => {
            this.#player.handleInput(e, 'player1');
        });
        window.addEventListener('keyup', e => {
            this.#player.handleInput(e, 'player1');
        });
    }

    update() {
        resizeCanvas(this.#gl.canvas);

        // Tell WebGL how to convert from clip space to pixels
        this.#gl.viewport(0, 0, this.#gl.canvas.width, this.#gl.canvas.height);

        // clear canvas
        this.#gl.clearColor(0, 0, 0, 0);
        this.#gl.clear(this.#gl.COLOR_BUFFER_BIT | this.#gl.DEPTH_BUFFER_BIT);

        // tell it to use our program
        this.#gl.useProgram(this.#program);

        this.#gl.bindVertexArray(this.#player.vao);

        // Set a random color.
        this.#gl.uniform4fv(this.#player.colorLocation, this.#player.color);

        this.#gl.uniform4fv(this.#player.translationLocation, this.#player.translation);

        // Draw the rectangle.
        const primitiveType = this.#gl.TRIANGLES;
        let offset = 0;
        const count = 6;
        this.#gl.drawArrays(primitiveType, offset, count);
    }
}

export default Game;