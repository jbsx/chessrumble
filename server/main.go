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
			"team": "white",
		}).SignedString(JWTKEY)

		server.games[id.String()] = newState(id.String())
		ctx.SetCookie("token", token, 60*60*24, "/", domain, true, true)

		ctx.JSON(http.StatusOK, gin.H{
			"message": id.String(),
		})
	})

	r.POST("/join/:id", func(ctx *gin.Context) {
		id := ctx.Params.ByName("id")
		game := server.games[id]

		if game == nil {
			ctx.JSON(http.StatusNotFound, gin.H{"message": "Game not found"})
			return
		}

		//check if already a player
		if cookie, err := ctx.Cookie("token"); err == nil {
			token, err := jwt.Parse(cookie, func(token *jwt.Token) (interface{}, error) {
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
				}
				return JWTKEY, nil
			})

			if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
				// Already in game
				if claims["id"] == id {
					ctx.JSON(http.StatusOK, gin.H{
						"message": "OK",
						"team":    claims["team"],
					})
					return
				}
			} else {
				fmt.Println(err)
			}

		}

		//check if both players are connected and refuse new connection if game full
		fmt.Println(game)
		if game.white != nil && game.black != nil {
			//check if connections are in open state
			if game.white.isConnected() && game.black.isConnected() {
				ctx.JSON(http.StatusNotAcceptable, gin.H{"message": "Game ongoing"})
				return
			}
		}

		//Not in game - create new token and join
		token, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"iat":  time.UTC,
			"id":   id,
			"team": "black",
		}).SignedString(JWTKEY)

		ctx.SetCookie("token", token, 60*60*24, "/", domain, true, true)

		ctx.JSON(http.StatusOK, gin.H{
			"message": "OK",
			"team":    "black",
		})
		return
	})

	r.GET("/ws", func(ctx *gin.Context) {
		//Authenticate
		tokenString, err := ctx.Cookie("token")
		if err != nil {
			fmt.Printf("Unexpected Error: %v", err)
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
			}
			return JWTKEY, nil
		})
		if err != nil {
			fmt.Printf("Unexpected Error: %v", err)
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {

			conn, err := wsupgrader.Upgrade(ctx.Writer, ctx.Request, nil)
			if err != nil {
				fmt.Println("Failed to set websocket upgrade: ", err)
				return
			}

			game := server.games[claims["id"].(string)]

			conn.SetCloseHandler(func(code int, text string) error {
				if claims["team"] == "white" {
					game.white = nil
				} else {
					game.black = nil
				}
				//println("from close handler")
				return fmt.Errorf("connection closed")
			})

			conn.SetPongHandler(func(appData string) error {
				println(appData)
				return nil
			})

			if claims["team"] == "white" {
				game.white = &Client{
					team: "white",
					conn: conn,
					send: make(chan []byte),
				}
				go game.white.readPump()
				go game.white.writePump()
			} else if claims["team"] == "black" {
				game.black = &Client{
					team: "black",
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
