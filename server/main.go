package main

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

const domain = "localhost"

var JWTKEY = []byte{69}

var wsupgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func main() {
	r := gin.Default()

	server := newServer()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"PUT", "PATCH", "POST", "GET", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization", "accept", "origin", "Cache-Control", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.POST("/create", func(ctx *gin.Context) {
		id := uuid.New()
		fmt.Println(id)

		token, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"iat":  time.UTC,
			"id":   id.String(),
			"team": "W",
		}).SignedString(JWTKEY)

		server.games[id.String()] = newState(id.String())
		ctx.SetCookie("token", token, 60*60*24, "/", domain, true, true)

		ctx.JSON(http.StatusOK, gin.H{
			"game_id": id.String(),
		})
	})

	r.GET("/log/:id", func(ctx *gin.Context) {
		temp := server.games[ctx.Params.ByName("id")]
		fmt.Println(temp)
		ctx.JSON(http.StatusOK, gin.H{"data": "string{temp}"})
	})

	r.GET("/ws/:id", func(ctx *gin.Context) {
		id := ctx.Params.ByName("id")
		game := server.games[id]

		//check if game ID is valid
		if game == nil {
			ctx.JSON(http.StatusNotFound, gin.H{"message": "Game not found"})
			return
		}

		//check if token_string is available
		token_string, err := ctx.Cookie("token")
		if err != nil {
			fmt.Println(err)
		}

		//validate token
		token, err := jwt.Parse(strings.Split(token_string, " ")[0], func(t *jwt.Token) (interface{}, error) {
			return JWTKEY, nil
		})

		//get data from token
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			fmt.Println("from token data exraction")
			fmt.Println(claims)
			if claims["id"] == id {
				fmt.Println("id match")
				conn, err := wsupgrader.Upgrade(ctx.Writer, ctx.Request, nil)
				if err != nil {
					fmt.Println("Failed to set websocket upgrade: ", err)
					return
				}
				if claims["team"] == "W" {
					game.white = &Client{
						conn: conn,
						team: "W",
						send: make(chan []byte),
					}

					go game.white.readPump()
					go game.white.writePump()
					game.white.send <- []byte("Team:W")
				} else {
					game.black = &Client{
						conn: conn,
						team: "B",
						send: make(chan []byte),
					}
					go game.black.readPump()
					go game.black.writePump()
					game.black.send <- []byte("Team:B")
				}

				conn.SetCloseHandler(func(code int, text string) error {
					if claims["team"] == "W" {
						game.white = &Client{
							conn: nil,
							team: "W",
							send: make(chan []byte),
						}
					} else {
						game.black = &Client{
							conn: nil,
							team: "W",
							send: make(chan []byte),
						}
					}
					return fmt.Errorf("connection closed")
				})

				conn.SetPongHandler(func(appData string) error {
					fmt.Println("print from pong handler" + appData)
					return nil
				})

			} else {
				fmt.Println("id mismatch")
				fmt.Println(id, claims["id"])
				//token present and valid but game id mismatch
				if game.white.conn != nil && game.black.conn != nil {
					fmt.Println("game full")
					ctx.JSON(http.StatusBadRequest, gin.H{"message": "Game full"})
					return
				} else {
					//connect ws
					var team string
					if game.white.conn == nil {
						team = "W"
					} else {
						team = "B"
					}

					token, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
						"iat":  time.UTC,
						"id":   id,
						"team": team,
					}).SignedString(JWTKEY)

					conn, err := wsupgrader.Upgrade(ctx.Writer, ctx.Request, http.Header{
						"Set-Cookie": {"token=" + token + "; Max-Age=" + fmt.Sprint(60*60*24) + "; Path=/; Secure; Domain=localhost; HttpOnly"},
					})

					if err != nil {
						fmt.Println("Failed to set websocket upgrade: ", err)
						return
					}

					if claims["team"] == "W" {
						game.white = &Client{
							conn: conn,
							team: "W",
							send: make(chan []byte),
						}
						go game.white.readPump()
						go game.white.writePump()
						game.white.send <- []byte("Team:W")
					} else {
						game.black = &Client{
							conn: conn,
							team: "B",
							send: make(chan []byte),
						}
						go game.black.readPump()
						go game.black.writePump()
						game.black.send <- []byte("Team:B")
					}

					conn.SetCloseHandler(func(code int, text string) error {
						if team == "W" {
							game.white = nil
						} else {
							game.black = nil
						}
						return fmt.Errorf("connection closed")
					})

					conn.SetPongHandler(func(appData string) error {
						fmt.Println("print from pong handler" + appData)
						return nil
					})
				}
			}
		} else {
			fmt.Println("from invalid token")

			if game.black.conn != nil {
				ctx.JSON(http.StatusBadRequest, gin.H{"message": "game full"})
				return
			}

			var team string
			if game.white.conn == nil {
				team = "W"
			} else {
				team = "B"
			}

			//set cookie if no token
			token, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
				"iat":  time.UTC,
				"id":   id,
				"team": team,
			}).SignedString(JWTKEY)

			// upgrade http to ws
			conn, err := wsupgrader.Upgrade(ctx.Writer, ctx.Request, http.Header{
				"Set-Cookie": {"token=" + token + "; Max-Age=" + fmt.Sprint(60*60*24) + "; Path=/; Secure; Domain=localhost; HttpOnly"},
			})

			if err != nil {
				fmt.Println("Failed to set websocket upgrade: ", err)
				return
			}

			if team == "W" {
				game.white = &Client{
					conn: conn,
					team: "W",
					send: make(chan []byte),
				}
				go game.white.readPump()
				go game.white.writePump()

				game.white.send <- []byte("Team:W")

			} else if team == "B" {
				game.black = &Client{
					conn: conn,
					team: "B",
					send: make(chan []byte),
				}
				go game.black.readPump()
				go game.black.writePump()

				game.black.send <- []byte("Team:B")

			}

			conn.SetCloseHandler(func(code int, text string) error {
				if team == "W" {
					game.white = nil
				} else {
					game.black = nil
				}
				if game.white == nil && game.black == nil {
					delete(server.games, game.id)
				}
				return fmt.Errorf("connection closed")
			})

			conn.SetPongHandler(func(appData string) error {
				fmt.Println("print from pong handler" + appData)
				return nil
			})

			return
		}
	})

	r.Run()
}
