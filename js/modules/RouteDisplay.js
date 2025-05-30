class RouteDisplay {
	constructor() {
		this._canvasID = null;
		this._canvas = null;
		this._ctx = null;
		this._cellSize = null;
		this._warehouse = null;
		this._rows = null;
		this._cols = null;
		this._depotCoord = null;
		this._pickList = null;
		this._routeCalc = null;

		// Warehouse
		this.rackStroke = "#525252";
		this.rackFill = "#888";
		this.aisleFill = "#eee";
		this.depotFill = "cyan";
		this.depotRadiusFrac = 0.5;
		this.depotFont = "700 18px Arial";
		this.pickEntryRadiusFrac = 0.3;
		// Picks
		this.pickFill = "#525252";
		this.pickStroke = "#ff9800";
		this.pickLineWidth = 3;
		// TSP path
		this.tspLineColor = "blue";
		this.tspLineWidth = 2;
		this.tspFont = "700 18px Arial";
		// A* path
		this.astarLineColor = ["blue", "blue"];
		this.astarLineWidth = 6;
	}

	set canvasID(val) { this._canvasID = val; }
	set cellSize(val) { this._cellSize = val; }
	set warehouse(val) { this._warehouse = val; }
	set pickList(val) { this._pickList = val; }
	set routeCalc(val) { this._routeCalc = val; }

	init() {
		this._canvas = document.getElementById(this._canvasID);
		this._ctx = this._canvas.getContext('2d');
		this._rows = this._warehouse.warehouseHeight;
		this._cols = this._warehouse.warehouseWidth;
		this._canvas.width = this.#canvasWidth();
		this._canvas.height = this.#canvasHeight();
		this._depotCoord = this._warehouse.warehouseDepotCoord;
	}

	#clearCanvas() {
		this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
	}

	#canvasWidth(){
		let w = this._cols * this._cellSize;

		return w;
	}

	#canvasHeight(){
		let h = this._rows * this._cellSize;
		
		return h;
	}

	// Draw only warehouse, depot, picks (no route)
	#drawBaseWarehouse() {
		for (let y = 0; y < this._rows; y++) {
			for (let x = 0; x < this._cols; x++) {
				if (this._warehouse.structArr[y][x] === 1) {
					this._ctx.strokeStyle = this.rackStroke;
					this._ctx.lineWidth = 2;
					this._ctx.strokeRect(
						x * this._cellSize,
						y * this._cellSize,
						this._cellSize - this._cellSize / 10,
						this._cellSize - this._cellSize / 10
					);
					this._ctx.fillStyle = this.rackFill;
					this._ctx.fillRect(
						x * this._cellSize,
						y * this._cellSize,
						this._cellSize - this._cellSize / 10,
						this._cellSize - this._cellSize / 10
					);
				} else {
					this._ctx.fillStyle = this.aisleFill;
					this._ctx.fillRect(
						x * this._cellSize,
						y * this._cellSize,
						this._cellSize,
						this._cellSize
					);
				}
			}
		}
	}

	#highLightPickLocations(route){
		// Pick locations
		
		this._ctx.fillStyle = this.pickFill;
		this._ctx.strokeStyle = this.pickStroke;
		this._ctx.lineWidth = this.pickLineWidth;

		route.forEach(p => {
			if(this._depotCoord == p) return;
			this._ctx.fillRect(
				p.x * this._cellSize,
				p.y * this._cellSize,
				this._cellSize,
				this._cellSize
			);

			this._ctx.strokeRect(
				p.x * this._cellSize,
				p.y * this._cellSize,
				this._cellSize,
				this._cellSize
			);
		});
	}

	#highlightDepot(){
		// ARC
		// this._ctx.fillStyle = this.depotFill;
		this._ctx.beginPath();

		// RECTANGLE
		this._ctx.fillStyle = this.depotFill;

		this._ctx.fillRect(
			this._depotCoord.x * this._cellSize,
			this._depotCoord.y * this._cellSize,
			this._cellSize,
			this._cellSize
		);

		// ARC
		// this._ctx.arc(
		// 	this._depotCoord.x * this._cellSize + this._cellSize / 2,
		// 	this._depotCoord.y * this._cellSize + this._cellSize / 2,
		// 	this._cellSize * this.depotRadiusFrac,
		// 	0, 2 * Math.PI
		// );

		// this._ctx.fill();

		// DEPOT INDICATION SIGN
		this._ctx.fillStyle = this.aisleFill;
		this._ctx.font = this.depotFont;
		this._ctx.fillText(
			"D",
			this._depotCoord.x * this._cellSize + this._cellSize / 4,
			this._depotCoord.y * this._cellSize + this._cellSize / 1.3
		);
	}

	#drawPickOrderNumbers(route) {

		this._ctx.fillStyle = this.aisleFill;
		this._ctx.font = this.tspFont;

		for (let i = 1; i < route.length; i++) {

			this._ctx.fillText(
				i.toString(),
				route[i].x * this._cellSize + this._cellSize / 13,
				route[i].y * this._cellSize + this._cellSize / 1.3
			);
		}
	}

	#drawPickEntryAisles() {
		this._ctx.fillStyle = this.pickStroke;
		let entries = [...this._routeCalc.pickEntryAisles];

		for (let i = 0; i < entries.length; i++) {
			let e = entries[i];

			this._ctx.beginPath();
			this._ctx.arc(
				e.x * this._cellSize + this._cellSize / 2,
				e.y * this._cellSize + this._cellSize / 2,
				this._cellSize * this.pickEntryRadiusFrac, 
				0, 2 * Math.PI
			);
			this._ctx.fill();
		}
	}


	drawTSPRoute() {
		// Draw TSP path
		const route = this._routeCalc.pickOrder;
		this._ctx.strokeStyle = this.tspLineColor;
		this._ctx.lineWidth = this.tspLineWidth;

		this._ctx.beginPath();

		this._ctx.moveTo(
				route[0].x * this._cellSize + this._cellSize / 2,
				route[0].y * this._cellSize + this._cellSize / 2
		);

		for (let i = 1; i < route.length; i++) {
				this._ctx.lineTo(
						route[i].x * this._cellSize + this._cellSize / 2,
						route[i].y * this._cellSize + this._cellSize / 2
				);
		}

		this._ctx.lineTo(
				route[0].x * this._cellSize + this._cellSize / 2,
				route[0].y * this._cellSize + this._cellSize / 2
		);

		this._ctx.stroke();
		this.#highLightPickLocations(route);
		this.#highlightDepot();
		this.#drawPickOrderNumbers(route);
	}

	drawAStarRoute() {
		// Draw A* path segments with alternating colors
		const pathSegments = this._routeCalc.astarPaths;
		let colorChoice = 0;

		for (const segment of pathSegments) {
			colorChoice = colorChoice === 0 ? 1 : 0;
			this._ctx.strokeStyle = this.astarLineColor[colorChoice];
			this._ctx.lineWidth = this.astarLineWidth;

			if (segment.length === 0) continue;

			this._ctx.beginPath();
			
			// Move to the start of the segment
			const firstNode = segment[0];
			this._ctx.moveTo(
				firstNode.x * this._cellSize + this._cellSize / 2,
				firstNode.y * this._cellSize + this._cellSize / 2
			);

			// Draw lines through the segment
			for (let i = 1; i < segment.length; i++) {
				const node = segment[i];
				this._ctx.lineTo(
					node.x * this._cellSize + this._cellSize / 2,
					node.y * this._cellSize + this._cellSize / 2
				);
			}
			this._ctx.stroke();
		}

		this.#highLightPickLocations(this._routeCalc.pickOrder);
		this.#highlightDepot();
		this.#drawPickOrderNumbers(this._routeCalc.pickOrder);
		this.#drawPickEntryAisles();
	}

	drawWarehouse(){
		this.#clearCanvas();
		this.#drawBaseWarehouse();
	}
}