var Dev = {};

Classic.MaxPlayers = 32;

// Default Catan Board Arrangement
// 0 = No tile
// 1 = Resource
// 2 = Dock?
Dev.Grid = [
	[1,1,1,1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1,1,1,1]
]

Dev.ResourceCount = [RESOURCE_DESERT];
for(var i=0; i < Math.floor((Dev.Grid.length * Dev.Grid[0].length)/5); i++) {
	Dev.ResourceCount.push(RESOURCE_LUMBER);
	Dev.ResourceCount.push(RESOURCE_SHEEP);
	Dev.ResourceCount.push(RESOURCE_GRAIN);
	Dev.ResourceCount.push(RESOURCE_ORE);
	Dev.ResourceCount.push(RESOURCE_BRICK);
}

Dev.NumberTokens = [];
for(var i=0; i < (Dev.Grid.length * Dev.Grid[0].length); i++) {
	Dev.NumberTokens.push(2);
}

Dev.Resources = [
	
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

Dev.Buildings = [
	
	{
		name: "Road",
		url: "models/hex.js",
		cost: [ 0, 1, 1, 0, 0, 0 ] // use resource values
	},
	
	{
		name: "Settlement",
		url: "models/hex.js",
		cost: [ 0, 1, 1, 1, 1, 0 ]
	},
	
	{
		name: "City",
		url: "models/hex.js",
		cost: [ 0, 1, 1, 1, 1, 0 ] // ???
	}
	
];

Dev.Robber = {
	name: "Robber",
	url: "models/robber.js"
};

CATAN.Schemas["Dev"] = Dev;