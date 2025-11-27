export interface PartyMember {
    userId: number;
    username: string;
    isLeader: boolean;
    isReady: boolean;
}

export interface Party {
    id: string;
    leaderId: number;
    members: PartyMember[];
    modeId?: string;
}

class PartyManager {
    private parties: Map<string, Party> = new Map();
    private userToParty: Map<number, string> = new Map();

    createParty(leaderId: number, username: string): Party {
        // Remove from existing party if any
        this.leaveParty(leaderId);

        const partyId = `party_${Date.now()}_${leaderId}`;
        const party: Party = {
            id: partyId,
            leaderId,
            members: [{
                userId: leaderId,
                username,
                isLeader: true,
                isReady: true
            }]
        };

        this.parties.set(partyId, party);
        this.userToParty.set(leaderId, partyId);

        return party;
    }

    getParty(partyId: string): Party | undefined {
        return this.parties.get(partyId);
    }

    getUserParty(userId: number): Party | undefined {
        const partyId = this.userToParty.get(userId);
        if (partyId) {
            return this.parties.get(partyId);
        }
        return undefined;
    }

    joinParty(partyId: string, userId: number, username: string): Party | null {
        const party = this.parties.get(partyId);
        if (!party) return null;

        // Remove from existing party
        this.leaveParty(userId);

        party.members.push({
            userId,
            username,
            isLeader: false,
            isReady: true
        });
        this.userToParty.set(userId, partyId);

        return party;
    }

    leaveParty(userId: number): void {
        const partyId = this.userToParty.get(userId);
        if (!partyId) return;

        const party = this.parties.get(partyId);
        if (party) {
            party.members = party.members.filter(m => m.userId !== userId);
            this.userToParty.delete(userId);

            // If leader left, assign new leader or disband
            if (party.members.length === 0) {
                this.parties.delete(partyId);
            } else if (party.leaderId === userId && party.members.length > 0) {
                const newLeader = party.members[0];
                if (newLeader) {
                    newLeader.isLeader = true;
                    party.leaderId = newLeader.userId;
                }
            }
        }
    }
}

export const partyManager = new PartyManager();
