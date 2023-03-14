package chess

import (
	"fmt"
)

type Chessboard struct {
	board [8][8]*Piece
	white string
	black string
}

func New() Chessboard {
	return Chessboard{[8][8]*Piece{
		{&Piece{Rook, White}, &Piece{Knight, White}, &Piece{Bishop, White}, &Piece{Queen, White}, &Piece{King, White}, &Piece{Bishop, White}, &Piece{Knight, White}, &Piece{Rook, White}},
		{&Piece{Pawn, White}, &Piece{Pawn, White}, &Piece{Pawn, White}, &Piece{Pawn, White}, &Piece{Pawn, White}, &Piece{Pawn, White}, &Piece{Pawn, White}, &Piece{Pawn, White}},
		{},
		{},
		{},
		{},
		{&Piece{Pawn, Black}, &Piece{Pawn, Black}, &Piece{Pawn, Black}, &Piece{Pawn, Black}, &Piece{Pawn, Black}, &Piece{Pawn, Black}, &Piece{Pawn, Black}, &Piece{Pawn, Black}},
		{&Piece{Rook, Black}, &Piece{Knight, Black}, &Piece{Bishop, Black}, &Piece{Queen, Black}, &Piece{King, Black}, &Piece{Bishop, Black}, &Piece{Knight, Black}, &Piece{Rook, Black}},
	}, "", ""}
}

func (c *Chessboard) Move(from string, to string) bool {
	fmt.Println("From move function")
	return true
}

func (c *Chessboard) Log() {
	for _, r := range c.board {
		for _, v := range r {
			if v != nil {
				fmt.Printf("%v ", v.String())
			}
		}
		fmt.Println()
	}
}
