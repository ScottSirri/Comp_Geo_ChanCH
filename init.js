'use strict';

let divContainer = document.createElement('div');
divContainer.id = 'divContainer';
divContainer.style.width = window.innerWidth;
document.body.appendChild(divContainer);

let divCanvas = document.createElement('div');
divCanvas.id = 'divCanvas';
divCanvas.style.width = (window.innerWidth / 2) + 'px';
divContainer.appendChild(divCanvas);

let canvas = document.createElement('canvas');
canvas.id='canvas';
canvas.height=window.innerHeight - 20;
canvas.width=window.innerWidth / 2;
divCanvas.appendChild(canvas);


let divUI = document.createElement('div');
divUI.id = 'divUI';
divContainer.appendChild(divUI);

let headerUI = document.createElement('h1');
headerUI.id = 'headerUI';
headerUI.innerHTML = 'Timothy Chan\'s O(nlgh) Convex Hull Algorithm';
divUI.appendChild(headerUI);

let labelNumPoints = document.createElement('label');
labelNumPoints.for='numPoints';
labelNumPoints.innerHTML='Number of points: ';
labelNumPoints.id='labelNumPoints';
divUI.appendChild(labelNumPoints);

let inputNumPoints = document.createElement("input");
inputNumPoints.id='numPoints';
inputNumPoints.type='number';
inputNumPoints.min='3';
inputNumPoints.max='1024';
inputNumPoints.name='Number of points';
inputNumPoints.id = 'inputPoints';
inputNumPoints.value = 32;
divUI.appendChild(inputNumPoints);

let buttonGeneratePts = document.createElement('button');
buttonGeneratePts.innerHTML = 'Generate Points';
buttonGeneratePts.id = 'buttonGeneratePts';
divUI.appendChild(buttonGeneratePts);

let buttonPartitionPts = document.createElement('button');
buttonPartitionPts.innerHTML = 'Partition Points';
buttonPartitionPts.id = 'buttonPartitionPts';
buttonPartitionPts.disabled = true;
divUI.appendChild(buttonPartitionPts);

let buttonCalculateCHs = document.createElement('button');
buttonCalculateCHs.innerHTML = 'Calculate Convex Hulls';
buttonCalculateCHs.id = 'buttonCalculateCHs';
buttonCalculateCHs.disabled = true;
divUI.appendChild(buttonCalculateCHs);

let pParams = document.createElement('p');
pParams.id = 'pParams';
divUI.appendChild(pParams);

let pParams2 = document.createElement('p');
pParams2.id = 'pParams2';
divUI.appendChild(pParams2);

let buttonCalculateTangents = document.createElement('button');
buttonCalculateTangents.innerHTML = 'Calculate Tangents';
buttonCalculateTangents.id = 'buttonCalculateTangents';
buttonCalculateTangents.disabled = true;
divUI.appendChild(buttonCalculateTangents);

let buttonNextTangent = document.createElement('button');
buttonNextTangent.innerHTML = 'Next Tangent';
buttonNextTangent.id = 'buttonNextTangent';
buttonNextTangent.disabled = true;
divUI.appendChild(buttonNextTangent);

let buttonReset = document.createElement('button');
buttonReset.innerHTML = 'Reset';
buttonReset.id = 'buttonReset';
divUI.appendChild(buttonReset);

let buttonBack = document.createElement('button');
buttonBack.innerHTML = 'Back';
buttonBack.id = 'buttonBack';
buttonBack.disabled = true;
divUI.appendChild(buttonBack);

class Iter {
	constructor(hullsIn, chIn, colorsIn) {
		this.hulls = hullsIn;
		this.partialCH = chIn;
		this.colors = colorsIn;
	}
}

function assert(condition, msg = '') {
	if(!condition) {
		let str = (msg.length > 0) ? ': ' + msg : '';
		throw new Error(`Assertion failed${str}`);
	}
}


/*
 * Code for mergesort and merge is taken from stackabuse.com
 * and is written by Abhilash Kakumanu.
 */
function mergesortX(array) {
  // Base case or terminating case
  if(array.length < 2){
    return array;
  }
  
  const half = array.length / 2;
  
  const left = array.splice(0, half);
  return merge(mergesortX(left), mergesortX(array));
}

/*
 * Code for mergesort and merge is taken from stackabuse.com
 * and is written by Abhilash Kakumanu.
 */
function merge(left, right) {
    let arr = [];
    // Break out of loop if any one of the array gets empty
    while (left.length && right.length) {
        // Pick the smaller among the smallest element of left and right sub arrays 
        if (left[0].x < right[0].x) {
            arr.push(left.shift());
        } else if (left[0].x > right[0].x) {
            arr.push(right.shift());
        } else if (left[0].x == right[0].x) {	// Lexicographical ordering to deal with degenerate case of dual x-coords
			if (left[0].y < right[0].y) {
				arr.push(left.shift());
			} else {
				arr.push(right.shift());
			}
		}
    }
    
    // Concatenating the leftover elements
    // (in case we didn't go through the entire left or right array)
    return [ ...arr, ...left, ...right ]
}
