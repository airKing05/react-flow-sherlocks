
const allNodes = [
  { id: "001", label: "n", parent: null,  isAlwaysVisible: true, layer: 0 },
  { id: "1", label: "a", parent: "001", layer: 1,  isAlwaysVisible: true  },
  { id: "2", label: "b", parent: "001", layer: 1,  isAlwaysVisible: true  },
  { id: "3", label: "c", parent: "001", layer: 1,  isAlwaysVisible: true  },

  { id: "11", label: "a1", parent: "1", layer: 2,  isAlwaysVisible: true  },
  { id: "12", label: "a2", parent: "1", layer: 2,  isAlwaysVisible: true  },

  { id: "21", label: "b1", parent: "2", layer: 2,  isAlwaysVisible: true  },

  { id: "31", label: "c1", parent: "3", layer: 2,  isAlwaysVisible: true  },

  { id: "121", label: "a21", parent: "12", layer: 3,  isAlwaysVisible: true  },

  { id: "211", label: "b11", parent: "21", layer: 3,  isAlwaysVisible: true  },
  { id: "212", label: "b12", parent: "21", layer: 3,  isAlwaysVisible: true  },

  { id: "311", label: "c11", parent: "31", layer: 3,  isAlwaysVisible: true  },

  { id: "2111", label: "b111", parent: "211", layer: 4,  isAlwaysVisible: true  },
  { id: "2121", label: "b121", parent: "212", layer: 4,  isAlwaysVisible: true  },

  { id: "311", label: "c111", parent: "311", layer: 4,  isAlwaysVisible: true  },

  //   children nodes
  { id: "1000011", label: "nc1", parent: "001", layer: 1, },
  { id: "1000012", label: "nc2", parent: "001", layer: 1, },
  { id: "1000013", label: "nc3", parent: "001", layer: 1, },
  { id: "1000014", label: "nc4", parent: "001", layer: 1, },

  { id: "10011", label: "ac1", parent: "1", layer: 2, },
  { id: "10012", label: "ac2", parent: "1", layer: 2, },

  { id: "100111", label: "ac1c1", parent: "1011", layer: 3, },
  { id: "100112", label: "ac1c2", parent: "1011", layer: 3, },

  { id: "100211", label: "b1c1", parent: "21", layer: 3,},

  { id: "10021211", label: "b121c1", parent: "2121", layer: 5,},
  { id: "10021212", label: "b121c2", parent: "2121", layer: 5,},


  { id: "100311", label: "c1c1", parent: "311", layer: 3,},
  { id: "100312", label: "c1c2", parent: "311", layer: 3,},
  { id: "100313", label: "c1c3", parent: "311", layer: 3,},

];



const allEdges = [
  { id: "001-1", source: "001", target: "1", fixed: true },
  { id: "001-2", source: "001", target: "2", fixed: true },
  { id: "001-3", source: "003", target: "3", fixed: true },

  { id: "1-11", source: "1", target: "11", fixed: true },
  { id: "1-12", source: "1", target: "12", fixed: true },








  { id: "1-31", source: "1", target: "31", fixed: true },

  { id: "31-311", source: "31", target: "311", fixed: true },
  { id: "31-312", source: "31", target: "312", fixed: true },

  // your custom required edge
  { id: "1-2", source: "1", target: "2" },
  { id: "1-5", source: "1", target: "5" },
  { id: "1-8", source: "1", target: "8" },
  { id: "1-11", source: "1", target: "11" },




  { id: "30-312", source: "30", target: "312", fixed: true },

  { id: "2-3", source: "2", target: "3" },
  { id: "3-4", source: "3", target: "4" },

  { id: "5-6", source: "5", target: "6" },
  { id: "6-7", source: "6", target: "7" },

  { id: "8-9", source: "8", target: "9" },
  { id: "9-10", source: "9", target: "10" },
  { id: "8-12", source: "8", target: "12" },

  { id: "31-313", source: "31", target: "313" },
  { id: "31-314", source: "31", target: "314" },
];