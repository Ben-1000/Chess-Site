
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

                let piece = noPiece; 
                const newSrc = piece.src; 

                let divImg = wrapper.children[1]; 
                let oldImg = divImg.children[0]; 
                oldImg.src = newSrc; 
                idx++
            }
        }
        else if(fenChars.includes(x)) {
            let cellID = idx_to_id(idx); 
            let cell = document.getElementById(cellID); 
            let wrapper = cell.children[0]; 

            let piece = fenChar_to_Piece(x); 
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
Bitboards 
########################################################################
*/

class File_Chess {
    constructor(bb, char_id) {
        this.bb = bb; 
        this.char_id = char_id; 
    }
}

class Rank_Chess {
    constructor(bb, char_id) {
        this.bb = bb; 
        this.char_id = char_id; 
    }
}

const FILE_A_BB = 0x0101010101010101n; 
const FILE_B_BB = FILE_A_BB << 1n;
const FILE_C_BB = FILE_A_BB << 2n;
const FILE_D_BB = FILE_A_BB << 3n;
const FILE_E_BB = FILE_A_BB << 4n;
const FILE_F_BB = FILE_A_BB << 5n;
const FILE_G_BB = FILE_A_BB << 6n;
const FILE_H_BB = FILE_A_BB << 7n;

const RANK_1_BB = 0xFFn; 
const RANK_2_BB = RANK_1_BB << 8n * 1n; 
const RANK_3_BB = RANK_1_BB << 8n * 2n; 
const RANK_4_BB = RANK_1_BB << 8n * 3n;  
const RANK_5_BB = RANK_1_BB << 8n * 4n; 
const RANK_6_BB = RANK_1_BB << 8n * 5n;
const RANK_7_BB = RANK_1_BB << 8n * 6n;
const RANK_8_BB = RANK_1_BB << 8n * 7n;

const ALL_SQUARES_BB    = 0xFFFFFFFFFFFFFFFn; 
const NO_SQUARES_BB     = 0x0n; 
const LIGHT_SQUARES_BB  = 0x55AA55AA55AA55AAn; 
const DARK_SQUARES_BB   = 0xAA55AA55AA55AA55n; 

const FILE_A = new File_Chess(FILE_A_BB, "a");
const FILE_B = new File_Chess(FILE_B_BB, "b");
const FILE_C = new File_Chess(FILE_C_BB, "c");
const FILE_D = new File_Chess(FILE_D_BB, "d");
const FILE_E = new File_Chess(FILE_E_BB, "e");
const FILE_F = new File_Chess(FILE_F_BB, "f");
const FILE_G = new File_Chess(FILE_G_BB, "g");
const FILE_H = new File_Chess(FILE_H_BB, "h");

const RANK_1 = new Rank_Chess(RANK_1_BB, "1"); 
const RANK_2 = new Rank_Chess(RANK_2_BB, "2"); 
const RANK_3 = new Rank_Chess(RANK_3_BB, "3"); 
const RANK_4 = new Rank_Chess(RANK_4_BB, "4"); 
const RANK_5 = new Rank_Chess(RANK_5_BB, "5"); 
const RANK_6 = new Rank_Chess(RANK_6_BB, "6"); 
const RANK_7 = new Rank_Chess(RANK_7_BB, "7"); 
const RANK_8 = new Rank_Chess(RANK_8_BB, "8"); 

const FILES = [FILE_A, FILE_B, FILE_C, FILE_D, FILE_E, FILE_F, FILE_G, FILE_H]; 
const RANKS = [RANK_1, RANK_2, RANK_3, RANK_4, RANK_5, RANK_6, RANK_7, RANK_8]; 

/*
########################################################################
Chess Classes 
########################################################################
*/

class Piece {
    constructor(name, color, fenChar) {
        this.name = name; 
        this.color = color; 
        this.src = `./imgs/pngs/${name}.png`; 
        this.fenChar = fenChar; 
    }

    set_bb(bb) {
        this.bb = bb; 
    }

    isEnemyPiece(color) {

        if(this.name == noPiece.name) {
            // console.log("isEnemyPiece: False b/c noPiece"); 
            return false; 
        }
        if(this.color == color) {
            // console.log("isEnemyPiece: False b/c friendly"); 
            return false; 
        }

        // console.log("isEnemyPiece: True"); 
        return true; 
    }

    isFriendlyPiece(color) {
        if(this.name == noPiece.name) {
            // console.log("isFriendlyPiece: False b/c noPiece"); 
            return false; 
        }
        if(this.color != color) {
            // console.log("isFriendlyPiece: False b/c enemy"); 
            return false; 
        }

        // console.log("isFriendlyPiece: True"); 
        return true; 
    }

    isNoPiece() {
        return this.name == noPiece.name; 
    }
}

const blackPawns =   new Piece("black_pawn", "black", "p"); 
const blackKnights = new Piece("black_knight", "black", "n"); 
const blackBishops = new Piece("black_bishop", "black", "b"); 
const blackRooks =   new Piece("black_rook", "black", "r"); 
const blackQueens =  new Piece("black_queen", "black", "q"); 
const blackKings =   new Piece("black_king", "black", "k"); 

const whitePawns =   new Piece("white_pawn", "white", "P"); 
const whiteKnights = new Piece("white_knight", "white", "N"); 
const whiteBishops = new Piece("white_bishop", "white", "B"); 
const whiteRooks =   new Piece("white_rook", "white", "R"); 
const whiteQueens =  new Piece("white_queen", "white", "Q"); 
const whiteKings =   new Piece("white_king", "white", "K"); 

const noPiece = new Piece("no_piece", "none", " "); 

const fenChars = ['p', 'n', 'b', 'r', 'q', 'k', 'P', 'N', 'B', 'R', 'Q', 'K']; 

function fenChar_to_Piece(fenChar) {
    switch(fenChar) {
        case 'p': return blackPawns; 
        case 'n': return blackKnights; 
        case 'b': return blackBishops; 
        case 'r': return blackRooks; 
        case 'q': return blackQueens; 
        case 'k': return blackKings; 
        case 'P': return whitePawns; 
        case 'N': return whiteKnights; 
        case 'B': return whiteBishops; 
        case 'R': return whiteRooks; 
        case 'Q': return whiteQueens; 
        case 'K': return whiteKings; 
        default: return 678; 
    }
}

/*
########################################################################
Game Classes
########################################################################
*/

class Player {
    constructor(color) {
        if(color === "white") {
            this.pawns      = whitePawns;
            this.knights    = whiteKnights; 
            this.bishops    = whiteBishops; 
            this.rooks      = whiteRooks;
            this.queens     = whiteQueens; 
            this.kings      = whiteKings; 

            this.pawns.bb   = RANK_2_BB; 
            this.knights.bb = RANK_1_BB & (FILE_B_BB | FILE_G_BB); 
            this.bishops.bb = RANK_1_BB & (FILE_C_BB | FILE_F_BB); 
            this.rooks.bb   = RANK_1_BB & (FILE_A_BB | FILE_H_BB); 
            this.queens.bb  = RANK_1_BB & FILE_D_BB;
            this.kings.bb   = RANK_1_BB & FILE_E_BB;

            this.name = "White Player"; 
        } 
        else if(color === "black") {
            this.pawns      = blackPawns;
            this.knights    = blackKnights; 
            this.bishops    = blackBishops; 
            this.rooks      = blackRooks;
            this.queens     = blackQueens; 
            this.kings      = blackKings; 
            
            this.pawns.bb   = RANK_7_BB; 
            this.knights.bb = RANK_8_BB & (FILE_B_BB | FILE_G_BB); 
            this.bishops.bb = RANK_8_BB & (FILE_C_BB | FILE_F_BB); 
            this.rooks.bb   = RANK_8_BB & (FILE_A_BB | FILE_H_BB); 
            this.queens.bb  = RANK_8_BB & FILE_D_BB;
            this.kings.bb   = RANK_8_BB & FILE_E_BB;

            this.name = "Black Player"; 
        }

        this.castling_kingside_rights = true; 
        this.castling_queenside_rights = true; 
    }

    get_king_square() {
        let king_rank; 
        let king_file; 

        for(const r of RANKS) {
            if((this.kings.bb & r.bb) != 0n) {
                king_rank = r; 
                break; 
            }
        }
        for(const f of FILES) {
            if((this.kings.bb & f.bb) != 0n) {
                king_file = f; 
                break; 
            }
        }

        console.log(`${this.name}'s king: ${king_file.char_id}${king_rank.char_id}`); 

        return Square.from_id(`${king_file.char_id}${king_rank.char_id}`); 
    }
}

class Game {
    constructor() {
        this.dark_player    = new Player("black"); 
        this.light_player   = new Player("white"); 
    }
    
    // Gets the pieces in the order: 
    //  0  1  2  3 ... 56 57 58 59 ... 
    // h1 h2 h3 h4 ... a1 a2 a3 a4 ...
    get_piece_vec() {
        let piece_vec = []; 

        for(let i = 7; i >= 0; i--) {        // rank 
            for(let j = 0; j < 8; j++) {   // file 
                let square_bb = RANKS[i].bb & FILES[j].bb; 

                // console.log(`square_bb: ${square_bb}`); 
                // console.log(`this.light_player.pawns.bb: ${this.light_player.pawns.bb}`); 
                // console.log(`AND: ${square_bb & this.light_player.pawns.bb}`); 

                // Check pieces 
                if((square_bb & this.dark_player.pawns.bb) != 0n) {
                    piece_vec.push(blackPawns.fenChar);
                }
                else if((square_bb & this.dark_player.knights.bb) != 0n) {
                    piece_vec.push(blackKnights.fenChar); 
                }
                else if((square_bb & this.dark_player.bishops.bb) != 0n) {
                    piece_vec.push(blackBishops.fenChar); 
                }
                else if((square_bb & this.dark_player.rooks.bb) != 0n) {
                    piece_vec.push(blackRooks.fenChar); 
                }
                else if((square_bb & this.dark_player.queens.bb) != 0n) {
                    piece_vec.push(blackQueens.fenChar);
                }
                else if((square_bb & this.dark_player.kings.bb) != 0n) {
                    piece_vec.push(blackKings.fenChar);
                }
                else if((square_bb & this.light_player.pawns.bb) != 0n) {
                    piece_vec.push(whitePawns.fenChar);
                }
                else if((square_bb & this.light_player.knights.bb) != 0n) {
                    piece_vec.push(whiteKnights.fenChar);
                }
                else if((square_bb & this.light_player.bishops.bb) != 0n) {
                    piece_vec.push(whiteBishops.fenChar);
                }
                else if((square_bb & this.light_player.rooks.bb) != 0n) {
                    piece_vec.push(whiteRooks.fenChar);
                }
                else if((square_bb & this.light_player.queens.bb) != 0n) {
                    piece_vec.push(whiteQueens.fenChar);
                }
                else if((square_bb & this.light_player.kings.bb) != 0n) {
                    piece_vec.push(whiteKings.fenChar);
                } 
                else {
                    piece_vec.push(" "); 
                }
            }
        }

        return piece_vec; 
    }

    get_fen() {
        let piece_vec = this.get_piece_vec(); 
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

    piece_at(cell_id) {
        let square_bb = bb_from_id(cell_id); 

        // console.log(`piece_at(${cell_id})`); 

        // Check pieces 
        if((square_bb & this.dark_player.pawns.bb) != 0n) {
            return this.dark_player.pawns; 
        }
        else if((square_bb & this.dark_player.knights.bb) != 0n) {
            return this.dark_player.knights;
        }
        else if((square_bb & this.dark_player.bishops.bb) != 0n) {
            return this.dark_player.bishops;
        }
        else if((square_bb & this.dark_player.rooks.bb) != 0n) {
            return this.dark_player.rooks;
        }
        else if((square_bb & this.dark_player.queens.bb) != 0n) {
            return this.dark_player.queens;
        }
        else if((square_bb & this.dark_player.kings.bb) != 0n) {
            return this.dark_player.kings;
        }
        else if((square_bb & this.light_player.pawns.bb) != 0n) {
            return this.light_player.pawns;
        }
        else if((square_bb & this.light_player.knights.bb) != 0n) {
            return this.light_player.knights;
        }
        else if((square_bb & this.light_player.bishops.bb) != 0n) {
            return this.light_player.bishops;
        }
        else if((square_bb & this.light_player.rooks.bb) != 0n) {
            return this.light_player.rooks;
        }
        else if((square_bb & this.light_player.queens.bb) != 0n) {
            return this.light_player.queens;
        }
        else if((square_bb & this.light_player.kings.bb) != 0n) {
            return this.light_player.kings;
        } 
        else {
            // console.log("piece_at reached noPiece clause"); 
            return noPiece; 
        }
    }

    // returns the piece fen char removed at cell_id and updates the players 
    remove_piece(cell_id) {
        // console.log(`Entered remove_piece at ${cell_id}`); 

        let piece = this.piece_at(cell_id); 

        // console.log(`piece: ${piece.name}`); 

        if(piece === noPiece) return " "; 

        switch(piece.fenChar) {
            case 'p': {
                this.dark_player.pawns.bb &= not_bb_from_id(cell_id);
                return 'p'; 
            } 
            case 'n': {
                this.dark_player.knights.bb &= not_bb_from_id(cell_id);
                return 'n'; 
            } 
            case 'b': {
                this.dark_player.bishops.bb &= not_bb_from_id(cell_id);
                return 'b'; 
            } 
            case 'r':  {
                this.dark_player.rooks.bb &= not_bb_from_id(cell_id);
                return 'r'; 
            }  
            case 'q': {
                this.dark_player.queens.bb &= not_bb_from_id(cell_id);
                return 'q'; 
            }  
            case 'k': {
                this.dark_player.kings.bb &= not_bb_from_id(cell_id);
                return 'k'; 
            }  
            case 'P': {
                this.light_player.pawns.bb &= not_bb_from_id(cell_id);
                return 'P'; 
            }  
            case 'N': {
                this.light_player.knights.bb &= not_bb_from_id(cell_id);
                return 'N'; 
            }  
            case 'B': {
                this.light_player.bishops.bb &= not_bb_from_id(cell_id);
                return 'B'; 
            } 
            case 'R': {
                this.light_player.rooks.bb &= not_bb_from_id(cell_id);
                return 'R'; 
            } 
            case 'Q': {
                this.light_player.queens.bb &= not_bb_from_id(cell_id);
                return 'Q'; 
            } 
            case 'K': {
                this.light_player.kings.bb &= not_bb_from_id(cell_id);
                return 'K'; 
            } 
            default: {
                alert("Error in remove piece function"); 
                return 800; 
            }
        }
    }

    // Overwrites the piece at cell_id with the piece denoted by the fen_char 
    add_piece(cell_id, fen_char) {
        switch(fen_char) {
            case 'p': {
                this.dark_player.pawns.bb |= bb_from_id(cell_id);
                return 'p'; 
            } 
            case 'n': {
                this.dark_player.knights.bb |= bb_from_id(cell_id);
                return 'n'; 
            } 
            case 'b': {
                this.dark_player.bishops.bb |= bb_from_id(cell_id);
                return 'b'; 
            } 
            case 'r':  {
                this.dark_player.rooks.bb |= bb_from_id(cell_id);
                return 'r'; 
            }  
            case 'q': {
                this.dark_player.queens.bb |= bb_from_id(cell_id);
                return 'q'; 
            }  
            case 'k': {
                this.dark_player.kings.bb |= bb_from_id(cell_id);
                return 'k'; 
            }  
            case 'P': {
                this.light_player.pawns.bb |= bb_from_id(cell_id);
                return 'P'; 
            }  
            case 'N': {
                this.light_player.knights.bb |= bb_from_id(cell_id);
                return 'N'; 
            }  
            case 'B': {
                this.light_player.bishops.bb |= bb_from_id(cell_id);
                return 'B'; 
            } 
            case 'R': {
                this.light_player.rooks.bb |= bb_from_id(cell_id);
                return 'R'; 
            } 
            case 'Q': {
                this.light_player.queens.bb |= bb_from_id(cell_id);
                return 'Q'; 
            } 
            case 'K': {
                this.light_player.kings.bb |= bb_from_id(cell_id);
                return 'K'; 
            } 
            default: {
                alert("Error in remove piece function"); 
                return 800; 
            }
        }
    }

    castle_kingside(color) {
        if(color === "white") {
            // remove king on e1 and rook on h1 
            // place king on g1 and rook on f1 
            
        }
        else if(color === "black") {
            // remove king on e8 and rook on h8 
            // place king on g8 and rook on f8 
        }
        else {
            alert("error in cast_kingside function"); 
        }
    }

    castle_queenside(color) {

    }
}

/*
########################################################################
utils 
########################################################################
*/

function bb_from_id(cell_id) { 
    let file_idx = FILES.findIndex( (f) => f.char_id === cell_id.charAt(0) ); 
    let rank_idx = RANKS.findIndex( (r) => r.char_id === cell_id.charAt(1) ); 

    if(file_idx === -1 || rank_idx === -1) {
        return OUT_OF_BOUNDS.bb; 
    }

    let file_bb = FILES[file_idx].bb; 
    let rank_bb = RANKS[rank_idx].bb; 

    return file_bb & rank_bb; 
}

function not_bb_from_id(cell_id) {
    let result = bb_from_id(cell_id); 

    return ~result; 
}

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

function highlight_bb(bb) {
    for(let i = 0; i < 8; i++) {
        for(let j = 0; j < 8; j++) {
            let rank = RANKS[i]; 
            let file = FILES[j]; 
            
            if(((rank.bb & file.bb) & bb) !== 0n) {
                let id = `${file.char_id}${rank.char_id}`; 

                highlight_id(id);   
            }
        }
    }
}

function remove_all_highlights() { 
    let cells = document.querySelectorAll(".highlighted"); 

    for(let i = 0; i < cells.length; i++) {
        cells[i].classList.remove("highlighted"); 
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

/*
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

class Square {
    constructor(id) {
        if(id === "out of bounds") {
            this.id = "out of bounds"; 
            this.idx = 100; 
            this.bb = 0n; 
        }
        else {
            this.id = id; 
            this.idx = id_to_idx(this.id); 
            this.bb = bb_from_id(this.id); 
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
        // console.log(`isOutOfBounds  this.id: ${this.id}  OUT_OF_BOUNDS.id: ${OUT_OF_BOUNDS.id}`); 
        // console.log(`Equality: ${this.id == OUT_OF_BOUNDS.id}`); 
        return this.id == OUT_OF_BOUNDS.id; 
    }
}

const OUT_OF_BOUNDS = new Square("out of bounds"); 

// A pawn can always move forward one square unless obstructed 
// A pawn can move two squares forward if it has not yet moved 
// A pawn can move diagonally one square if there is an enemy piece 
// A pawn will promote if it reaches the last rank 
// Returns a bitboard of squares that the pawn can move to 
function gen_pawn_moves(game, cell_id, color) {
    let moves = 0n; 
    let square = Square.from_id(cell_id); 
    let direction; 

    if(color === "white") direction = NORTH; 
    if(color === "black") direction = SOUTH; 

    // Handle the case of the cell in front of the pawn 
    let one_ahead_square = direction.from_square(square); 
    let one_ahead_piece = game.piece_at(one_ahead_square.id); 

    if(one_ahead_piece === noPiece) {
        moves |= one_ahead_square.bb; 

        // Handle the case of the cell two spaces in front of the pawn 
        if(((direction === NORTH) && (cell_id.charAt(1) === "2")) || ((direction === SOUTH) && (cell_id.charAt(1) === "7"))) {
            let two_ahead_square = direction.from_square(one_ahead_square); 
            let two_ahead_piece = game.piece_at(one_ahead_square.id); 

            if(two_ahead_piece === noPiece) {
                moves |= two_ahead_square.bb; 
            }
        }
    }

    // Handle the diagonals 
    let diagonal_east = EAST.from_square(one_ahead_square); 
    let diagonal_west = WEST.from_square(one_ahead_square); 
    let diagonalSquares = [diagonal_east, diagonal_west]; 

    for(const d of diagonalSquares) {
        let diagonal_piece = game.piece_at(d.id); 

        if(diagonal_piece.isEnemyPiece(color)) {
            moves |= bb_from_id(d.id); 
        } 
    } 

    return moves;  
} 

// The knight can move two squares Horizontally/Vertically  
// and one square Vertically/Horizontally  
// The only thing that can stop the knight is a piece of  
// the same color on a destination square  
function gen_knight_moves(game, cell_id, color) { 
    let moves = 0n;  
    let square = Square.from_id(cell_id);  
    let dest_square;  
    let dest_piece;  

    for(const horz of HORIZONTALS) {
        for(const vert of VERTICALS) {
            for(let i = 1; i <= 2; i++) {
                let j = 3 - i; 

                // Calculate destination square
                dest_square = horz.from_square_by(square, i); 
                dest_square = vert.from_square_by(dest_square, j); 

                // if destination square is out of bounds, continue 
                if(dest_square.isOutOfBounds()) {
                    // console.log("Destination square is out of bounds"); 
                    continue; 
                }

                // Check if the destination square has a piece of the same 
                // color. If it doesn't, add it to the moves 
                dest_piece = game.piece_at(dest_square.id); 

                if(dest_piece.isEnemyPiece(color) || dest_piece.isNoPiece()) {
                    moves |= bb_from_id(dest_square.id); 
                }
            }
        }
    }

    return moves; 
}

function gen_bishop_moves(game, cell_id, color) {
    let moves = 0n; 
    let source_square = Square.from_id(cell_id); 

    for(const d of DIAGONAL_DIRECTIONS) {
        square_loop: for(let i = 1; i < 8; i++) {
            // Check if the square is occupied or if the square is out of bounds. 
            // Break from square_loop is so. 
            let dest_square = d.from_square_by(source_square, i); 
            let dest_piece = game.piece_at(dest_square.id); 

            if(dest_square.isOutOfBounds() || dest_piece.isFriendlyPiece(color)) {
                break square_loop; 
            }
            else if(dest_piece.isEnemyPiece(color)) {
                moves |= dest_square.bb; 
                break square_loop; 
            }
            else { // dest_square is unoccupied 
                moves |= dest_square.bb; 
            }
        }
    }

    return moves; 
}

function gen_rook_moves(game, cell_id, color) {
    let moves = 0n; 
    let source_square = Square.from_id(cell_id); 

    for(const c of CARDINAL_DIRECTIONS) {
        square_loop: for(let i = 1; i < 8; i++) {
            // Check if the square is occupied or if the square is out of bounds. 
            // Break from square_loop is so. 
            let dest_square = c.from_square_by(source_square, i); 
            let dest_piece = game.piece_at(dest_square.id); 

            if(dest_square.isOutOfBounds() || dest_piece.isFriendlyPiece(color)) {
                break square_loop; 
            }
            else if(dest_piece.isEnemyPiece(color)) {
                moves |= dest_square.bb; 
                break square_loop; 
            }
            else { // dest_square is unoccupied 
                moves |= dest_square.bb; 
            }
        }
    }

    return moves; 
}

function gen_queen_moves(game, cell_id, color) {
    let cardinal_moves = gen_rook_moves(game, cell_id, color); 
    let diagonal_moves = gen_bishop_moves(game, cell_id, color); 

    return (cardinal_moves | diagonal_moves); 
}

function gen_king_moves(game, cell_id, color) {
    let moves = 0n; 
    let source_square = Square.from_id(cell_id); 

    for(const d of ALL_DIRECTIONS) {
        let dest_square = d.from_square(source_square); 
        let dest_piece = game.piece_at(dest_square.id); 

        if(dest_square.isOutOfBounds()) {
            continue; 
        }
        else if(dest_piece.isEnemyPiece(color)) {
            moves |= dest_square.bb; 
        }
        else if(dest_piece.isNoPiece()) {
            moves |= dest_square.bb; 
        }
    }

    return moves; 
}

function gen_moves_before_checks(game, cell_id) {
    let piece = game.piece_at(cell_id); 

    // Check if there is a piece 
    if(piece === noPiece) return 0n; 

    switch(piece.fenChar) {
        case 'p': return gen_pawn_moves(game, cell_id, "black"); 
        case 'n': return gen_knight_moves(game, cell_id, "black"); 
        case 'b': return gen_bishop_moves(game, cell_id, "black"); 
        case 'r': return gen_rook_moves(game, cell_id, "black"); 
        case 'q': return gen_queen_moves(game, cell_id, "black"); 
        case 'k': return gen_king_moves(game, cell_id, "black"); 
        case 'P': return gen_pawn_moves(game, cell_id, "white"); 
        case 'N': return gen_knight_moves(game, cell_id, "white"); 
        case 'B': return gen_bishop_moves(game, cell_id, "white"); 
        case 'R': return gen_rook_moves(game, cell_id, "white"); 
        case 'Q': return gen_queen_moves(game, cell_id, "white"); 
        case 'K': return gen_king_moves(game, cell_id, "white"); 
        default: {
            alert("Error in gen_moves function"); 
            return 0n; 
        }
    }
}

function gen_moves(game, cell_id) {
    let moves = 0n; 
    let pre_check_moves = gen_moves_before_checks(game, cell_id); 

    // deal with castling 

    // deal with en passant 

    // deal with pawn promotion 

    moves |= pre_check_moves; 

    return moves; 
}

/*
########################################################################
Special Rules - Checks, Checkmate
########################################################################
*/

// returns a bitboard with 1's on the squares that have pieces 
// checking the king 
function in_check(color, game) {
    let player; 
    let enemy_player; 
    let dir_ahead; 

    if(color === "white") {
        player = game.light_player; 
        enemy_player = game.dark_player; 
        dir_ahead = NORTH; 
    }
    else if(color === "black") {
        player = game.dark_player; 
        enemy_player = game.light_player; 
        dir_ahead = SOUTH; 
    }
    else {
        alert("Error in in_check function"); 
    }

    let king_square = player.get_king_square(); 
    // console.log(`king_square.id: ${king_square.id}`);

    // Check diagonally for enemy pawns 
    // - Get squares diagonally from king 
    // - Get pieces at the squares 
    // - Check if those are enemy pawns
    let s1 = dir_ahead.from_square(king_square); 
    let s2 = dir_ahead.from_square(king_square); 
    s1 = EAST.from_square(s1); 
    s2 = WEST.from_square(s2); 

    if(((s1.bb | s2.bb) & enemy_player.pawns.bb) != 0n) {
        console.log("Checked by pawn")
        return true;  
    }

    // Generate knight moves from king square and check for enemy knight 
    let knight_moves = gen_knight_moves(game, king_square.id, color); 
    
    if((knight_moves & enemy_player.knights.bb) != 0n) {
        console.log("Checked by knight"); 
        return true; 
    }

    // Generate bishop moves from king square and check for enemy bishop / queen 
    let bishop_moves = gen_bishop_moves(game, king_square.id, color); 

    if(((bishop_moves & enemy_player.bishops.bb) != 0n) || ((bishop_moves & enemy_player.queens.bb) != 0n)) {
        console.log("Checked on a diagonal"); 
        return true; 
    }

    // Generate rook moves from king square and check for enemy rook / queen 
    let rook_moves = gen_rook_moves(game, king_square.id, color); 

    if(((rook_moves & enemy_player.rooks.bb) != 0n) || ((rook_moves & enemy_player.queens.bb) != 0n)) {
        console.log("Checked on a cardinal"); 
        return true; 
    }

    return false; 
}

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
        this.moves = 0n; 
        this.source_id = null; 
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
    handle_click(cell_id) {
        if(this.move_mode) { // We are in move mode 
            // If we click on a cell we can move to, make the move 
            if((bb_from_id(cell_id) & this.moves) !== 0n) {
                // Make move 
                this.game.remove_piece(cell_id); 
                let piece_fen = this.game.remove_piece(this.source_id); 
                // console.log(`piece_fen: ${piece_fen}`); 
                this.game.add_piece(cell_id, piece_fen); 
                // Switch turn 
                this.swap_turn(); 
                // Re-render board 
                fen_to_board(this.game.get_fen()); 
            }
            // Check for checks and modify the status if a player is in check 
            if(in_check("white", this.game)) {
                this.status.textContent = "White Player is in check!"; 
            } 
            else if(in_check("black", this.game)) {
                this.status.textContent = "Black Player is in check!"; 
            }
            else {
                this.status.textContent = ""; 
            }

            // Afterwards, remove highlights and exit move mode 
            remove_all_highlights(); 
            this.move_mode = false; 
        }
        else { // We are not in move mode 
            // check if the player clicked a square without one of their pieces 
            let piece_clicked = this.game.piece_at(cell_id); 
            
            console.log(`${cell_id}: ${piece_clicked.name}`); 

            if(piece_clicked === noPiece) return; 
            else if(piece_clicked.color != this.turn) return; 
            
            // highlight piece clicked on 
            highlight_id(cell_id); 

            // player has clicked one of their own pieces 
            // - Set source square id 
            // - Generate moves 
            // - Highlight moves 
            // - Set the controllers moves 
            // - Set move mode to true 
            this.source_id = cell_id; 
            let moves = gen_moves(this.game, cell_id); 
            // console.log(`moves: ${moves}`); 
            highlight_bb(moves); 
            this.moves = moves; 
            this.move_mode = true; 
        }
    }
}



















