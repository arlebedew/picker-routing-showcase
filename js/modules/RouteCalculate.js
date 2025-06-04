/*

	Dažu A* impl-jas aspekti ir parņemti un pielagoti
	no Will Thimbleby 2009. gada realizācijas.
	
	Kā arī algoritma implementācijai, galvenokārt bija
	izmantoti Amit Patel raksti timekļa vietnē
	https://www.redblobgames.com/.

*/

class PriorityQueue {
	constructor(comparator) {
		this._elements = [];
		this._comparator = comparator;
	}
	enqueue(item) {
		let low = 0, high = this._elements.length;
		while (low < high) {
			const mid = Math.floor((low + high) / 2);
			if (this._comparator(item, this._elements[mid]) < 0) high = mid;
			else low = mid + 1;
		}
		this._elements.splice(low, 0, item);
	}
	dequeue() { return this._elements.pop(); }
	remove(item) {
		const idx = this._elements.indexOf(item);
		if (idx > -1) this._elements.splice(idx, 1);
	}
	isEmpty() { return this._elements.length === 0; }
}

class GridNode {
	constructor(x, y, blocked) {
		this.x = x;
		this.y = y;
		this.blocked = blocked;
		this.id = `${x}:${y}`;
	}

	getNeighbors(
		grid,
		rows,
		cols,
		allowDiagonals,
		goal
	) {
		const 	neighbors = [],
				directions = [
					[0, 1], [0, -1], [1, 0], [-1, 0],
					[1, 1], [-1, 1], [1, -1], [-1, -1]
				],
				maxDir = allowDiagonals ? 8 : 4;

		for (let i = 0; i < maxDir; i++) {

			const 	newX = this.x + directions[i][0],
					newY = this.y + directions[i][1];

			if (newX < 0 || newX >= cols || newY < 0 || newY >= rows) continue;

			const neighbor = grid[newY][newX];

			if (
				neighbor.blocked && 
				!(goal && neighbor.x === goal.x && neighbor.y === goal.y)
			) continue;

			neighbors.push(neighbor);
		}
		return neighbors;
	}
}

class RouteCalculate {
	constructor() {
		// TSP properties
			this._depotCoord = null;
			this._pickList = null;
			this._pickListAndDepo = null;
			this._pickOrder = null;
			this._pickRoute = null;
			this._pickListGen = null;
			this._totalDistancePerOrder = null;
			this.heuristicTypeTSP = 1;
			this.tspType = 1;

		// A* properties
			this.allowDiagonals = true;
			this.diagonalCostToggle = false;
			this.optimizeSorting = false;
			this.enableDotTiebreaker = false;
			this.pickEntryAisles = [];
			this.heuristicTypeAstar = 1;
			this.startCoord = 0; // For Manhattan Heuristic

		// Warehouse model
			this._warehouse = null;
			this._astarGrid = null;	// Array of GridNodes [y][x]
			this._astarRows = null;
			this._astarCols = null;
			this._astarPaths = [];	// Segments of full path
			this._astarTotalLength = 0;	// Total distance

		// Performance mode
			this._precomputePaths = false;	// Default: "on the fly" calculation
			this._precomputedPathMap = new Map();
	}
	// Setter
		set pickList(val) {
			this._pickList = val;
		}

		set precomputePaths(val) {
			if(!val) return;
			this._precomputePaths = val;
			this.#init();
			this.#precomputeAllPairs();
		}

		set pickListGen(val) {
			this._pickListGen = val;
		}

		set warehouse(val) {
			this._warehouse = val;
			this.#buildAStarGrid();
		}
	// Getters 
		get totalDistancePerOrder() { return this._totalDistancePerOrder; }
		get pickOrder() { return this._pickOrder; }
		get astarTotalLength() { return this._astarTotalLength; }
		get astarPaths() { return this._astarPaths; }

	// Full path for TSP order using A*
	calculateAStarPaths() {
		if (!this._pickOrder) return;
		this._astarPaths = [];
		this._astarTotalLength = 0;

		// Close the route
		const stops = [...this._pickOrder, this._depotCoord];

		for (let i = 0; i < stops.length - 1; i++) {
			const 	from = stops[i],
					to = stops[i + 1];

			// Find the correct aisle cells
			let 	fromAisle = from,
					toAisle = to;

			if (this._warehouse.structArr[from.y][from.x] === 1)
				fromAisle = this.#getAisleCellForPick(from, true);
			if (this._warehouse.structArr[to.y][to.x] === 1)
				toAisle = this.#getAisleCellForPick(to, false);

			this.startCoord = fromAisle;

			let path;
			if (this.precomputePaths) {
				const key = `${fromAisle.x},${fromAisle.y}|${toAisle.x},${toAisle.y}`;
				path = this._precomputedPathMap.get(key);
				if (!path) {
					path = this.#findAStarPath(fromAisle, toAisle);
					this._precomputedPathMap.set(key, path);
				}
			} else {
				path = this.#findAStarPath(fromAisle, toAisle);
			}
			this._astarPaths.push(path);
			this._astarTotalLength += path.length;
		}
	}

	calculateOrder(){

		this.#init();

		switch (this.tspType) {
			case 1:
				this.#nearestNeighbor();
				break;
			case 2:
				// For future G.A. impl.
				this.#nearestNeighbor();

				break;
			default:
				console.error("TSP type unset! Defaulting to N.N.");
				this.#nearestNeighbor();
			break;
		}
	}

	#init() {
		this._pickList = this._pickListGen.pickList;
		this._depotCoord = this._warehouse.warehouseDepotCoord;
		this._pickListAndDepo = [this._depotCoord, ...this._pickList];
	}

	// Build A* grid from warehouse structure
	#buildAStarGrid() {
		const 	arr = this._warehouse.structArr,
				rows = arr.length,
				cols = arr[0].length;

		this._astarRows = rows;
		this._astarCols = cols;

		this._astarGrid = Array.from(
			{ length: rows },
			(_, y) =>
			Array.from(
				{ length: cols },
				(_, x) =>
				new GridNode(x, y, arr[y][x] === 1)
			)
		);
	}

	//	Core A* for pathfinding
	#findAStarPath(from, to) {
		const 	grid = this._astarGrid,
				rows = this._astarRows,
				cols = this._astarCols,
				startNode = grid[from.y][from.x],
				goalNode = grid[to.y][to.x],
				cameFrom = {},
				diagMult = this.diagonalCostToggle ? 1.01 : 1.0;

		const fScoreMap = {
			[startNode.id]: this.#distanceAB(
				this.heuristicTypeAstar, startNode, goalNode, 2) 
		},
		gScoreMap = { 
			[startNode.id]: 0 
		};

		const 	closedSet = new Set(),
				openSet = new PriorityQueue((a, b) =>
					this.optimizeSorting ?
					fScoreMap[b.id] - fScoreMap[a.id] : 
					fScoreMap[a.id] - fScoreMap[b.id]
				);

		openSet.enqueue(startNode);

		while (!openSet.isEmpty()) {
			const current = openSet.dequeue();

			if (current.id === goalNode.id) {
				const path = [goalNode];

				while (cameFrom[path[path.length-1].id]) {
					path.push(cameFrom[path[path.length-1].id]);
				}
				return path.reverse();
			}

			closedSet.add(current.id);
			const 	neighbors = current.getNeighbors(
						grid,
						rows,
						cols,
						this.allowDiagonals,
						goalNode
					);

			for (const neighbor of neighbors) {

				if (closedSet.has(neighbor.id)) continue;

				const 	isDiagonal = neighbor.x !== current.x && neighbor.y !== current.y,
						moveCost = isDiagonal ? diagMult : 1.0,
						tentativeG = gScoreMap[current.id] + moveCost;

				let tentativeBetter = false;

				if (gScoreMap[neighbor.id] === undefined) {
					tentativeBetter = true;
				} else if (tentativeG < gScoreMap[neighbor.id]) {
					openSet.remove(neighbor);
					tentativeBetter = true;
				}

				if (tentativeBetter) {
					cameFrom[neighbor.id] = current;
					gScoreMap[neighbor.id] = tentativeG;
					fScoreMap[neighbor.id] = tentativeG + this.#distanceAB(this.heuristicTypeAstar, neighbor, goalNode, 2);
					openSet.enqueue(neighbor);
				}
			}
		}
		return [];
	}

	#precomputeAllPairs(picks = this._warehouse.storageArr) {
		// Precompute all the routes for caching
		const arr = [
			this._depotCoord,
			...picks,
			this._depotCoord
		];

		for (let i = 0; i < arr.length-1; i++) {

			let from = arr[i],
				to = arr[i+1],
				fromAisle = from,
				toAisle = to;

			if (this._warehouse.structArr[from.y][from.x] === 1)

				fromAisle = this.#getAisleCellForPick(from, true);

			if (this._warehouse.structArr[to.y][to.x] === 1)

				toAisle = this.#getAisleCellForPick(to, false);

			const key = `${fromAisle.x},${fromAisle.y}|${toAisle.x},${toAisle.y}`;

			if (!this._precomputedPathMap.has(key))

				this._precomputedPathMap.set(
					key,
					this.#findAStarPath(fromAisle, toAisle)
				);
		}
	}

	// Aisle cell for pick
	#getAisleCellForPick(pick, firstTime) {
		let { x, y } = pick,
			align = this._warehouse._alignment,
			isOnEdge = 0,
			sideOfEdge = 0;

		if(pick.onEdge !== undefined){
			isOnEdge = pick.onEdge[0] ? true: false;
			sideOfEdge = pick.onEdge[1];
		}

		// For horizontal racks
		if (align === 1) {

			if(sideOfEdge === 1){
				if(firstTime) this.pickEntryAisles.push({ x: x -1, y });
				return { x: x -1, y };
			}

			if(sideOfEdge === 2){
				if(firstTime) this.pickEntryAisles.push({ x: x +1, y });
				return { x: x +1, y};
			}				

		}
		// For vertical
		if (align === 2) {

			if(sideOfEdge === 1){
				if(firstTime) this.pickEntryAisles.push({ x, y: y-1 });
				return { x, y: y-1 };
			}

			if(sideOfEdge === 2){
				if(firstTime) this.pickEntryAisles.push({ x, y: y+1 });
				return { x, y: y+1 };
			}				

		}

		return { x, y };
	}

	#nearestNeighbor() {

		const 	visited = new Array(this._pickListAndDepo.length).fill(false),
				order = [];
		let currentIndex = 0;

		visited[currentIndex] = true;
		order.push(this._pickListAndDepo[currentIndex]);

		for (let step = 1; step < this._pickListAndDepo.length; step++) {

			let nearestIdx = -1,
				nearestDist = Infinity;

			for (let j = 1; j < this._pickListAndDepo.length; j++) {

				if (!visited[j]) {
					const d = this.#distanceAB(
						this.heuristicTypeTSP,
						this._pickListAndDepo[currentIndex],
						this._pickListAndDepo[j],
						1
					);
					if (d < nearestDist) {
						nearestDist = d;
						nearestIdx = j;
					}
				}
			}

			visited[nearestIdx] = true;
			currentIndex = nearestIdx;
			order.push(this._pickListAndDepo[currentIndex]);
		}
		this._pickOrder = order;
		this.#distancePerOrder();
	}

	#heuristicEuclidianDistance(a, b) {
		const 	dx = a.x - b.x,
				dy = a.y - b.y;
		return Math.sqrt(dx * dx + dy * dy);
	}

	// Manhattan/Diagonal with options
	#heuristicManhattanDiagonal(a, b, who) {
		let tieBreaker = 0;

		if (this.enableDotTiebreaker&&who===2) {

			const 	dx1 = a.x - b.x,
					dy1 = a.y - b.y,
					dx2 = this.startCoord.x - b.x,
					dy2 = this.startCoord.y - b.y;

			tieBreaker = Math.abs(dx1 * dy2 - dx2 * dy1);
		}

		if (this.allowDiagonals) {

			const 	straight = Math.abs(
						Math.abs(a.x-b.x) - Math.abs(a.y-b.y)
					),
					diag = Math.max(
						Math.abs(a.x-b.x), Math.abs(a.y-b.y)
					) - straight,
					diagMult = this.diagonalCostToggle ? 1.01 : 1.0;

			return straight + diagMult * diag + tieBreaker * 0.005;
		}

		return Math.abs(a.x-b.x) + Math.abs(a.y-b.y) + tieBreaker * 0.005;
	}

	#distanceAB(type, a, b, who){
		
		if(a === undefined || b === undefined) console.log(a, b);
		switch (type) {
			case 1:
				return this.#heuristicManhattanDiagonal(a, b, who);
				break;
			case 2:
				return this.#heuristicEuclidianDistance(a, b);

				break;
			default:
				console.error("Distance type unset!");
				
		}
	}

	#distancePerOrder() {
		let totalDistance = 0;

		for (let i = 0; i < this._pickOrder.length - 1; i++) {
			totalDistance += this.#distanceAB(
				this.heuristicTypeTSP,
				this._pickOrder[i],
				this._pickOrder[i + 1],
				1
				);
		}

		totalDistance += this.#distanceAB(
			this.heuristicTypeTSP,
			this._pickOrder[this._pickOrder.length - 1],
			this._pickOrder[0],
			1
			);
		this._totalDistancePerOrder = totalDistance;
	}
}
