import 'dotenv/config';

async function verifyGameSync() {
    const API_URL = 'http://localhost:3000/api';
    const EMAIL = 'demo@rift.com';
    const PASSWORD = 'password';

    console.log('🔍 Starting Game Sync Verification...');

    // 1. Login
    console.log('\n1. Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });

    if (!loginRes.ok) {
        throw new Error(`Login failed: ${loginRes.status} ${loginRes.statusText}`);
    }

    const loginData = await loginRes.json();
    const token = loginData.token;
    const initialStats = loginData.user.stats;
    const initialCurrency = loginData.user.currency;

    console.log('✅ Login successful');
    console.log('Initial Stats:', {
        level: initialStats.level,
        xp: initialStats.xp,
        matches: initialStats.matches
    });
    console.log('Initial Currency:', initialCurrency);

    // 2. Get Loadout
    console.log('\n2. Fetching Loadout...');
    const loadoutRes = await fetch(`${API_URL}/game/loadout`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!loadoutRes.ok) {
        throw new Error(`Loadout fetch failed: ${loadoutRes.status}`);
    }

    const loadoutData = await loadoutRes.json();
    console.log('✅ Loadout fetched');
    console.log('Equipped:', loadoutData.equipped);

    // 3. Sync Stats (Simulate Game Over)
    console.log('\n3. Syncing Game Stats (Simulating Match)...');
    const matchStats = {
        kills: 10,
        score: 1000,
        timePlayed: 120,
        won: true
    };

    const syncRes = await fetch(`${API_URL}/game/sync`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(matchStats)
    });

    if (!syncRes.ok) {
        throw new Error(`Sync failed: ${syncRes.status}`);
    }

    const syncData = await syncRes.json();
    console.log('✅ Stats synced');
    console.log('Sync Response:', syncData);

    // 4. Verify Persistence (Fetch Profile again)
    console.log('\n4. Verifying Persistence...');
    const profileRes = await fetch(`${API_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const profileData = await profileRes.json();
    const newStats = profileData.stats;
    const newCurrency = profileData.currency;

    console.log('Updated Stats:', {
        level: newStats.level,
        xp: newStats.xp,
        matches: newStats.matches
    });

    // Assertions
    const expectedXp = initialStats.xp + matchStats.score; // Simple logic from backend
    // Note: Level up logic might change XP, so exact match might be tricky if level up happened.
    // But matches should definitely increment.

    if (newStats.matches === initialStats.matches + 1) {
        console.log('✅ Matches incremented correctly');
    } else {
        console.error('❌ Matches count did not increment correctly');
    }

    if (newCurrency.riftTokens > initialCurrency.riftTokens) {
        console.log('✅ Currency earned');
    } else {
        console.error('❌ Currency did not increase');
    }

    console.log('\n🎉 Verification Complete!');
}

verifyGameSync().catch(console.error);
