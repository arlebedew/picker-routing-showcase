/*
	Global system setup and object parameter/dependance intialization
	Warehouse - permament due run, model changes is a unrealistic scenario
	Pick List - temporary due run, list can be updated
	Route Calculate - temporary due run, routes can be recalculated
	Route Display - temporary due run, output may be updated
*/

const warehouse = new WarehouseModel();

	// Set warehouse parameters (racks, aisles, etc.)
	warehouse.alignment = 1; // layout orientation mode
	warehouse.rackW = 2; // rack width (cells)
	warehouse.rackL = 10; // rack length (cells)
	warehouse.blockAmnt = 7; // number of blocks (sections of racks)
	warehouse.rackAmntPerBlock = 10; // racks per block
	warehouse.crossAisleW = 3; // width of cross-aisles (in cells)
	warehouse.aisleW = 2; // width of aisles between rack rows (in cells)
	warehouse.depoWidth = 3;
	warehouse.depoPos = 'top';
	warehouse.buildStructArr();

// Change to MockWMS
const pickListGen = new PickListGenerator();
	pickListGen.minListSize = warehouse.storageArr.length * 0.04;
	pickListGen.maxListSize = warehouse.storageArr.length * 0.04;
	pickListGen.warehouse = warehouse;


const routeCal = new RouteCalculate();
	routeCal.warehouse = warehouse;
	routeCal.pickListGen = pickListGen;

	// A* options
	routeCal.allowDiagonals = true;
	routeCal.diagonalCostToggle = true;
	routeCal.optimizeSorting = true;
	routeCal.enableDotTiebreaker = false;
	routeCal.precomputePaths = false; // All the paths possible, can be cached latter
	routeCal.heuristicTypeTSP = 2; // 1 - Manhattan; 2 - Euclidian
	routeCal.heuristicTypeAstar = 1; // 1 - Manhattan; 2 - Euclidian
	routeCal.tspType = 1; // 1 - Neirest Neighbour; 2 - Something else(IN FUTURE)

const routeDis = new RouteDisplay();
	routeDis.canvasID = 'warehouse-map-canvas';
	routeDis.cellSize = 25;
	routeDis.warehouse = warehouse;
	routeDis.routeCalc = routeCal;

	// Map display stuff configurations
	routeDis.rackFill = "#888";
	routeDis.aisleFill = "#eee";
	routeDis.cellTextColor ="#525252";
	routeDis.pickOrderNumberTextColor = "#3e53b3eb";
	routeDis.depotFill = "#525252";
	routeDis.pickFill = "#52525200";
	routeDis.pickStroke = "#3e53b3";
	routeDis.rackBlockSigns = "#525252";
	routeDis.rackStroke = "#525252";
	routeDis.pickLineWidth = 5;
	routeDis.tspLineColor = "#65b8eb";
	routeDis.astarLineColor = ["#657debc7", "#3f4e94e0"];
	routeDis.astarLineWidth = 7;
	routeDis.tspLineWidth = 4;
	routeDis.init();


console.log("I'm fine");

