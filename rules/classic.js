export class ClassicRules {
    constructor(){
      this.castlingRights = { white: { kingside: true, queenside: true }, black: { kingside: true, queenside: true }};
      this.kingMoved = { white: false, black: false };
      this.rookMoved = { white: { kingside: false, queenside: false }, black: { kingside: false, queenside: false }};
      this.enPassantTarget = null;
      this.pieceTypeMap = { '♔': 'king', '♚': 'king', '♕': 'queen', '♛': 'queen', '♖': 'rook', '♜': 'rook', '♗': 'bishop', '♝': 'bishop', '♘': 'knight', '♞': 'knight', '♙': 'pawn', '♟': 'pawn' };
    }
    getPieceType(pc) { return this.pieceTypeMap[pc] || null; }
    getInitialSetup() {
      return {
        // White pieces (bottom, ranks 1 and 2)
        a1: { ch: '♖', color: 'white' }, b1: { ch: '♘', color: 'white' }, c1: { ch: '♗', color: 'white' }, d1: { ch: '♕', color: 'white' },
        e1: { ch: '♔', color: 'white' }, f1: { ch: '♗', color: 'white' }, g1: { ch: '♘', color: 'white' }, h1: { ch: '♖', color: 'white' },
        a2: { ch: '♙', color: 'white' }, b2: { ch: '♙', color: 'white' }, c2: { ch: '♙', color: 'white' }, d2: { ch: '♙', color: 'white' },
        e2: { ch: '♙', color: 'white' }, f2: { ch: '♙', color: 'white' }, g2: { ch: '♙', color: 'white' }, h2: { ch: '♙', color: 'white' },
        // Black pieces (top, ranks 8 and 7)
        a8: { ch: '♜', color: 'black' }, b8: { ch: '♞', color: 'black' }, c8: { ch: '♝', color: 'black' }, d8: { ch: '♛', color: 'black' },
        e8: { ch: '♚', color: 'black' }, f8: { ch: '♝', color: 'black' }, g8: { ch: '♞', color: 'black' }, h8: { ch: '♜', color: 'black' },
        a7: { ch: '♟', color: 'black' }, b7: { ch: '♟', color: 'black' }, c7: { ch: '♟', color: 'black' }, d7: { ch: '♟', color: 'black' },
        e7: { ch: '♟', color: 'black' }, f7: { ch: '♟', color: 'black' }, g7: { ch: '♟', color: 'black' }, h7: { ch: '♟', color: 'black' }
      };
    }
    isValidMove(t,col,fr,fc,tr,tc,bm,isC=false){
      const sq=bm.getSquareByRowCol(tr,tc),tp=bm.getPieceInSquare(sq);
      if(tp && tp.classList.contains('black') === (col === 'black') && !isC) return false;
      const dr = Math.abs(tr - fr), dc = Math.abs(tc - fc);
      switch (t) {
        case 'king': return dr <= 1 && dc <= 1 && (dr > 0 || dc > 0);
        case 'queen': if (!dr || !dc || dr === dc) return bm.isPathClear(fr, fc, tr, tc); return false;
        case 'rook': if ((!dr || !dc) && (dr > 0 || dc > 0)) return bm.isPathClear(fr, fc, tr, tc); return false;
        case 'bishop': if (dr === dc && dr > 0) return bm.isPathClear(fr, fc, tr, tc); return false;
        case 'knight': return (dr === 2 && dc === 1) || (dr === 1 && dc === 2);
        case 'pawn': {
          let tSq=bm.getSquareByRowCol(tr,tc),tP=bm.getPieceInSquare(tSq);
          if (col === 'white') {
            if (fc === tc) { if (tP) return false; if (fr === 6 && tr === 4) return bm.isPathClear(fr,fc,tr,tc); if (fr - tr === 1) return true; }
            else if (Math.abs(fc - tc) === 1 && fr - tr === 1) { if (tP && tP.classList.contains('black')) return true; if (this.enPassantTarget && this.enPassantTarget.row === tr && this.enPassantTarget.col === tc && this.enPassantTarget.color === 'black') return true; }
          } else {
            if (fc === tc) { if (tP) return false; if (fr === 1 && tr === 3) return bm.isPathClear(fr,fc,tr,tc); if (tr - fr === 1) return true; }
            else if (Math.abs(fc - tc) === 1 && tr - fr === 1) { if (tP && tP.classList.contains('white')) return true; if (this.enPassantTarget && this.enPassantTarget.row === tr && this.enPassantTarget.col === tc && this.enPassantTarget.color === 'white') return true; }
          }
          return false;
        }
        default: return false;
      }
    }
    getPromotionPieces() { return { white: ['♕', '♖', '♗', '♘'], black: ['♛', '♜', '♝', '♞'] }; }
    getCastlingTargetsForKing(col,fr,fc,bm){
      const r=col==='white'?7:0, res=[];
      if(fr!==r) return [];
      // Standard chess: king and rooks are at standard columns
      const kCol = 4;
      const qsRookCol = 0;
      const ksRookCol = 7;
      if(fc!==kCol || this.kingMoved[col]) return [];

      // Kingside castling
      if(this.castlingRights[col].kingside && !this.rookMoved[col].kingside) {
        // Check squares between king and kingside rook are empty
        let cls=[];
        for(let c=kCol+1;c<ksRookCol;c++) cls.push(c);
        if(cls.every(c=>bm.isSquareEmpty(bm.getSquareByRowCol(r,c))))
          res.push({row:r, col:ksRookCol, castlingSide:'kingside'});
      }
      // Queenside castling
      if(this.castlingRights[col].queenside && !this.rookMoved[col].queenside) {
        // Check squares between rook and king are empty
        let cls=[];
        for(let c=qsRookCol+1;c<kCol;c++) cls.push(c);
        if(cls.every(c=>bm.isSquareEmpty(bm.getSquareByRowCol(r,c))))
          res.push({row:r, col:qsRookCol, castlingSide:'queenside'});
      }
      return res;
    }
    performCastlingByRook(col,kr,kc,rr,rc,bm,kPE=null,rPE=null){
      const r = col==='white'?7:0, kCol=4, qsRookCol=0, ksRookCol=7;
      if(kr!==r || kc!==kCol) return false;

      let ks = rc===ksRookCol, qs = rc===qsRookCol, m=null;
      if(ks)
        m={kingTo:6,rookFrom:ksRookCol,rookTo:5};
      else if(qs)
        m={kingTo:2,rookFrom:qsRookCol,rookTo:3};
      else
        return false;

      if(!kPE){ const sq=bm.getSquareByRowCol(r,kCol); kPE=bm.getPieceInSquare(sq);}
      if(!rPE){ const sq=bm.getSquareByRowCol(r,rc); rPE=bm.getPieceInSquare(sq);}
      if(!kPE||!rPE) return false;
      kPE.remove(); rPE.remove();

      bm.getSquareByRowCol(r,m.kingTo).appendChild(kPE);
      bm.getSquareByRowCol(r,m.rookTo).appendChild(rPE);

      this.kingMoved[col]=true;
      if(ks) this.rookMoved[col].kingside=true;
      else   this.rookMoved[col].queenside=true;

      this.castlingRights[col].kingside=false;
      this.castlingRights[col].queenside=false;
      return true;
    }
    onPieceMoved(t,col,fr,fc,tr,tc){
      this.enPassantTarget=null;
      // For standard chess: king is at 4, rooks at 0,7
      const kCol = 4, rCols = [0,7];

      if(t==='king'){
        this.kingMoved[col]=true;
        this.castlingRights[col].kingside = this.castlingRights[col].queenside = false;
      }
      else if(t==='rook' && fr===(col==='white'?7:0)){
        if(fc===7){
          this.rookMoved[col].kingside=true;
          this.castlingRights[col].kingside=false;
        }
        else if(fc===0){
          this.rookMoved[col].queenside=true;
          this.castlingRights[col].queenside=false;
        }
      }
      else if(t==='pawn' && Math.abs(tr-fr)===2){
        this.enPassantTarget={row:col==='white'?tr+1:tr-1, col:tc, color:col};
      }
    }
    performEnPassant(t,col,fr,fc,tr,tc,bm){
      if(t!=='pawn'||!this.enPassantTarget||tr!==this.enPassantTarget.row||tc!==this.enPassantTarget.col||this.enPassantTarget.color===col)return false;
      const cpr=col==='white'?tr+1:tr-1,cpSq=bm.getSquareByRowCol(cpr,tc),cp=bm.getPieceInSquare(cpSq);if(!cp)return false;cp.remove();
      return {capturedSquare:cpSq,capturedPiece:cp};
    }
    getAllValidMoves(pt,pc,fr,fc,bm){
      const m=[];
      for(let r=0;r<8;r++)for(let c=0;c<8;c++){
        if(fr===r&&fc===c)continue;if(this.isValidMove(pt,pc,fr,fc,r,c,bm)){
          const sq=bm.getSquareByRowCol(r,c),p=bm.getPieceInSquare(sq);
          if(!p||p.classList.contains('black')!==(pc==='black'))
            m.push({row:r,col:c,isCapture:!!p&&(p.classList.contains('black')!==(pc==='black'))});
        }
      }
      if(pt==='king'){const cs=this.getCastlingTargetsForKing(pc,fr,fc,bm);for(const t of cs)m.push({row:t.row,col:t.col,isCastlingTarget:!0,castlingSide:t.castlingSide});}
      return m;
    }
  }