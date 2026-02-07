// Native fetch is available in Node.js 18+

async function testUpdate() {
    const API_URL = 'http://localhost:3000/api';

    // 1. Get Players
    console.log('Fetching players...');
    const res = await fetch(`${API_URL}/players`);
    const players = await res.json();
    console.log(`Found ${players.length} players.`);

    // 2. Find a Pending player or create one
    let targetPlayer = players.find(p => p.status === 'Pending');

    if (!targetPlayer) {
        console.log('No pending player found. Creating one...');
        const createRes = await fetch(`${API_URL}/players`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Debug Player',
                role: 'Batsman',
                basePrice: 1000000,
                status: 'Pending'
            })
        });
        targetPlayer = await createRes.json();
        console.log('Created pending player:', targetPlayer.id);
    } else {
        console.log('Found pending player:', targetPlayer.id);
    }

    // 3. Try to accept (Update status to Unsold)
    console.log(`Attempting to accept player ${targetPlayer.id}...`);
    const updateRes = await fetch(`${API_URL}/players/${targetPlayer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Unsold' })
    });

    if (updateRes.ok) {
        console.log('Update reported success.');
        const json = await updateRes.json();
        console.log('Response:', json);
    } else {
        console.error('Update failed:', updateRes.status, updateRes.statusText);
        const text = await updateRes.text();
        console.error('Body:', text);
    }

    // 4. Verify
    const verifyRes = await fetch(`${API_URL}/players`);
    const verifyPlayers = await verifyRes.json();
    const verifiedPlayer = verifyPlayers.find(p => p.id === targetPlayer.id);
    console.log('Player status after update:', verifiedPlayer.status);

    // Cleanup if created
    if (verifiedPlayer.name === 'Debug Player') {
        await fetch(`${API_URL}/players/${targetPlayer.id}`, { method: 'DELETE' });
        console.log('Cleaned up debug player.');
    }
}

testUpdate();
