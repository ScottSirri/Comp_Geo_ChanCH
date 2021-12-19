'use strict';

let pointsArr;	// Contains points in plane
let subCHs;		// The cub-convex hulls tangents are drawn between
let currentCH = [];	// The current overall convex hull
let canvasPtLen = 4;	// Side length of point drawn in plane
let algo_t = 1;		// t parameter for determining subset sizes

let prevStates = [];	// Array of Iter objects
let currColors = [];

const STATE_INIT = 0;			// Initial state
const STATE_GEND_PTS = 1;		// Just generated the points
const STATE_PARTD_PTS = 2;		// Just partitioned the points
const STATE_GEND_HULLS = 3;		// Just generated the sub-convex hulls
const STATE_CALCING_TANS = 4;	// Calculating the tangents

let state = STATE_INIT;
let repeatIter = false;

//Graphics library utility
let context;
if(canvas.getContext) {
	context = canvas.getContext('2d');
}

/* Generates, stores, and draws random points in plane.
 */
function generatePointsHandler() {
	let numPoints = Math.floor(inputNumPoints.value);
	if (numPoints < 3 || numPoints > 1024) {
		alert('Enter an integer number of points in the range [3, 1024]');
		inputNumPoints.value = '';
		return;
	}
	pointsArr = new Array();
	for(let i = 0; i < numPoints; ++i) {
		let randX = Math.floor(Math.random() * (canvas.width - 40)) + 20;
		let randY = Math.floor(Math.random() * (canvas.height - 40)) + 20;
		pointsArr.push({x : randX, y : randY, color : 'rgba(200, 0, 0, 0.5)'});
	}
	
	drawPoints(pointsArr);
	buttonGeneratePts.disabled = true;
	buttonPartitionPts.disabled = false;
	buttonBack.disabled = false;
	updateParamsLabel();
	console.log(`Generated ${numPoints} points`);
	state = STATE_GEND_PTS;
}
buttonGeneratePts.onclick = generatePointsHandler;

/* Randomly partitions points into subsets according to algorithm global 
 * parameters, recolors points accordingly and circles the rightmost point 
 * for next step.
 */
function partitionPtsHandler() {
	
	let arr = [...pointsArr];	// Create a deep copy so points aren't lost
	let multiArr = new Array();
	let param = calculateParam();
	let numSubsets = Math.ceil(arr.length / param);
	
	for(let i = 0; i < numSubsets && arr.length > 0; ++i) {
		
		let subset = arr.splice(0, param);
		let color;
		
		if(!repeatIter) {
			color = ranColor();
			currColors.push(color);
		} else color = currColors[i];
		
		for(let pt of subset) pt.color = color;
		multiArr.push(subset);
	}
	
	repeatIter = false;
	subCHs = multiArr;
	
	clearCanvas();
	drawPoints(pointsArr);
	buttonPartitionPts.disabled = true;
	buttonCalculateCHs.disabled = false;
	
	console.log(`Partitioned ${pointsArr.length} points into 
				${numSubsets} subsets`);
	state = STATE_PARTD_PTS;
}
buttonPartitionPts.onclick = partitionPtsHandler;

function buttonBackHandler() {

	switch(state) {
		case STATE_INIT:
			console.log('Cannot backstep further');
			break;
			
		case STATE_GEND_PTS:
			assert(currentCH.length === 0);
			assert(pointsArr.length > 0);
			
			// Restore previous state
			if(prevStates.length > 0) {
				console.log('Restoring previous state');
				assert(currentCH.length === 0);
				assert(algo_t > 1);
				currColors = [];
				
				algo_t--;
				let prevIter = prevStates.pop();
				subCHs = prevIter.hulls;
				for(let ch of subCHs) {
					let color = prevIter.colors.shift();
					for(let pt of ch) pt.color = color;
					currColors.push(color);
				}
				currentCH = prevIter.partialCH;
				
				clearCanvas();
				drawPoints(pointsArr);
				drawSubCHs();
				drawCurrentCH();
				updateParamsLabel();
				
				state = STATE_CALCING_TANS;
				
				buttonNextTangent.disabled = false;
				buttonCalculateTangents.disabled = false;
				buttonPartitionPts.disabled = true;
				repeatIter = true;
				
				break;
			}
			
			algoReset();
			buttonBack.disabled = true;
			
			state = STATE_INIT;
			break;
			
		case STATE_PARTD_PTS:
			assert(currentCH.length === 0);
			assert(subCHs.length > 0);
			assert(pointsArr.length > 0);
			
			subCHs = [];
			clearCanvas();
			resetPartitions();
			drawPoints(pointsArr);
			
			buttonPartitionPts.disabled = false;
			buttonCalculateCHs.disabled = true;
			
			state = STATE_GEND_PTS;
			repeatIter = true;
			break;
			
		case STATE_GEND_HULLS:
			assert(subCHs.length > 0);
			
			clearCanvas();
			drawPoints(pointsArr);
			
			buttonCalculateCHs.disabled = false;
			buttonCalculateTangents.disabled = true;
			buttonNextTangent.disabled = true;
			
			state = STATE_PARTD_PTS;
			break;
			
		case STATE_CALCING_TANS:
		
			assert(currentCH.length > 0);
			assert(subCHs.length > 0);
			
			currentCH.pop();
			clearCanvas();
			drawPoints(pointsArr);
			drawSubCHs();
			drawCurrentCH();
			updateParamsLabel();
			
			if(currentCH.length === 1) {
				currentCH.pop();
				state = STATE_GEND_HULLS;
				updateParamsLabel();
			}
			break;
			
		default:
			
	}
}
buttonBack.onclick = buttonBackHandler;

/* Applies Graham's Scan to each sub-convex hull. Stores and draws the results.
 */
function generateCHsHandler() {
	
	for(let i = 0; i < subCHs.length; ++i) {
		subCHs[i] = grahamsScan(subCHs[i]);
		drawPolygon(subCHs[i]);
	}
	
	let rightmostPt = rightmost(pointsArr);
	
	context.strokeStyle = 'rgb(0, 0, 0)';
	context.beginPath();
	context.moveTo(rightmostPt.x + canvasPtLen * 3, rightmostPt.y);
    context.arc(rightmostPt.x, rightmostPt.y, canvasPtLen * 3, 0, Math.PI * 2, 
				true);
	context.closePath();
	context.stroke();
	
	buttonCalculateCHs.disabled = true;
	buttonCalculateTangents.disabled = false;
	buttonNextTangent.disabled = false;
	state = STATE_GEND_HULLS;
}
buttonCalculateCHs.onclick = generateCHsHandler;

/* Draws all the candidate tangents for the current convex hull point, DOES 
 * NOT update any global variables nor store its results.
 */
function calculateTangentsHandler() {
	
	state = STATE_CALCING_TANS;
	
	let n = currentCH.length;
	if(n == 0) {
		let rightmostPt = rightmost(pointsArr);
		// Just below rightmostPt to provide vertical segment
		let tempPt = { x : rightmostPt.x, y : rightmostPt.y + .1}; 
		currentCH = [tempPt, rightmostPt];
		n = 2;
	}

	let maxAnglePts = [];	// Max angle point from each sub-CH
	
	// Find point maximizing angle in each sub-CH
	for(let i = 0; i < Math.ceil(pointsArr.length / calculateParam()); ++i) {
		let searchedArr = subCHs[i];
		
		let maxPt = { pt : { x : 0, y : 0 }, angle : -999 };
		
		for(let candidatePt of searchedArr) {	// Linear (not binary) search
			if(candidatePt != currentCH[n - 1]) {
				let candidateAngle = angle(currentCH[n - 2], currentCH[n - 1],
									candidatePt);
				if(candidateAngle > maxPt.angle) {
					maxPt = { pt : candidatePt, angle : candidateAngle };
				}
			}
		}
		maxAnglePts.push(maxPt);
	}
	
	// Draw each candidate tangent
	context.strokeStyle = 'rgba(0,0,0,1)';
	
	context.beginPath();
	context.moveTo(currentCH[n - 1].x, currentCH[n - 1].y);
	for(let cand of maxAnglePts) {
		context.lineTo(cand.pt.x, cand.pt.y);
		context.moveTo(currentCH[n - 1].x, currentCH[n - 1].y);
	}
	context.closePath();
	context.stroke();
}
buttonCalculateTangents.onclick = calculateTangentsHandler;

/* Compute and draw the next tangent. Store results in global variables.
 */
function nextTangentHandler() {
	state = STATE_CALCING_TANS;
	
	let n = currentCH.length;
	if(n == 0) {
		let rightmostPt = rightmost(pointsArr);
		// tempPt is just below rightmostPt: provides initial vertical segment
		let tempPt = { x : rightmostPt.x, y : rightmostPt.y + .1}; 
		currentCH = [tempPt, rightmostPt];
		n = 2;
	}
	
	// Hit upper limit, restart with revised parameters
	if(n == calculateParam()) {
		console.log('L incomplete');
		
		// Archive this state for the 'Back' button
		let iter = new Iter(subCHs, currentCH, currColors);
		prevStates.push(iter);
		console.log('Archived state');
		state = STATE_GEND_PTS;
		currColors = [];
		repeatIter = false;
		
		// End of inner Hull2D Iteration
		currentCH = [];
		clearCanvas();
		resetPartitions();
		drawPoints(pointsArr);
		++algo_t;
		updateParamsLabel();
		buttonPartitionPts.disabled = false;
		buttonCalculateTangents.disabled = true;
		buttonNextTangent.disabled = true;
		return;
	}

	let maxAnglePts = [];	// Max angle point from each sub-CH
	
	// Find point maximizing angle in each sub-CH
	let numSubCHs = Math.ceil(pointsArr.length / calculateParam());
	for(let i = 0; i < numSubCHs; ++i) {
		let searchedArr = subCHs[i];
		
		let maxPt = { pt : { x : 0, y : 0 }, angle : -999 };
		
		for(let candidatePt of searchedArr) {	// Linear (not binary) search
			if(candidatePt != currentCH[n - 1]) {
				let candidateAngle = angle(currentCH[n - 2], currentCH[n - 1],
									candidatePt);
				if(candidateAngle > maxPt.angle) {
					maxPt = { pt : candidatePt, angle : candidateAngle };
				}
			}
		}
		maxAnglePts.push(maxPt);
	}
	
	let maxAngPt = { angle : -999 };
	for(let cand of maxAnglePts) {
		if(cand.angle > maxAngPt.angle) maxAngPt = cand;
	}
	
	currentCH.push(maxAngPt.pt);
	
	// Draw convex hull calculated up until now
	clearCanvas();
	drawPoints(pointsArr);
	drawSubCHs();
	drawCurrentCH();
	
	if(Math.abs(currentCH[0].y - currentCH[1].y) < 1) {
		currentCH.shift();	// Get rid of tempPt
	}
	updateParamsLabel();
	
	console.log('currentCH:');
	printArr(currentCH);
	
	// Wrapped all the way around, found the whole convex hull
	if(maxAngPt.pt == currentCH[0]) {
		clearCanvas();
		drawPoints(pointsArr);
		drawCurrentCH();
		buttonCalculateTangents.disabled = true;
		buttonNextTangent.disabled = true;
		console.log('L complete');
	}
}
buttonNextTangent.onclick = nextTangentHandler;

/* Returns the rightmost point in the passed array.
 */
function rightmost(arr) {
	let ret = { x : -999, y : 0};
	for(let pt of arr) {
		if(pt.x > ret.x) ret = pt;
	}
	
	return ret;
}

/* Returns the angle between the vectors qp and qr.
 */
function angle(p, q, r) {
	let a = { x : -1*(q.x - p.x), y : -1*(q.y - p.y)};
	let b = { x : r.x - q.x, y : r.y - q.y};
	// cos( dot(a, b) / (norm(a) * norm(b)) )
	let acuteAngle = Math.acos((a.x * b.x + a.y * b.y) / Math.sqrt((a.x**2 + a.y**2) * (b.x**2 + b.y**2)));
	acuteAngle *= (180 / Math.PI); // To degrees for ease of debugging
	
	let angle = acuteAngle;
	if(!leftTurn(p, q, r)) {
		angle += 180;
	}
	return angle;
}

/* Return the convex hull of the array of passed points without modifying the
 * passed array.
 */
function grahamsScan(arrOriginal) {
	
	if(arrOriginal.length <= 2) return arrOriginal;
	
	let arr = [...arrOriginal]
	arr = mergesortX(arr);	// Sorts points on increasing x-coordinate
	
	// Upper hull
	let n = arr.length;
	let upper = [arr[0], arr[1]];
	for(let arrInd = 2; arrInd < n; ++arrInd) {
		upper.push(arr[arrInd]);
		while(upper.length > 2 && leftTurn(upper[upper.length - 3], 
				upper[upper.length - 2], upper[upper.length - 1])) {
			let temp = upper.pop();	// Delete the middle of the last three
			upper.pop();
			upper.push(temp);
		}
	}
	
	// Lower hull
	let lower = [arr[n-1], arr[n-2]];
	for(let arrInd = n-3; arrInd >= 0; --arrInd) {
		lower.push(arr[arrInd]);
		while(lower.length > 2 && leftTurn(lower[lower.length - 3], 
				lower[lower.length - 2], lower[lower.length - 1])) {
			let temp = lower.pop();	// Delete the middle of the last three
			lower.pop();
			lower.push(temp);
		}
	}
	
	// Avoid duplication of far left and far right vertices
	lower.shift();
	lower.pop();
	
	return upper.concat(lower);
}

/* Returns whether the three passed points make a left turn, as defined in the 
 * Orient function from Dave Mount's notes.
 * THE INEQUALITY SIGNS ARE FLIPPED because origin of canvas is top left.
 */
function leftTurn(p, q, r) {
	// The equal part of the geq deals with the degenerate case in which
	// two of the points are coincident
	return (q.x*r.y - q.y*r.x) - (p.x*r.y - p.y*r.x) + (p.x*q.y - p.y*q.x) <= 0;
}

/* Draws all the points in the passed array with the corresponding color.
 */
function drawPoints(arr) {
	clearCanvas();
	for(let pt of arr) {
		context.strokeStyle = pt.color;
		context.fillStyle = pt.color;
		context.fillRect(pt.x - 2, pt.y - 2, canvasPtLen, canvasPtLen);
	}
}

/* Draws the polygon formed by the passed points with the corresponding color.
 */
function drawPolygon(arr, color = arr[0].color) {
	
	context.strokeStyle = color;
	
	context.beginPath();
	context.moveTo(arr[0].x, arr[0].y);
	for(let pt of arr) {
		context.lineTo(pt.x, pt.y);
	}
	context.closePath();
	context.stroke();
}

/* Draws the thus-far calculated (but not necessarily complete) convex hull.
 */
function drawCurrentCH() {
	
	if(currentCH.length === 0) return;
	
	context.strokeStyle = 'rgba(0,0,0,.5)';
	
	context.beginPath();
	context.moveTo(currentCH[0].x, currentCH[0].y);
	for(let pt of currentCH) {
		context.lineTo(pt.x, pt.y);
	}
	context.stroke();
	
	let n = currentCH.length;
	if(n <= 1) return;
	
	// Draw new tangent
	context.strokeStyle = 'rgba(0,255,0,1)';
	
	context.beginPath();
	context.moveTo(currentCH[n - 2].x, currentCH[n - 2].y);
	context.lineTo(currentCH[n - 1].x, currentCH[n - 1].y);
	context.closePath();
	context.stroke();
}

/* Draws each sub-convex hull.
 */
function drawSubCHs() {
	for(let subset of subCHs) {
		drawPolygon(subset);
	}
}

/* Clears the canvas.
 */
function clearCanvas() {
	context.clearRect(0, 0, canvas.width, canvas.height);
}

/* Prints the passed array of points. Debugging utility.
 */
function printArr(arr) {
	let str = '{' + arr.length + '}: ';
	for(let pt of arr) str = str + '(' + pt.x + ', ' + pt.y + ')  ';
	console.log(str);
}

/* Resets global structures, canvas, and UI.
 */
function algoReset() {
	pointsArr = [];
	subCHs = [];
	currentCH = [];
	clearCanvas();
	algo_t = 1;
	updateParamsLabel();
	buttonGeneratePts.disabled = false;
	buttonCalculateCHs.disabled = true;
	buttonCalculateTangents.disabled = true;
	buttonNextTangent.disabled = true;
	buttonBack.disabled = true;
	state = STATE_INIT;
	updateParamsLabel();
}
buttonReset.onclick = algoReset;

/* Updates the UI label listing global parameters.
 */
function updateParamsLabel() {
	let param = calculateParam();
	pParams.innerHTML = `t = ${algo_t}, m = H = min{2^2^^${algo_t}, ${pointsArr.length}) = ${param}`;
	pParams2.innerHTML = `Hull length = ${currentCH.length}/${param}`;
}

/* Calculates the parameter m = H from the pseudocode description, which
 * defines the number of points in each points partition at the current stage.
 */
function calculateParam() {
	let param;
	if(2**(2**algo_t) < pointsArr.length) {
		param = 2**(2**algo_t);
	} else {
		param = pointsArr.length;
	}
	return param;
}

/* Resets the color of all the points.
 */
function resetPartitions() {
	for(let i = 0; i < pointsArr.length; ++i) {
		pointsArr[i].color = 'rgba(200,0,0,.5)';
	}
}

function ranColor() {
	return "hsl(" + Math.floor(360 * Math.random()) + ',' + 
			(25 + Math.floor(70 * Math.random())) + '%,' + 
			(55 + Math.floor(10 * Math.random())) + '%)';
}
