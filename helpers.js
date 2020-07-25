//Helpers (from http://jaketrent.com/post/addremove-classes-raw-javascript/)
export function hasClass(el, className) {
    if (el.classList) return el.classList.contains(className);
    else
      return !!el.className.match(new RegExp("(\\s|^)" + className + "(\\s|$)"));
}
export function addClass(el, className) {
    if (el.classList) el.classList.add(className);
    else if (!hasClass(el, className)) el.className += " " + className;
}
export function removeClass(el, className) {
    if (el.classList) el.classList.remove(className);
    else if (hasClass(el, className)) {
       var reg = new RegExp("(\\s|^)" + className + "(\\s|$)");
       el.className = el.className.replace(reg, " ");
    }
}

//Helper function that takes the object returned from isTerminal() and adds a 
//class to the board that will handle drawing the winning line's animation
export function drawWinningLine(statusObject) {
	if(!statusObject) return;
	const { winner, direction, row, column, diagonal } = statusObject;
	if(winner === 'draw') return;
	const board = document.getElementById("board");
    addClass(board, `${direction.toLowerCase()}-${row || column || diagonal}`);
    setTimeout(() => { addClass(board, 'fullLine'); }, 50);
}