import { BaseGameMode } from './BaseGameMode';
import { PLAYER_CONFIG } from '../../config/gameConfig';

export class SinglePlayerWaveMode extends BaseGameMode {
    public getName(): string {
        return 'Single Player Wave';
    }

    public start(): void {
        super.start();

        // Reset game state for wave mode
        this.game.gameState.wave = 1;
        this.game.gameState.score = 0;
        this.game.gameState.kills = 0;
        this.game.gameState.waveInProgress = false;
        this.game.gameState.betweenWaves = false;

        // Spawn initial pickups
        this.game.pickupSystem.spawnWavePickups(
            this.game.player.health,
            PLAYER_CONFIG.maxHealth,
            this.game.gameState.wave
        );

        this.startWave();
    }

    public update(dt: number): void {
        super.update(dt);

        if (!this.game.gameState.running || this.game.gameState.paused) return;

        // Check for wave completion
        if (this.game.gameState.waveInProgress && this.game.enemyManager.getEnemyCount() === 0) {
            this.waveComplete();
        }
    }

    private startWave(): void {
        this.game.gameState.waveInProgress = true;
        this.game.gameState.betweenWaves = false;
        this.game.enemyManager.spawnWave(this.game.gameState.wave);
        this.game.updateHUD();
    }

    private waveComplete(): void {
        this.game.gameState.waveInProgress = false;
        this.game.gameState.betweenWaves = true;
        this.game.gameState.score += this.game.gameState.wave * 500;

        this.game.hudManager.showMessage('WAVE CLEARED');
        this.game.pickupSystem.spawnWavePickups(
            this.game.player.health,
            PLAYER_CONFIG.maxHealth,
            this.game.gameState.wave
        );

        setTimeout(() => {
            if (this.isActive) {
                this.game.gameState.wave++;
                this.startWave();
            }
        }, 3000);
    }
}
