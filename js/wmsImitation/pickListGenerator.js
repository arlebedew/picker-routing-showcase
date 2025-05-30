/*
TODO:
	1. Random item Titles and SKUs for UI
	2. Random item Amount

*/

class PickListGenerator {
	constructor() {
		this._minListSize = null;
		this._maxListSize = null;
		this._storageLocations = [];
		this._pickList = [];
		this._warehouse = null;
	}

	// Setters
	set minListSize(value) { this._minListSize = value; }
	set maxListSize(value) { this._maxListSize = value; }
	set storageLocations(value) { 
		this._storageLocations = value;
	}
	set warehouse(value) { 
		this._warehouse = value;
		this._storageLocations = value.storageArr;
	}

	set pickList(val) {
		this._pickList = val;
	}

	get pickList(){
		return this._pickList;
	}

	get pickListSize(){
		
		return this._pickList.length;
	}

	generatePickList() {
	// Create a random Pick List

		let selectionCount = Math.min(
			Math.floor(
				Math.random() * (this._maxListSize - this._minListSize + 1)
				) + this._minListSize,
				this._storageLocations.length
			),
			result = [];

		for (let sel = selectionCount; sel > 0; sel--) {

			result.push(
				this._storageLocations[
					Math.floor(Math.random() * this._storageLocations.length)
				]
			);
		}
		// Set() for removing dublicates
		this._pickList=[...new Set(result)];
	}
}
