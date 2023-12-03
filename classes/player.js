import Board from './board.js';

export default class Player {
    constructor(maxDepth = -1) {
        this.maxDepth = maxDepth;
        this.nodesMap = new Map();
    }
    getBestMove(board, maximizing = true, callback = () => {}, cheat = false, depth = 0) {
        // Clear nodesMap if the function is called for a new move
        if (depth === 0) this.nodesMap.clear();

        // If the board state is a terminal one, return the heuristic value
        const terminalValue = this.handleTerminalState(board, depth);
        if (terminalValue !== null) {
            return terminalValue;
        }

        // Check for opponent's winning moves if cheating is enabled
        if (cheat) {
            const opponentWinningMove = this.checkOpponentWinningMove(board, maximizing);
            if (opponentWinningMove !== null) {
                this.handleCheatMove(opponentWinningMove, callback);
                return opponentWinningMove;
            }
        }

        // Initialize best value based on the player's role
        const bestValue = maximizing ? -100 : 100;

        // Loop through all empty cells and calculate the best move
        const bestMove = this.calculateBestMove(board, maximizing, callback, depth, bestValue);

        return bestMove;
    }

    handleTerminalState(board, depth) {
        if (board.isTerminal() || depth === this.maxDepth) {
            if (board.isTerminal().winner === 'x') {
                return 100 - depth;
            } else if (board.isTerminal().winner === 'o') {
                return -100 + depth;
            }
            return 0;
        }
        return null;
    }

    checkOpponentWinningMove(board, maximizing) {
        let opponentWinningMove = null;

        board.getAvailableMoves().forEach(index => {
            const child = new Board([...board.state]);
            child.insert(maximizing ? 'o' : 'x', index);

            if (child.isTerminal() && child.isTerminal().winner === (maximizing ? 'o' : 'x')) {
                opponentWinningMove = index;
                return;
            }
        });

        return opponentWinningMove;
    }

    handleCheatMove(opponentWinningMove, callback) {
        // Add a theoretical move with the highest possible value to nodesMap
        const theoreticalBestValue = 200; // Adjust this value based on your heuristic
        const moves = this.nodesMap.has(theoreticalBestValue) ? `${this.nodesMap.get(theoreticalBestValue)},${opponentWinningMove}` : opponentWinningMove;
        this.nodesMap.set(theoreticalBestValue, moves);

        callback({ move: opponentWinningMove, cheatMove: true });
    }

    calculateBestMove(board, maximizing, callback, depth, initialBestValue) {
        // Initialize best value
        let best = initialBestValue;

        // Loop through all empty cells
        board.getAvailableMoves().forEach(index => {
            // Initialize a new board with a copy of our current state
            const child = new Board([...board.state]);

            // Create a child node by inserting the player's symbol into the current empty cell
            child.insert(maximizing ? 'x' : 'o', index);

            // Recursively calling getBestMove with the new board and switch the player's turn
            const nodeValue = this.getBestMove(child, !maximizing, callback, false, depth + 1);

            // Updating the best value based on the player's role
            if (maximizing) {
                best = Math.max(best, nodeValue);
            } else {
                best = Math.min(best, nodeValue);
            }

            // If it's the main function call, map each heuristic value with its move indices
            if (depth === 0) {
                const moves = this.nodesMap.has(nodeValue) ? `${this.nodesMap.get(nodeValue)},${index}` : index;
                this.nodesMap.set(nodeValue, moves);
            }
        });

        // If it's the main call, return the index of the best move or a random index if multiple indices have the same value
        if (depth === 0) {
            let returnValue;
            if (typeof this.nodesMap.get(best) === 'string') {
                const arr = this.nodesMap.get(best).split(',');
                const rand = Math.floor(Math.random() * arr.length);
                returnValue = arr[rand];
            } else {
                returnValue = this.nodesMap.get(best);
            }

            // Run a callback after calculation and return the index
            callback({ move: returnValue, cheatMove: false });
            return returnValue;
        }

        // If not the main call (recursive), return the heuristic value for the next calculation
        return best;
    }
}
