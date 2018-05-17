const WebSocket = require('uws');
const crypto = require('crypto');

class Team {
	score: number = 50;
	connections: any = new Set();
}

const team1 = new Team();
const team2 = new Team();

const getConnectionCount = () => {
	return ['connectionCount', team1.connections.size, team2.connections.size];
};

const getState = (team: number = 1) => {
	return ['state', team, team1.score, team2.score];
};

const setTeam = (connectionId: string) => {
	if (team1.connections.size <= team2.connections.size) {
		team1.connections.add(connectionId);
		return 1;
	} else {
		team2.connections.add(connectionId);
		return 2;
	}
};

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function(ws) {
	const connectionId = crypto.randomBytes(8).toString('hex');

	ws.team = setTeam(connectionId);

	ws.send(JSON.stringify(getState(ws.team)));

    wss.clients.forEach(function(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(getConnectionCount()));
        }
    });

	ws.on('close', function() {
		team1.connections.delete(connectionId);
		team2.connections.delete(connectionId);

        wss.clients.forEach(function(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(getConnectionCount()));
            }
        });
	});

	ws.on('message', function(message) {
		if (ws.team === 1) {
			if (team1.score < 100) {
				team1.score++;
				team2.score--;
			}
		} else {
			if (team2.score < 100) {
				team1.score--;
				team2.score++;
			}
		}

		wss.clients.forEach(function(client) {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(getState(client.team)));
			}
		});
	});
});
