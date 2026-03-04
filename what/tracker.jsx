import { useState, useEffect, useCallback } from "react";

// ============================================================
// DATA
// ============================================================

const VILLAGERS = [
  // Cats
  {name:"Ankha",species:"Cat",personality:"Snooty",gender:"Female",bdayMonth:9,bdayDay:22},
  {name:"Bob",species:"Cat",personality:"Lazy",gender:"Male",bdayMonth:1,bdayDay:1},
  {name:"Cole",species:"Cat",personality:"Lazy",gender:"Male",bdayMonth:8,bdayDay:26},
  {name:"Felicity",species:"Cat",personality:"Peppy",gender:"Female",bdayMonth:3,bdayDay:30},
  {name:"Kabuki",species:"Cat",personality:"Cranky",gender:"Male",bdayMonth:11,bdayDay:29},
  {name:"Kid Cat",species:"Cat",personality:"Jock",gender:"Male",bdayMonth:4,bdayDay:22},
  {name:"Kitty",species:"Cat",personality:"Snooty",gender:"Female",bdayMonth:2,bdayDay:15},
  {name:"Lolly",species:"Cat",personality:"Normal",gender:"Female",bdayMonth:3,bdayDay:27},
  {name:"Merry",species:"Cat",personality:"Peppy",gender:"Female",bdayMonth:6,bdayDay:29},
  {name:"Merry",species:"Cat",personality:"Peppy",gender:"Female",bdayMonth:6,bdayDay:29},
  {name:"Mitzi",species:"Cat",personality:"Normal",gender:"Female",bdayMonth:9,bdayDay:25},
  {name:"Monique",species:"Cat",personality:"Snooty",gender:"Female",bdayMonth:9,bdayDay:7},
  {name:"Muppet",species:"Cat",personality:"Peppy",gender:"Female",bdayMonth:10,bdayDay:2},
  {name:"Olivia",species:"Cat",personality:"Snooty",gender:"Female",bdayMonth:2,bdayDay:3},
  {name:"Pierre",species:"Cat",personality:"Smug",gender:"Male",bdayMonth:6,bdayDay:22},
  {name:"Purrl",species:"Cat",personality:"Snooty",gender:"Female",bdayMonth:5,bdayDay:29},
  {name:"Stinky",species:"Cat",personality:"Jock",gender:"Male",bdayMonth:8,bdayDay:17},
  {name:"Tabby",species:"Cat",personality:"Peppy",gender:"Female",bdayMonth:8,bdayDay:13},
  {name:"Tom",species:"Cat",personality:"Cranky",gender:"Male",bdayMonth:12,bdayDay:10},
  {name:"Rosie",species:"Cat",personality:"Peppy",gender:"Female",bdayMonth:2,bdayDay:27},
  {name:"Kiki",species:"Cat",personality:"Normal",gender:"Female",bdayMonth:10,bdayDay:8},
  // Bears
  {name:"Beardo",species:"Bear",personality:"Smug",gender:"Male",bdayMonth:7,bdayDay:28},
  {name:"Charlise",species:"Bear",personality:"BigSister",gender:"Female",bdayMonth:4,bdayDay:2},
  {name:"Divina",species:"Bear",personality:"Normal",gender:"Female",bdayMonth:10,bdayDay:21},
  {name:"Ike",species:"Bear",personality:"Cranky",gender:"Male",bdayMonth:1,bdayDay:23},
  {name:"Klaus",species:"Bear",personality:"Smug",gender:"Male",bdayMonth:12,bdayDay:29},
  {name:"Megan",species:"Bear",personality:"Normal",gender:"Female",bdayMonth:9,bdayDay:2},
  {name:"Nate",species:"Bear",personality:"Lazy",gender:"Male",bdayMonth:3,bdayDay:28},
  {name:"Paula",species:"Bear",personality:"BigSister",gender:"Female",bdayMonth:1,bdayDay:26},
  {name:"Teddy",species:"Bear",personality:"Jock",gender:"Male",bdayMonth:5,bdayDay:27},
  {name:"Tutu",species:"Bear",personality:"Peppy",gender:"Female",bdayMonth:9,bdayDay:28},
  // Bear Cubs
  {name:"Barold",species:"Bear Cub",personality:"Lazy",gender:"Male",bdayMonth:12,bdayDay:8},
  {name:"Bluebear",species:"Bear Cub",personality:"Peppy",gender:"Female",bdayMonth:6,bdayDay:24},
  {name:"Chester",species:"Bear Cub",personality:"Lazy",gender:"Male",bdayMonth:2,bdayDay:6},
  {name:"Chow",species:"Bear Cub",personality:"Cranky",gender:"Male",bdayMonth:7,bdayDay:5},
  {name:"Curt",species:"Bear Cub",personality:"Cranky",gender:"Male",bdayMonth:7,bdayDay:1},
  {name:"June",species:"Bear Cub",personality:"Normal",gender:"Female",bdayMonth:6,bdayDay:15},
  {name:"Kody",species:"Bear Cub",personality:"Jock",gender:"Male",bdayMonth:9,bdayDay:13},
  {name:"Maude",species:"Bear Cub",personality:"Snooty",gender:"Female",bdayMonth:11,bdayDay:26},
  {name:"Maple",species:"Bear Cub",personality:"Normal",gender:"Female",bdayMonth:11,bdayDay:27},
  {name:"Mufasa",species:"Bear Cub",personality:"Cranky",gender:"Male",bdayMonth:12,bdayDay:22},
  {name:"Murphy",species:"Bear Cub",personality:"Cranky",gender:"Male",bdayMonth:2,bdayDay:19},
  {name:"Pekoe",species:"Bear Cub",personality:"Normal",gender:"Female",bdayMonth:5,bdayDay:18},
  {name:"Poncho",species:"Bear Cub",personality:"Jock",gender:"Male",bdayMonth:1,bdayDay:2},
  {name:"Pudge",species:"Bear Cub",personality:"Lazy",gender:"Male",bdayMonth:6,bdayDay:11},
  {name:"Stitches",species:"Bear Cub",personality:"Lazy",gender:"Male",bdayMonth:2,bdayDay:10},
  {name:"Vladimir",species:"Bear Cub",personality:"Cranky",gender:"Male",bdayMonth:8,bdayDay:30},
  // Birds
  {name:"Anchovy",species:"Bird",personality:"Lazy",gender:"Male",bdayMonth:3,bdayDay:4},
  {name:"Jacques",species:"Bird",personality:"Smug",gender:"Male",bdayMonth:8,bdayDay:22},
  {name:"Jitters",species:"Bird",personality:"Jock",gender:"Male",bdayMonth:2,bdayDay:2},
  {name:"Medli",species:"Bird",personality:"Normal",gender:"Female",bdayMonth:12,bdayDay:23},
  {name:"Peck",species:"Bird",personality:"Jock",gender:"Male",bdayMonth:5,bdayDay:25},
  {name:"Robin",species:"Bird",personality:"Snooty",gender:"Female",bdayMonth:12,bdayDay:4},
  {name:"Midge",species:"Bird",personality:"Normal",gender:"Female",bdayMonth:3,bdayDay:12},
  {name:"Twiggy",species:"Bird",personality:"Peppy",gender:"Female",bdayMonth:9,bdayDay:13},
  // Bulls
  {name:"Angus",species:"Bull",personality:"Cranky",gender:"Male",bdayMonth:11,bdayDay:26},
  {name:"Stu",species:"Bull",personality:"Lazy",gender:"Male",bdayMonth:9,bdayDay:18},
  {name:"T-Bone",species:"Bull",personality:"Cranky",gender:"Male",bdayMonth:5,bdayDay:5},
  {name:"Vic",species:"Bull",personality:"Cranky",gender:"Male",bdayMonth:2,bdayDay:26},
  // Deer
  {name:"Bam",species:"Deer",personality:"Jock",gender:"Male",bdayMonth:11,bdayDay:7},
  {name:"Bruce",species:"Deer",personality:"Cranky",gender:"Male",bdayMonth:11,bdayDay:28},
  {name:"Diana",species:"Deer",personality:"Snooty",gender:"Female",bdayMonth:1,bdayDay:4},
  {name:"Fuchsia",species:"Deer",personality:"BigSister",gender:"Female",bdayMonth:7,bdayDay:19},
  {name:"Lopez",species:"Deer",personality:"Smug",gender:"Male",bdayMonth:10,bdayDay:29},
  {name:"Zell",species:"Deer",personality:"Smug",gender:"Male",bdayMonth:6,bdayDay:7},
  // Dogs
  {name:"Biskit",species:"Dog",personality:"Lazy",gender:"Male",bdayMonth:5,bdayDay:13},
  {name:"Bea",species:"Dog",personality:"Normal",gender:"Female",bdayMonth:10,bdayDay:15},
  {name:"Benjamin",species:"Dog",personality:"Lazy",gender:"Male",bdayMonth:12,bdayDay:18},
  {name:"Bones",species:"Dog",personality:"Lazy",gender:"Male",bdayMonth:8,bdayDay:4},
  {name:"Cherry",species:"Dog",personality:"BigSister",gender:"Female",bdayMonth:5,bdayDay:11},
  {name:"Cookie",species:"Dog",personality:"Peppy",gender:"Female",bdayMonth:6,bdayDay:18},
  {name:"Daisy",species:"Dog",personality:"Normal",gender:"Female",bdayMonth:11,bdayDay:16},
  {name:"Goldie",species:"Dog",personality:"Normal",gender:"Female",bdayMonth:12,bdayDay:27},
  {name:"Lucky",species:"Dog",personality:"Lazy",gender:"Male",bdayMonth:11,bdayDay:4},
  {name:"Mac",species:"Dog",personality:"Jock",gender:"Male",bdayMonth:11,bdayDay:11},
  {name:"Marcel",species:"Dog",personality:"Lazy",gender:"Male",bdayMonth:12,bdayDay:31},
  {name:"Portia",species:"Dog",personality:"Snooty",gender:"Female",bdayMonth:10,bdayDay:30},
  {name:"Shep",species:"Dog",personality:"Smug",gender:"Male",bdayMonth:2,bdayDay:28},
  {name:"Tia",species:"Dog",personality:"Normal",gender:"Female",bdayMonth:9,bdayDay:5},
  // Ducks
  {name:"Bill",species:"Duck",personality:"Jock",gender:"Male",bdayMonth:2,bdayDay:1},
  {name:"Deena",species:"Duck",personality:"Normal",gender:"Female",bdayMonth:2,bdayDay:27},
  {name:"Drake",species:"Duck",personality:"Lazy",gender:"Male",bdayMonth:12,bdayDay:25},
  {name:"Freckles",species:"Duck",personality:"Peppy",gender:"Female",bdayMonth:2,bdayDay:19},
  {name:"Gloria",species:"Duck",personality:"Snooty",gender:"Female",bdayMonth:9,bdayDay:12},
  {name:"Ketchup",species:"Duck",personality:"Peppy",gender:"Female",bdayMonth:7,bdayDay:27},
  {name:"Molly",species:"Duck",personality:"Normal",gender:"Female",bdayMonth:3,bdayDay:7},
  {name:"Pate",species:"Duck",personality:"Peppy",gender:"Female",bdayMonth:2,bdayDay:23},
  {name:"Scoot",species:"Duck",personality:"Jock",gender:"Male",bdayMonth:6,bdayDay:13},
  {name:"Derwin",species:"Duck",personality:"Lazy",gender:"Male",bdayMonth:5,bdayDay:25},
  {name:"Joey",species:"Duck",personality:"Lazy",gender:"Male",bdayMonth:1,bdayDay:3},
  // Eagles
  {name:"Apollo",species:"Eagle",personality:"Cranky",gender:"Male",bdayMonth:7,bdayDay:4},
  {name:"Amelia",species:"Eagle",personality:"Snooty",gender:"Female",bdayMonth:11,bdayDay:19},
  {name:"Avery",species:"Eagle",personality:"Cranky",gender:"Male",bdayMonth:2,bdayDay:22},
  {name:"Frank",species:"Eagle",personality:"Cranky",gender:"Male",bdayMonth:4,bdayDay:30},
  {name:"Pierce",species:"Eagle",personality:"Jock",gender:"Male",bdayMonth:1,bdayDay:8},
  {name:"Quinn",species:"Eagle",personality:"BigSister",gender:"Female",bdayMonth:6,bdayDay:12},
  {name:"Sam",species:"Eagle",personality:"Lazy",gender:"Male",bdayMonth:8,bdayDay:5},
  {name:"Sterling",species:"Eagle",personality:"Jock",gender:"Male",bdayMonth:10,bdayDay:26},
  {name:"Victor",species:"Eagle",personality:"Jock",gender:"Male",bdayMonth:12,bdayDay:18},
  {name:"Keaton",species:"Eagle",personality:"Smug",gender:"Male",bdayMonth:3,bdayDay:1},
  // Elephants
  {name:"Big Top",species:"Elephant",personality:"Lazy",gender:"Male",bdayMonth:10,bdayDay:3},
  {name:"Chai",species:"Elephant",personality:"Peppy",gender:"Female",bdayMonth:5,bdayDay:26},
  {name:"Axel",species:"Elephant",personality:"Jock",gender:"Male",bdayMonth:3,bdayDay:23},
  {name:"Elise",species:"Elephant",personality:"Snooty",gender:"Female",bdayMonth:3,bdayDay:21},
  {name:"Ellie",species:"Elephant",personality:"Normal",gender:"Female",bdayMonth:5,bdayDay:12},
  {name:"Margie",species:"Elephant",personality:"Normal",gender:"Female",bdayMonth:1,bdayDay:28},
  {name:"Opal",species:"Elephant",personality:"Snooty",gender:"Female",bdayMonth:1,bdayDay:20},
  {name:"Paolo",species:"Elephant",personality:"Lazy",gender:"Male",bdayMonth:11,bdayDay:21},
  {name:"Tia",species:"Elephant",personality:"Normal",gender:"Female",bdayMonth:9,bdayDay:5},
  {name:"Tucker",species:"Elephant",personality:"Lazy",gender:"Male",bdayMonth:8,bdayDay:9},
  // Frogs
  {name:"Camofrog",species:"Frog",personality:"Cranky",gender:"Male",bdayMonth:6,bdayDay:5},
  {name:"Cousteau",species:"Frog",personality:"Jock",gender:"Male",bdayMonth:12,bdayDay:17},
  {name:"Croque",species:"Frog",personality:"Cranky",gender:"Male",bdayMonth:7,bdayDay:18},
  {name:"Diva",species:"Frog",personality:"BigSister",gender:"Female",bdayMonth:6,bdayDay:25},
  {name:"Drift",species:"Frog",personality:"Jock",gender:"Male",bdayMonth:7,bdayDay:22},
  {name:"Gigi",species:"Frog",personality:"Snooty",gender:"Female",bdayMonth:8,bdayDay:11},
  {name:"Henry",species:"Frog",personality:"Smug",gender:"Male",bdayMonth:3,bdayDay:14},
  {name:"Jeremiah",species:"Frog",personality:"Lazy",gender:"Male",bdayMonth:7,bdayDay:8},
  {name:"Lily",species:"Frog",personality:"Normal",gender:"Female",bdayMonth:2,bdayDay:4},
  {name:"Prince",species:"Frog",personality:"Lazy",gender:"Male",bdayMonth:10,bdayDay:20},
  {name:"Raddle",species:"Frog",personality:"Lazy",gender:"Male",bdayMonth:11,bdayDay:22},
  {name:"Ribbot",species:"Frog",personality:"Jock",gender:"Male",bdayMonth:2,bdayDay:13},
  {name:"Sunny",species:"Frog",personality:"Peppy",gender:"Female",bdayMonth:2,bdayDay:28},
  {name:"Tad",species:"Frog",personality:"Jock",gender:"Male",bdayMonth:8,bdayDay:3},
  {name:"Wart Jr.",species:"Frog",personality:"Cranky",gender:"Male",bdayMonth:8,bdayDay:21},
  // Gorillas
  {name:"Al",species:"Gorilla",personality:"Lazy",gender:"Male",bdayMonth:10,bdayDay:18},
  {name:"Boone",species:"Gorilla",personality:"Jock",gender:"Male",bdayMonth:9,bdayDay:19},
  {name:"Boyd",species:"Gorilla",personality:"Cranky",gender:"Male",bdayMonth:9,bdayDay:20},
  {name:"Cesar",species:"Gorilla",personality:"Cranky",gender:"Male",bdayMonth:2,bdayDay:6},
  {name:"Flip",species:"Gorilla",personality:"Jock",gender:"Male",bdayMonth:8,bdayDay:27},
  {name:"Rocco",species:"Gorilla",personality:"Cranky",gender:"Male",bdayMonth:5,bdayDay:14},
  {name:"Violet",species:"Gorilla",personality:"Snooty",gender:"Female",bdayMonth:9,bdayDay:1},
  // Hamsters
  {name:"Apple",species:"Hamster",personality:"Peppy",gender:"Female",bdayMonth:2,bdayDay:24},
  {name:"Clay",species:"Hamster",personality:"Lazy",gender:"Male",bdayMonth:10,bdayDay:19},
  {name:"Graham",species:"Hamster",personality:"Smug",gender:"Male",bdayMonth:1,bdayDay:4},
  {name:"Hamphrey",species:"Hamster",personality:"Cranky",gender:"Male",bdayMonth:4,bdayDay:4},
  {name:"Hamlet",species:"Hamster",personality:"Jock",gender:"Male",bdayMonth:5,bdayDay:30},
  {name:"Rodney",species:"Hamster",personality:"Smug",gender:"Male",bdayMonth:10,bdayDay:28},
  {name:"Soleil",species:"Hamster",personality:"Snooty",gender:"Female",bdayMonth:10,bdayDay:14},
  // Hippos
  {name:"Biff",species:"Hippo",personality:"Jock",gender:"Male",bdayMonth:3,bdayDay:29},
  {name:"Bubbles",species:"Hippo",personality:"Peppy",gender:"Female",bdayMonth:9,bdayDay:18},
  {name:"Harry",species:"Hippo",personality:"Cranky",gender:"Male",bdayMonth:1,bdayDay:7},
  {name:"Rocco",species:"Hippo",personality:"Cranky",gender:"Male",bdayMonth:5,bdayDay:14},
  // Horses
  {name:"Buck",species:"Horse",personality:"Jock",gender:"Male",bdayMonth:4,bdayDay:4},
  {name:"Clyde",species:"Horse",personality:"Lazy",gender:"Male",bdayMonth:5,bdayDay:1},
  {name:"Ed",species:"Horse",personality:"Smug",gender:"Male",bdayMonth:8,bdayDay:16},
  {name:"Elmer",species:"Horse",personality:"Lazy",gender:"Male",bdayMonth:10,bdayDay:5},
  {name:"Epona",species:"Horse",personality:"Normal",gender:"Female",bdayMonth:12,bdayDay:26},
  {name:"Filly",species:"Horse",personality:"Peppy",gender:"Female",bdayMonth:6,bdayDay:28},
  {name:"Julian",species:"Horse",personality:"Smug",gender:"Male",bdayMonth:3,bdayDay:15},
  {name:"Papi",species:"Horse",personality:"Lazy",gender:"Male",bdayMonth:5,bdayDay:10},
  {name:"Peaches",species:"Horse",personality:"Normal",gender:"Female",bdayMonth:11,bdayDay:28},
  {name:"Reneigh",species:"Horse",personality:"BigSister",gender:"Female",bdayMonth:8,bdayDay:28},
  {name:"Savannah",species:"Horse",personality:"Normal",gender:"Female",bdayMonth:2,bdayDay:18},
  {name:"Winnie",species:"Horse",personality:"Peppy",gender:"Female",bdayMonth:1,bdayDay:31},
  // Kangaroos
  {name:"Astrid",species:"Kangaroo",personality:"Snooty",gender:"Female",bdayMonth:3,bdayDay:8},
  {name:"Carrie",species:"Kangaroo",personality:"Normal",gender:"Female",bdayMonth:5,bdayDay:4},
  {name:"Kitt",species:"Kangaroo",personality:"Normal",gender:"Female",bdayMonth:10,bdayDay:11},
  {name:"Marcie",species:"Kangaroo",personality:"Normal",gender:"Female",bdayMonth:2,bdayDay:13},
  {name:"Mathilda",species:"Kangaroo",personality:"Snooty",gender:"Female",bdayMonth:11,bdayDay:12},
  {name:"Sydney",species:"Kangaroo",personality:"Normal",gender:"Female",bdayMonth:2,bdayDay:5},
  {name:"Walt",species:"Kangaroo",personality:"Cranky",gender:"Male",bdayMonth:1,bdayDay:21},
  // Koalas
  {name:"Canberra",species:"Koala",personality:"BigSister",gender:"Female",bdayMonth:5,bdayDay:21},
  {name:"Lyman",species:"Koala",personality:"Jock",gender:"Male",bdayMonth:10,bdayDay:12},
  {name:"Sydney",species:"Koala",personality:"Normal",gender:"Female",bdayMonth:2,bdayDay:5},
  {name:"Ozzie",species:"Koala",personality:"Lazy",gender:"Male",bdayMonth:9,bdayDay:13},
  // Lambs
  {name:"Baabara",species:"Sheep",personality:"Snooty",gender:"Female",bdayMonth:3,bdayDay:28},
  {name:"Cashmere",species:"Sheep",personality:"Snooty",gender:"Female",bdayMonth:12,bdayDay:4},
  {name:"Dom",species:"Sheep",personality:"Jock",gender:"Male",bdayMonth:3,bdayDay:18},
  {name:"Eunice",species:"Sheep",personality:"Normal",gender:"Female",bdayMonth:4,bdayDay:3},
  {name:"Frita",species:"Sheep",personality:"BigSister",gender:"Female",bdayMonth:7,bdayDay:16},
  {name:"Muffy",species:"Sheep",personality:"BigSister",gender:"Female",bdayMonth:2,bdayDay:14},
  {name:"Pietro",species:"Sheep",personality:"Smug",gender:"Male",bdayMonth:4,bdayDay:19},
  {name:"Stella",species:"Sheep",personality:"Normal",gender:"Female",bdayMonth:4,bdayDay:10},
  {name:"Vesta",species:"Sheep",personality:"Normal",gender:"Female",bdayMonth:5,bdayDay:16},
  {name:"Wendy",species:"Sheep",personality:"Peppy",gender:"Female",bdayMonth:10,bdayDay:10},
  // Lions
  {name:"Beau",species:"Lion",personality:"Lazy",gender:"Male",bdayMonth:4,bdayDay:5},
  {name:"Elvis",species:"Lion",personality:"Cranky",gender:"Male",bdayMonth:7,bdayDay:23},
  {name:"Jubilee",species:"Lion",personality:"Snooty",gender:"Female",bdayMonth:8,bdayDay:23},
  {name:"Leopold",species:"Lion",personality:"Smug",gender:"Male",bdayMonth:12,bdayDay:14},
  {name:"Rex",species:"Lion",personality:"Lazy",gender:"Male",bdayMonth:7,bdayDay:30},
  {name:"Lionel",species:"Lion",personality:"Smug",gender:"Male",bdayMonth:8,bdayDay:23},
  // Monkeys
  {name:"Deli",species:"Monkey",personality:"Lazy",gender:"Male",bdayMonth:12,bdayDay:21},
  {name:"Flip",species:"Monkey",personality:"Jock",gender:"Male",bdayMonth:8,bdayDay:27},
  {name:"Nana",species:"Monkey",personality:"Normal",gender:"Female",bdayMonth:6,bdayDay:8},
  {name:"Shari",species:"Monkey",personality:"BigSister",gender:"Female",bdayMonth:1,bdayDay:28},
  {name:"Simon",species:"Monkey",personality:"Lazy",gender:"Male",bdayMonth:7,bdayDay:14},
  // Octopi
  {name:"Marina",species:"Octopus",personality:"Normal",gender:"Female",bdayMonth:6,bdayDay:26},
  {name:"Octavian",species:"Octopus",personality:"Cranky",gender:"Male",bdayMonth:9,bdayDay:20},
  {name:"Zucker",species:"Octopus",personality:"Lazy",gender:"Male",bdayMonth:3,bdayDay:8},
  {name:"Cephalobot",species:"Octopus",personality:"Smug",gender:"Male",bdayMonth:3,bdayDay:16},
  // Ostriches
  {name:"Blanche",species:"Ostrich",personality:"Snooty",gender:"Female",bdayMonth:1,bdayDay:31},
  {name:"Flora",species:"Ostrich",personality:"Peppy",gender:"Female",bdayMonth:2,bdayDay:9},
  {name:"Gladys",species:"Ostrich",personality:"Normal",gender:"Female",bdayMonth:1,bdayDay:15},
  {name:"Julia",species:"Ostrich",personality:"Snooty",gender:"Female",bdayMonth:6,bdayDay:9},
  {name:"Phoebe",species:"Ostrich",personality:"BigSister",gender:"Female",bdayMonth:4,bdayDay:22},
  {name:"Sandy",species:"Ostrich",personality:"Normal",gender:"Female",bdayMonth:8,bdayDay:25},
  {name:"Sprocket",species:"Ostrich",personality:"Jock",gender:"Male",bdayMonth:10,bdayDay:24},
  {name:"Stella",species:"Ostrich",personality:"Normal",gender:"Female",bdayMonth:4,bdayDay:10},
  // Pandas
  {name:"Chai",species:"Panda",personality:"Peppy",gender:"Female",bdayMonth:5,bdayDay:26},
  {name:"Cub",species:"Bear Cub",personality:"Lazy",gender:"Male",bdayMonth:1,bdayDay:30},
  // Penguins
  {name:"Cube",species:"Penguin",personality:"Lazy",gender:"Male",bdayMonth:1,bdayDay:29},
  {name:"Deli",species:"Penguin",personality:"Lazy",gender:"Male",bdayMonth:12,bdayDay:21},
  {name:"Flo",species:"Penguin",personality:"BigSister",gender:"Female",bdayMonth:9,bdayDay:2},
  {name:"Gwen",species:"Penguin",personality:"Snooty",gender:"Female",bdayMonth:11,bdayDay:23},
  {name:"Hopper",species:"Penguin",personality:"Cranky",gender:"Male",bdayMonth:4,bdayDay:6},
  {name:"Iggly",species:"Penguin",personality:"Jock",gender:"Male",bdayMonth:11,bdayDay:2},
  {name:"Roald",species:"Penguin",personality:"Lazy",gender:"Male",bdayMonth:5,bdayDay:26},
  {name:"Sprinkle",species:"Penguin",personality:"Peppy",gender:"Female",bdayMonth:2,bdayDay:20},
  {name:"Tuck",species:"Penguin",personality:"Lazy",gender:"Male",bdayMonth:3,bdayDay:1},
  {name:"Wade",species:"Penguin",personality:"Lazy",gender:"Male",bdayMonth:10,bdayDay:31},
  // Pigs
  {name:"Agnes",species:"Pig",personality:"BigSister",gender:"Female",bdayMonth:4,bdayDay:21},
  {name:"Boris",species:"Pig",personality:"Cranky",gender:"Male",bdayMonth:11,bdayDay:6},
  {name:"Cobb",species:"Pig",personality:"Jock",gender:"Male",bdayMonth:10,bdayDay:7},
  {name:"Curly",species:"Pig",personality:"Jock",gender:"Male",bdayMonth:7,bdayDay:26},
  {name:"Gala",species:"Pig",personality:"Normal",gender:"Female",bdayMonth:3,bdayDay:5},
  {name:"Hambo",species:"Pig",personality:"Jock",gender:"Male",bdayMonth:3,bdayDay:28},
  {name:"Hugh",species:"Pig",personality:"Lazy",gender:"Male",bdayMonth:12,bdayDay:30},
  {name:"Kevin",species:"Pig",personality:"Jock",gender:"Male",bdayMonth:4,bdayDay:26},
  {name:"Maggie",species:"Pig",personality:"Normal",gender:"Female",bdayMonth:7,bdayDay:6},
  {name:"Peggy",species:"Pig",personality:"Peppy",gender:"Female",bdayMonth:5,bdayDay:23},
  {name:"Rasher",species:"Pig",personality:"Cranky",gender:"Male",bdayMonth:2,bdayDay:2},
  {name:"Spork",species:"Pig",personality:"Lazy",gender:"Male",bdayMonth:5,bdayDay:9},
  {name:"Truffles",species:"Pig",personality:"Peppy",gender:"Female",bdayMonth:11,bdayDay:16},
  // Rabbits
  {name:"Bonbon",species:"Rabbit",personality:"Peppy",gender:"Female",bdayMonth:3,bdayDay:3},
  {name:"Bree",species:"Rabbit",personality:"Snooty",gender:"Female",bdayMonth:10,bdayDay:21},
  {name:"Bunnie",species:"Rabbit",personality:"Peppy",gender:"Female",bdayMonth:5,bdayDay:9},
  {name:"Carmen",species:"Rabbit",personality:"Peppy",gender:"Female",bdayMonth:1,bdayDay:6},
  {name:"Chrissy",species:"Rabbit",personality:"Peppy",gender:"Female",bdayMonth:3,bdayDay:27},
  {name:"Cole",species:"Rabbit",personality:"Lazy",gender:"Male",bdayMonth:8,bdayDay:26},
  {name:"Coco",species:"Rabbit",personality:"Normal",gender:"Female",bdayMonth:3,bdayDay:1},
  {name:"Doc",species:"Rabbit",personality:"Lazy",gender:"Male",bdayMonth:3,bdayDay:24},
  {name:"Dotty",species:"Rabbit",personality:"Peppy",gender:"Female",bdayMonth:3,bdayDay:14},
  {name:"Francine",species:"Rabbit",personality:"Snooty",gender:"Female",bdayMonth:1,bdayDay:22},
  {name:"Gabi",species:"Rabbit",personality:"Peppy",gender:"Female",bdayMonth:12,bdayDay:13},
  {name:"Genji",species:"Rabbit",personality:"Jock",gender:"Male",bdayMonth:1,bdayDay:21},
  {name:"Hopkins",species:"Rabbit",personality:"Lazy",gender:"Male",bdayMonth:10,bdayDay:31},
  {name:"Mira",species:"Rabbit",personality:"BigSister",gender:"Female",bdayMonth:4,bdayDay:8},
  {name:"O'Hare",species:"Rabbit",personality:"Smug",gender:"Male",bdayMonth:10,bdayDay:18},
  {name:"Pippy",species:"Rabbit",personality:"Peppy",gender:"Female",bdayMonth:3,bdayDay:14},
  {name:"Ruby",species:"Rabbit",personality:"Peppy",gender:"Female",bdayMonth:12,bdayDay:25},
  {name:"Snake",species:"Rabbit",personality:"Jock",gender:"Male",bdayMonth:11,bdayDay:3},
  {name:"Tiffany",species:"Rabbit",personality:"Snooty",gender:"Female",bdayMonth:4,bdayDay:26},
  {name:"Toby",species:"Rabbit",personality:"Lazy",gender:"Male",bdayMonth:11,bdayDay:14},
  // Squirrels
  {name:"Blaire",species:"Squirrel",personality:"Snooty",gender:"Female",bdayMonth:11,bdayDay:22},
  {name:"Carrot",species:"Squirrel",personality:"Peppy",gender:"Female",bdayMonth:6,bdayDay:25},
  {name:"Hazel",species:"Squirrel",personality:"BigSister",gender:"Female",bdayMonth:8,bdayDay:30},
  {name:"Filbert",species:"Squirrel",personality:"Lazy",gender:"Male",bdayMonth:6,bdayDay:3},
  {name:"Marshal",species:"Squirrel",personality:"Smug",gender:"Male",bdayMonth:9,bdayDay:29},
  {name:"Mint",species:"Squirrel",personality:"Normal",gender:"Female",bdayMonth:5,bdayDay:2},
  {name:"Pecan",species:"Squirrel",personality:"Snooty",gender:"Female",bdayMonth:9,bdayDay:10},
  {name:"Peanut",species:"Squirrel",personality:"Peppy",gender:"Female",bdayMonth:6,bdayDay:8},
  {name:"Poppy",species:"Squirrel",personality:"Normal",gender:"Female",bdayMonth:8,bdayDay:5},
  {name:"Ricky",species:"Squirrel",personality:"Cranky",gender:"Male",bdayMonth:10,bdayDay:1},
  {name:"Static",species:"Squirrel",personality:"Cranky",gender:"Male",bdayMonth:11,bdayDay:5},
  {name:"Sylvana",species:"Squirrel",personality:"Normal",gender:"Female",bdayMonth:11,bdayDay:18},
  {name:"Tasha",species:"Squirrel",personality:"Snooty",gender:"Female",bdayMonth:1,bdayDay:31},
  {name:"Nibbles",species:"Squirrel",personality:"Peppy",gender:"Female",bdayMonth:12,bdayDay:26},
  // Wolves
  {name:"Chief",species:"Wolf",personality:"Cranky",gender:"Male",bdayMonth:12,bdayDay:19},
  {name:"Dobie",species:"Wolf",personality:"Cranky",gender:"Male",bdayMonth:2,bdayDay:17},
  {name:"Freya",species:"Wolf",personality:"Snooty",gender:"Female",bdayMonth:12,bdayDay:16},
  {name:"Fang",species:"Wolf",personality:"Cranky",gender:"Male",bdayMonth:12,bdayDay:18},
  {name:"Lobo",species:"Wolf",personality:"Cranky",gender:"Male",bdayMonth:11,bdayDay:5},
  {name:"Skye",species:"Wolf",personality:"Normal",gender:"Female",bdayMonth:4,bdayDay:9},
  {name:"Vivian",species:"Wolf",personality:"Snooty",gender:"Female",bdayMonth:5,bdayDay:27},
  {name:"Whitney",species:"Wolf",personality:"Snooty",gender:"Female",bdayMonth:9,bdayDay:17},
  // Special fan favorites
  {name:"Audie",species:"Wolf",personality:"Peppy",gender:"Female",bdayMonth:8,bdayDay:31},
  {name:"Raymond",species:"Cat",personality:"Smug",gender:"Male",bdayMonth:10,bdayDay:1},
  {name:"Judy",species:"Bear Cub",personality:"Snooty",gender:"Female",bdayMonth:3,bdayDay:10},
  {name:"Sherb",species:"Goat",personality:"Lazy",gender:"Male",bdayMonth:1,bdayDay:18},
  {name:"Merengue",species:"Rhino",personality:"Normal",gender:"Female",bdayMonth:3,bdayDay:19},
  {name:"Celia",species:"Eagle",personality:"Normal",gender:"Female",bdayMonth:3,bdayDay:26},
  {name:"Flurry",species:"Hamster",personality:"Normal",gender:"Female",bdayMonth:1,bdayDay:30},
  {name:"Zucker",species:"Octopus",personality:"Lazy",gender:"Male",bdayMonth:3,bdayDay:8},
  {name:"Beau",species:"Deer",personality:"Lazy",gender:"Male",bdayMonth:4,bdayDay:5},
].filter((v,i,a)=>a.findIndex(x=>x.name===v.name)===i); // deduplicate

const REACTIONS = [
  "Delight","Greetings","Joy","Surprise",
  "Pleased","Fearful","Sadness","Glee","Daydreaming",
  "Laughter","Drool","Inspiration","Flourish","Aggravation",
  "Distress","Worried","Apologetic","Shocked","Sheepishness",
  "Mistaken","Love","Excitement","Confident","Smirked",
  "Disagreement","Sigh","Doze","Shyness","Guffaw",
  "Haunt","Scare",
  "Excited","Here You Go","Sit Down","Sniff Sniff","Ta-da","Take a Picture","Wave Goodbye","Work Out","Yoga",
  "Feelin' It","Let's Go","Viva","Confetti",
  "Double Wave","Stretch","Jammin'","Listening Ear","Say Cheese","Behold","Eager","Flex","Work It","Act Natural","Hula",
  "Posture Warm-Up","Arm Circles","Side Bends","Body Twists","Wide Arm Stretch","Upper-Body Circles","Jump"
];

const MYSTERY_ISLANDS = [
  {id:0,name:"Spiral River Island",rarity:"Common (9%)",desc:"A river winds in a spiral toward the sea. One of four starter islands."},
  {id:1,name:"Big Pond Island",rarity:"Common (9%)",desc:"A large fidget-spinner-shaped pond full of fish. Starter island."},
  {id:2,name:"Short River Island",rarity:"Common (9%)",desc:"A river starts on a small second layer in the north and flows east. Starter island."},
  {id:3,name:"Short River & Pond Island",rarity:"Common (9%)",desc:"Like Short River but with a pond in the southwest. Starter island."},
  {id:4,name:"Bamboo Island",rarity:"Common (10%)",desc:"Covered in bamboo — the only place to find it. No fruit/hardwood trees."},
  {id:5,name:"Sister Fruit Island",rarity:"Common (10%)",desc:"Filled with a fruit type different from your native fruit (19 trees)."},
  {id:6,name:"Waterfall Island",rarity:"Common (10%)",desc:"Three layers with a river cascading counter-clockwise. Great for rare river fish."},
  {id:7,name:"Big Fish Island",rarity:"Uncommon (3%)",desc:"Circle river, spawns rare large fish (size 4+). 1x daily max. Requires Vaulting Pole."},
  {id:8,name:"Big Fish Island 2",rarity:"Rare (daily limit)",desc:"Similar to Big Fish Island but with fewer flowers and a lower encounter rate."},
  {id:9,name:"Money Rock Island",rarity:"Uncommon (5%)",desc:"All rocks give Bells (88,500 total). Requires Resident Services upgrade."},
  {id:10,name:"Money Rock Island 2",rarity:"Uncommon (5%)",desc:"Variation with different layout. Central island accessible by breaking a rock."},
  {id:11,name:"Arachnid Island",rarity:"Rare (2%)",desc:"One-layer island with octagonal stream. Only tarantulas or scorpions spawn (night-only, 1x daily)."},
  {id:12,name:"Flower Island",rarity:"Uncommon",desc:"Pond surrounded by hybrid flowers in rare colors. Great for rare specimens."},
  {id:13,name:"Mountain Island",rarity:"Uncommon",desc:"No rivers, contains a mountain with 5 rocks on top."},
  {id:14,name:"Curly River Island",rarity:"Uncommon (5%)",desc:"Curled river pattern in the northeast. Only water insects spawn here."},
  {id:15,name:"Hardwood Forest Island",rarity:"Common",desc:"Dense hardwood trees, very few flowers. Good for wood farming."},
  {id:16,name:"Cedar Forest Island",rarity:"Common",desc:"Cedar trees, mostly flat. Good for cedar wood and pine beetles."},
  {id:17,name:"Empty/Trash Island",rarity:"Rare",desc:"A nearly empty island where fishing only produces trash. Avoid this one!"},
];

const FLOWER_BREEDS = {
  roses: {
    colors: ["Red","White","Yellow","Orange","Black","Pink","Purple","Blue","Gold"],
    combinations: [
      {from:"Red + White",result:"Pink"},
      {from:"Red + Red",result:"Black (25%)"},
      {from:"Yellow + Red",result:"Orange"},
      {from:"White + White",result:"Purple"},
      {from:"Purple + Orange → Hybrid Red + Hybrid Red",result:"Blue"},
      {from:"Black + Golden Watering Can",result:"Gold"},
    ],
    note:"Roses are the most complex. Blue roses require chain breeding through Hybrid Reds. Gold roses require watering a black rose with a golden watering can."
  },
  tulips: {
    colors: ["Red","White","Yellow","Orange","Black","Pink","Purple"],
    combinations: [
      {from:"Red + White",result:"Pink (50%)"},
      {from:"Red + Yellow",result:"Orange"},
      {from:"Red + Red",result:"Black (25%)"},
      {from:"Orange + Orange",result:"Purple (6.25%, higher with Mystery Island hybrids)"},
    ],
    note:"Tulips are moderately simple. Purple is the rarest — use Mystery Island hybrids for a 25% chance."
  },
  pansies: {
    colors: ["Red","White","Yellow","Orange","Blue","Purple"],
    combinations: [
      {from:"Red + Yellow",result:"Orange"},
      {from:"White + White",result:"Blue"},
      {from:"Blue + Red (seed)",result:"Hybrid Red"},
      {from:"Hybrid Red + Hybrid Red",result:"Purple (25%)"},
    ],
    note:"Purple pansies require Hybrid Reds. Seed reds CANNOT produce purple — you must first breed blue × seed red."
  },
  cosmos: {
    colors: ["Red","White","Yellow","Orange","Pink","Black"],
    combinations: [
      {from:"Red + Yellow",result:"Orange"},
      {from:"Red + White",result:"Pink"},
      {from:"Orange + Orange",result:"Black (25%)"},
    ],
    note:"Cosmos are among the simpler flowers. Orange and black can self-clone."
  },
  lilies: {
    colors: ["Red","White","Yellow","Orange","Pink","Black"],
    combinations: [
      {from:"Red + White",result:"Pink (50%)"},
      {from:"Yellow + Red",result:"Orange"},
      {from:"Red + Red",result:"Black (25%)"},
    ],
    note:"All lily colors are obtainable from starting seeds alone. Pink appears as a side effect of pursuing black."
  },
  hyacinths: {
    colors: ["Red","White","Yellow","Orange","Pink","Blue","Purple"],
    combinations: [
      {from:"Red + White",result:"Pink"},
      {from:"Red + Yellow",result:"Orange"},
      {from:"White + White",result:"Blue"},
      {from:"Orange + Orange (hybrid)",result:"Purple or Special Blue"},
      {from:"Special Blue + Special Blue",result:"Purple (high %)"},
    ],
    note:"Orange is a side effect of pursuing purple. Recycle oranges to accelerate breeding."
  },
  windflowers: {
    colors: ["Red","White","Orange","Pink","Blue","Purple"],
    combinations: [
      {from:"Red + Orange",result:"Pink"},
      {from:"White + White",result:"Blue"},
      {from:"Blue + Red (seed)",result:"Hybrid Red (100%)"},
      {from:"Hybrid Red + Hybrid Red",result:"Special Blue"},
      {from:"Special Blue + Special Blue",result:"Purple (25%)"},
    ],
    note:"Windflowers have NO yellow — orange is a default, not a hybrid. Purple requires Special Blue windflowers."
  },
  mums: {
    colors: ["Red","White","Yellow","Orange","Pink","Purple","Green"],
    combinations: [
      {from:"White + Red",result:"Pink"},
      {from:"White + White",result:"Purple"},
      {from:"Purple + Purple",result:"Green"},
      {from:"Yellow (hybrid) + Yellow (hybrid)",result:"Green (also possible)"},
    ],
    note:"Mums are the ONLY flower with green. Ensure yellow mums used are hybrid yellows (from Red × Yellow), not seed yellows."
  }
};

const EVENTS = [
  {name:"New Year's Day",month:1,day:1},
  {name:"Festivale",month:2,day:15},
  {name:"Valentine's Day",month:2,day:14},
  {name:"Shamrock Day",month:3,day:17},
  {name:"Bunny Day (Easter)",month:4,day:9},
  {name:"Nature Day",month:4,day:22},
  {name:"May Day",month:5,day:1},
  {name:"International Museum Day",month:5,day:18},
  {name:"Wedding Season (June)",month:6,day:1},
  {name:"Bug-Off (Summer)",month:6,day:27},
  {name:"Fireworks Show",month:8,day:1},
  {name:"Bug-Off (Summer)",month:8,day:26},
  {name:"Halloween",month:10,day:31},
  {name:"Fall Harvest",month:11,day:26},
  {name:"Toy Day",month:12,day:25},
  {name:"New Year's Eve",month:12,day:31},
];

const VISITOR_NPCS = ["Daisy Mae","Celeste","Saharah","Kicks","Label","Flick","C.J.","Leif","Redd","K.K. Slider","Gullivarr"];

const FOSSILS_LIST = [
  "Acanthostega","Amber","Ammonite","Ankylo skull","Ankylo tail","Ankylo torso",
  "Archelon skull","Archelon tail","Australopith","Brachio chest","Brachio pelvis",
  "Brachio skull","Brachio tail","Coprolite","Deinony tail","Deinony torso",
  "Dimetrodon skull","Dimetrodon torso","Dinosaur track","Diplo chest","Diplo hip",
  "Diplo neck","Diplo pelvis","Diplo skull","Diplo tail","Diplo tail tip",
  "Elasmosaur neck","Elasmosaur torso","Fern fossil","Ichthyo skull","Ichthyo torso",
  "Iguanodon skull","Iguanodon tail","Iguanodon torso","Juramaia","Left megalo side",
  "Left ptera wing","Left quetzal wing","Mammoth skull","Mammoth torso","Megacero skull",
  "Megacero tail","Megacero torso","Megaloceros tail","Myllokunmingia","Ophthalmo skull",
  "Ophthalmo torso","Pachy skull","Pachy tail","Parasaur skull","Parasaur tail","Parasaur torso",
  "Plesio body","Plesio neck","Plesio skull","Ptera body","Quetzal torso","Right megalo side",
  "Right ptera wing","Right quetzal wing","Sabertooth skull","Sabertooth tail",
  "Shark-tooth pattern","Shastasaurus body","Shastasaurus neck","Shastasaurus skull",
  "Shark-tooth pattern","Spino skull","Spino tail","Spino torso","Stego skull","Stego tail",
  "Stego torso","T. rex skull","T. rex tail","T. rex torso","Tricera skull","Tricera tail",
  "Tricera torso","Trilobite"
];

const BUGS = [
  {name:"Common butterfly",months:"all year",time:"4am–7pm",location:"Flying near flowers",price:160},
  {name:"Yellow butterfly",months:"Mar–Jun, Sep (NH); Sep–Dec, Mar (SH)",time:"4am–7pm",location:"Flying near flowers",price:160},
  {name:"Tiger butterfly",months:"Mar–Sep (NH)",time:"4am–7pm",location:"Flying near flowers",price:240},
  {name:"Peacock butterfly",months:"Mar–Jun (NH)",time:"4am–7pm",location:"Near blue/black flowers",price:2500},
  {name:"Common bluebottle",months:"Apr–Aug (NH)",time:"4am–7pm",location:"Flying",price:300},
  {name:"Paper kite butterfly",months:"Jan–Dec",time:"8am–7pm",location:"Flying",price:1000},
  {name:"Great purple emperor",months:"May–Aug (NH)",time:"4am–7pm",location:"Flying",price:3000},
  {name:"Monarch butterfly",months:"Sep–Nov (NH)",time:"4am–5pm",location:"Flying",price:140},
  {name:"Emperor butterfly",months:"Jun–Sep (NH)",time:"5pm–8am",location:"Flying",price:4000},
  {name:"Agrias butterfly",months:"Apr–Sep (NH)",time:"8am–5pm",location:"Flying",price:3000},
  {name:"Rajah Brooke's birdwing",months:"Dec–Mar, Jun–Sep (NH)",time:"8am–5pm",location:"Flying near flowers",price:2500},
  {name:"Queen Alexandra's birdwing",months:"May–Sep (NH)",time:"8am–4pm",location:"Flying near flowers",price:4000},
  {name:"Moth",months:"all year",time:"7pm–4am",location:"Attracted to light",price:130},
  {name:"Atlas moth",months:"Apr–Sep (NH)",time:"7pm–4am",location:"On trees",price:3000},
  {name:"Brahmin moth",months:"Apr–Sep (NH)",time:"7pm–4am",location:"On trees",price:3000},
  {name:"Lunar moth",months:"May–Sep (NH)",time:"7pm–4am",location:"On trees",price:1500},
  {name:"Silk moth",months:"Sep–Nov (NH)",time:"7pm–4am",location:"On trees",price:400},
  {name:"Vampire moth",months:"Oct (NH)",time:"7pm–4am",location:"On trees",price:1500},
  {name:"Moon moth",months:"Apr–Sep (NH)",time:"7pm–4am",location:"On trees",price:2500},
  {name:"Madagascan sunset moth",months:"Apr–Sep (NH)",time:"8am–4pm",location:"Flying",price:2500},
  {name:"Long locust",months:"Apr–Nov (NH)",time:"8am–7pm",location:"On ground",price:200},
  {name:"Migratory locust",months:"Aug–Nov (NH)",time:"8am–7pm",location:"On ground",price:600},
  {name:"Rice grasshopper",months:"Aug–Nov (NH)",time:"8am–7pm",location:"On ground",price:160},
  {name:"Grasshopper",months:"Jul–Sep (NH)",time:"8am–5pm",location:"On ground",price:160},
  {name:"Cricket",months:"Sep–Nov (NH)",time:"5pm–8am",location:"On ground",price:130},
  {name:"Bell cricket",months:"Sep–Oct (NH)",time:"5pm–8am",location:"On ground",price:430},
  {name:"Mantis",months:"Mar–Nov (NH)",time:"8am–5pm",location:"On flowers",price:430},
  {name:"Orchid mantis",months:"Mar–Nov (NH)",time:"8am–5pm",location:"On white flowers",price:2400},
  {name:"Honeybee",months:"Mar–Jul (NH)",time:"8am–5pm",location:"Flying near flowers",price:200},
  {name:"Wasp",months:"all year",time:"all day",location:"Shaking trees",price:2500},
  {name:"Brown cicada",months:"Jul–Aug (NH)",time:"8am–5pm",location:"On trees",price:250},
  {name:"Robust cicada",months:"Jul–Aug (NH)",time:"8am–5pm",location:"On trees",price:300},
  {name:"Giant cicada",months:"Jul–Aug (NH)",time:"8am–5pm",location:"On trees",price:500},
  {name:"Walker cicada",months:"Sep–Oct (NH)",time:"8am–5pm",location:"On trees",price:400},
  {name:"Evening cicada",months:"Jul–Aug (NH)",time:"4am–8am & 4pm–7pm",location:"On trees",price:550},
  {name:"Cicada shell",months:"Jul–Aug (NH)",time:"all day",location:"On trees",price:10},
  {name:"Red dragonfly",months:"Sep–Oct (NH)",time:"8am–7pm",location:"Flying",price:180},
  {name:"Darner dragonfly",months:"Apr–Oct (NH)",time:"8am–5pm",location:"Flying",price:230},
  {name:"Banded dragonfly",months:"May–Oct (NH)",time:"8am–5pm",location:"Flying",price:4500},
  {name:"Giant petaltail",months:"Apr–Oct (NH)",time:"8am–5pm",location:"Flying near ponds",price:4000},
  {name:"Firefly",months:"Jun (NH)",time:"7pm–4am",location:"Near water",price:300},
  {name:"Mole cricket",months:"Nov–May (NH)",time:"all day",location:"Underground",price:500},
  {name:"Pondskater",months:"May–Sep (NH)",time:"8am–7pm",location:"On water",price:130},
  {name:"Diving beetle",months:"May–Sep (NH)",time:"8am–7pm",location:"On water",price:800},
  {name:"Giant water bug",months:"Apr–Sep (NH)",time:"7pm–8am",location:"On water",price:2000},
  {name:"Stinkbug",months:"Mar–Oct (NH)",time:"all day",location:"On flowers",price:120},
  {name:"Man-faced stink bug",months:"Mar–Oct (NH)",time:"8am–8pm",location:"On flowers",price:1000},
  {name:"Ladybug",months:"Mar–Jun, Oct (NH)",time:"8am–5pm",location:"On flowers",price:200},
  {name:"Tiger beetle",months:"Feb–Oct (NH)",time:"all day",location:"On ground",price:1500},
  {name:"Jewel beetle",months:"Apr–Aug (NH)",time:"8am–4pm",location:"On tree stumps",price:2400},
  {name:"Violin beetle",months:"May–Jun, Sep–Nov (NH)",time:"all day",location:"On tree stumps",price:450},
  {name:"Citrus long-horned beetle",months:"all year",time:"all day",location:"On tree stumps",price:350},
  {name:"Rosalia Batesi beetle",months:"Jul–Aug (NH)",time:"all day",location:"On tree stumps",price:3000},
  {name:"Blue weevil beetle",months:"Jul–Aug (NH)",time:"all day",location:"On coconut trees",price:800},
  {name:"Dung beetle",months:"Dec–Feb (NH)",time:"all day",location:"Rolling snowballs",price:3000},
  {name:"Earth-boring dung beetle",months:"Jul–Sep (NH)",time:"all day",location:"On ground",price:300},
  {name:"Scarab beetle",months:"Jul–Aug (NH)",time:"11pm–8am",location:"On trees",price:10000},
  {name:"Drone beetle",months:"Jun–Aug (NH)",time:"all day",location:"On trees",price:200},
  {name:"Goliath beetle",months:"Jun–Sep (NH)",time:"5pm–8am",location:"On coconut trees",price:8000},
  {name:"Saw stag",months:"Jul–Aug (NH)",time:"11pm–8am",location:"On trees",price:2000},
  {name:"Miyama stag",months:"Jul–Aug (NH)",time:"all day",location:"On trees",price:1000},
  {name:"Giant stag",months:"Jul–Aug (NH)",time:"11pm–8am",location:"On trees",price:10000},
  {name:"Rainbow stag",months:"Jun–Sep (NH)",time:"7pm–8am",location:"On trees",price:6000},
  {name:"Cyclommatus stag",months:"Jul–Aug (NH)",time:"5pm–8am",location:"On coconut trees",price:8000},
  {name:"Golden stag",months:"Jul–Aug (NH)",time:"5pm–8am",location:"On coconut trees",price:12000},
  {name:"Giraffe stag",months:"Jul–Aug (NH)",time:"5pm–8am",location:"On coconut trees",price:12000},
  {name:"Horned dynastid",months:"Jul–Aug (NH)",time:"5pm–8am",location:"On trees",price:1350},
  {name:"Horned atlas",months:"Jul–Sep (NH)",time:"5pm–8am",location:"On coconut trees",price:8000},
  {name:"Horned elephant",months:"Jul–Aug (NH)",time:"5pm–8am",location:"On coconut trees",price:8000},
  {name:"Horned hercules",months:"Jul–Aug (NH)",time:"5pm–8am",location:"On coconut trees",price:12000},
  {name:"Walking stick",months:"Jul–Nov (NH)",time:"4am–8am & 4pm–7pm",location:"On trees",price:600},
  {name:"Walking leaf",months:"Jul–Sep (NH)",time:"all day",location:"Under trees",price:600},
  {name:"Bagworm",months:"all year",time:"all day",location:"Shaking trees",price:600},
  {name:"Ant",months:"all year",time:"all day",location:"On rotting food",price:80},
  {name:"Hermit crab",months:"all year",time:"7pm–8am",location:"On beach",price:1000},
  {name:"Wharf roach",months:"all year",time:"all day",location:"Near water",price:200},
  {name:"Fly",months:"all year",time:"all day",location:"On trash",price:60},
  {name:"Mosquito",months:"Jun–Sep (NH)",time:"5pm–4am",location:"Flying",price:130},
  {name:"Flea",months:"Apr–Nov (NH)",time:"all day",location:"On villagers",price:70},
  {name:"Snail",months:"all year (rainy days)",time:"all day",location:"On bushes",price:250},
  {name:"Pill bug",months:"all year",time:"11pm–4pm",location:"Under rocks",price:250},
  {name:"Centipede",months:"all year",time:"4pm–11pm",location:"Under rocks",price:300},
  {name:"Spider",months:"all year",time:"7pm–8am",location:"Shaking trees",price:600},
  {name:"Tarantula",months:"Nov–Apr (NH)",time:"7pm–4am",location:"On ground",price:8000},
  {name:"Scorpion",months:"May–Oct (NH)",time:"7pm–4am",location:"On ground",price:8000},
];

const FISH = [
  {name:"Bitterling",months:"Nov–Mar (NH)",time:"all day",location:"River",shadow:"XS",price:900},
  {name:"Pale chub",months:"all year",time:"9am–4pm",location:"River",shadow:"XS",price:200},
  {name:"Crucian carp",months:"all year",time:"all day",location:"River",shadow:"S",price:160},
  {name:"Dace",months:"all year",time:"4pm–9am",location:"River",shadow:"S",price:240},
  {name:"Carp",months:"all year",time:"all day",location:"Pond",shadow:"M",price:300},
  {name:"Koi",months:"all year",time:"4pm–9am",location:"Pond",shadow:"M",price:4000},
  {name:"Goldfish",months:"all year",time:"all day",location:"Pond",shadow:"XS",price:1300},
  {name:"Pop-eyed goldfish",months:"all year",time:"9am–4pm",location:"Pond",shadow:"XS",price:1300},
  {name:"Ranchu goldfish",months:"all year",time:"9am–4pm",location:"Pond",shadow:"XS",price:4500},
  {name:"Killifish",months:"Apr–Aug (NH)",time:"all day",location:"Pond",shadow:"XS",price:300},
  {name:"Crawfish",months:"Apr–Sep (NH)",time:"all day",location:"Pond",shadow:"S",price:200},
  {name:"Soft-shelled turtle",months:"Aug–Sep (NH)",time:"4pm–9am",location:"River",shadow:"M",price:3750},
  {name:"Snapping turtle",months:"Apr–Oct (NH)",time:"9pm–4am",location:"River",shadow:"L",price:5000},
  {name:"Tadpole",months:"Mar–Jul (NH)",time:"all day",location:"Pond",shadow:"XS",price:100},
  {name:"Frog",months:"May–Aug (NH)",time:"all day",location:"Pond",shadow:"S",price:120},
  {name:"Freshwater goby",months:"all year",time:"4pm–9am",location:"River",shadow:"S",price:400},
  {name:"Loach",months:"Mar–May (NH)",time:"all day",location:"River",shadow:"S",price:400},
  {name:"Catfish",months:"May–Oct (NH)",time:"4pm–9am",location:"Pond",shadow:"L",price:800},
  {name:"Giant snakehead",months:"Jun–Aug (NH)",time:"9am–4pm",location:"Pond",shadow:"L",price:5500},
  {name:"Bluegill",months:"all year",time:"9am–4pm",location:"River",shadow:"S",price:180},
  {name:"Yellow perch",months:"Oct–Mar (NH)",time:"all day",location:"River",shadow:"S",price:300},
  {name:"Black bass",months:"all year",time:"all day",location:"River",shadow:"L",price:400},
  {name:"Tilapia",months:"Jun–Oct (NH)",time:"all day",location:"River",shadow:"M",price:800},
  {name:"Pike",months:"Sep–Dec (NH)",time:"all day",location:"River",shadow:"XL",price:1800},
  {name:"Pond smelt",months:"Dec–Feb (NH)",time:"all day",location:"River",shadow:"S",price:500},
  {name:"Sweetfish",months:"Jul–Sep (NH)",time:"all day",location:"River",shadow:"M",price:900},
  {name:"Cherry salmon",months:"Mar–Jun, Sep–Nov (NH)",time:"4pm–9am",location:"River (clifftop)",shadow:"S",price:1000},
  {name:"Char",months:"Mar–Jun, Sep–Nov (NH)",time:"4pm–9am",location:"River (clifftop)",shadow:"S",price:3800},
  {name:"Golden trout",months:"Mar–May, Sep–Nov (NH)",time:"4pm–9am",location:"River (clifftop)",shadow:"M",price:15000},
  {name:"Stringfish",months:"Dec–Mar (NH)",time:"4pm–9am",location:"River (clifftop)",shadow:"XL",price:15000},
  {name:"Salmon",months:"Sep (NH)",time:"all day",location:"River (mouth)",shadow:"L",price:700},
  {name:"King salmon",months:"Sep (NH)",time:"all day",location:"River (mouth)",shadow:"XL",price:1800},
  {name:"Mitten crab",months:"Sep–Nov (NH)",time:"4pm–9am",location:"River",shadow:"S",price:2000},
  {name:"Guppy",months:"Apr–Nov (NH)",time:"9am–4pm",location:"River",shadow:"XS",price:1300},
  {name:"Nibble fish",months:"May–Sep (NH)",time:"9am–4pm",location:"River",shadow:"XS",price:1500},
  {name:"Angelfish",months:"May–Oct (NH)",time:"4pm–9am",location:"River",shadow:"S",price:3000},
  {name:"Betta",months:"May–Oct (NH)",time:"9am–4pm",location:"River",shadow:"S",price:2500},
  {name:"Neon tetra",months:"Apr–Nov (NH)",time:"9am–4pm",location:"River",shadow:"XS",price:500},
  {name:"Rainbowfish",months:"May–Oct (NH)",time:"9am–4pm",location:"River",shadow:"XS",price:800},
  {name:"Piranha",months:"Jun–Sep (NH)",time:"9am–4pm & 9pm–4am",location:"River",shadow:"S",price:2500},
  {name:"Arowana",months:"Jun–Sep (NH)",time:"4pm–9am",location:"River",shadow:"L",price:10000},
  {name:"Dorado",months:"Jun–Sep (NH)",time:"4am–9pm",location:"River",shadow:"XL",price:15000},
  {name:"Gar",months:"Jun–Sep (NH)",time:"4pm–9am",location:"Pond",shadow:"XL",price:6000},
  {name:"Arapaima",months:"Jul–Sep (NH)",time:"4pm–9am",location:"River",shadow:"XL",price:10000},
  {name:"Saddled bichir",months:"Jun–Sep (NH)",time:"9pm–4am",location:"River",shadow:"L",price:4000},
  {name:"Sturgeon",months:"Sep–Mar (NH)",time:"all day",location:"River (mouth)",shadow:"XL",price:10000},
  {name:"Sea butterfly",months:"Dec–Mar (NH)",time:"all day",location:"Sea",shadow:"XS",price:1000},
  {name:"Sea horse",months:"Apr–Nov (NH)",time:"all day",location:"Sea",shadow:"XS",price:1100},
  {name:"Clown fish",months:"Apr–Sep (NH)",time:"all day",location:"Sea",shadow:"XS",price:650},
  {name:"Surgeonfish",months:"Apr–Sep (NH)",time:"all day",location:"Sea",shadow:"XS",price:1000},
  {name:"Butterfly fish",months:"Apr–Sep (NH)",time:"all day",location:"Sea",shadow:"S",price:1000},
  {name:"Napoleonfish",months:"Jul–Aug (NH)",time:"4am–9pm",location:"Sea",shadow:"XL",price:10000},
  {name:"Zebra turkeyfish",months:"Apr–Nov (NH)",time:"all day",location:"Sea",shadow:"M",price:500},
  {name:"Blowfish",months:"Nov–Feb (NH)",time:"9pm–4am",location:"Sea",shadow:"M",price:5000},
  {name:"Puffer fish",months:"Jul–Sep (NH)",time:"all day",location:"Sea",shadow:"M",price:250},
  {name:"Anchovy",months:"all year",time:"all day",location:"Sea",shadow:"S",price:200},
  {name:"Horse mackerel",months:"all year",time:"all day",location:"Sea",shadow:"S",price:150},
  {name:"Barred knifejaw",months:"Mar–Nov (NH)",time:"all day",location:"Sea",shadow:"M",price:5000},
  {name:"Sea bass",months:"all year",time:"all day",location:"Sea",shadow:"L (fin)",price:400},
  {name:"Red snapper",months:"all year",time:"all day",location:"Sea",shadow:"L",price:3000},
  {name:"Dab",months:"Oct–Apr (NH)",time:"all day",location:"Sea",shadow:"M",price:300},
  {name:"Olive flounder",months:"all year",time:"all day",location:"Sea",shadow:"L",price:800},
  {name:"Squid",months:"Jan–Aug (NH)",time:"all day",location:"Sea",shadow:"M",price:500},
  {name:"Moray eel",months:"Aug–Oct (NH)",time:"all day",location:"Sea",shadow:"Long & thin",price:2000},
  {name:"Ribbon eel",months:"Jun–Oct (NH)",time:"all day",location:"Sea",shadow:"Long & thin",price:600},
  {name:"Tuna",months:"Nov–Apr (NH)",time:"all day",location:"Pier",shadow:"XL (fin)",price:7000},
  {name:"Blue marlin",months:"Jul–Sep, Nov–Apr (NH)",time:"all day",location:"Pier",shadow:"XL (fin)",price:10000},
  {name:"Giant trevally",months:"May–Oct (NH)",time:"all day",location:"Pier",shadow:"XL (fin)",price:4500},
  {name:"Mahi-mahi",months:"May–Oct (NH)",time:"all day",location:"Pier",shadow:"XL (fin)",price:6000},
  {name:"Ocean sunfish",months:"Jul–Sep (NH)",time:"4am–9pm",location:"Sea",shadow:"XL (fin)",price:4000},
  {name:"Ray",months:"Aug–Nov (NH)",time:"4am–9pm",location:"Sea",shadow:"XL",price:3000},
  {name:"Saw shark",months:"Jun–Sep (NH)",time:"4pm–9am",location:"Sea",shadow:"XL (fin)",price:12000},
  {name:"Hammerhead shark",months:"Jun–Sep (NH)",time:"4pm–9am",location:"Sea",shadow:"XL (fin)",price:8000},
  {name:"Great white shark",months:"Jun–Sep (NH)",time:"4pm–9am",location:"Sea",shadow:"XL (fin)",price:15000},
  {name:"Whale shark",months:"Jun–Sep (NH)",time:"all day",location:"Sea",shadow:"XL (fin)",price:13000},
  {name:"Suckerfish",months:"Jun–Sep (NH)",time:"all day",location:"Sea",shadow:"XL (fin)",price:1500},
  {name:"Football fish",months:"Nov–Mar (NH)",time:"4pm–9am",location:"Sea",shadow:"L",price:2500},
  {name:"Oarfish",months:"Dec–May (NH)",time:"all day",location:"Sea",shadow:"XL",price:9000},
  {name:"Barreleye",months:"all year",time:"9pm–4am",location:"Sea",shadow:"XS",price:15000},
  {name:"Coelacanth",months:"all year (rain)",time:"all day",location:"Sea or River (mouth)",shadow:"XL",price:15000},
];

const SEA_CREATURES = [
  {name:"Seaweed",months:"Oct–Jul (NH)",time:"all day",shadow:"L"},
  {name:"White sea slug",months:"all year",time:"all day",shadow:"XS"},
  {name:"Sea grapes",months:"Jun–Sep (NH)",time:"all day",shadow:"S"},
  {name:"Sea cucumber",months:"Nov–Apr (NH)",time:"all day",shadow:"M"},
  {name:"Sea pig",months:"Nov–Feb (NH)",time:"4pm–9am",shadow:"S"},
  {name:"Sea star",months:"all year",time:"all day",shadow:"S"},
  {name:"Sea anemone",months:"all year",time:"all day",shadow:"M"},
  {name:"Moon jellyfish",months:"Jul–Sep (NH)",time:"all day",shadow:"S"},
  {name:"Sea slug",months:"all year",time:"all day",shadow:"XS"},
  {name:"Pearl oyster",months:"all year",time:"all day",shadow:"S"},
  {name:"Mussel",months:"Jun–Dec (NH)",time:"all day",shadow:"S"},
  {name:"Oyster",months:"Sep–Feb (NH)",time:"all day",shadow:"S"},
  {name:"Scallop",months:"all year",time:"all day",shadow:"S"},
  {name:"Whelk",months:"all year",time:"all day",shadow:"S"},
  {name:"Turban shell",months:"Mar–May, Sep–Dec (NH)",time:"all day",shadow:"S"},
  {name:"Abalone",months:"Jun–Jan (NH)",time:"4pm–9am",shadow:"M"},
  {name:"Gigas giant clam",months:"May–Sep (NH)",time:"all day",shadow:"XL"},
  {name:"Chambered nautilus",months:"Mar–Jun, Sep–Nov (NH)",time:"4pm–9am",shadow:"M"},
  {name:"Octopus",months:"all year",time:"all day",shadow:"M"},
  {name:"Umbrella octopus",months:"Mar–May, Sep–Nov (NH)",time:"all day",shadow:"S"},
  {name:"Vampire squid",months:"May–Aug (NH)",time:"4pm–9am",shadow:"M"},
  {name:"Firefly squid",months:"Mar–Jun (NH)",time:"9pm–4am",shadow:"S"},
  {name:"Gazami crab",months:"Jun–Nov (NH)",time:"all day",shadow:"M"},
  {name:"Dungeness crab",months:"Nov–May (NH)",time:"all day",shadow:"M"},
  {name:"Snow crab",months:"Nov–Apr (NH)",time:"all day",shadow:"M"},
  {name:"Red king crab",months:"Nov–Mar (NH)",time:"all day",shadow:"L"},
  {name:"Acorn barnacle",months:"all year",time:"all day",shadow:"XS"},
  {name:"Spider crab",months:"Mar–Apr (NH)",time:"all day",shadow:"L"},
  {name:"Tiger prawn",months:"Jun–Sep (NH)",time:"4pm–9am",shadow:"S"},
  {name:"Sweet shrimp",months:"Sep–Feb (NH)",time:"4pm–9am",shadow:"S"},
  {name:"Mantis shrimp",months:"all year",time:"4pm–9am",shadow:"S"},
  {name:"Spiny lobster",months:"Oct–Dec (NH)",time:"9pm–4am",shadow:"M"},
  {name:"Lobster",months:"Apr–Jun, Nov–Jan (NH)",time:"all day",shadow:"M"},
  {name:"Flatworm",months:"Aug–Sep (NH)",time:"4pm–9am",shadow:"XS"},
  {name:"Venus' flower basket",months:"Oct–Feb (NH)",time:"all day",shadow:"M"},
  {name:"Sea pineapple",months:"Apr–Aug (NH)",time:"all day",shadow:"S"},
  {name:"Spotted garden eel",months:"May–Oct (NH)",time:"4am–9pm",shadow:"S"},
  {name:"Miniature crown",months:"all year",time:"4pm–9am",shadow:"XS"},
  {name:"Aurelia",months:"Jan–Mar, Jul–Sep (NH)",time:"all day",shadow:"M"},
  {name:"Blue parrotfish",months:"Apr–Sep (NH)",time:"all day",shadow:"M"},
  {name:"Pearl",months:"all year",time:"all day",shadow:"XS"},
];

// ============================================================
// STORAGE HELPERS
// ============================================================
const STORE_KEY = "acnh_tracker_v2";
const loadState = () => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};
const saveState = (s) => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch {}
};

const initialState = {
  profile: { name:"", island:"", nativeFruit:"Apple", hemisphere:"Northern", switchCode:"", dreamId:"", creatorId:"" },
  ownedVillagers: {},
  favouriteVillagers: {},
  caughtBugs: {},
  caughtFish: {},
  caughtSeaCreatures: {},
  donatedBugs: {},
  donatedFish: {},
  donatedSeaCreatures: {},
  donatedFossils: {},
  donatedArt: {},
  reactions: {},
  mysteryIslands: {},
  customLists: [],
  turnipPrices: { buyPrice: "", prevPattern: "unknown", isFirstBuy: false, mon_am:"", mon_pm:"", tue_am:"", tue_pm:"", wed_am:"", wed_pm:"", thu_am:"", thu_pm:"", fri_am:"", fri_pm:"", sat:"" },
  dailyChecks: { villagers: {}, turnipAM: false, turnipPM: false, fossils: [false,false,false,false], moneyTree: false, bottle: false, rocks: [false,false,false,false,false,false] },
  visitors: {},
  calendarEvents: [],
  catalogUrl: "",
};

// ============================================================
// ICONS
// ============================================================
const Icon = ({ name, size=18 }) => {
  const icons = {
    home: <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    calendar: <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    villagers: <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    list: <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
    catalog: <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    flower: <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="3"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3a3 3 0 010 6M12 15a3 3 0 010 6M3 12a3 3 0 016 0M15 12a3 3 0 016 0M5.6 5.6a3 3 0 014.2 4.2M14.2 14.2a3 3 0 004.2 4.2M5.6 18.4a3 3 0 014.2-4.2M14.2 9.8a3 3 0 004.2-4.2" /></svg>,
    turnip: <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    island: <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    reaction: <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    bug: <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>,
    fish: <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>,
    profile: <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    check: <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
    plus: <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
    trash: <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    star: <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
    museum: <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    sea: <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>,
  };
  return icons[name] || null;
};

// ============================================================
// MAIN APP
// ============================================================
export default function ACNHTracker() {
  const [activeTab, setActiveTab] = useState("home");
  const [state, setState] = useState(() => {
    const saved = loadState();
    return saved ? { ...initialState, ...saved } : { ...initialState };
  });

  const update = useCallback((key, val) => {
    setState(prev => {
      const next = { ...prev, [key]: typeof val === 'function' ? val(prev[key]) : val };
      saveState(next);
      return next;
    });
  }, []);

  const toggleItem = useCallback((stateKey, itemKey) => {
    setState(prev => {
      const next = { ...prev, [stateKey]: { ...prev[stateKey], [itemKey]: !prev[stateKey][itemKey] } };
      saveState(next);
      return next;
    });
  }, []);

  const navItems = [
    { id:"home", label:"Home", icon:"home" },
    { id:"events", label:"Events", icon:"calendar" },
    { id:"villagers", label:"Villagers", icon:"villagers" },
    { id:"lists", label:"Custom Lists", icon:"list" },
    { id:"catalog", label:"Catalog Scanner", icon:"catalog" },
    { id:"flowers", label:"Flower Breeding", icon:"flower" },
    { id:"turnips", label:"Turnip Calculator", icon:"turnip" },
    { id:"islands", label:"Mystery Islands", icon:"island" },
    { id:"reactions", label:"Reactions", icon:"reaction" },
    { id:"critterpedia", label:"Critterpedia", icon:"bug" },
    { id:"profile", label:"Profile", icon:"profile" },
  ];

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#f0faf5", fontFamily:"'Nunito', 'Segoe UI', sans-serif", color:"#2d4a3e" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #e8f5ee; } ::-webkit-scrollbar-thumb { background: #7ecba1; border-radius: 3px; }
        input, select, textarea { font-family: inherit; }
        .nav-btn { display:flex; align-items:center; gap:10px; padding:10px 16px; border-radius:12px; cursor:pointer; border:none; background:transparent; color:#4a7c67; font-size:14px; font-weight:600; font-family:inherit; transition:all 0.15s; width:100%; text-align:left; }
        .nav-btn:hover { background:#d4f0e3; color:#2d6b52; }
        .nav-btn.active { background:linear-gradient(135deg,#7ecba1,#5bb88a); color:white; box-shadow:0 3px 10px #7ecba155; }
        .card { background:white; border-radius:16px; padding:20px; box-shadow:0 2px 12px #0001; }
        .tag { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:700; }
        .btn { padding:8px 18px; border-radius:10px; border:none; cursor:pointer; font-family:inherit; font-weight:700; font-size:13px; transition:all 0.15s; }
        .btn-primary { background:linear-gradient(135deg,#7ecba1,#5bb88a); color:white; box-shadow:0 2px 8px #7ecba155; }
        .btn-primary:hover { transform:translateY(-1px); box-shadow:0 4px 12px #7ecba177; }
        .btn-danger { background:#fee2e2; color:#dc2626; }
        .btn-ghost { background:#f0faf5; color:#4a7c67; border:1px solid #c3e6d4; }
        .checkbox-item { display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:10px; cursor:pointer; transition:background 0.1s; }
        .checkbox-item:hover { background:#f0faf5; }
        .cb { width:20px; height:20px; border-radius:6px; border:2px solid #7ecba1; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.15s; }
        .cb.checked { background:#7ecba1; border-color:#7ecba1; }
        input[type=text], input[type=number], select, textarea { border:2px solid #c3e6d4; border-radius:10px; padding:8px 12px; font-size:14px; outline:none; transition:border 0.15s; }
        input[type=text]:focus, input[type=number]:focus, select:focus, textarea:focus { border-color:#7ecba1; }
        .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
        .progress-bar { height:8px; border-radius:4px; background:#e8f5ee; overflow:hidden; }
        .progress-fill { height:100%; border-radius:4px; background:linear-gradient(90deg,#7ecba1,#5bb88a); transition:width 0.3s; }
        .search-input { width:100%; border:2px solid #c3e6d4; border-radius:10px; padding:8px 14px; font-size:14px; outline:none; }
        .search-input:focus { border-color:#7ecba1; }
        .pill { padding:2px 10px; border-radius:20px; font-size:11px; font-weight:700; }
        h2 { font-size:22px; font-weight:900; color:#2d4a3e; }
        h3 { font-size:16px; font-weight:800; color:#2d4a3e; }
        .section-title { font-size:13px; font-weight:700; color:#7ecba1; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:10px; }
        .divider { border:none; border-top:2px dashed #d4f0e3; margin:16px 0; }
        .villager-card { border:2px solid #e8f5ee; border-radius:12px; padding:12px; transition:all 0.15s; cursor:pointer; }
        .villager-card:hover { border-color:#7ecba1; background:#f7fefb; }
        .villager-card.owned { background:#f0faf5; border-color:#7ecba1; }
        .flower-combo { display:flex; align-items:center; gap:8px; padding:8px; background:#f7fefb; border-radius:8px; }
        .flower-dot { width:16px; height:16px; border-radius:50%; border:2px solid #fff; box-shadow:0 1px 3px #0002; flex-shrink:0; }
        @media(max-width:768px){
          .sidebar { width:60px !important; }
          .nav-label { display:none; }
          .nav-btn { padding:12px; justify-content:center; }
          .grid-2 { grid-template-columns:1fr; }
          .grid-3 { grid-template-columns:1fr 1fr; }
        }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{ width:220, background:"white", borderRight:"2px solid #e8f5ee", padding:"20px 12px", display:"flex", flexDirection:"column", gap:4, position:"sticky", top:0, height:"100vh", overflowY:"auto", flexShrink:0 }} className="sidebar">
        <div style={{ padding:"12px 8px 20px", textAlign:"center" }}>
          <div style={{ fontSize:28, marginBottom:4 }}>🌿</div>
          <div style={{ fontSize:15, fontWeight:900, color:"#2d4a3e", lineHeight:1.2 }}>Island<br/>Tracker</div>
          <div style={{ fontSize:11, color:"#7ecba1", fontWeight:600 }}>ACNH</div>
        </div>
        {navItems.map(item => (
          <button key={item.id} className={`nav-btn ${activeTab === item.id ? "active" : ""}`} onClick={() => setActiveTab(item.id)}>
            <Icon name={item.icon} size={16} />
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </aside>

      {/* MAIN */}
      <main style={{ flex:1, padding:"24px", overflowY:"auto", maxHeight:"100vh" }}>
        {activeTab === "home" && <HomeTab state={state} update={update} toggleItem={toggleItem} />}
        {activeTab === "events" && <EventsTab state={state} update={update} />}
        {activeTab === "villagers" && <VillagersTab state={state} toggleItem={toggleItem} />}
        {activeTab === "lists" && <ListsTab state={state} update={update} />}
        {activeTab === "catalog" && <CatalogTab state={state} update={update} />}
        {activeTab === "flowers" && <FlowersTab />}
        {activeTab === "turnips" && <TurnipsTab state={state} update={update} />}
        {activeTab === "islands" && <IslandsTab state={state} toggleItem={toggleItem} />}
        {activeTab === "reactions" && <ReactionsTab state={state} toggleItem={toggleItem} />}
        {activeTab === "critterpedia" && <CritterpediaTab state={state} toggleItem={toggleItem} />}
        {activeTab === "profile" && <ProfileTab state={state} update={update} toggleItem={toggleItem} />}
      </main>
    </div>
  );
}

// ============================================================
// HOME TAB
// ============================================================
function HomeTab({ state, update, toggleItem }) {
  const { dailyChecks, visitors, profile } = state;
  const numBugs = Object.values(state.caughtBugs).filter(Boolean).length;
  const numFish = Object.values(state.caughtFish).filter(Boolean).length;
  const numSea = Object.values(state.caughtSeaCreatures).filter(Boolean).length;
  const numFossils = Object.values(state.donatedFossils).filter(Boolean).length;
  const numArt = Object.values(state.donatedArt).filter(Boolean).length;

  const toggleVisitor = (v) => {
    update("visitors", prev => ({ ...prev, [v]: !prev[v] }));
  };
  const toggleRock = (i) => {
    update("dailyChecks", prev => {
      const rocks = [...(prev.rocks||[false,false,false,false,false,false])];
      rocks[i] = !rocks[i];
      return { ...prev, rocks };
    });
  };
  const toggleFossil = (i) => {
    update("dailyChecks", prev => {
      const fossils = [...(prev.fossils||[false,false,false,false])];
      fossils[i] = !fossils[i];
      return { ...prev, fossils };
    });
  };

  const mushrooms = (state.ownedVillagers ? Object.entries(state.ownedVillagers).filter(([,v])=>v) : []).map(([k])=>k);

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h2>🏝️ {profile.island ? `${profile.island}'s Dashboard` : "Good morning, islander!"}</h2>
        <p style={{ color:"#6b9e86", marginTop:4, fontSize:14 }}>Track your daily tasks and island progress.</p>
      </div>

      <div className="grid-2" style={{ marginBottom:20 }}>
        {/* Daily Tasks */}
        <div className="card">
          <h3 style={{ marginBottom:14 }}>☀️ Daily Tasks</h3>
          
          <p className="section-title">Villager Chats</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
            {mushrooms.length === 0 && <p style={{ color:"#9dc5b0", fontSize:13 }}>Add villagers in the Villagers tab first.</p>}
            {mushrooms.slice(0,10).map(name => (
              <div key={name} onClick={() => toggleItem("dailyChecks", `villager_${name}`)} 
                style={{ padding:"4px 12px", borderRadius:20, cursor:"pointer", fontSize:13, fontWeight:700,
                  background: (dailyChecks[`villager_${name}`]||dailyChecks?.villagers?.[name]) ? "#7ecba1" : "#e8f5ee",
                  color: (dailyChecks[`villager_${name}`]||dailyChecks?.villagers?.[name]) ? "white" : "#4a7c67" }}>
                {(dailyChecks[`villager_${name}`]||dailyChecks?.villagers?.[name]) ? "✓ " : ""}{name}
              </div>
            ))}
          </div>

          <hr className="divider" />
          <p className="section-title">Turnip Prices</p>
          <div style={{ display:"flex", gap:8, marginBottom:14 }}>
            {["turnipAM","turnipPM"].map(k => (
              <div key={k} className="checkbox-item" style={{ flex:1 }} onClick={() => update("dailyChecks", prev => ({...prev, [k]:!prev[k]}))}>
                <div className={`cb ${dailyChecks[k] ? "checked" : ""}`}>{dailyChecks[k] && <Icon name="check" size={12} />}</div>
                <span style={{ fontSize:13 }}>{k === "turnipAM" ? "AM Price" : "PM Price"}</span>
              </div>
            ))}
          </div>

          <hr className="divider" />
          <p className="section-title">Daily Fossils (4)</p>
          <div style={{ display:"flex", gap:8, marginBottom:14 }}>
            {[0,1,2,3].map(i => (
              <div key={i} onClick={() => toggleFossil(i)}
                style={{ flex:1, padding:"8px", borderRadius:10, textAlign:"center", cursor:"pointer", fontSize:12, fontWeight:700,
                  background: dailyChecks.fossils?.[i] ? "#7ecba1" : "#e8f5ee",
                  color: dailyChecks.fossils?.[i] ? "white" : "#4a7c67" }}>
                🦕 {i+1}
              </div>
            ))}
          </div>

          <hr className="divider" />
          <p className="section-title">Rocks (6)</p>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
            {[0,1,2,3,4,5].map(i => (
              <div key={i} onClick={() => toggleRock(i)}
                style={{ padding:"6px 12px", borderRadius:10, cursor:"pointer", fontSize:12, fontWeight:700,
                  background: dailyChecks.rocks?.[i] ? "#7ecba1" : "#e8f5ee",
                  color: dailyChecks.rocks?.[i] ? "white" : "#4a7c67" }}>
                🪨 Rock {i+1}
              </div>
            ))}
          </div>

          <hr className="divider" />
          <div style={{ display:"flex", gap:8 }}>
            {["moneyTree","bottle"].map(k => (
              <div key={k} className="checkbox-item" style={{ flex:1 }} onClick={() => update("dailyChecks", prev => ({...prev, [k]:!prev[k]}))}>
                <div className={`cb ${dailyChecks[k] ? "checked" : ""}`}>{dailyChecks[k] && <Icon name="check" size={12} />}</div>
                <span style={{ fontSize:13 }}>{k === "moneyTree" ? "💰 Money Tree" : "📨 Daily Bottle"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* Visitor NPCs */}
          <div className="card">
            <h3 style={{ marginBottom:12 }}>👥 Weekly Visitors</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              {VISITOR_NPCS.map(v => (
                <div key={v} className="checkbox-item" onClick={() => toggleVisitor(v)}>
                  <div className={`cb ${visitors[v] ? "checked" : ""}`}>{visitors[v] && <Icon name="check" size={12} />}</div>
                  <span style={{ fontSize:14 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Museum Progress */}
          <div className="card">
            <h3 style={{ marginBottom:12 }}>🏛️ Museum Progress</h3>
            {[
              {label:"Bugs 🦋", caught:numBugs, total:BUGS.length},
              {label:"Fish 🐟", caught:numFish, total:FISH.length},
              {label:"Sea 🦀", caught:numSea, total:SEA_CREATURES.length},
              {label:"Fossils 🦕", caught:numFossils, total:FOSSILS_LIST.length},
            ].map(({label,caught,total}) => (
              <div key={label} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:600 }}>{label}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:"#5bb88a" }}>{caught}/{total}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width:`${(caught/total)*100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reset daily */}
      <div style={{ textAlign:"right" }}>
        <button className="btn btn-ghost" onClick={() => update("dailyChecks", { villagers:{}, turnipAM:false, turnipPM:false, fossils:[false,false,false,false], moneyTree:false, bottle:false, rocks:[false,false,false,false,false,false] })}>
          🔄 Reset Daily Tasks
        </button>
      </div>
    </div>
  );
}

// ============================================================
// EVENTS TAB
// ============================================================
function EventsTab({ state, update }) {
  const [newEvent, setNewEvent] = useState({name:"",month:1,day:1});
  const allEvents = [...EVENTS, ...(state.calendarEvents || [])].sort((a,b) => a.month*100+a.day - b.month*100+b.day);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const addEvent = () => {
    if (!newEvent.name) return;
    update("calendarEvents", prev => [...(prev||[]), {...newEvent, custom:true}]);
    setNewEvent({name:"",month:1,day:1});
  };

  return (
    <div>
      <h2 style={{ marginBottom:8 }}>📅 Annual Event Calendar</h2>
      <p style={{ color:"#6b9e86", marginBottom:24, fontSize:14 }}>All ACNH events plus your custom additions.</p>

      {/* Add custom event */}
      <div className="card" style={{ marginBottom:24 }}>
        <h3 style={{ marginBottom:12 }}>➕ Add Custom Event</h3>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <input type="text" placeholder="Event name" value={newEvent.name} onChange={e=>setNewEvent(p=>({...p,name:e.target.value}))} style={{ flex:2 }} />
          <select value={newEvent.month} onChange={e=>setNewEvent(p=>({...p,month:parseInt(e.target.value)}))} style={{ flex:1 }}>
            {months.map((m,i)=><option key={m} value={i+1}>{m}</option>)}
          </select>
          <input type="number" min={1} max={31} value={newEvent.day} onChange={e=>setNewEvent(p=>({...p,day:parseInt(e.target.value)}))} style={{ width:70 }} />
          <button className="btn btn-primary" onClick={addEvent}>Add</button>
        </div>
      </div>

      {/* Calendar by month */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16 }}>
        {months.map((m,mi) => {
          const monthEvents = allEvents.filter(e=>e.month===mi+1);
          return (
            <div key={m} className="card">
              <h3 style={{ marginBottom:10, color:"#5bb88a" }}>{m}</h3>
              {monthEvents.length === 0 ? <p style={{ color:"#9dc5b0", fontSize:13 }}>No events</p> :
                monthEvents.map((e,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 0", borderBottom:i<monthEvents.length-1?"1px solid #f0faf5":""  }}>
                    <span style={{ width:24, height:24, borderRadius:8, background:"#f0faf5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#5bb88a", flexShrink:0 }}>{e.day}</span>
                    <span style={{ fontSize:13, fontWeight:600 }}>{e.name}</span>
                    {e.custom && <span style={{ marginLeft:"auto" }}>
                      <button className="btn" style={{ padding:"2px 8px", background:"#fee2e2", color:"#dc2626", fontSize:11 }}
                        onClick={() => update("calendarEvents", prev => prev.filter(x=>x!==e))}>✕</button>
                    </span>}
                  </div>
                ))
              }
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// VILLAGERS TAB
// ============================================================
function VillagersTab({ state, toggleItem }) {
  const [search, setSearch] = useState("");
  const [filterSpecies, setFilterSpecies] = useState("All");
  const [filterPersonality, setFilterPersonality] = useState("All");
  const species = ["All", ...new Set(VILLAGERS.map(v=>v.species).sort())];
  const personalities = ["All","Lazy","Normal","Peppy","Cranky","Jock","Snooty","Smug","BigSister"];

  const filtered = VILLAGERS.filter(v => {
    const q = search.toLowerCase();
    return (filterSpecies==="All"||v.species===filterSpecies) &&
      (filterPersonality==="All"||v.personality===filterPersonality) &&
      (v.name.toLowerCase().includes(q) || v.species.toLowerCase().includes(q));
  });

  const ownedCount = Object.values(state.ownedVillagers).filter(Boolean).length;
  const favCount = Object.values(state.favouriteVillagers).filter(Boolean).length;

  return (
    <div>
      <h2 style={{ marginBottom:4 }}>🐾 Villagers</h2>
      <p style={{ color:"#6b9e86", marginBottom:16, fontSize:14 }}>{ownedCount} on island • {favCount} favourited • {VILLAGERS.length} total</p>

      {/* Filters */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:20 }}>
        <input className="search-input" style={{ width:200 }} placeholder="Search villagers..." value={search} onChange={e=>setSearch(e.target.value)} />
        <select value={filterSpecies} onChange={e=>setFilterSpecies(e.target.value)}>
          {species.map(s=><option key={s}>{s}</option>)}
        </select>
        <select value={filterPersonality} onChange={e=>setFilterPersonality(e.target.value)}>
          {personalities.map(p=><option key={p}>{p}</option>)}
        </select>
      </div>

      {/* Legend */}
      <div style={{ display:"flex", gap:12, marginBottom:16, fontSize:13 }}>
        <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ background:"#7ecba1", color:"white", padding:"2px 8px", borderRadius:8, fontSize:12 }}>✓ Owned</span> = on your island</span>
        <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ color:"#fbbf24" }}>★</span> = favourite/wishlist</span>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:10 }}>
        {filtered.map(v => {
          const owned = state.ownedVillagers[v.name];
          const fav = state.favouriteVillagers[v.name];
          return (
            <div key={v.name} className={`villager-card ${owned?"owned":""}`}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                <span style={{ fontSize:16, fontWeight:800 }}>{v.name}</span>
                <span onClick={() => toggleItem("favouriteVillagers", v.name)}
                  style={{ cursor:"pointer", color: fav ? "#fbbf24" : "#d1d5db", fontSize:18 }}>★</span>
              </div>
              <div style={{ fontSize:12, color:"#6b9e86", marginBottom:8 }}>
                <div>{v.species} • {v.personality}</div>
                <div>🎂 {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][v.bdayMonth-1]} {v.bdayDay}</div>
              </div>
              <button className={`btn ${owned?"btn-primary":"btn-ghost"}`} style={{ width:"100%", fontSize:12, padding:"6px" }}
                onClick={() => toggleItem("ownedVillagers", v.name)}>
                {owned ? "✓ On Island" : "+ Mark Owned"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// CUSTOM LISTS TAB
// ============================================================
function ListsTab({ state, update }) {
  const [newListName, setNewListName] = useState("");
  const [activeList, setActiveList] = useState(null);
  const [newItem, setNewItem] = useState("");
  const [search, setSearch] = useState("");

  // All game items (simplified set)
  const gameItems = [
    ...BUGS.map(b=>({name:b.name,category:"Bug"})),
    ...FISH.map(f=>({name:f.name,category:"Fish"})),
    ...SEA_CREATURES.map(s=>({name:s.name,category:"Sea Creature"})),
    ...FOSSILS_LIST.map(f=>({name:f,category:"Fossil"})),
    ...VILLAGERS.map(v=>({name:v.name,category:"Villager"})),
  ];

  const searchResults = search.length >= 2 ? gameItems.filter(i=>i.name.toLowerCase().includes(search.toLowerCase())).slice(0,15) : [];

  const createList = () => {
    if (!newListName.trim()) return;
    update("customLists", prev => [...(prev||[]), {id:Date.now(), name:newListName, items:[]}]);
    setNewListName("");
  };

  const addItemToList = (listId, itemName) => {
    update("customLists", prev => prev.map(l => l.id === listId ? {...l, items:[...l.items, {id:Date.now(), text:itemName, done:false}]} : l));
    setNewItem(""); setSearch("");
  };

  const toggleListItem = (listId, itemId) => {
    update("customLists", prev => prev.map(l => l.id === listId ? {...l, items:l.items.map(i => i.id===itemId ? {...i,done:!i.done} : i)} : l));
  };

  const deleteList = (listId) => {
    update("customLists", prev => prev.filter(l=>l.id!==listId));
    if (activeList?.id === listId) setActiveList(null);
  };

  const currentList = state.customLists?.find(l=>l.id===activeList?.id);

  return (
    <div>
      <h2 style={{ marginBottom:4 }}>📋 Custom Lists</h2>
      <p style={{ color:"#6b9e86", marginBottom:24, fontSize:14 }}>Create lists for anything — wishlist, to-do, trade offers, etc.</p>

      <div style={{ display:"flex", gap:20 }}>
        {/* List sidebar */}
        <div style={{ width:240, flexShrink:0 }}>
          <div className="card" style={{ marginBottom:12 }}>
            <div style={{ display:"flex", gap:8 }}>
              <input type="text" placeholder="New list name" value={newListName} onChange={e=>setNewListName(e.target.value)} 
                onKeyDown={e=>e.key==="Enter"&&createList()} style={{ flex:1, fontSize:13 }} />
              <button className="btn btn-primary" onClick={createList} style={{ padding:"8px 12px" }}><Icon name="plus" size={14} /></button>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {(state.customLists||[]).map(list => (
              <div key={list.id} onClick={()=>setActiveList(list)}
                style={{ padding:"10px 14px", borderRadius:12, cursor:"pointer", border:"2px solid", display:"flex", justifyContent:"space-between", alignItems:"center",
                  borderColor: activeList?.id===list.id ? "#7ecba1" : "#e8f5ee",
                  background: activeList?.id===list.id ? "#f0faf5" : "white" }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{list.name}</div>
                  <div style={{ fontSize:11, color:"#9dc5b0" }}>{list.items.filter(i=>i.done).length}/{list.items.length} done</div>
                </div>
                <button onClick={e=>{e.stopPropagation();deleteList(list.id);}} style={{ background:"none", border:"none", cursor:"pointer", color:"#fca5a5", fontSize:16 }}>✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* List content */}
        <div style={{ flex:1 }}>
          {!currentList ? (
            <div className="card" style={{ textAlign:"center", padding:40, color:"#9dc5b0" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>📝</div>
              <p>Select or create a list to get started</p>
            </div>
          ) : (
            <div className="card">
              <h3 style={{ marginBottom:16 }}>{currentList.name}</h3>
              
              {/* Add item */}
              <div style={{ marginBottom:16, position:"relative" }}>
                <div style={{ display:"flex", gap:8 }}>
                  <input type="text" className="search-input" placeholder="Search game items or type anything..." 
                    value={search||newItem} onChange={e=>{setSearch(e.target.value);setNewItem(e.target.value);}} style={{ flex:1 }} />
                  <button className="btn btn-primary" onClick={()=>{if(newItem.trim())addItemToList(currentList.id,newItem.trim());}}>Add</button>
                </div>
                {searchResults.length > 0 && (
                  <div style={{ position:"absolute", top:"100%", left:0, right:60, zIndex:10, background:"white", border:"2px solid #7ecba1", borderRadius:10, overflow:"hidden", boxShadow:"0 8px 24px #0002" }}>
                    {searchResults.map(item => (
                      <div key={item.name} onClick={()=>addItemToList(currentList.id,item.name)}
                        style={{ padding:"8px 14px", cursor:"pointer", display:"flex", justifyContent:"space-between", borderBottom:"1px solid #f0faf5" }}
                        onMouseEnter={e=>e.currentTarget.style.background="#f0faf5"} onMouseLeave={e=>e.currentTarget.style.background="white"}>
                        <span style={{ fontSize:14 }}>{item.name}</span>
                        <span style={{ fontSize:12, color:"#9dc5b0" }}>{item.category}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Items */}
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                {currentList.items.map(item => (
                  <div key={item.id} className="checkbox-item" onClick={()=>toggleListItem(currentList.id,item.id)}>
                    <div className={`cb ${item.done?"checked":""}`}>{item.done && <Icon name="check" size={12} />}</div>
                    <span style={{ fontSize:14, textDecoration:item.done?"line-through":"none", color:item.done?"#9dc5b0":"inherit" }}>{item.text}</span>
                  </div>
                ))}
                {currentList.items.length === 0 && <p style={{ color:"#9dc5b0", fontSize:13, textAlign:"center", padding:20 }}>No items yet. Add some above!</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CATALOG TAB
// ============================================================
function CatalogTab({ state, update }) {
  const [url, setUrl] = useState(state.catalogUrl || "");
  const [submitted, setSubmitted] = useState(!!state.catalogUrl);

  return (
    <div>
      <h2 style={{ marginBottom:4 }}>📖 Catalog Scanner</h2>
      <p style={{ color:"#6b9e86", marginBottom:24, fontSize:14 }}>View your island catalog from nook.lol.</p>

      <div className="card" style={{ marginBottom:20 }}>
        <h3 style={{ marginBottom:12 }}>Enter your nook.lol URL</h3>
        <p style={{ fontSize:13, color:"#6b9e86", marginBottom:12 }}>
          Visit <strong>nook.lol</strong>, open your island data, and paste the URL below. Your catalog will be embedded here.
        </p>
        <div style={{ display:"flex", gap:10 }}>
          <input type="text" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://nook.lol/u/..." style={{ flex:1 }} />
          <button className="btn btn-primary" onClick={() => { update("catalogUrl", url); setSubmitted(true); }}>Load</button>
          {submitted && <button className="btn btn-ghost" onClick={()=>{update("catalogUrl","");setUrl("");setSubmitted(false);}}>Clear</button>}
        </div>
      </div>

      {submitted && state.catalogUrl && (
        <div className="card" style={{ padding:0, overflow:"hidden" }}>
          <iframe src={state.catalogUrl} style={{ width:"100%", height:"70vh", border:"none" }} title="Nook Catalog" />
        </div>
      )}

      {!submitted && (
        <div className="card" style={{ textAlign:"center", padding:48, color:"#9dc5b0" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🗂️</div>
          <p style={{ fontSize:15 }}>Paste your nook.lol URL above to view your catalog</p>
          <p style={{ fontSize:13, marginTop:8 }}>Your data stays private — we just embed the page.</p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// FLOWERS TAB
// ============================================================
function FlowersTab() {
  const [selected, setSelected] = useState("roses");
  const flowerNames = Object.keys(FLOWER_BREEDS);
  const flowerEmoji = { roses:"🌹", tulips:"🌷", pansies:"🌸", cosmos:"🌼", lilies:"💐", hyacinths:"💜", windflowers:"🌺", mums:"🌻" };
  const colorHex = {
    Red:"#e74c3c", White:"#ffffff", Yellow:"#f1c40f", Orange:"#e67e22", Black:"#2c3e50",
    Pink:"#fd79a8", Purple:"#9b59b6", Blue:"#3498db", Gold:"#f9ca24", Green:"#27ae60"
  };
  const data = FLOWER_BREEDS[selected];

  return (
    <div>
      <h2 style={{ marginBottom:4 }}>🌸 Flower Breeding Guide</h2>
      <p style={{ color:"#6b9e86", marginBottom:20, fontSize:14 }}>Genetics-based breeding paths for all 8 flower types.</p>

      {/* Flower selector */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24 }}>
        {flowerNames.map(f => (
          <button key={f} className={`btn ${selected===f?"btn-primary":"btn-ghost"}`} onClick={()=>setSelected(f)}>
            {flowerEmoji[f]} {f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom:12 }}>🎨 Available Colors</h3>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {data.colors.map(c => (
              <div key={c} style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:20, background:"#f7fefb", border:"2px solid #e8f5ee" }}>
                <div className="flower-dot" style={{ background: colorHex[c]||"#aaa", border:c==="White"?"2px solid #ccc":"2px solid white" }} />
                <span style={{ fontSize:13, fontWeight:600 }}>{c}</span>
              </div>
            ))}
          </div>

          <hr className="divider" />
          <h3 style={{ marginBottom:12 }}>🧬 Breeding Combinations</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {data.combinations.map((combo, i) => (
              <div key={i} className="flower-combo">
                <span style={{ fontSize:13, color:"#4a7c67", fontWeight:600, flex:1 }}>{combo.from}</span>
                <span style={{ fontSize:20 }}>→</span>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div className="flower-dot" style={{ background: colorHex[combo.result.split(" ")[0]]||"#aaa", border: combo.result.startsWith("White")?"2px solid #ccc":"2px solid white" }} />
                  <span style={{ fontSize:13, fontWeight:700, color:"#2d4a3e" }}>{combo.result}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom:12 }}>📝 Breeding Notes</h3>
          <p style={{ fontSize:14, lineHeight:1.7, color:"#4a7c67", background:"#f0faf5", padding:14, borderRadius:12 }}>{data.note}</p>

          <hr className="divider" />
          <h3 style={{ marginBottom:12 }}>💡 Tips</h3>
          <ul style={{ paddingLeft:16, fontSize:13, lineHeight:2, color:"#4a7c67" }}>
            <li>Plant in a checkerboard pattern with gaps between flowers</li>
            <li>Water your flowers daily to increase breeding chance</li>
            <li>5 unique visitors watering = maximum 80% daily breed chance</li>
            <li>Mystery island flowers can provide better starting genetics</li>
            <li>Separate hybrid flowers from seeds to avoid contamination</li>
            {selected==="roses" && <li>🌹 Blue roses are the rarest flower in the game — be patient!</li>}
            {selected==="windflowers" && <li>🌺 No yellow windflowers exist; orange is a base color</li>}
            {selected==="mums" && <li>💛 Use hybrid yellows (Red × Yellow) for green mums, not seed yellows</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TURNIPS TAB
// ============================================================
function TurnipsTab({ state, update }) {
  const t = state.turnipPrices;
  const days = [
    {key:"mon_am",label:"Mon AM"},{key:"mon_pm",label:"Mon PM"},
    {key:"tue_am",label:"Tue AM"},{key:"tue_pm",label:"Tue PM"},
    {key:"wed_am",label:"Wed AM"},{key:"wed_pm",label:"Wed PM"},
    {key:"thu_am",label:"Thu AM"},{key:"thu_pm",label:"Thu PM"},
    {key:"fri_am",label:"Fri AM"},{key:"fri_pm",label:"Fri PM"},
    {key:"sat",label:"Sat"},
  ];

  const setT = (key, val) => update("turnipPrices", prev => ({...prev, [key]:val}));

  const calculate = () => {
    const buy = parseInt(t.buyPrice)||100;
    const prices = days.map(d=>parseInt(t[d.key])||0).filter(v=>v>0);
    if (prices.length === 0) return null;
    const max = Math.max(...prices);
    const profit = (max - buy) * 100;
    return { max, profit, buy };
  };

  const result = calculate();

  const openTurnipProphet = () => {
    const prices = [t.buyPrice||"", ...days.map(d=>t[d.key]||"")].join(".");
    window.open(`https://turnipprophet.io/?prices=${prices}`, "_blank");
  };

  return (
    <div>
      <h2 style={{ marginBottom:4 }}>📈 Turnip Calculator</h2>
      <p style={{ color:"#6b9e86", marginBottom:24, fontSize:14 }}>Track stalk market prices and predict your profit.</p>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom:16 }}>⚙️ Setup</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div>
              <label style={{ fontSize:13, fontWeight:700, display:"block", marginBottom:4 }}>Buy Price (Daisy Mae)</label>
              <input type="number" value={t.buyPrice} onChange={e=>setT("buyPrice",e.target.value)} placeholder="e.g. 98" style={{ width:"100%" }} />
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:700, display:"block", marginBottom:4 }}>Previous Week Pattern</label>
              <select value={t.prevPattern} onChange={e=>setT("prevPattern",e.target.value)} style={{ width:"100%" }}>
                <option value="unknown">Unknown</option>
                <option value="fluctuating">Fluctuating</option>
                <option value="large-spike">Large Spike</option>
                <option value="decreasing">Decreasing</option>
                <option value="small-spike">Small Spike</option>
              </select>
            </div>
            <label className="checkbox-item" style={{ cursor:"pointer" }} onClick={() => setT("isFirstBuy", !t.isFirstBuy)}>
              <div className={`cb ${t.isFirstBuy?"checked":""}`}>{t.isFirstBuy && <Icon name="check" size={12} />}</div>
              <span style={{ fontSize:14 }}>First time buying turnips this game?</span>
            </label>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom:16 }}>💹 Week Prices</h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {days.map(d => (
              <div key={d.key}>
                <label style={{ fontSize:12, fontWeight:700, display:"block", marginBottom:2, color:"#6b9e86" }}>{d.label}</label>
                <input type="number" value={t[d.key]} onChange={e=>setT(d.key,e.target.value)} placeholder="Bells" style={{ width:"100%" }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="card" style={{ marginTop:20 }}>
        <h3 style={{ marginBottom:12 }}>📊 Result</h3>
        {result ? (
          <div style={{ display:"flex", gap:20, alignItems:"center", flexWrap:"wrap" }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, color:"#6b9e86", marginBottom:4 }}>Highest price this week</div>
              <div style={{ fontSize:32, fontWeight:900, color:"#5bb88a" }}>{result.max} <span style={{ fontSize:16 }}>bells</span></div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, color:"#6b9e86", marginBottom:4 }}>Profit per 100 turnips</div>
              <div style={{ fontSize:24, fontWeight:900, color: result.profit > 0 ? "#5bb88a" : "#ef4444" }}>
                {result.profit > 0 ? "+" : ""}{result.profit.toLocaleString()} bells
              </div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, color:"#6b9e86", marginBottom:4 }}>Buy → Sell</div>
              <div style={{ fontSize:20, fontWeight:800 }}>{result.buy} → {result.max}</div>
              <div style={{ fontSize:13, color:result.max>result.buy?"#5bb88a":"#ef4444" }}>
                {result.max > result.buy ? `✓ Profit: ${((result.max/result.buy-1)*100).toFixed(1)}%` : "❌ Loss"}
              </div>
            </div>
            <button className="btn btn-primary" onClick={openTurnipProphet} style={{ whiteSpace:"nowrap" }}>
              🔮 Open in Turnip Prophet
            </button>
          </div>
        ) : (
          <p style={{ color:"#9dc5b0", fontSize:14 }}>Enter at least one selling price to see results.</p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MYSTERY ISLANDS TAB
// ============================================================
function IslandsTab({ state, toggleItem }) {
  const visited = Object.values(state.mysteryIslands).filter(Boolean).length;
  return (
    <div>
      <h2 style={{ marginBottom:4 }}>🏝️ Mystery Islands</h2>
      <p style={{ color:"#6b9e86", marginBottom:24, fontSize:14 }}>{visited}/{MYSTERY_ISLANDS.length} visited</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
        {MYSTERY_ISLANDS.map(island => {
          const v = state.mysteryIslands[`island_${island.id}`];
          return (
            <div key={island.id} className="card" style={{ border:`2px solid ${v?"#7ecba1":"#e8f5ee"}`, background:v?"#f0faf5":"white" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <h3 style={{ fontSize:15 }}>{island.name}</h3>
                <span style={{ background:v?"#7ecba1":"#e8f5ee", color:v?"white":"#6b9e86", padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:700 }}>
                  {island.rarity}
                </span>
              </div>
              <p style={{ fontSize:13, color:"#6b9e86", marginBottom:12, lineHeight:1.5 }}>{island.desc}</p>
              <button className={`btn ${v?"btn-primary":"btn-ghost"}`} style={{ width:"100%", fontSize:13 }}
                onClick={() => toggleItem("mysteryIslands", `island_${island.id}`)}>
                {v ? "✓ Visited & Claimed" : "Mark as Visited"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// REACTIONS TAB
// ============================================================
function ReactionsTab({ state, toggleItem }) {
  const owned = REACTIONS.filter(r => state.reactions[r]).length;
  const [search, setSearch] = useState("");
  const filtered = REACTIONS.filter(r => r.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <h2 style={{ marginBottom:4 }}>😄 Reactions</h2>
      <p style={{ color:"#6b9e86", marginBottom:4, fontSize:14 }}>{owned}/{REACTIONS.length} collected</p>
      <div className="progress-bar" style={{ marginBottom:20 }}>
        <div className="progress-fill" style={{ width:`${(owned/REACTIONS.length)*100}%` }} />
      </div>
      <input className="search-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search reactions..." style={{ marginBottom:16, width:280 }} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:8 }}>
        {filtered.map(r => {
          const has = state.reactions[r];
          return (
            <div key={r} className="checkbox-item" onClick={() => toggleItem("reactions", r)}
              style={{ border:`2px solid ${has?"#7ecba1":"#e8f5ee"}`, borderRadius:10, background:has?"#f0faf5":"white" }}>
              <div className={`cb ${has?"checked":""}`}>{has && <Icon name="check" size={12} />}</div>
              <span style={{ fontSize:14 }}>{r}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// CRITTERPEDIA TAB
// ============================================================
function CritterpediaTab({ state, toggleItem }) {
  const [subTab, setSubTab] = useState("bugs");
  const [search, setSearch] = useState("");
  const [hideCaught, setHideCaught] = useState(false);
  const [hideNotDonated, setHideNotDonated] = useState(false);

  const data = subTab==="bugs" ? BUGS : subTab==="fish" ? FISH : SEA_CREATURES;
  const caughtKey = subTab==="bugs" ? "caughtBugs" : subTab==="fish" ? "caughtFish" : "caughtSeaCreatures";
  const donatedKey = subTab==="bugs" ? "donatedBugs" : subTab==="fish" ? "donatedFish" : "donatedSeaCreatures";

  const filtered = data.filter(c => {
    const q = search.toLowerCase();
    const caught = state[caughtKey][c.name];
    if (hideCaught && caught) return false;
    return c.name.toLowerCase().includes(q) || c.months?.toLowerCase().includes(q);
  });

  const caughtCount = data.filter(c=>state[caughtKey][c.name]).length;
  const donatedCount = data.filter(c=>state[donatedKey][c.name]).length;

  return (
    <div>
      <h2 style={{ marginBottom:16 }}>🔬 Critterpedia</h2>
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {[["bugs","🦋 Bugs"],["fish","🐟 Fish"],["sea","🦀 Sea Creatures"]].map(([id,label]) => (
          <button key={id} className={`btn ${subTab===id?"btn-primary":"btn-ghost"}`} onClick={()=>{setSubTab(id);setSearch("");}}>{label}</button>
        ))}
      </div>

      <div style={{ display:"flex", gap:20, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        <input className="search-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{ width:220 }} />
        <label className="checkbox-item" onClick={()=>setHideCaught(p=>!p)} style={{ cursor:"pointer" }}>
          <div className={`cb ${hideCaught?"checked":""}`}>{hideCaught && <Icon name="check" size={12} />}</div>
          <span style={{ fontSize:13 }}>Hide caught</span>
        </label>
        <div style={{ marginLeft:"auto", fontSize:13, color:"#6b9e86", fontWeight:700 }}>
          Caught: {caughtCount}/{data.length} • Donated: {donatedCount}/{data.length}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:10 }}>
        {filtered.map(c => {
          const caught = state[caughtKey][c.name];
          const donated = state[donatedKey][c.name];
          return (
            <div key={c.name} className="card" style={{ padding:14, border:`2px solid ${donated?"#7ecba1":caught?"#c3e6d4":"#e8f5ee"}`, background:donated?"#f0faf5":caught?"#f7fefb":"white" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <span style={{ fontWeight:800, fontSize:15 }}>{c.name}</span>
                <div style={{ display:"flex", gap:6 }}>
                  {donated && <span style={{ background:"#7ecba1", color:"white", padding:"2px 8px", borderRadius:8, fontSize:11, fontWeight:700 }}>🏛️ Donated</span>}
                  {caught && !donated && <span style={{ background:"#c3e6d4", color:"#2d6b52", padding:"2px 8px", borderRadius:8, fontSize:11, fontWeight:700 }}>✓ Caught</span>}
                </div>
              </div>
              <div style={{ fontSize:12, color:"#6b9e86", marginBottom:8, lineHeight:1.6 }}>
                <div>📅 {c.months}</div>
                <div>🕐 {c.time}</div>
                {c.location && <div>📍 {c.location}</div>}
                {c.shadow && <div>💧 Shadow: {c.shadow}</div>}
                {c.price && <div>🔔 {c.price.toLocaleString()} bells</div>}
              </div>
              <div style={{ display:"flex", gap:6 }}>
                <button className={`btn ${caught?"btn-primary":"btn-ghost"}`} style={{ flex:1, fontSize:12, padding:"5px" }}
                  onClick={() => toggleItem(caughtKey, c.name)}>
                  {caught ? "✓ Caught" : "Mark Caught"}
                </button>
                <button className={`btn ${donated?"btn-primary":"btn-ghost"}`} style={{ flex:1, fontSize:12, padding:"5px" }}
                  onClick={() => toggleItem(donatedKey, c.name)}>
                  {donated ? "🏛️ Donated" : "Donate"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// PROFILE TAB
// ============================================================
const FRUITS = ["Apple","Cherry","Orange","Pear","Peach","Coconut","Bamboo"];
function ProfileTab({ state, update, toggleItem }) {
  const p = state.profile;
  const set = (key, val) => update("profile", prev => ({...prev, [key]:val}));
  const ownedVillagers = VILLAGERS.filter(v=>state.ownedVillagers[v.name]);
  const favVillagers = VILLAGERS.filter(v=>state.favouriteVillagers[v.name]);
  const numBugs = Object.values(state.donatedBugs).filter(Boolean).length;
  const numFish = Object.values(state.donatedFish).filter(Boolean).length;
  const numSea = Object.values(state.donatedSeaCreatures).filter(Boolean).length;
  const numFossils = Object.values(state.donatedFossils).filter(Boolean).length;

  return (
    <div>
      <h2 style={{ marginBottom:24 }}>🧑 Island Profile</h2>
      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom:16 }}>✏️ Your Info</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[
              {key:"name",label:"Player Name",placeholder:"Isabelle"},
              {key:"island",label:"Island Name",placeholder:"Nook Isle"},
              {key:"switchCode",label:"Switch Friend Code",placeholder:"SW-1234-5678-9012"},
              {key:"dreamId",label:"Dream ID",placeholder:"DA-1234-5678-9012"},
              {key:"creatorId",label:"Creator ID",placeholder:"MA-1234-5678-9012"},
            ].map(({key,label,placeholder}) => (
              <div key={key}>
                <label style={{ fontSize:13, fontWeight:700, display:"block", marginBottom:4, color:"#4a7c67" }}>{label}</label>
                <input type="text" value={p[key]||""} onChange={e=>set(key,e.target.value)} placeholder={placeholder} style={{ width:"100%" }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize:13, fontWeight:700, display:"block", marginBottom:4, color:"#4a7c67" }}>Native Fruit</label>
              <select value={p.nativeFruit||"Apple"} onChange={e=>set("nativeFruit",e.target.value)} style={{ width:"100%" }}>
                {FRUITS.map(f=><option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:700, display:"block", marginBottom:4, color:"#4a7c67" }}>Hemisphere</label>
              <select value={p.hemisphere||"Northern"} onChange={e=>set("hemisphere",e.target.value)} style={{ width:"100%" }}>
                <option>Northern</option>
                <option>Southern</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* Island villagers */}
          <div className="card">
            <h3 style={{ marginBottom:12 }}>🏡 Island Villagers ({ownedVillagers.length}/10)</h3>
            {ownedVillagers.length === 0 ? (
              <p style={{ color:"#9dc5b0", fontSize:13 }}>Mark villagers as owned in the Villagers tab.</p>
            ) : (
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {ownedVillagers.map(v => (
                  <span key={v.name} style={{ background:"#f0faf5", border:"2px solid #c3e6d4", borderRadius:10, padding:"4px 12px", fontSize:13, fontWeight:700 }}>
                    {v.name} <span style={{ color:"#9dc5b0", fontSize:11 }}>{v.species}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Favourite villagers */}
          <div className="card">
            <h3 style={{ marginBottom:12 }}>⭐ Favourite / Wishlist ({favVillagers.length})</h3>
            {favVillagers.length === 0 ? (
              <p style={{ color:"#9dc5b0", fontSize:13 }}>Star villagers in the Villagers tab.</p>
            ) : (
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {favVillagers.map(v => (
                  <span key={v.name} style={{ background:"#fffbeb", border:"2px solid #fcd34d", borderRadius:10, padding:"4px 12px", fontSize:13, fontWeight:700, color:"#92400e" }}>
                    ★ {v.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Museum donations */}
          <div className="card">
            <h3 style={{ marginBottom:12 }}>🏛️ Museum Donations</h3>
            {[
              {label:"Bugs",count:numBugs,total:BUGS.length,icon:"🦋"},
              {label:"Fish",count:numFish,total:FISH.length,icon:"🐟"},
              {label:"Sea",count:numSea,total:SEA_CREATURES.length,icon:"🦀"},
              {label:"Fossils",count:numFossils,total:FOSSILS_LIST.length,icon:"🦕"},
            ].map(({label,count,total,icon}) => (
              <div key={label} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <span style={{ fontSize:18 }}>{icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                    <span style={{ fontSize:13, fontWeight:600 }}>{label}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:"#5bb88a" }}>{count}/{total}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width:`${(count/total)*100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fossils tracker */}
      <div className="card" style={{ marginTop:20 }}>
        <h3 style={{ marginBottom:16 }}>🦴 Fossil Donations ({Object.values(state.donatedFossils).filter(Boolean).length}/{FOSSILS_LIST.length})</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:6 }}>
          {FOSSILS_LIST.map(f => {
            const done = state.donatedFossils[f];
            return (
              <div key={f} className="checkbox-item" 
                onClick={() => update("donatedFossils", prev => ({...prev, [f]:!prev[f]}))}
                style={{ border:`1px solid ${done?"#c3e6d4":"#f0faf5"}`, borderRadius:8 }}>
                <div className={`cb ${done?"checked":""}`} style={{ width:16, height:16, borderRadius:4 }}>{done && <Icon name="check" size={10} />}</div>
                <span style={{ fontSize:12 }}>{f}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}