import { h, app } from 'hyperapp';
import './style.css';

const state = {
	team: 1,
	myTeamScore: 50,
	enemyTeamScore: 50
};

const actions = {
	setAll: (value) => (state) => value
};

const socket = new WebSocket('ws://localhost/ws');

const attack = () => socket.send(null);

const view = (state, actions) => (
	<div class="wrapper">
		<div
			class={state.team === 1 ? 'top top_red' : 'top top_blue'}
			style={{ height: `${state.enemyTeamScore}%` }}
		/>
		<div
			class={state.team === 1 ? 'bottom bottom_blue' : 'bottom bottom_red'}
			style={{ height: `${state.myTeamScore}%` }}
		/>
		<div class="bottomFixed">
			<div
				class={
					state.team === 1 ? (
						'choAttack choAttack_blue'
					) : (
						'choAttack choAttack_red'
					)
				}
				onclick={() => attack()}
			>
				ЧО
			</div>
		</div>
	</div>
);

document.onkeyup = function(e) {
	if (e.keyCode == 32) attack();
};

const main = app(state, actions, view, document.body);

socket.onmessage = function(event) {
	const [team, team1, team2] = JSON.parse(event.data);
	main.setAll({
		team,
		myTeamScore: team === 1 ? team1 : team2,
		enemyTeamScore: team === 1 ? team2 : team1
	});
};
