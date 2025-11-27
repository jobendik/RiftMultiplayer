import { io, Socket } from 'socket.io-client';
import * as THREE from 'three';
import { Game } from '../Game';
import { RemotePlayer } from '../entities/RemotePlayer';

export class NetworkManager {
    private socket: Socket;
    private game: Game;
    private remotePlayers: Map<string, RemotePlayer> = new Map();
    private deadPlayers: Set<any> = new Set(); // Track dead players to prevent recreation
    private updateRate = 50; // ms
    private lastUpdate = 0;
    private matchId = 'deathmatch_room'; // Default room for now
    private scores: any = { players: {} };

    public myUserId: string;

    constructor(game: Game) {
        this.game = game;

        // Get token from URL or generate random
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token') || `mock-jwt-token-${Math.floor(Math.random() * 1000)}`;

        // Extract user ID from token for local comparison (must match server logic)
        // Server logic: parseInt(token.split('-').pop() || '0')
        const userIdStr = token.split('-').pop() || '0';
        this.myUserId = userIdStr; // Keep as string for now as RemotePlayer uses string, but value is numeric

        this.socket = io('http://localhost:3000', {
            auth: { token },
            transports: ['websocket']
        });

        this.setupListeners();
    }

    private setupListeners() {
        this.socket.on('connect', () => {
            console.log('Connected to game server');
            this.socket.emit('join_match', this.matchId);
        });

        this.socket.on('player_joined', (data: { userId: string }) => {
            console.log(`Player ${data.userId} joined`);
            // Create remote player if not exists
            if (!this.remotePlayers.has(data.userId)) {
                this.addRemotePlayer(data.userId);
            }
        });

        this.socket.on('player_update', (data: any) => {
            const { userId, position, rotation, isSprinting, isGrounded } = data;

            // Ignore updates for dead players
            if (this.deadPlayers.has(userId)) {
                return;
            }

            let remotePlayer = this.remotePlayers.get(userId);
            if (!remotePlayer) {
                remotePlayer = this.addRemotePlayer(userId);
            }

            remotePlayer.updateState(position, rotation, isSprinting, isGrounded);
        });

        this.socket.on('player_shoot', (data: any) => {
            const { userId } = data;
            // const { origin, direction, weaponType } = data; // Available for visual effects
            // Show muzzle flash / tracer for remote player
            // TODO: Implement visual effects for remote shooting
            console.log(`Player ${userId} shot`);
        });

        this.socket.on('player_damaged', (data: any) => {
            const { targetId, attackerId, damage } = data;
            // const { hitLocation } = data; // Available for effects
            console.log(`Player ${targetId} took ${damage} damage from ${attackerId}`);

            // If I am the target, take damage (convert targetId to string for comparison)
            if (this.game.handleRemoteDamage && String(targetId) === this.myUserId) {
                this.game.handleRemoteDamage(data);
            }
        });

        this.socket.on('player_killed', (data: any) => {
            const { attackerId, victimId, weaponType } = data;
            console.log(`Player ${victimId} killed by ${attackerId} with ${weaponType}`);

            // Mark player as dead to ignore future updates
            this.deadPlayers.add(victimId);

            // Remove the dead player's mesh (victimId is a number, matches map key type)
            if (this.remotePlayers.has(victimId)) {
                const deadPlayer = this.remotePlayers.get(victimId);
                if (deadPlayer) {
                    deadPlayer.destroy();
                    this.remotePlayers.delete(victimId);
                    console.log(`Player ${victimId} removed from scene`);
                }
            }

            if (this.game.handleKillFeed) {
                this.game.handleKillFeed(attackerId, victimId, weaponType);
            }
        });

        this.socket.on('player_respawned', (data: any) => {
            const { userId } = data;
            console.log(`Player ${userId} respawned`);

            // Remove from dead players list
            this.deadPlayers.delete(userId);

            // Recreate the remote player if they don't exist (userId is number, matches map key)
            if (!this.remotePlayers.has(userId) && String(userId) !== this.myUserId) {
                this.addRemotePlayer(userId);
            }
        });

        this.socket.on('match_state', (state: any) => {
            console.log('Received match state:', state);
            this.scores = state;
            if (this.game.handleScoreUpdate) {
                this.game.handleScoreUpdate(this.scores);
            }
        });

        this.socket.on('score_update', (state: any) => {
            console.log('Received score update:', state);
            this.scores = state;
            if (this.game.handleScoreUpdate) {
                this.game.handleScoreUpdate(this.scores);
            }
        });

        this.socket.on('match_ended', (finalState: any) => {
            console.log('Match ended:', finalState);
            this.scores = finalState;
            if (this.game.handleMatchEnd) {
                this.game.handleMatchEnd(finalState);
            }
        });
    }

    public getRemotePlayers(): RemotePlayer[] {
        return Array.from(this.remotePlayers.values());
    }

    public getScores() {
        return this.scores;
    }

    private addRemotePlayer(userId: string): RemotePlayer {
        const player = new RemotePlayer(this.game.getScene(), userId);
        this.remotePlayers.set(userId, player);
        return player;
    }

    public update(dt: number, player: any, camera: any) {
        // Update remote players (interpolation)
        this.remotePlayers.forEach(p => p.update(dt));

        // Send local update
        const now = Date.now();
        if (now - this.lastUpdate > this.updateRate) {
            this.sendPlayerUpdate(player, camera);
            this.lastUpdate = now;
        }
    }

    private sendPlayerUpdate(player: any, camera: any) {
        if (!this.socket.connected) return;

        const position = camera.position; // FPS camera position
        const rotation = {
            y: camera.rotation.y,
            x: camera.rotation.x
        };

        this.socket.emit('player_update', {
            matchId: this.matchId,
            position: { x: position.x, y: position.y, z: position.z },
            rotation,
            velocity: { x: player.velocity.x, y: player.velocity.y, z: player.velocity.z },
            isSprinting: player.isSprinting,
            isGrounded: player.onGround
        });
    }

    public sendShoot(origin: THREE.Vector3, direction: THREE.Vector3, weaponType: string) {
        this.socket.emit('player_shoot', {
            matchId: this.matchId,
            origin,
            direction,
            weaponType
        });
    }

    public sendPlayerHit(targetId: string, damage: number, hitLocation: THREE.Vector3) {
        this.socket.emit('player_hit', {
            matchId: this.matchId,
            targetId,
            damage,
            hitLocation
        });
    }

    public sendPlayerDied(attackerId: string, weaponType: string) {
        this.socket.emit('player_died', {
            matchId: this.matchId,
            attackerId,
            weaponType
        });
    }

    public sendPlayerRespawn() {
        this.socket.emit('player_respawn', {
            matchId: this.matchId
        });
    }
}
