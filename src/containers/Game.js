import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { fetchOneGame, fetchPlayers, sendTurn } from '../actions/games/fetch'
import { connect as subscribeToWebsocket } from '../actions/websocket'
import JoinGameDialog from '../components/games/JoinGameDialog'
import './Game.css'

const playerShape = PropTypes.shape({
  userId: PropTypes.string.isRequired,
  pairs: PropTypes.arrayOf(PropTypes.string).isRequired,
  name: PropTypes.string
})

class Game extends PureComponent {
  static propTypes = {
    fetchOneGame: PropTypes.func.isRequired,
    sendTurn: PropTypes.func.isRequired,
    fetchPlayers: PropTypes.func.isRequired,
    subscribeToWebsocket: PropTypes.func.isRequired,
    game: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      userId: PropTypes.string.isRequired,
      players: PropTypes.arrayOf(playerShape),
      draw: PropTypes.bool,
      updatedAt: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      started: PropTypes.bool,
      turn: PropTypes.number.isRequired,
      cards: PropTypes.arrayOf(PropTypes.shape({
        symbol: PropTypes.string,
        _id: PropTypes.string,
        won: PropTypes.bool,
        visible: PropTypes.bool
      }))
    }),
    currentPlayer: playerShape,
    isPlayer: PropTypes.bool,
    isJoinable: PropTypes.bool,
    hasTurn: PropTypes.bool
  }

  componentWillMount() {
    const { game, fetchOneGame, subscribeToWebsocket } = this.props
    const { gameId } = this.props.match.params

    if (!game) { fetchOneGame(gameId) }
    subscribeToWebsocket()
  }

  componentWillReceiveProps(nextProps) {
    const { game } = nextProps

    if (game && !game.players[0].name) {
      this.props.fetchPlayers(game)
    }
  }

clickButton(buttonId) {
    const gameId = this.props.game._id
    this.props.sendTurn(gameId, buttonId)
    // console.log(gameId, buttonId)
  }

  render() {
    const { game } = this.props

    if (!game) return null

    const title = game.players.map(p => (p.name || null))
      .filter(n => !!n)
      .join(' vs ')

    return (
      <div className="Game">

        <p>{title}</p>

        <h1 className="title">Let the Game begin :)</h1>
        <div id="game">
          <div id="board">
             <div className="square" id="0" onClick={() => this.clickButton(0)}>0</div>
             <div className="square" id="1" onClick={() => this.clickButton(1)}>1</div>
             <div className="square" id="2" onClick={() => this.clickButton(2)}>2</div>
             <div className="square" id="3" onClick={() => this.clickButton(3)}>3</div>
             <div className="square" id="4" onClick={() => this.clickButton(4)}>4</div>
             <div className="square" id="5" onClick={() => this.clickButton(5)}>5</div>
             <div className="square" id="6" onClick={() => this.clickButton(6)}>6</div>
             <div className="square" id="7" onClick={() => this.clickButton(7)}>7</div>
             <div className="square" id="8" onClick={() => this.clickButton(8)}>8</div>
          </div>
        </div>

        <h2>Debug Props</h2>
        <pre>{JSON.stringify(this.props, true, 2)}</pre>

        <JoinGameDialog gameId={game._id} />
      </div>
    )
  }
}

const mapStateToProps = ({ currentUser, games }, { match }) => {
  const game = games.filter((g) => (g._id === match.params.gameId))[0]
  const currentPlayer = game && game.players.filter((p) => (p.userId === currentUser._id))[0]
  const hasTurn = !!currentPlayer && game.players[game.turn].userId === currentUser._id
  return {
    currentPlayer,
    game,
    isPlayer: !!currentPlayer,
    hasTurn,
    isJoinable: game && !currentPlayer && game.players.length < 2
  }
}

export default connect(mapStateToProps, {
  sendTurn,
  subscribeToWebsocket,
  fetchOneGame,
  fetchPlayers
})(Game)
