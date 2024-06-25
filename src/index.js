
const colChars = ["a", "b", "c", "d", "e", "f", "g", "h"];
const rowChars = ["1", "2", "3", "4", "5", "6", "7", "8"];
const piece_side_size = 40; 

/* 
########################################################################
Website 
########################################################################
*/

function create_chess_ui() {
    create_board(); 
}

function create_board() {
    let game = new Game; 
    let moveController = new MoveController(game); 
    build_board(moveController); 
    fen_to_board(game.get_fen()); 
}

// Construct the board as a <tbl> where each <td> has a <div> child 
// which in turn has three <div> children. These <div>s are organized 
// using the grid display. The first div holds the rank annotation 
// (if on the a column) and the third div holds the column annotation 
// (if on the 1st rank). The second div holds the image, which is 
// either transparent or a piece image. 
function build_board(moveController) {
    const board = document.getElementById("chessboard"); 
    const body = document.createElement("tbody"); 
    const sideLength = 8; 

    for(let i = 0; i < sideLength; i++) {
        const row = document.createElement("tr"); 
        for(let j = 0; j < sideLength; j++) {
            const cell = document.createElement("td"); 
            cell.id = `${colChars[j]}${rowChars[sideLength - (i + 1)]}`; 
            
            // construct the wrapper and child divs
            let wrapper = document.createElement("div"); 
            let divprow = document.createElement("div"); 
            let divimg = document.createElement("div"); 
            let divpcol = document.createElement("div"); 
            
            wrapper.id = "wrapper"; 
            divprow.id = "pdivrow"; 
            divimg.id = "imgdiv"; 
            divpcol.id = "pdivcol"; 

            // Determine the square color 
            let squareColor; 
            if((j + (i % 2)) % 2 === 1) {
                squareColor = "darksquare";
            }
            else {
                squareColor = "lightsquare";
            }
            cell.classList.add(squareColor); 

            // Add the onclick behavior 
            cell.addEventListener("click", (e) => {
                moveController.handle_click(cell.id); 
            });

            // Empty squares have a transparent image
            let trans_img = gen_trans_img(); 
            divimg.appendChild(trans_img);             

            // Determine the row/col annotations 
            let rowAnnotation = document.createElement("p"); 
            let colAnnotation = document.createElement("p"); 
            rowAnnotation.classList.add("rowAnnotation", squareColor); 
            colAnnotation.classList.add("colAnnotation", squareColor); 
            if(i === sideLength - 1) { // last row 
                colAnnotation.innerText = colChars[j]; 
                divpcol.appendChild(colAnnotation); 
            }
            if(j === 0) { // first col 
                rowAnnotation.innerText = rowChars[sideLength - (i + 1)];  
                divprow.appendChild(rowAnnotation); 
            }

            wrapper.appendChild(divprow);
            wrapper.appendChild(divimg);
            wrapper.appendChild(divpcol);
            cell.appendChild(wrapper); 
            row.appendChild(cell); 
        }
        body.appendChild(row); 
    }
    board.appendChild(body); 
}

function gen_trans_img() {
    let no_piece = document.createElement("img"); 
    no_piece.src = "./imgs/pngs/no_piece.png"; 
    return no_piece; 
}

// takes in a fen string and fills the board with the pieces 
function fen_to_board(fen) {
    let idx = 0; 

    for(let i = 0; i < fen.length; i++) {
        let x = fen.charAt(i); 
        if(x >= '1' && x <= '8') {
            for(let j = 0; j < Number(x); j++) {
                let cellID = idx_to_id(idx); 
                let cell = document.getElementById(cellID); 
                let wrapper = cell.children[0]; 

                let square = Square.from_id(cellID); 
                let piece = Piece.makeNoPiece(); 
                const newSrc = piece.src; 

                let divImg = wrapper.children[1]; 
                let oldImg = divImg.children[0]; 
                oldImg.src = newSrc; 
                idx++
            }
        }
        else if(fen_chars.includes(x)) {
            let cellID = idx_to_id(idx); 
            let cell = document.getElementById(cellID); 
            let wrapper = cell.children[0]; 

            // let piece = fenChar_to_Piece(x); 
            let square = Square.from_id(cellID); 
            let piece = Piece.from_fen_and_square(x, square); 
            const newSrc = piece.src; 

            let divImg = wrapper.children[1]; 
            let oldImg = divImg.children[0]; 
            oldImg.src = newSrc; 

            idx += 1; 
        }
    }
}

/*
########################################################################
Board Utility classes 
########################################################################
*/

/*
The board is arranged and numbered as: 

a8 b8 c8 d8 e8 f8 g8 h8 
a7 b7 c7 d7 e7 f7 g7 h7 
a6 b6 c6 d6 e6 f6 g6 h6 
a5 b5 c5 d5 e5 f5 g5 h5 
a4 b4 c4 d4 e4 f4 g4 h4 
a3 b3 c3 d3 e3 f3 g3 h3 
a2 b2 c2 d2 e2 f2 g2 h2 
a1 b1 c1 d1 e1 f1 g1 h1 

 0  1  2  3  4  5  6  7
 8  9 10 11 12 13 14 15 
16 17 18 19 20 21 22 23 
24 25 26 27 28 29 30 31 
32 33 34 35 36 37 38 39 
40 41 42 43 44 45 46 47 
48 49 50 51 52 53 54 55 
56 57 58 59 60 61 62 63 

So the directions 
NW N NE 
 W 0  E
SW S SE
Correspond to adding: 
-9 -8 -7
-1  0  1 
 7  8  9
*/

class Square {
    constructor(id) {
        if(id === "out of bounds") {
            this.id = "out of bounds"; 
            this.idx = 100; 
        }
        else {
            this.id = id; 
            this.idx = id_to_idx(this.id); 
        }
    }

    static from_id(id) {
        let fileIdx = colChars.findIndex((c) => c === id.charAt(0)); 
        let rankIdx = rowChars.findIndex((c) => c === id.charAt(1)); 

        if(fileIdx === -1 || rankIdx === -1) {
            return OUT_OF_BOUNDS; 
        }

        return new Square(id); 
    }

    static from_idx(idx) {
        let id = idx_to_id(idx); 

        if(id === OUT_OF_BOUNDS.id) {
            return OUT_OF_BOUNDS; 
        }

        return new Square(id); 
    }

    isOutOfBounds() {
        return this.id == OUT_OF_BOUNDS.id; 
    }
}

const OUT_OF_BOUNDS = new Square("out of bounds"); 

class Direction {
    constructor(name, offset) {
        this.name = name; 
        this.offset = offset; 
    }

    // returns idx 
    // We have to respect the board boundaries 
    // You can't go: 
    // NORTH from the 8th rank, 
    // SOUTH from the 1st rank, 
    // EAST from the H file, 
    // WEST from the A file 
    from_idx(idx) { 
        let result = idx + this.offset; 
        if(result < 0 || result > 63) {
            return OUT_OF_BOUNDS.idx; 
        }

        // Handle 8th Rank indices 0,1,2,3,4,5,6,7 
        if(this.name == NORTH.name || this.name === NORTHEAST.name || this.name === NORTHWEST.name) {
            if(idx >= 0 && idx <= 8) {
                return OUT_OF_BOUNDS.idx; 
            }
        }
        
        // Handle 1st Rank indices 56, 57, 58, 59, 60, 61, 62, 63
        if(this.name == SOUTH.name || this.name === SOUTHEAST.name || this.name === SOUTHWEST.name) {
            if(idx >= 56 && idx <= 63) {
                return OUT_OF_BOUNDS.idx; 
            }
        }

        // Handle H File indices 7, 15, 23, 31, 39, 47, 55, 63
        if(this.name == EAST.name || this.name === SOUTHEAST.name || this.name === NORTHEAST.name) {
            if((idx + 1) % 8 == 0) {
                return OUT_OF_BOUNDS.idx; 
            }
        }

        // Handle A File indices 0, 8, 16, 24, 32, 40, 48, 56 
        if(this.name == WEST.name || this.name === NORTHWEST.name || this.name === SOUTHWEST.name) {
            if(idx % 8 == 0) {
                return OUT_OF_BOUNDS.idx; 
            }
        }

        return result; 
    }

    // returns square 
    from_square(square) { 
        return Square.from_idx( this.from_idx(id_to_idx(square.id)) ); 
    }

    from_square_by(square, num) {
        let result = Square.from_id(square.id); 
        for(let i = 0; i < num; i++) {
            result = this.from_square(result); 
        }

        return result; 
    }

    from_idxs(idxs) {
        return idxs.map((x) => x + this.offset); 
    }
}

const NORTH = new Direction("N", -8); 
const EAST = new Direction("E", 1); 
const SOUTH = new Direction("S", 8); 
const WEST = new Direction("W", -1); 

const NORTHEAST = new Direction("NE", -7); 
const SOUTHEAST = new Direction("SE", 9); 
const SOUTHWEST = new Direction("SW", 7); 
const NORTHWEST = new Direction("NW", -9); 

const CARDINAL_DIRECTIONS = [NORTH, EAST, SOUTH, WEST]; 
const VERTICALS = [NORTH, SOUTH]; 
const HORIZONTALS = [EAST, WEST]; 
const DIAGONAL_DIRECTIONS = [NORTHEAST, SOUTHEAST, SOUTHWEST, NORTHWEST]; 
const ALL_DIRECTIONS = [NORTH, EAST, SOUTH, WEST, NORTHEAST, SOUTHEAST, SOUTHWEST, NORTHWEST]; 


class File_Chess {
    constructor(idxs, char_id) {
        this.idxs = idxs; 
        this.char_id = char_id; 
    }
}

class Rank_Chess {
    constructor(idxs, char_id) {
        this.idxs = idxs; 
        this.char_id = char_id; 
    }
}

const FILE_A_IDXS = [0, 8, 16, 24, 32, 40, 48, 56, 64]; 
const FILE_B_IDXS = EAST.from_idxs(FILE_A_IDXS);
const FILE_C_IDXS = EAST.from_idxs(FILE_B_IDXS);
const FILE_D_IDXS = EAST.from_idxs(FILE_C_IDXS);
const FILE_E_IDXS = EAST.from_idxs(FILE_D_IDXS);
const FILE_F_IDXS = EAST.from_idxs(FILE_E_IDXS);
const FILE_G_IDXS = EAST.from_idxs(FILE_F_IDXS);
const FILE_H_IDXS = EAST.from_idxs(FILE_G_IDXS);

const RANK_1_IDXS = [56, 57, 58, 59, 60, 61, 62, 63]; 
const RANK_2_IDXS = NORTH.from_idxs(RANK_1_IDXS); 
const RANK_3_IDXS = NORTH.from_idxs(RANK_2_IDXS); 
const RANK_4_IDXS = NORTH.from_idxs(RANK_3_IDXS);
const RANK_5_IDXS = NORTH.from_idxs(RANK_4_IDXS); 
const RANK_6_IDXS = NORTH.from_idxs(RANK_5_IDXS);
const RANK_7_IDXS = NORTH.from_idxs(RANK_6_IDXS);
const RANK_8_IDXS = NORTH.from_idxs(RANK_7_IDXS);

const FILE_A = new File_Chess(FILE_A_IDXS, "a");
const FILE_B = new File_Chess(FILE_B_IDXS, "b");
const FILE_C = new File_Chess(FILE_C_IDXS, "c");
const FILE_D = new File_Chess(FILE_D_IDXS, "d");
const FILE_E = new File_Chess(FILE_E_IDXS, "e");
const FILE_F = new File_Chess(FILE_F_IDXS, "f");
const FILE_G = new File_Chess(FILE_G_IDXS, "g");
const FILE_H = new File_Chess(FILE_H_IDXS, "h");
const OUT_OF_BOUNDS_FILE = new File_Chess([], "out_of_bounds_file");

const RANK_1 = new Rank_Chess(RANK_1_IDXS, "1"); 
const RANK_2 = new Rank_Chess(RANK_2_IDXS, "2"); 
const RANK_3 = new Rank_Chess(RANK_3_IDXS, "3"); 
const RANK_4 = new Rank_Chess(RANK_4_IDXS, "4"); 
const RANK_5 = new Rank_Chess(RANK_5_IDXS, "5"); 
const RANK_6 = new Rank_Chess(RANK_6_IDXS, "6"); 
const RANK_7 = new Rank_Chess(RANK_7_IDXS, "7"); 
const RANK_8 = new Rank_Chess(RANK_8_IDXS, "8"); 
const OUT_OF_BOUNDS_RANK = new Rank_Chess([], "out_of_bounds_rank");

const FILES = [FILE_A, FILE_B, FILE_C, FILE_D, FILE_E, FILE_F, FILE_G, FILE_H]; 
const RANKS = [RANK_1, RANK_2, RANK_3, RANK_4, RANK_5, RANK_6, RANK_7, RANK_8]; 

/*
########################################################################
Chess Classes 
########################################################################
*/

class Piece {
    constructor(name, color, fen_char, square) {
        this.name = name; 
        this.color = color; 
        this.src = `./imgs/pngs/${name}.png`; 
        this.fen_char = fen_char; 
        this.square = square; 
        this.has_moved = false; 
        this.can_be_captured_en_passant = false; 
    }

    isEnemyPiece(color) {
        //console.log("this.isNoPiece() :"); 
        //console.log(this.isNoPiece()); 

        if(this.isNoPiece()) {
            return false; 
        }
        if(this.color == color) {
            return false; 
        }

        return true; 
    }

    isFriendlyPiece(color) {
        if(this.isNoPiece()) {
            return false; 
        }
        if(this.color != color) {
            return false; 
        }

        return true; 
    }

    isNoPiece() {
        return this.name == no_piece_name; 
    }

    static makeBlackPawn(square) {
        return new Piece("black_pawn", "black", "p", square); 
    }

    static makeBlackKnight(square) {
        return new Piece("black_knight", "black", "n", square); 
    }

    static makeBlackBishop(square) {
        return new Piece("black_bishop", "black", "b", square); 
    }

    static makeBlackRook(square) {
        return new Piece("black_rook", "black", "r", square); 
    }

    static makeBlackQueen(square) {
        return new Piece("black_queen", "black", "q", square); 
    }

    static makeBlackKing(square) {
        return new Piece("black_king", "black", "k", square); 
    }

    static makeWhitePawn(square) {
        return new Piece("white_pawn", "white", "P", square); 
    }

    static makeWhiteKnight(square) {
        return new Piece("white_knight", "white", "N", square); 
    }

    static makeWhiteBishop(square) {
        return new Piece("white_bishop", "white", "B", square); 
    }

    static makeWhiteRook(square) {
        return new Piece("white_rook", "white", "R", square); 
    }

    static makeWhiteQueen(square) {
        return new Piece("white_queen", "white", "Q", square); 
    }

    static makeWhiteKing(square) {
        return new Piece("white_king", "white", "K", square); 
    }

    static makeNoPiece(square) {
        return new Piece("no_piece", "none", no_piece_char, square); 
    }

    static from_fen_and_square(fen_char, square) {
        switch(fen_char) {
            case 'p': return Piece.makeBlackPawn(square); 
            case 'n': return Piece.makeBlackKnight(square); 
            case 'b': return Piece.makeBlackBishop(square); 
            case 'r': return Piece.makeBlackRook(square); 
            case 'q': return Piece.makeBlackQueen(square); 
            case 'k': return Piece.makeBlackKing(square); 
            case 'P': return Piece.makeWhitePawn(square); 
            case 'N': return Piece.makeWhiteKnight(square); 
            case 'B': return Piece.makeWhiteBishop(square); 
            case 'R': return Piece.makeWhiteRook(square); 
            case 'Q': return Piece.makeWhiteQueen(square); 
            case 'K': return Piece.makeWhiteKing(square); 
            case no_piece_char: return Piece.makeNoPiece(square); 
            default: return 678; 
        }
    }

    isPawn() {
        return this.fen_char === "p" || this.fen_char === "P"; 
    }
    
    isKnight() {
        return this.fen_char === "n" || this.fen_char === "N"; 
    }

    isBishop() {
        return this.fen_char === "b" || this.fen_char === "B"; 
    }

    isRook() {
        return this.fen_char === "r" || this.fen_char === "R"; 
    }

    isQueen() {
        return this.fen_char === "q" || this.fen_char === "Q"; 
    }

    isKing() {
        return this.fen_char === "k" || this.fen_char === "K"; 
    }
}

const fen_chars = ['p', 'n', 'b', 'r', 'q', 'k', 'P', 'N', 'B', 'R', 'Q', 'K']; 
const no_piece_char = " "; 
const no_piece_name = "no_piece"; 

/*
########################################################################
Game Classes
########################################################################
*/

class Player {
    constructor(color) {
        if(color === "white") {
            this.name = "White Player"; 
        } 
        else if(color === "black") {
            this.name = "Black Player"; 
        }

        this.pawns = []; 
        this.knights = []; 
        this.bishops = []; 
        this.rooks = []; 
        this.queens = []; 
        this.kings = []; 

        this.castling_kingside_rights = true; 
        this.castling_queenside_rights = true; 
    }

    print_pieces() {
        console.log(this.pawns); 
        console.log(this.knights); 
        console.log(this.bishops); 
        console.log(this.rooks); 
        console.log(this.queens); 
        console.log(this.kings); 
    }

    add_piece(piece) {
        switch(piece.fen_char) {
            case 'p': {
                this.pawns.push(piece); 
                break; 
            }
            case 'n': {
                this.knights.push(piece); 
                break;
            }
            case 'b': {
                this.bishops.push(piece); 
                break;
            }
            case 'r': {
                this.rooks.push(piece); 
                break;
            }
            case 'q': {
                this.queens.push(piece); 
                break;
            }
            case 'k':{
                this.kings.push(piece); 
                break;
            }
            case 'P': {
                this.pawns.push(piece); 
                break;
            }
            case 'N': {
                this.knights.push(piece); 
                break; 
            }
            case 'B': {
                this.bishops.push(piece); 
                break; 
            }
            case 'R': {
                this.rooks.push(piece); 
                break; 
            }
            case 'Q': {
                this.queens.push(piece); 
                break; 
            }
            case 'K': {
                this.kings.push(piece); 
                break; 
            }
            default: ;
        }
    }

    remove_piece(id) {
        function filter_func(p) {
            return p.square.id != id; 
        }
        
        this.pawns = this.pawns.filter(filter_func); 
        this.knights = this.knights.filter(filter_func); 
        this.bishops = this.bishops.filter(filter_func); 
        this.rooks = this.rooks.filter(filter_func); 
        this.queens = this.queens.filter(filter_func); 
        this.kings = this.kings.filter(filter_func);  
    }

    get_pawn_squares() {
        return this.pawns.map((p) => p.square); 
    }

    get_knight_squares() {
        return this.knights.map((p) => p.square); 
    }

    get_bishop_squares() {
        return this.bishops.map((p) => p.square); 
    }

    get_rook_squares() {
        return this.rooks.map((p) => p.square); 
    }
    
    get_queen_squares() {
        return this.queens.map((p) => p.square); 
    }

    get_king_square() {
        return this.kings[0].square; 
    }
}

// The board_array has a length of 64 and corresponds to the numbering 
// a8 b8 c8 d8 e8 f8 g8 h8 
// a7 b7 c7 d7 e7 f7 g7 h7 
// a6 b6 c6 d6 e6 f6 g6 h6 
// a5 b5 c5 d5 e5 f5 g5 h5 
// a4 b4 c4 d4 e4 f4 g4 h4 
// a3 b3 c3 d3 e3 f3 g3 h3 
// a2 b2 c2 d2 e2 f2 g2 h2 
// a1 b1 c1 d1 e1 f1 g1 h1 

//  0  1  2  3  4  5  6  7
//  8  9 10 11 12 13 14 15 
// 16 17 18 19 20 21 22 23 
// 24 25 26 27 28 29 30 31 
// 32 33 34 35 36 37 38 39 
// 40 41 42 43 44 45 46 47 
// 48 49 50 51 52 53 54 55 
// 56 57 58 59 60 61 62 63 
class Game {
    constructor() {
        this.dark_player    = new Player("black"); 
        this.light_player   = new Player("white"); 
        this.board_array = []; 
        this.setup_board("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"); 
    }

    place_piece_on_board(piece) {
        if(piece.isNoPiece()) {
            this.board_array.splice(piece.square.idx, 1, piece); 
        }

        if(piece.color === "white") {
            this.light_player.remove_piece(piece.square.id); 
            this.light_player.add_piece(piece); 
            this.board_array.splice(piece.square.idx, 1, piece); 
        }
        else if(piece.color === "black") {
            this.dark_player.remove_piece(piece.square.id); 
            this.dark_player.add_piece(piece); 
            this.board_array.splice(piece.square.idx, 1, piece); 
        }
    }

    remove_piece_from_board_at_square(square) {
        let piece = this.board_array[square.idx]; 

        if(piece.isNoPiece()) {
            return; 
        }

        if(piece.color === "white") {
            this.light_player.remove_piece(piece.square.id); 
            this.board_array[square.idx] = Piece.makeNoPiece(); 
        }
        else if(piece.color === "black") {
            this.dark_player.remove_piece(piece.square.id); 
            this.board_array[square.idx] = Piece.makeNoPiece(); 
        }
    }

    remove_piece_from_board_at_id(id) {
        let idx = id_to_idx(id); 
        let piece = this.board_array[idx]; 

        if(piece.isNoPiece()) {
            return; 
        }

        if(piece.color === "white") {
            this.light_player.remove_piece(piece.square.id); 
            this.board_array[idx] = Piece.makeNoPiece(); 
        }
        else if(piece.color === "black") {
            this.dark_player.remove_piece(piece.square.id); 
            this.board_array[idx] = Piece.makeNoPiece(); 
        }
    }

    setup_board(fen) {
        let idx = 0; 

        for(let i = 0; i < fen.length; i++) {
            let x = fen.charAt(i); 
            if(x >= '1' && x <= '8') {
                for(let j = 0; j < Number(x); j++) {
                    let id = idx_to_id(idx); 
                    let square = Square.from_id(id); 
                    let piece = Piece.makeNoPiece(square); 
                    this.place_piece_on_board(piece); 
                    idx++
                }
            }
            else if(fen_chars.includes(x)) {
                let id = idx_to_id(idx); 
                let square = Square.from_id(id); 
                let piece = Piece.from_fen_and_square(x, square); 
                this.place_piece_on_board(piece); 
                idx++; 
            }
        }
    }

    // Returns a list of the 64 piece's fen chars in order 
    get_fen_list() {
        let fen_list = []; 

        for(let i = 0; i < 64; i++) {
            fen_list.push(this.board_array[i].fen_char); 
        }

        return fen_list; 
    }

    get_fen() {
        let piece_vec = this.get_fen_list(); 
        let spaces = 0; 
        let fen_str = ""; 

        for(let idx = 0; idx < piece_vec.length; idx++) {
            if(piece_vec[idx] != " ") {
                if(spaces < 8) {
                    if(spaces > 0) {
                        fen_str += String(spaces); 
                    }
                    fen_str += piece_vec[idx]; 
                    spaces = 0; 
                }
                else if(spaces === 8) {
                    fen_str += "8"; 
                    fen_str += piece_vec[idx]; 
                    spaces = 0; 
                }
            }
            else {
                if(spaces === 8) {
                    fen_str += "8"; 
                    spaces = 0; 
                }
                else if(idx === 63) {
                    spaces += 1; 
                    fen_str += String(spaces); 
                }
                else {
                    spaces += 1; 
                }
            }

            if((idx + 1) % 8 == 0 && idx > 0 && idx < 63) {
                if(spaces > 0) {
                    fen_str += String(spaces); 
                    spaces = 0; 
                }
                fen_str += "/"; 
            }
        }

        return fen_str; 
    }

    piece_at_id(id) {
        if(id < 0 || id > 63) {
            return Piece.makeNoPiece(OUT_OF_BOUNDS); 
        }
        return this.board_array[id_to_idx(id)]; 
    }

    piece_at_square(square) {
        if(square.isOutOfBounds()) {
            return Piece.makeNoPiece(OUT_OF_BOUNDS); 
        }

        return this.piece_at_id(square.id); 
    }

    move_piece(source_id, dest_id) {
        let piece = this.piece_at_id(source_id); 
        if(piece.isNoPiece()) {
            return; 
        }

        this.remove_piece_from_board_at_id(piece.square.id); 
        piece.square = Square.from_id(dest_id); 
        piece.has_moved = true; 
        this.place_piece_on_board(piece); 
    }

    castle_kingside(color) {
        if(color === "white") {
            // move king e1 -> g1 
            // move rook h1 -> f1 
            this.move_piece("e1", "g1"); 
            this.move_piece("h1", "f1"); 
        }
        else if(color === "black") {
            // move king e8 -> g8 
            // move rook h8 -> f8
            this.move_piece("e8", "g8"); 
            this.move_piece("h8", "f8"); 
        }
        else {
            alert("error in cast_kingside function"); 
        }
    }

    castle_queenside(color) {
        if(color === "white") {
            // move king e1 -> c1
            // move rook a1 -> d1
            this.move_piece("e1", "c1"); 
            this.move_piece("h1", "d1"); 
        }
        else if(color === "black") {
            // move king e8 -> c8
            // move rook a8 -> d8
            this.move_piece("e8", "c8"); 
            this.move_piece("h8", "d8"); 
        }
        else {
            alert("error in cast_queenside function"); 
        }
    }

    get_player(color) {
        if(color === "white") {
            return this.light_player; 
        }
        else if(color === "black") {
            return this.dark_player; 
        }
    }
}

/*
########################################################################
utils 
########################################################################
*/

function color_from_id(cell_id) { 
    let fileIdx = colChars.findIndex((c) => c === cell_id.charAt(0)); 
    let rankIdx = rowChars.findIndex((c) => c === cell_id.charAt(1)); 

    if(fileIdx === -1 || rankIdx === -1) {
        return OUT_OF_BOUNDS.id; 
    }

    if((fileIdx + (rankIdx % 2)) % 2 === 1) {
        return "dark";
    }
    else {
        return "light";
    }
}

function highlight_id(cell_id) { 
    let cell = document.getElementById(cell_id); 
    cell.classList.add("highlighted"); 
}

function highlight_squares(squares) {
    for(const square of squares) {
        highlight_id(square.id); 
    }
}

function highlight_attacker(cell_id) {
    let cell = document.getElementById(cell_id); 
    cell.classList.add("highlighted_attacker"); 
}

function highlight_attacker_squares(squares) {
    for(const square of squares) {
        highlight_attacker(square.id); 
    }
}

function remove_all_highlights() { 
    console.log("remove_all_highlights"); 
    let cells = document.querySelectorAll(".highlighted"); 

    for(let i = 0; i < cells.length; i++) {
        cells[i].classList.remove("highlighted"); 
    }
}

function remove_all_attacker_highlights() { 
    let cells = document.querySelectorAll(".highlighted_attacker"); 

    for(let i = 0; i < cells.length; i++) {
        cells[i].classList.remove("highlighted_attacker"); 
    }
}

// number the squares of the chessboard with a8 = 0 and h1 = 63 
function idx_to_id(idx) { 
    if(idx < 0 || idx > 63) {
        return OUT_OF_BOUNDS.id; 
    }

    const rankIdx = 8 - (Math.floor(idx / 8) + 1); 
    const fileIdx = idx % 8; 

    return `${colChars[fileIdx]}${rowChars[rankIdx]}`;
}

function id_to_idx(id) { 
    let fileIdx = colChars.findIndex((c) => c === id.charAt(0)); 
    let rankIdx = rowChars.findIndex((c) => c === id.charAt(1)); 

    if(fileIdx === -1 || rankIdx === -1) {
        return OUT_OF_BOUNDS.idx; 
    }

    return 8 * (7 - rankIdx) + fileIdx; 
}

/*
########################################################################
move generation 
########################################################################
*/ 

class Moves {
    constructor(source_square) {
        this.source_square = source_square; 
        this.dest_squares = []; 
    }

    static AND_squares(squares_a, squares_b) {
        return squares_a.filter((x) => {
            for(const y of squares_b) {
                return x.id === y.id && x.idx === y.idx; 
            }
        }); 
    }

    static OR_squares(squares_a, squares_b) {
        return [...new Set([...squares_a, ...squares_b])];
    }

    AND(squares) {
        this.dest_squares = AND_squares(this.dest_squares, squares); 
    }

    OR(squares) {
        this.dest_squares = OR_squares(this.dest_squares, squares); 
    }

    has_move(square) {
        for(let s of this.dest_squares) {
            if(s.id === square.id && s.idx === square.idx) {
                return true; 
            }
        }

        return false; 
    }
}

function gen_pawn_moves(game, source_id, color) {
    let source_square = Square.from_id(source_id); 
    let moves = new Moves(source_square); 
    let direction; 

    if(color == "white") {
        direction = NORTH; 
    }
    else if(color == "black") {
        direction = SOUTH; 
    }
    else {
        alert("Error in gen_pawn_moves"); 
    }

    // Handle the case of one cell in front of the pawn 
    let one_ahead_square = direction.from_square(source_square); 
    let one_ahead_piece = game.piece_at_square(one_ahead_square); 
    // console.log("one_ahead_piece: "); 
    // console.log(one_ahead_piece); 

    if(one_ahead_piece.isNoPiece()) {
        moves.dest_squares.push(one_ahead_square); 

        // Handle the case of the cell two spaces in front of the pawn 
        if(((direction === NORTH) && (source_id.charAt(1) === "2")) || ((direction === SOUTH) && (source_id.charAt(1) === "7"))) {
            let two_ahead_square = direction.from_square(one_ahead_square); 
            let two_ahead_piece = game.piece_at_square(two_ahead_square); 

            // console.log("two_ahead_piece: "); 
            // console.log(two_ahead_piece); 

            if(two_ahead_piece.isNoPiece()) {
                moves.dest_squares.push(two_ahead_square); 
            }
        }
    }

    // Handle the diagonals 
    let diagonal_east = EAST.from_square(one_ahead_square); 
    let diagonal_west = WEST.from_square(one_ahead_square); 
    let diagonalSquares = [diagonal_east, diagonal_west]; 

    for(const d of diagonalSquares) {
        let diagonal_piece = game.piece_at_square(d); 

        if(diagonal_piece.isEnemyPiece(color)) {
            moves.dest_squares.push(d);
        } 
    } 

    return moves;      
}

function gen_knight_moves(game, source_id, color) {
    let source_square = Square.from_id(source_id); 
    let moves = new Moves(source_square); 
    let dest_square;  
    let dest_piece;  

    for(const horz of HORIZONTALS) {
        for(const vert of VERTICALS) {
            for(let i = 1; i <= 2; i++) {
                let j = 3 - i; 

                // Calculate destination square
                dest_square = horz.from_square_by(source_square, i); 
                dest_square = vert.from_square_by(dest_square, j); 

                // if destination square is out of bounds, continue 
                if(dest_square.isOutOfBounds()) {
                    continue; 
                }

                // Check if the destination square has a piece of the same 
                // color. If it doesn't, add it to the moves 
                dest_piece = game.piece_at_square(dest_square); 

                if(dest_piece.isEnemyPiece(color) || dest_piece.isNoPiece()) {
                    // moves |= bb_from_id(dest_square.id); 
                    moves.dest_squares.push(dest_square); 
                }
            }
        }
    }

    return moves; 
}

function gen_bishop_moves(game, source_id, color) {
    let source_square = Square.from_id(source_id); 
    let moves = new Moves(source_square); 

    for(const d of DIAGONAL_DIRECTIONS) {
        square_loop: for(let i = 1; i < 8; i++) {
            // Check if the square is occupied or if the square is out of bounds. 
            // Break from square_loop is so. 
            let dest_square = d.from_square_by(source_square, i); 
            let dest_piece = game.piece_at_square(dest_square); 

            if(dest_square.isOutOfBounds() || dest_piece.isFriendlyPiece(color)) {
                break square_loop; 
            }
            else if(dest_piece.isEnemyPiece(color)) {
                moves.dest_squares.push(dest_square); 
                break square_loop; 
            }
            else { // dest_square is unoccupied 
                moves.dest_squares.push(dest_square); 
            }
        }
    }

    return moves; 
}

function gen_rook_moves(game, source_id, color) {
    let source_square = Square.from_id(source_id); 
    let moves = new Moves(source_square); 

    for(const c of CARDINAL_DIRECTIONS) {
        square_loop: for(let i = 1; i < 8; i++) {
            // Check if the square is occupied or if the square is out of bounds. 
            // Break from square_loop is so. 
            let dest_square = c.from_square_by(source_square, i); 
            let dest_piece = game.piece_at_square(dest_square); 

            if(dest_square.isOutOfBounds() || dest_piece.isFriendlyPiece(color)) {
                break square_loop; 
            }
            else if(dest_piece.isEnemyPiece(color)) {
                moves.dest_squares.push(dest_square); 
                break square_loop; 
            }
            else { // dest_square is unoccupied 
                moves.dest_squares.push(dest_square); 
            }
        }
    }

    return moves; 
}

function gen_queen_moves(game, source_id, color) {
    let source_square = Square.from_id(source_id); 
    let moves = new Moves(source_square); 
    let cardinal_moves = gen_rook_moves(game, source_id, color); 
    let diagonal_moves = gen_bishop_moves(game, source_id, color); 

    moves.dest_squares = Moves.OR_squares(cardinal_moves.dest_squares, diagonal_moves.dest_squares); 
    return moves; 
}

function gen_king_moves(game, source_id, color) {
    let source_square = Square.from_id(source_id); 
    let moves = new Moves(source_square); 

    for(const d of ALL_DIRECTIONS) {
        let dest_square = d.from_square(source_square); 
        let dest_piece = game.piece_at_square(dest_square); 

        if(dest_square.isOutOfBounds()) {
            continue; 
        }
        else if(dest_piece.isEnemyPiece(color)) {
            moves.dest_squares.push(dest_square); 
        }
        else if(dest_piece.isNoPiece()) {
            moves.dest_squares.push(dest_square); 
        }
    }

    return moves; 
}

function gen_moves(game, id) {
    let piece = game.piece_at_id(id); 
    let square = Square.from_id(id); 

    // Check if there is a piece 
    if(piece.isNoPiece()) return new Moves(square); 

    switch(piece.fen_char) {
        case 'p': return gen_pawn_moves(game, id, "black"); 
        case 'n': return gen_knight_moves(game, id, "black"); 
        case 'b': return gen_bishop_moves(game, id, "black"); 
        case 'r': return gen_rook_moves(game, id, "black"); 
        case 'q': return gen_queen_moves(game, id, "black"); 
        case 'k': return gen_king_moves(game, id, "black"); 
        case 'P': return gen_pawn_moves(game, id, "white"); 
        case 'N': return gen_knight_moves(game, id, "white"); 
        case 'B': return gen_bishop_moves(game, id, "white"); 
        case 'R': return gen_rook_moves(game, id, "white"); 
        case 'Q': return gen_queen_moves(game, id, "white"); 
        case 'K': return gen_king_moves(game, id, "white"); 
        default: {
            alert("Error in gen_moves function"); 
            return 0; 
        }
    }
}

// function gen_moves(game, cell_id) {
//     let moves = 0n; 
//     let pre_check_moves = gen_moves_before_checks(game, cell_id); 

//     // deal with castling 

//     // deal with en passant 

//     // deal with pawn promotion 

//     moves |= pre_check_moves; 

//     return moves; 
// }

/*
########################################################################
Special Rules - Checks, Checkmate
########################################################################
*/

// Checks if the square is under attack by the player [color] 
function square_under_attack(color, game, square) {
    let enemy_player; 
    let dir_ahead; 
    let under_attack = false; 
    let attacker_squares = []; 

    if(color === "white") {
        enemy_player = game.dark_player; 
        dir_ahead = NORTH; 
    }
    else if(color === "black") {
        enemy_player = game.light_player; 
        dir_ahead = SOUTH; 
    }
    else {
        alert("Error in square_under_attack function"); 
    }

    // Check diagonally for enemy pawns 
    // - Get squares diagonally from square 
    // - Get pieces at the squares 
    // - Check if those are enemy pawns
    let s1 = dir_ahead.from_square(square); 
    let s2 = dir_ahead.from_square(square); 
    s1 = EAST.from_square(s1); 
    s2 = WEST.from_square(s2); 
    let p1 = game.piece_at_square(s1); 
    let p2 = game.piece_at_square(s2); 

    if(p1.isNoPiece()) {}
    else if(p1.isEnemyPiece(color) && p1.isPawn()) {
        console.log("Attacked by pawn")
        attacker_squares.push(s1); 
        under_attack = true;  
    }
    if(p2.isNoPiece()) {}
    else if(p2.isEnemyPiece(color) && p2.isPawn()) {
        console.log("Attacked by pawn"); 
        attacker_squares.push(s2); 
        under_attack = true; 
    }

    // Generate knight moves from square and check for enemy knight 
    let knight_moves = gen_knight_moves(game, square.id, color); 
    let attacking_knights = Moves.AND_squares(knight_moves.dest_squares, enemy_player.get_knight_squares()); 
    
    if(attacking_knights.length != 0) {
        console.log("Attacked by a knight"); 
        attacker_squares.push(...attacking_knights); 
        under_attack = true; 
    }

    // Generate bishop moves from king square and check for enemy bishop 
    let bishop_moves = gen_bishop_moves(game, square.id, color); 
    let attacking_bishops = Moves.AND_squares(bishop_moves.dest_squares, enemy_player.get_bishop_squares()); 

    if(attacking_bishops.length != 0) {
        console.log("Attacked by a bishop"); 
        attacker_squares.push(...attacking_bishops); 
        under_attack = true; 
    }

    // Generate rook moves from king square and check for enemy rook 
    let rook_moves = gen_rook_moves(game, square.id, color); 
    let attacking_rooks = Moves.AND_squares(rook_moves.dest_squares, enemy_player.get_rook_squares()); 

    if(attacking_rooks.length != 0) {
        console.log("Attacked by a rook"); 
        attacker_squares.push(...attacking_rooks); 
        under_attack = true; 
    }

    // Generate queen moves from the rook/bishop moves and check for enemy queen 
    let queen_moves = gen_queen_moves(game, square.id, color); 
    let attacking_queens = Moves.AND_squares(queen_moves.dest_squares, enemy_player.get_queen_squares()); 
    
    if(attacking_queens.length != 0) {
        console.log("Attacked by a queen"); 
        attacker_squares.push(...attacking_queens); 
        under_attack = true; 
    }

    return [under_attack, attacker_squares]; 
}

// returns (in_check: bool, list_of_attacking_squares: Square[]) 
function in_check(color, game) {
    let player = game.get_player(color); 
    let king_square = player.get_king_square(); 

    return square_under_attack(color, game, king_square); 
}

// function gen_moves_to_escape_check(color, game) {
//     // iterate through all possible moves. Make each of them, and if 
//     // the king is no longer in check, then add the move to the list 
//     let move_list = []; 

    
// }

/*
########################################################################
move controller 
########################################################################
*/ 

class MoveController {
    constructor(game) {
        this.game = game; 
        this.move_mode = false; 
        this.turn = "white"; 
        this.moves = new Moves(Square.from_id("a1")); 
        this.source_id = "a1"; 
        this.piece; 
        this.square; 
        this.player = this.game.light_player; 
        this.status = document.getElementById("status"); 
    }

    swap_turn() {
        if(this.turn === "white") {
            this.turn = "black"; 
            this.player = this.game.dark_player; 
        }
        else {
            this.turn = "white"; 
            this.player = this.game.light_player; 
        }
    }

    // Initially, we are not in move mode. If the player clicks an empty 
    // square, we are still not in move mode. 
    // If the player clicks one of their own pieces, then we enter move mode. 
    // If the player then clicks a square the piece can move to, the move 
    // is made and we exit move mode 
    handle_click(id) {
        this.square = Square.from_id(id); 
        if(this.move_mode) { // We are in move mode 
            // If we click on a cell we can move to, check if that 
            // move will put the player in check. If not, then make the move 
            // console.log("this.moves.dest_squares"); 
            // console.log(this.moves.dest_squares); 
            // console.log("this.piece.square"); 
            // console.log(this.square); 
            // console.log(`Includes: ${this.moves.has_move(this.square)}`); 

            if(this.moves.has_move(this.square)) { 
                // Make move 
                this.game.move_piece(this.piece.square.id, id); 
                // Switch turn 
                this.swap_turn(); 
                // Re-render board 
                fen_to_board(this.game.get_fen()); 
            } 
            // Check for checks. If a player is in check, then modify the status 
            // if a player is in check and highlight the attacker squares

            let white_is_in_check, white_attackers; 
            let black_is_in_check, black_attackers; 
            
            [white_is_in_check, white_attackers] = in_check("white", this.game); 
            [black_is_in_check, black_attackers] = in_check("black", this.game); 

            if(white_is_in_check) {
                this.status.textContent = "White Player is in check!"; 
                highlight_attacker_squares(white_attackers); 
            } 
            else if(black_is_in_check) {
                this.status.textContent = "Black Player is in check!"; 
                highlight_attacker_squares(black_attackers); 
            }
            else {
                remove_all_attacker_highlights(); 
                this.status.textContent = ""; 
            }

            // Afterwards, remove highlights and exit move mode 
            remove_all_highlights(); 
            this.move_mode = false; 
        }
        else { // We are not in move mode 
            // check if the player clicked a square without one of their pieces 
            this.piece = this.game.piece_at_id(id); 
            
            console.log(`${id}: ${this.piece.name}`); 

            if(this.piece.isNoPiece()) return; 
            else if(this.piece.color != this.turn) return; 
            
            // highlight piece clicked on 
            highlight_id(id); 

            // player has clicked one of their own pieces 
            // - Set source square id 
            // - Generate moves 
            // - Highlight moves 
            // - Set the controllers moves 
            // - Set move mode to true 
            this.source_id = id; 
            let moves = gen_moves(this.game, id); 
            if(moves.dest_squares.length > 0) {
                highlight_squares(moves.dest_squares); 
            }
            this.moves = moves; 
            this.move_mode = true; 
        }
    }
}





