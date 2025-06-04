

// To display the TSP route (Euclidean lines)
function showTSPRoute() {
	routeDis.drawTSPRoute();
	console.log(
		"TSP Euclidean order route distance:",
		routeCal.totalDistancePerOrder.toFixed(2)
	);
}

// To display the walkable A* path:
function showAStarRoute() {
	routeCal.calculateAStarPaths();
	routeDis.drawAStarRoute();
	console.log(
		"A*lmost walkable route distance:",
		routeCal.astarTotalLength.toFixed(2)
	);
}

function setPickList(mode){
	if(mode) pickListGen.generatePickList();
	if(!mode) console.log("Using manual pick list.");
	if(mode===undefined) console.warn("Why no Pick list mode??");	
}

function showWarehouse(){
	routeDis.drawWarehouse();
}

function togglePickOrderListMap(){
	
	let wMap = document.getElementById("warehouse-map-container"),
		pList = document.getElementById("pick-list-sub-container"),
		toggler1 = document.getElementById("bottom-pick-list-toggle"),
		toggler2 = document.getElementById("top-pick-list-toggle"),
		wMapC = document.getElementById("warehouse-map"),
		pListC = document.getElementById("pick-list-container"),
		zoomInBtn = document.getElementById("zoom-in"),
		zoomOutBtn = document.getElementById("zoom-out");


	// pList.classList.toggle("hidden-container");
	pListC.classList.toggle("hidden-container");
	wMapC.classList.toggle("hidden-container");
	toggler1.classList.toggle("hidden");
	toggler2.classList.toggle("hidden");
	wMap.classList.toggle("hidden");
	pList.classList.toggle("hidden");
	zoomInBtn.classList.toggle("hidden");
	zoomOutBtn.classList.toggle("hidden");
	
}

function zoomIn(){

	let map = document.getElementById("warehouse-map-canvas"),
		mapZoom = window.getComputedStyle(map)
					.getPropertyValue('zoom')*100;

	map.style.zoom = (mapZoom+10)+"%";

}

function zoomOut(amount){

	let map = document.getElementById("warehouse-map-canvas"),
		mapZoom = window.getComputedStyle(map)
					.getPropertyValue('zoom')*100;

	amount = Number.isInteger(amount) ? amount : 10;

	map.style.zoom = (mapZoom-amount)+"%";
	
}

function zoomPerContent(){

	let map = document.getElementById("warehouse-map-canvas"),
		mapSize = map.width;

	if(mapSize >= 1500){
		map.style.zoom = 120+"%";
	}
	
}