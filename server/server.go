package main

import (
	"bytes"
	"fmt"
	"time"

	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 10 * 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

// Player Information
type Client struct {
	conn      *websocket.Conn
	team      string
	connected bool
}

func (c *Client) check() {
	//TODO
}

// State of the game
type GameState struct {
	id    string
	white *Client
	black *Client
}

func (g *GameState) check() {
	g.white.check()
	g.black.check()
}

func newState(newid string) *GameState {
	return &GameState{
		id:    newid,
		white: &Client{},
		black: &Client{},
	}
}

func (c *Client) read() {
	defer func() {
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			fmt.Println(err)
			break
		}

		message = bytes.TrimSpace(bytes.Replace(message, []byte{'\n'}, []byte{' '}, -1))
		fmt.Println("Message from team " + c.team + ": " + string(message[:]))
	}
}

func (c *Client) write() {

}

type Server struct {
	games map[string]*GameState
}

func newServer() *Server {
	return &Server{
		games: make(map[string]*GameState),
	}
}

func (s *Server) run() {
	for {
		// TODO
	}
}
