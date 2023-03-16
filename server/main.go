package main

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jbsx/chessrumble/chess"
)

var JWTKEY = []byte{69}

func main() {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"PUT", "PATCH", "POST", "GET", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization", "accept", "origin", "Cache-Control", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	type gamedata struct {
		id    string
		white string
		black string
	}
	games := make(map[string]*gamedata)

	r.POST("/create", func(ctx *gin.Context) {
		id := uuid.New()

		token, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"iat":  time.UTC,
			"id":   id.String(),
			"team": "white",
		}).SignedString(JWTKEY)

		games[id.String()] = &gamedata{
			id: id.String(),
			//white: websocket,
		}

		ctx.SetCookie("token", token, 60*60*24, "/", "http://localhost:3000", true, true)

		ctx.JSON(http.StatusOK, gin.H{
			"message": id.String(),
		})
	})

	r.POST("/join/:id", func(ctx *gin.Context) {
		id := ctx.Params.ByName("id")
		game := games[id]

		if game == nil {
			ctx.JSON(http.StatusNotFound, gin.H{"message": "game not found"})
		}

		if cookie, err := ctx.Cookie("token"); err == nil {
			//either authorized or to join or issue new token

			token, err := jwt.Parse(cookie, func(token *jwt.Token) (interface{}, error) {
				// Don't forget to validate the alg is what you expect:
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
				}

				return JWTKEY, nil
			})

			if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
				fmt.Println(claims["id"], claims["team"])
			} else {
				fmt.Println(err)
			}

		}

		token, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"iat":  time.UTC,
			"id":   id,
			"team": "black",
		}).SignedString(JWTKEY)

		ctx.SetCookie("token", token, 60*60*24, "/", "http://localhost:3000", true, true)

		ctx.JSON(http.StatusOK, gin.H{
			"message": "OK",
		})
	})

	r.Run()

	br := chess.New()
	br.Log()
}
