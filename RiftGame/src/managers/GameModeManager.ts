import { Game } from '../Game';
import { IGameMode } from './gamemodes/IGameMode';
import { SinglePlayerWaveMode } from './gamemodes/SinglePlayerWaveMode';
import { MultiplayerDeathmatchMode } from './gamemodes/MultiplayerDeathmatchMode';

export enum GameModeType {
    SINGLE_PLAYER_WAVE = 'SINGLE_PLAYER_WAVE',
    MULTIPLAYER_DEATHMATCH = 'MULTIPLAYER_DEATHMATCH'
}

export class GameModeManager {
    // private game: Game;
    private currentMode?: IGameMode;
    private modes: Map<GameModeType, IGameMode>;

    constructor(game: Game) {
        // this.game = game;
        this.modes = new Map();

        // Register modes
        this.modes.set(GameModeType.SINGLE_PLAYER_WAVE, new SinglePlayerWaveMode(game));
        this.modes.set(GameModeType.MULTIPLAYER_DEATHMATCH, new MultiplayerDeathmatchMode(game));
    }

    public setMode(type: GameModeType): void {
        if (this.currentMode) {
            this.currentMode.cleanup();
        }

        const newMode = this.modes.get(type);
        if (!newMode) {
            console.error(`Game mode ${type} not found!`);
            return;
        }

        this.currentMode = newMode;
        this.currentMode.init();
        this.currentMode.start();
    }

    public update(dt: number): void {
        if (this.currentMode) {
            this.currentMode.update(dt);
        }
    }

    public getCurrentMode(): IGameMode | undefined {
        return this.currentMode;
    }
}
