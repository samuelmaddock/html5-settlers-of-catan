var Classic = {};

Classic.MaxPlayers = 4;

// Default Catan Board Arrangement
// 0 = No tile
// 1 = Resource
// 2 = Dock?
Classic.Grid = [
	[0,1,1,1,0],
	[1,1,1,1,1],
	[1,1,1,1,1],
	[1,1,1,1,1],
	[0,0,1,0,0],
]

Classic.ResourceCount = [RESOURCE_DESERT];
for(var i=0; i < 4; i++) {
	Classic.ResourceCount.push(RESOURCE_LUMBER);
	Classic.ResourceCount.push(RESOURCE_SHEEP);
	Classic.ResourceCount.push(RESOURCE_GRAIN);
}
for(var i=0; i < 3; i++) {
	Classic.ResourceCount.push(RESOURCE_BRICK);
	Classic.ResourceCount.push(RESOURCE_ORE);
}

Classic.NumberTokens = [2,3,3,4,4,5,5,6,6,8,8,9,9,10,10,11,11,12];

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

if(typeof exports !== 'undefined') {
	module.exports = Classic;
}