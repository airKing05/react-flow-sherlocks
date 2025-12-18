export const defaultGraphData = {
  nodes: [
    { id: "0", label: "0", parent: null, isAlwaysVisible: true, hasChildren: false },
    { id: "1", label: "a", parent: "0", isAlwaysVisible: true, hasChildren: true },
    { id: "30", label: "30", parent: "1", isAlwaysVisible: true, hasChildren: false },
    { id: "31", label: "31", parent: "1", isAlwaysVisible: true, hasChildren: true },
    { id: "311", label: "311", parent: "31", isAlwaysVisible: true, hasChildren: false },
    { id: "312", label: "312", parent: "31", isAlwaysVisible: true, hasChildren: false },

    // tree-2
    { id: "200", label: "200", parent: null, isAlwaysVisible: true, hasChildren: false },
    { id: "201", label: "201", parent: "200", isAlwaysVisible: true, hasChildren: false },
    { id: "202", label: "202", parent: "200", isAlwaysVisible: true, hasChildren: false },

  ],
  edges: [
    { id: "0-1", source: "0", target: "1", fixed: true },
    { id: "1-30", source: "1", target: "30", fixed: true },
    { id: "1-31", source: "1", target: "31", fixed: true },
    { id: "31-311", source: "31", target: "311", fixed: true },
    { id: "31-312", source: "31", target: "312", fixed: true },
    { id: "30-312", source: "30", target: "312", fixed: true },


    // tree-2
    { id: "200-201", source: "200", target: "201", fixed: true },
    { id: "200-202", source: "200", target: "202", fixed: true },

  ]
};

export const childrenGraphData = {
  "1": {
    nodes: [
      { id: "2", label: "b", parent: "1", hasChildren: true },
      { id: "5", label: "e", parent: "1", hasChildren: true },
      { id: "8", label: "h", parent: "1", hasChildren: true },
      { id: "11", label: "l", parent: "1", hasChildren: false }
    ],
    edges: [
      { id: "1-2", source: "1", target: "2" },
      { id: "1-5", source: "1", target: "5" },
      { id: "1-8", source: "1", target: "8" },
      { id: "1-11", source: "1", target: "11" }
    ]
  },
  "2": {
    nodes: [
      { id: "3", label: "c", parent: "2", hasChildren: true }
    ],
    edges: [
      { id: "2-3", source: "2", target: "3" }
    ]
  },
  "3": {
    nodes: [
      { id: "4", label: "d", parent: "3", hasChildren: false }
    ],
    edges: [
      { id: "3-4", source: "3", target: "4" }
    ]
  },
  "4": { nodes: [], edges: [] },
  "5": {
    nodes: [{ id: "6", label: "f", parent: "5", hasChildren: true }],
    edges: [{ id: "5-6", source: "5", target: "6" }]
  },
  "6": {
    nodes: [{ id: "7", label: "g", parent: "6", hasChildren: false }],
    edges: [{ id: "6-7", source: "6", target: "7" }]
  },
  "7": { nodes: [], edges: [] },
  "8": {
    nodes: [
      { id: "9", label: "i", parent: "8", hasChildren: true },
      { id: "12", label: "k", parent: "8", hasChildren: false }
    ],
    edges: [
      { id: "8-9", source: "8", target: "9" },
      { id: "8-12", source: "8", target: "12" }
    ]
  },
  "9": {
    nodes: [{ id: "10", label: "j", parent: "9", hasChildren: false }],
    edges: [{ id: "9-10", source: "9", target: "10" }]
  },
  "10": { nodes: [], edges: [] },
  "11": { nodes: [], edges: [] },
  "30": { nodes: [], edges: [] },
  "31": {
    nodes: [
      { id: "313", label: "313", parent: "31", hasChildren: false },
      { id: "314", label: "314", parent: "31", hasChildren: false }
    ],
    edges: [
      { id: "31-313", source: "31", target: "313" },
      { id: "31-314", source: "31", target: "314" }
    ]
  },
  "313": { nodes: [], edges: [] },
  "314": { nodes: [], edges: [] },
  "311": { nodes: [], edges: [] },
  "312": { nodes: [], edges: [] }
};