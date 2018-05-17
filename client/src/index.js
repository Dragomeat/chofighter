import {h, app} from 'hyperapp';
import './style.css';

const state = {
  team: 1,
  myTeamScore: 50,
  myTeamPlayers: 0,
  enemyTeamScore: 50,
  enemyTeamPlayers: 0,
};

const actions = {
  mergeWith: (data) => (state) => Object.assign({}, state, data)
};

const socket = new WebSocket('ws://localhost/ws');

const attack = () => socket.send(null);

const view = (state, actions) => (
  <div class="wrapper">
    <div
      class={state.team === 1 ? 'top top_red' : 'top top_blue'}
      style={{height: `${state.enemyTeamScore}%`}}
    >
      <div class="playerCounter">{state.enemyTeamPlayers}</div>
    </div>
    <div
      class={state.team === 1 ? 'bottom bottom_blue' : 'bottom bottom_red'}
      style={{height: `${state.myTeamScore}%`}}
    >
      <div className="playerCounter">{state.myTeamPlayers}</div>
    </div>
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

document.onkeyup = function (e) {
  if (e.keyCode == 32) attack();
};

const main = app(state, actions, view, document.body);

socket.onmessage = function (event) {
  const [type, ...data] = JSON.parse(event.data);

  switch (type) {
    case 'connectionCount':
      const [team1Players, team2Players] = data;

      main.mergeWith({
        myTeamPlayers: state.team === 1 ? team1Players : team2Players,
        enemyTeamPlayers: state.team === 1 ? team2Players : team1Players
      });

      break;

    case 'state':
      const [team, team1, team2] = data;

      main.mergeWith({
        team,
        myTeamScore: team === 1 ? team1 : team2,
        enemyTeamScore: team === 1 ? team2 : team1
      });

      break;
  }
};
