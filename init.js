'use strict';

let divContainer = document.createElement('div');
divContainer.id = 'divContainer';
divContainer.style.width = window.innerWidth;
document.body.appendChild(divContainer);

let divCanvas = document.createElement('div');
divCanvas.id = 'divCanvas';
divContainer.appendChild(divCanvas);

let canvas = document.createElement('canvas');
canvas.id='canvas';
canvas.height=550;
divCanvas.appendChild(canvas);
canvas.width=600;

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
labelNumPoints.id='inputPoints';
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
