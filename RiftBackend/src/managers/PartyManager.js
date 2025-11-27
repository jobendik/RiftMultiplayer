"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partyManager = void 0;
class PartyManager {
    constructor() {
        this.parties = new Map();
        this.userToParty = new Map();
    }
    createParty(leaderId, username) {
        // Remove from existing party if any
        this.leaveParty(leaderId);
        const partyId = `party_${Date.now()}_${leaderId}`;
        const party = {
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
    getParty(partyId) {
        return this.parties.get(partyId);
    }
    getUserParty(userId) {
        const partyId = this.userToParty.get(userId);
        if (partyId) {
            return this.parties.get(partyId);
        }
        return undefined;
    }
    joinParty(partyId, userId, username) {
        const party = this.parties.get(partyId);
        if (!party)
            return null;
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
    leaveParty(userId) {
        const partyId = this.userToParty.get(userId);
        if (!partyId)
            return null;
        const party = this.parties.get(partyId);
        if (party) {
            party.members = party.members.filter(m => m.userId !== userId);
            this.userToParty.delete(userId);
            // If leader left, assign new leader or disband
            if (party.members.length === 0) {
                this.parties.delete(partyId);
                return null;
            }
            else if (party.leaderId === userId && party.members.length > 0) {
                const newLeader = party.members[0];
                if (newLeader) {
                    newLeader.isLeader = true;
                    party.leaderId = newLeader.userId;
                }
            }
            return party;
        }
        return null;
    }
    kickMember(partyId, targetUserId) {
        const party = this.parties.get(partyId);
        if (!party)
            return null;
        // Remove member
        party.members = party.members.filter(m => m.userId !== targetUserId);
        this.userToParty.delete(targetUserId);
        return party;
    }
    toggleReady(partyId, userId) {
        const party = this.parties.get(partyId);
        if (!party)
            return null;
        const member = party.members.find(m => m.userId === userId);
        if (member) {
            member.isReady = !member.isReady;
        }
        return party;
    }
}
exports.partyManager = new PartyManager();
//# sourceMappingURL=PartyManager.js.map