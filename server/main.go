package main

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jbsx/chessrumble/chess"
)

var JWTKEY = []byte{69}

func main() {
	r := gin.Default()

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

		ctx.JSON(http.StatusOK, gin.H{
			"ID":    id.String(),
			"token": token,
		})
	})

	r.POST("/join/:id", func(ctx *gin.Context) {
		id := ctx.Params.ByName("id")
		game := games[id]

		if game == nil {
			ctx.JSON(http.StatusNotFound, gin.H{"message": "game not found"})
		}

		token, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"iat":  time.UTC,
			"id":   id,
			"team": "black",
		}).SignedString(JWTKEY)

		//ctx.SetCookie

		ctx.JSON(http.StatusOK, gin.H{
			"ID":    id,
			"token": token,
		})
	})

	r.Run()

	br := chess.New()
	br.Log()
}
