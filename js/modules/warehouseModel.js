class WarehouseModel {
	constructor() {
		this._alignment = null;
		this._rackW = null;
		this._rackL = null;
		this._blockAmnt = null;
		this._rackAmntPerBlock = null;
		this._crossAisleW = null;
		this._aisleW = null;
		this._crossAisleAmnt = null;
		this._aisleAmnt = null;
		this._depoPos = null;
		this._depoWidth = null;
		this._structArr = [];
		this._storageArr = [];
		this._blockArr = [];
		this._rackArr = [];
		this._warehouseDepotCoord = null;
	}

	// Setters
		set alignment(value) { this._alignment = value; }
		set rackW(value) { this._rackW = value; }
		set rackL(value) { this._rackL = value; }
		set blockAmnt(value) { this._blockAmnt = value; }
		set rackAmntPerBlock(value) { this._rackAmntPerBlock = value; }
		set crossAisleW(value) { this._crossAisleW = value; }
		set aisleW(value) { this._aisleW = value; }
		set crossAisleAmnt(value) { this._crossAisleAmnt = value; }
		set aisleAmnt(value) { this._aisleAmnt = value; }
		set depoPos(value) { this._depoPos = value; }
		set depoWidth(value) { this._depoWidth = value; }

	// Getters
		get structArr() {
			return this._structArr;
		}

		get storageArr() {
			return this._storageArr;
		}

		get warehouseHeight(){
			// Rows
			return this._structArr.length;
		}

		get warehouseWidth(){
			// Cols
			return this._structArr[0].length;
		}

		get warehouseDepotCoord(){
			return this._warehouseDepotCoord;
		}

		get depotPos(){
			return this._depoPos;
		}


	buildStructArr() {
		let block = [], space = [];
		this._structArr = [];
		
		// Generate warehouse structure
		switch (this._alignment) {
			case 1: {
				// 1: horizontal
				block = createBlock(
					this._aisleW,
					this._rackL,
					this._rackW,
					this._rackAmntPerBlock
					);
				space = spaceBetween(this._crossAisleW, block[0].length);

				this._structArr.push(...space);

				for (let i = 0; i < this._blockAmnt; i++) {

					for (let b = 0; b < block.length; b++) {
						this._structArr.push(block[b]);
					}

					this._structArr.push(...space);
				}

				let depotResult = addDepot(
					this._crossAisleW,
					block[0].length,
					this._depoWidth,
					this._structArr,
					this._depoPos
				);

				this._structArr = depotResult.struct;
				this._warehouseDepotCoord = depotResult.depotCoord;

				break;
			}
			case 2: {
				// 2: vertical
				// Parameter inversion due to different align. type
				block = createBlock(
					this._crossAisleW,
					this._rackW,
					this._rackL,
					this._blockAmnt
					);
				space = spaceBetween(this._aisleW, block[0].length);

				this._structArr.push(...space);

				for (let i = 0; i < this._rackAmntPerBlock; i++) {
					for (let b = 0; b < block.length; b++) {
						this._structArr.push(block[b]);
					}

					this._structArr.push(...space);
				}

				let depotResult = addDepot(
					this._aisleW,
					block[0].length,
					this._depoWidth,
					this._structArr,
					this._depoPos
				);

				this._structArr = depotResult.struct;
				this._warehouseDepotCoord = depotResult.depotCoord;

				break;
			}
			default:
				throw new Error("Unknown alignment value!");
		}

		this.#buildStorageArr();
		
		function createBlock(aisleW, rackL, rackW, rackAmnt) {
			let _block = [],
				aisleSpace = Array.from({ length: aisleW }, () => 0);

			for (let r = 0; r < rackL; r++) {
				let blockRow = [...aisleSpace];

				for (let ra = 0; ra < rackAmnt; ra++) {
					blockRow.push(...Array.from({ length: rackW }, () => 1));
					blockRow.push(...aisleSpace);
				}

				_block.push(blockRow);

			}
			return _block;
		}

		function spaceBetween(aisleW, blockWidth) {
			// Space between blocks
			return Array.from({ length: aisleW }, () => Array(blockWidth).fill(0));
		}

		function addDepot(aisleW, aisleL, depoW, warStruct, dP){
			let warStructTemp = [...warStruct],
				depoCells = [];

			function depotSpace(aL, dW){

				let depotPos = [...Array.from({ length: (aL - dW)/2 }, () => 0)],
					depotRow = [...depotPos];

				depotRow.push(...Array.from({ length: dW }, () => 1));
				depotRow.push(...Array.from({ length: aL - depotRow.length}, () => 0));

				return depotRow;
			}

			if (dP === 'top') {
				const depotRow = depotSpace(aisleL, depoW);

				for (let x = 0; x < depotRow.length; x++) {
					if (depotRow[x] === 1) depoCells.push({ x, y: 0 });
				}

				warStructTemp = [depotRow, ...warStructTemp];
			}
			else if (dP === 'bottom') {
				const depotRow = depotSpace(aisleL, depoW);
				const newY = warStructTemp.length;

				for (let x = 0; x < depotRow.length; x++) {
					if (depotRow[x] === 1) depoCells.push({ x, y: newY });
				}
				warStructTemp = [...warStructTemp, depotRow];
			}
			else if (dP === 'left') {
				const dS = depotSpace(warStructTemp.length, depoW);

				for (let y = 0; y < warStructTemp.length; y++) {
					warStructTemp[y] = [dS[y], ...warStructTemp[y]];
					if (dS[y] === 1) depoCells.push({ x: 0, y });
				}
			}
			else if (dP === 'right') {

				const dS = depotSpace(warStructTemp.length, depoW);
				for (let y = 0; y < warStructTemp.length; y++) {
					warStructTemp[y] = [...warStructTemp[y], dS[y]];
					if (dS[y] === 1) depoCells.push({ x: warStructTemp[y].length - 1, y });
				}
			}

			// Depot center coordinate
			if (depoCells.length) {
				const mid = Math.floor(depoCells.length / 2);
				return {
					struct: warStructTemp,
					depotCoord: depoCells[mid]
				};
			}
		}
	}


	#buildStorageArr() {
		this._storageArr = [];
		const 	rows = this._structArr.length,
				cols = this._structArr[0].length;

		let width = 0,
			length = 0,
			lCnt = 1,
			positionCnt = 0,
			wCnt = 1,
			fullWidth = 0,
			blockOrRack =0;

		if (this._alignment === 1) {
			width = this._rackW;
			length = this._rackL;
			blockOrRack = this._rackAmntPerBlock;

		} else if (this._alignment === 2) {
			width = this._rackL;
			length = this._rackW;
			blockOrRack = this._blockAmnt;
		} else {
			console.warn("Unset alignment");
			return;
		}

		fullWidth = width * blockOrRack;

		for (let y = 0; y < rows; y++) {

			positionCnt = fullWidth;

			for (let x = 0; x < cols; x++) {
				if (this._structArr[y][x] !== 1) continue;  // skip non-storage cells

				// Check if this cell is part of a depot
				let isDepot =
					(this._depoPos === 'top'    && y === 0        && this._structArr[y][x] === 1) ||
					(this._depoPos === 'bottom' && y === rows - 1 && this._structArr[y][x] === 1) ||
					(this._depoPos === 'left'   && x === 0        && this._structArr[y][x] === 1) ||
					(this._depoPos === 'right'  && x === cols - 1 && this._structArr[y][x] === 1);

				if (isDepot) continue;

				let onEdge = 0,
					side = 0,
					block = 0,
					rack = 0,
					rackOrBlock = 0,
					actualPosition =0;

				// Rack/Block nr. calculation
					if (this._alignment === 1) {
						// Compute block index
						block = Math.floor(y / (length + this._crossAisleW))+1;
						// Compute rack index
						rack = Math.floor(x / (width + this._aisleW))+1;

						// Saving block and rack positions
							// Rack start detection
							if(lCnt === 1 && wCnt == 1){
								this._rackArr.push({ x, y, block, rack });

								// Block start detection
								if(positionCnt === fullWidth) this._blockArr.push({ x, y, block, rack });
							}

						rackOrBlock = rack;

					} else if (this._alignment === 2) {
						rack = Math.floor(y / (length + this._aisleW))+1;
						block = Math.floor(x / (width + this._crossAisleW))+1;

						// Saving block and rack positions
							// Rack start detection
							if(wCnt == 1 && lCnt % 2 == 1){
								this._rackArr.push({ x, y, block, rack });

								// Block start detection
								if(lCnt===1) this._blockArr.push({ x, y, block, rack });
							}

						rackOrBlock = block;
					}

				// Find rack edges
					if (wCnt === 1) {
						side = lCnt % 2 > 0 ? 1 : 2;
						onEdge = [true, side];
						actualPosition = wCnt;
						wCnt++;
					} else if (wCnt === width) {
						side = lCnt % 2 > 0 ? 1 : 2;
						onEdge = [true, side];
						actualPosition = wCnt;
						wCnt = 1; 

					} else {
						side = lCnt % 2 > 0 ? 1 : 2;
						onEdge = [false, side];
						actualPosition = wCnt;
						wCnt++;
					}

					if (this._alignment === 1) {
						if (lCnt === 1 || lCnt === length) {
							side = positionCnt % 2 > 0 ? 2 : 1;
							actualPosition = lCnt;
							onEdge = [true, side];
						} else {

							side = positionCnt % 2 > 0 ? 2 : 1;
							actualPosition = lCnt;
							onEdge = [false, side];
						}
					}
				
				this._storageArr.push({ x, y, onEdge, block, rack, actualPosition});

				positionCnt--;
			}

			if (positionCnt === 0){
				if (this._alignment === 1) {
					if (lCnt === length) {
						lCnt = 1;
					} else {
						lCnt++;
					}
				} else {
					lCnt++;
				}
			}
		}

	}
}