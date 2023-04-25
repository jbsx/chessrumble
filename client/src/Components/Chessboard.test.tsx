import { render } from "@testing-library/react";
import Chessboard from "../Components/Chessboard";

describe("Initial render", () => {
    test("Board render", () => {
        const { container } = render(<Chessboard />);

        const rows = container.getElementsByClassName("row");
        expect(rows.length).toBe(8);
        for (let i = 0; i < rows.length; i++) {
            expect(rows[i]).toHaveClass("row");

            const squares = rows[i].childNodes;
            expect(squares.length).toBe(8);
            squares.forEach((node) => {
                expect(node).toHaveClass("square");
            });
        }
    });

    test("Render from FEN", () => {
        const { container } = render(<Chessboard fen="" />);

        const rows = container.getElementsByClassName("row");
        expect(rows.length).toBe(8);
        for (let i = 0; i < rows.length; i++) {
            expect(rows[i]).toHaveClass("row");

            const squares = rows[i].childNodes;
            expect(squares.length).toBe(8);
            squares.forEach((node) => {
                expect(node).toHaveClass("square");
            });
        }
    });

    test("Initial position in FEN", () => {
        const { container } = render(
            <Chessboard fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" />,
        );

        const rows = container.getElementsByClassName("row");
        expect(rows.length).toBe(8);
    });
});
