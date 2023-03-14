package chess

type Team int8

const (
	White Team = iota
	Black
)

type Kind int8

const (
	Pawn Kind = iota
	Knight
	Bishop
	Rook
	Queen
	King
)

type Piece struct {
	Kind Kind
	Team Team
}

func (p *Piece) Val() int {
	switch p.Kind {
	case Pawn:
		return 1
	case Knight:
		return 3
	case Bishop:
		return 3
	case Rook:
		return 5
	case Queen:
		return 9
	case King:
		return 0
	default:
		return -1
	}
}

func (p *Piece) String() string {
	res := ""

	switch p.Team {
	case White:
		res += "W"
	case Black:
		res += "B"
	}

	switch p.Kind {
	case Pawn:
		res += "P"
	case Knight:
		res += "N"
	case Bishop:
		res += "B"
	case Rook:
		res += "R"
	case Queen:
		res += "Q"
	case King:
		res += "K"
	default:
	}

	return res
}
