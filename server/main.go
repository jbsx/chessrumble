package main

import (
	"fmt"
	"net/http"
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

	r.GET("/ws/:id", func(ctx *gin.Context) {
		id := ctx.Params.ByName("id")
		game := server.games[id]

		//check if game ID is valid
		if game == nil {
			ctx.JSON(http.StatusNotFound, gin.H{"message": "Game not found"})
			return
		}

		//TODO: move this section later in the code. player could be white or black. check with jwt token
		//check if both players are connected and refuse new connection if game full
		if game.white != nil && game.black != nil {
			//check if connections are in open state
			if game.white.isConnected() && game.black.isConnected() {
				ctx.JSON(http.StatusNotAcceptable, gin.H{"message": "Game ongoing"})
				return
			}
		}

		//Authenticate
		tokenString, err := ctx.Cookie("token")
		if err != nil {
			//TODO: no token
			if err.Error() == "http: named cookie not present" {
				//return error if game full. Otherwise initiate ws connection
				if game.white != nil && game.black != nil {
					if game.white.isConnected() && game.black.isConnected() {
						ctx.JSON(http.StatusNotAcceptable, gin.H{"message": "Game full"})
						return
					}
				}
			} else {
				fmt.Printf("Error in parsing cookie: %v\n", err)
				return
			}
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
			}
			return JWTKEY, nil
		})
		if err != nil {
			fmt.Printf("Error in validating token: %v\n", err)
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {

			if claims["id"] != id {
				//TODO: join this game and delete game matching the id in the jwt token from server.games[]
			}

			conn, err := wsupgrader.Upgrade(ctx.Writer, ctx.Request, nil)
			if err != nil {
				fmt.Println("Failed to set websocket upgrade: ", err)
				return
			}

			game := server.games[claims["id"].(string)]

			conn.SetCloseHandler(func(code int, text string) error {
				if claims["team"] == "W" {
					game.white = nil
				} else {
					game.black = nil
				}
				return fmt.Errorf("connection closed")
			})

			conn.SetPongHandler(func(appData string) error {
				fmt.Println(appData)
				return nil
			})

			if claims["team"] == "W" {
				game.white = &Client{
					team: "W",
					conn: conn,
					send: make(chan []byte),
				}
				go game.white.readPump()
				go game.white.writePump()
			} else if claims["team"] == "B" {
				game.black = &Client{
					team: "B",
					conn: conn,
					send: make(chan []byte),
				}
				go game.black.readPump()
				go game.black.writePump()
			}
		}
	})

	r.Run()
}
