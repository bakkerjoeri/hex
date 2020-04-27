import { Size, GameState } from './types';
import { start } from './tick.js';
import { setupGame } from './setupGame.js';
import EventEmitter from './EventEmitter.js';

interface GameOptions {
	size: Size;
	scale: number;
	containerSelector?: string;
}

export interface GameEvents {
	start: {};
	beforeUpdate: { time: number };
	update: { time: number };
	afterUpdate: { time: number };
	beforeDraw: { time: number };
	draw: { time: number; context: CanvasRenderingContext2D; scale: number };
	afterDraw: { time: number };
}

const initialState = {
	entities: {},
	sprites: {},
};

export default class Game<Events extends GameEvents> {
	public readonly canvas: HTMLCanvasElement;
	public readonly context: CanvasRenderingContext2D;
    public readonly scale: number;

	private state: GameState;
	private readonly eventEmitter: EventEmitter<Events>;

	constructor(
		eventEmitter: EventEmitter<Events>,
		{ size, scale, containerSelector = 'body' }: GameOptions
	) {
        this.eventEmitter = eventEmitter;
        const { canvas, context } = setupGame(containerSelector, size, scale);
		this.canvas = canvas;
        this.context = context;
        this.scale = scale;
		this.state = {...initialState};
	}

	public start(): void {
		this.state = this.eventEmitter.emit('start', this.state, {});

		start((time) => {
			this.state = this.eventEmitter.emit('beforeUpdate', this.state, { time });
			this.state = this.eventEmitter.emit('update', this.state, { time });
			this.state = this.eventEmitter.emit('afterUpdate', this.state, { time });
			this.state = this.eventEmitter.emit('beforeDraw', this.state, { time });
			this.state = this.eventEmitter.emit('draw', this.state, { time, context: this.context, scale: this.scale });
			this.state = this.eventEmitter.emit('afterDraw', this.state, { time });
		});
	}
}
