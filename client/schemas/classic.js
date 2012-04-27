var Classic = {};

Classic.Resources = [
	
	{
		name: "Desert",
		url: "models/hex.js",
		color: 0xE8E67D
	},
	
	{
		name: "Lumber",
		url: "models/hex.js",
		color: 0x7A6400
	},
	
	{
		name: "Brick",
		url: "models/hex.js",
		color: 0xCC1B1B
	},
	
	{
		name: "Sheep",
		url: "models/hex.js",
		color: 0x55E076
	},
	
	{
		name: "Grain",
		url: "models/hex.js",
		color: 0xC2AF25
	},
	
	{
		name: "Ore",
		url: "models/hex.js",
		color: 0x878787
	}
		
]

Classic.Buildings = [
	
	{
		name: "Road",
		url: "models/hex.js",
		cost: [ 0, 1, 1, 0, 0, 0 ] // use resource enums
	},
	
	{
		name: "Settlement",
		url: "models/hex.js",
		cost: [ 0, 1, 1, 1, 1, 0 ]
	},
	
	{
		name: "City",
		url: "models/hex.js",
		cost: [ 0, 0, 0, 0, 2, 3 ]
	}
	
];

Classic.Robber = {
	name: "Robber",
	url: "models/robber.js"
};

Classic.CardCost = [ 0, 0, 0, 1, 1, 1 ]
Classic.Cards = [
	
	{
		name: "Year of Plenty",
		url: "materials/cards/yearofplenty.png"
	},
	
	{
		name: "Road Building",
		url: "materials/cards/roadbuilding.png"
	},
	
	{
		name: "Monopoly",
		url: "materials/cards/monopoly.png"
	},
	
	{
		name: "Knight",
		url: "materials/cards/knight.png"
	}
	
];

Classic.Special = [
	
	{
		name: "Largest Army",
		url: "materials/special/largestarmy.png"
	},
	
	{
		name: "Longest Road",
		url: "materials/special/longestroad.png"
	}
	
];

CATAN.Schemas["Classic"] = Classic;