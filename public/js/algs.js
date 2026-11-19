// Algorithm database for every step of a CFOP solve, held yellow on top and
// green in front (white cross on the bottom). Each case lists one or more
// variants; test/algs.test.js checks all of them on the cube model.

// The cross has no algorithm set: it is planned, not recalled. These are the
// eleven ways one cross edge can sit while the other three are home, with the
// shortest way to place it (the edge belongs at the front of the bottom).
export const CROSS_ALGS = [
  {
    section: "EDGE IN THE TOP LAYER",
    algs: [
      {
        name: "White facing up",
        desc: "Edge in the top layer, above its place",
        variants: [
          { label: "Shortest", alg: "F2" },
        ],
      },
      {
        name: "White facing you",
        desc: "Edge in the top layer, above its place",
        variants: [
          { label: "Shortest", alg: "U' R' F R" },
        ],
      },
    ]
  },
  {
    section: "EDGE IN THE MIDDLE LAYER",
    algs: [
      {
        name: "Front-right, white right",
        desc: "Edge in the front-right slot, white on the right face",
        variants: [
          { label: "Shortest", alg: "F" },
        ],
      },
      {
        name: "Front-right, white front",
        desc: "Edge in the front-right slot, white on the front face",
        variants: [
          { label: "Shortest", alg: "D R' D'" },
        ],
      },
      {
        name: "Front-left, white left",
        desc: "Edge in the front-left slot, white on the left face",
        variants: [
          { label: "Shortest", alg: "F'" },
        ],
      },
      {
        name: "Front-left, white front",
        desc: "Edge in the front-left slot, white on the front face",
        variants: [
          { label: "Shortest", alg: "D' L D" },
        ],
      },
      {
        name: "Back-right, white right",
        desc: "Edge in the back-right slot, white on the right face",
        variants: [
          { label: "Shortest", alg: "R2 F R2" },
        ],
      },
      {
        name: "Back-right, white back",
        desc: "Edge in the back-right slot, white on the back face",
        variants: [
          { label: "Shortest", alg: "D R D'" },
        ],
      },
      {
        name: "Back-left, white left",
        desc: "Edge in the back-left slot, white on the left face",
        variants: [
          { label: "Shortest", alg: "L2 F' L2" },
        ],
      },
      {
        name: "Back-left, white back",
        desc: "Edge in the back-left slot, white on the back face",
        variants: [
          { label: "Shortest", alg: "D' L' D" },
        ],
      },
    ]
  },
  {
    section: "EDGE IN PLACE, FLIPPED",
    algs: [
      {
        name: "Flipped in place",
        desc: "Edge in its place, white on the side",
        variants: [
          { label: "Shortest", alg: "D R D' F" },
        ],
      },
    ]
  },
];

// All 41 first-two-layers cases for the front-right slot, without cube
// rotations. Case names are this app's own, not the usual F2L numbering.
export const F2L_ALGS = [
  {
    section: "BASIC INSERTS",
    algs: [
      {
        name: "Insert 1",
        desc: "Corner top, white front · edge top right, front colour up",
        variants: [
          { label: "Standard", alg: "U R U' R'" },
        ],
      },
      {
        name: "Insert 2",
        desc: "Corner top, white right · edge top front, side colour up",
        variants: [
          { label: "Standard", alg: "U' F' U F" },
        ],
      },
      {
        name: "Insert 3",
        desc: "Corner top, white front · edge top left, side colour up",
        variants: [
          { label: "Standard", alg: "F' U' F" },
        ],
      },
      {
        name: "Insert 4",
        desc: "Corner top, white right · edge top back, front colour up",
        variants: [
          { label: "Standard", alg: "R U R'" },
        ],
      },
    ]
  },
  {
    section: "CORNER ON TOP — WHITE ON THE SIDE",
    algs: [
      {
        name: "Side 1",
        desc: "Corner top, white front · edge top back, front colour up",
        variants: [
          { label: "Standard", alg: "U' R U R' U2 R U' R'" },
        ],
      },
      {
        name: "Side 2",
        desc: "Corner top, white right · edge top left, side colour up",
        variants: [
          { label: "Standard", alg: "U F' U' F U2 F' U F" },
        ],
      },
      {
        name: "Side 3",
        desc: "Corner top, white front · edge top left, front colour up",
        variants: [
          { label: "Standard", alg: "U' R U2 R' U2 R U' R'" },
        ],
      },
      {
        name: "Side 4",
        desc: "Corner top, white right · edge top back, side colour up",
        variants: [
          { label: "Standard", alg: "U F' U2 F U2 F' U F" },
        ],
      },
      {
        name: "Side 5",
        desc: "Corner top, white front · edge top back, side colour up",
        variants: [
          { label: "Standard", alg: "U' R U' R' U F' U' F" },
        ],
      },
      {
        name: "Side 6",
        desc: "Corner top, white right · edge top left, front colour up",
        variants: [
          { label: "Standard", alg: "U' R U R' U R U R'" },
          { label: "U2 R U'…", alg: "U2 R U' R' U' R U R'" },
        ],
      },
      {
        name: "Side 7",
        desc: "Corner top, white front · edge top right, side colour up",
        variants: [
          { label: "Standard", alg: "U' R U2 R' U F' U' F" },
        ],
      },
      {
        name: "Side 8",
        desc: "Corner top, white right · edge top front, front colour up",
        variants: [
          { label: "Standard", alg: "R U' R' U R U' R' U2 R U' R'" },
          { label: "R' U2 R2…", alg: "R' U2 R2 U R2 U R" },
          { label: "U F' U2…", alg: "U F' U2 F U' R U R'" },
        ],
      },
      {
        name: "Side 9",
        desc: "Corner top, white front · edge top front, side colour up",
        variants: [
          { label: "Standard", alg: "U F' U F U' F' U' F" },
        ],
      },
      {
        name: "Side 10",
        desc: "Corner top, white right · edge top right, front colour up",
        variants: [
          { label: "Standard", alg: "U' R U' R' U R U R'" },
        ],
      },
      {
        name: "Side 11",
        desc: "Corner top, white front · edge top front, front colour up",
        variants: [
          { label: "Standard", alg: "R U R' U2 R U' R' U R U' R'" },
          { label: "F' U F…", alg: "F' U F U2 R U R'" },
          { label: "R' D' R…", alg: "R' D' R U' R' D R U R U' R'" },
        ],
      },
      {
        name: "Side 12",
        desc: "Corner top, white right · edge top right, side colour up",
        variants: [
          { label: "Standard", alg: "R U' R' U2 F' U' F" },
        ],
      },
    ]
  },
  {
    section: "CORNER ON TOP — WHITE FACING UP",
    algs: [
      {
        name: "Up 1",
        desc: "Corner top, white up · edge top right, front colour up",
        variants: [
          { label: "Standard", alg: "R U2 R' U' R U R'" },
        ],
      },
      {
        name: "Up 2",
        desc: "Corner top, white up · edge top front, side colour up",
        variants: [
          { label: "Standard", alg: "F' U2 F U F' U' F" },
        ],
      },
      {
        name: "Up 3",
        desc: "Corner top, white up · edge top back, front colour up",
        variants: [
          { label: "Standard", alg: "U R U2 R' U R U' R'" },
        ],
      },
      {
        name: "Up 4",
        desc: "Corner top, white up · edge top left, side colour up",
        variants: [
          { label: "Standard", alg: "U' F' U2 F U' F' U F" },
        ],
      },
      {
        name: "Up 5",
        desc: "Corner top, white up · edge top left, front colour up",
        variants: [
          { label: "Standard", alg: "U2 R U R' U R U' R'" },
          { label: "R U' R'…", alg: "R U' R' U2 R U R'" },
        ],
      },
      {
        name: "Up 6",
        desc: "Corner top, white up · edge top back, side colour up",
        variants: [
          { label: "Standard", alg: "U2 F' U' F U' F' U F" },
          { label: "F' U F…", alg: "F' U F U2 F' U' F" },
          { label: "r U' r'…", alg: "r U' r' U2 r U r'" },
        ],
      },
      {
        name: "Up 7",
        desc: "Corner top, white up · edge top front, front colour up",
        variants: [
          { label: "Standard", alg: "U R U' R' U' R U' R' U R U' R'" },
          { label: "U2 R2 U2…", alg: "U2 R2 U2 R' U' R U' R2" },
        ],
      },
      {
        name: "Up 8",
        desc: "Corner top, white up · edge top right, side colour up",
        variants: [
          { label: "Standard", alg: "F U R U' R' F' R U' R'" },
          { label: "U' R U…", alg: "U' R U R2 F R F' R U' R'" },
        ],
      },
    ]
  },
  {
    section: "CORNER ON TOP, EDGE IN THE SLOT",
    algs: [
      {
        name: "Edge in slot 1",
        desc: "Corner top, white up · edge in slot",
        variants: [
          { label: "Standard", alg: "R U R' U' R U R' U' R U R'" },
          { label: "F' U' F…", alg: "F' U' F U F' U' F U F' U' F" },
        ],
      },
      {
        name: "Edge in slot 2",
        desc: "Corner top, white front · edge in slot",
        variants: [
          { label: "Standard", alg: "U' R U' R' U2 R U' R'" },
          { label: "U' F' U'…", alg: "U' F' U' F U2 F' U' F" },
        ],
      },
      {
        name: "Edge in slot 3",
        desc: "Corner top, white right · edge in slot",
        variants: [
          { label: "Standard", alg: "U R U R' U2 R U R'" },
          { label: "U F' U…", alg: "U F' U F U2 F' U F" },
        ],
      },
      {
        name: "Edge in slot 4",
        desc: "Corner top, white up · edge in slot, flipped",
        variants: [
          { label: "Standard", alg: "U' R' F R F' R U' R'" },
        ],
      },
      {
        name: "Edge in slot 5",
        desc: "Corner top, white front · edge in slot, flipped",
        variants: [
          { label: "Standard", alg: "U' R U R' U F' U' F" },
          { label: "U2 R U'…", alg: "U2 R U' R' U' F' U' F" },
        ],
      },
      {
        name: "Edge in slot 6",
        desc: "Corner top, white right · edge in slot, flipped",
        variants: [
          { label: "Standard", alg: "U F' U' F U' R U R'" },
          { label: "d R' U'…", alg: "d R' U' R d' R U R'" },
        ],
      },
    ]
  },
  {
    section: "CORNER IN THE SLOT, EDGE ON TOP",
    algs: [
      {
        name: "Corner in slot 1",
        desc: "Corner in slot · edge top right, front colour up",
        variants: [
          { label: "Standard", alg: "U' F' U F U R U' R'" },
          { label: "R' F' R…", alg: "R' F' R U R U' R' F" },
          { label: "U' R' F…", alg: "U' R' F R F' R U R'" },
        ],
      },
      {
        name: "Corner in slot 2",
        desc: "Corner in slot · edge top front, side colour up",
        variants: [
          { label: "Standard", alg: "U R U' R' U' F' U F" },
          { label: "U R U'…", alg: "U R U' R' F R' F' R" },
        ],
      },
      {
        name: "Corner in slot 3",
        desc: "Corner in slot, white front · edge top right, front colour up",
        variants: [
          { label: "Standard", alg: "R U' R' U R U' R'" },
        ],
      },
      {
        name: "Corner in slot 4",
        desc: "Corner in slot, white right · edge top front, side colour up",
        variants: [
          { label: "Standard", alg: "F' U F U' F' U F" },
          { label: "R U R'…", alg: "R U R' U' F R' F' R" },
        ],
      },
      {
        name: "Corner in slot 5",
        desc: "Corner in slot, white front · edge top front, side colour up",
        variants: [
          { label: "Standard", alg: "F' U' F U F' U' F" },
          { label: "R' F R…", alg: "R' F R F' U R U' R'" },
        ],
      },
      {
        name: "Corner in slot 6",
        desc: "Corner in slot, white right · edge top right, front colour up",
        variants: [
          { label: "Standard", alg: "R U R' U' R U R'" },
        ],
      },
    ]
  },
  {
    section: "BOTH IN THE SLOT",
    algs: [
      {
        name: "Stuck pair 1",
        desc: "Corner in slot · edge in slot, flipped",
        variants: [
          { label: "Standard", alg: "R U' R' U F' U2 F U2 F' U F" },
          { label: "R2 U2 F…", alg: "R2 U2 F R2 F' U2 R' U R'" },
        ],
      },
      {
        name: "Stuck pair 2",
        desc: "Corner in slot, white front · edge in slot",
        variants: [
          { label: "Standard", alg: "R U' R' U' R U R' U2 R U' R'" },
          { label: "R U R'…", alg: "R U R' U' R U2 R' U' R U R'" },
        ],
      },
      {
        name: "Stuck pair 3",
        desc: "Corner in slot, white right · edge in slot",
        variants: [
          { label: "Standard", alg: "R U' R' U R U2 R' U R U' R'" },
        ],
      },
      {
        name: "Stuck pair 4",
        desc: "Corner in slot, white front · edge in slot, flipped",
        variants: [
          { label: "Standard", alg: "R U' R' U' R U' R' U F' U' F" },
          { label: "R F U…", alg: "R F U R U' R' F' U' R'" },
        ],
      },
      {
        name: "Stuck pair 5",
        desc: "Corner in slot, white right · edge in slot, flipped",
        variants: [
          { label: "Standard", alg: "R U' R' U2 F' U' F U' F' U F" },
          { label: "R U' R'…", alg: "R U' R' F' U F U2 F' U' F" },
          { label: "R U' R'…", alg: "R U' R' r U' r' U2 r U r'" },
        ],
      },
    ]
  },
];

export const OLL_ALGS = [
  {
    section: "STEP 1 — EDGE ORIENTATION",
    edgesOnly: true,
    algs: [
      {
        name: "Dot",
        desc: "No edges oriented",
        variants: [
          { label: "Standard", alg: "F R U R' U' F' f R U R' U' f'" },
          { label: "One-look", alg: "R U2 R2 F R F' U2 R' F R F'" },
          { label: "r U r'", alg: "r U r' U2 R U2 R' U2 r U' r'" },
        ],
      },
      {
        name: "L-Shape",
        desc: "Two adjacent edges",
        variants: [
          { label: "f-wide", alg: "f R U R' U' f'" },
          { label: "F U R", alg: "F U R U' R' F'" },
          { label: "Left-hand", alg: "f' L' U' L U f" },
        ],
      },
      {
        name: "Line",
        desc: "Two opposite edges",
        variants: [
          { label: "Standard", alg: "F R U R' U' F'" },
          { label: "R' F", alg: "R' F' U' F U R" },
          { label: "f-wide", alg: "f U R U' R' f'" },
        ],
      }
    ]
  },
  {
    section: "STEP 2 — CORNER ORIENTATION",
    algs: [
      {
        name: "Sune (OLL 27)",
        desc: "One corner oriented",
        variants: [
          { label: "Standard", alg: "R U R' U R U2 R'" },
          { label: "Left-hand", alg: "L' U2 L U L' U L" },
          { label: "L U L'", alg: "L U L' U L U2 L'" },
        ],
      },
      {
        name: "Anti-Sune (OLL 26)",
        desc: "One corner oriented (mirror)",
        variants: [
          { label: "Standard", alg: "R U2 R' U' R U' R'" },
          { label: "Left-hand", alg: "R' U' R U' R' U2 R" },
          { label: "L' U2 L", alg: "L' U' L U' L' U2 L" },
        ],
      },
      {
        name: "H / Double Sune (OLL 21)",
        desc: "No corners oriented — headlights on all sides",
        variants: [
          { label: "Double Sune", alg: "R U R' U R U' R' U R U2 R'" },
          { label: "Inverse", alg: "R U2 R' U' R U R' U' R U' R'" },
          { label: "F-based", alg: "F R U R' U' R U R' U' R U R' U' F'" },
        ],
      },
      {
        name: "Pi / Bruno (OLL 22)",
        desc: "No corners oriented — headlights on one side",
        variants: [
          { label: "Standard", alg: "R U2 R2 U' R2 U' R2 U2 R" },
          { label: "Mirror", alg: "R' U2 R2 U R2 U R2 U2 R'" },
          { label: "f-based", alg: "f R U R' U' f' F R U R' U' F'" },
        ],
      },
      {
        name: "T / Chameleon (OLL 24)",
        desc: "Two diagonal corners oriented",
        variants: [
          { label: "Standard", alg: "r U R' U' r' F R F'" },
          { label: "R' F'", alg: "R' F' r U R U' r' F" },
          { label: "R U R D", alg: "R U R D R' U' R D' R2" },
        ],
      },
      {
        name: "L / Bowtie (OLL 25)",
        desc: "Two diagonal corners oriented",
        variants: [
          { label: "R U2 R D", alg: "R U2 R D R' U2 R D' R2" },
          { label: "F' r U R'", alg: "F' r U R' U' r' F R" },
          { label: "F R' F'", alg: "F R' F' r U R U' r'" },
        ],
      },
      {
        name: "Headlights (OLL 23)",
        desc: "Two adjacent corners oriented",
        variants: [
          { label: "Standard", alg: "R2 D R' U2 R D' R' U2 R'" },
          { label: "Mirror", alg: "R2 D' R U2 R' D R U2 R" },
          { label: "2GEN long", alg: "R U R' U R U2 R2 U' R U' R' U2 R" },
        ],
      }
    ]
  }
];

export const PLL_ALGS = [
  {
    section: "STEP 1 — CORNER PERMUTATION",
    algs: [
      {
        name: "Adj. Corner Swap",
        desc: "T-Perm — swap 2 adjacent corners",
        variants: [
          { label: "T-Perm", alg: "R U R' U' R' F R2 U' R' U' R U R' F'" },
          { label: "J-Perm (a)", alg: "R' U L' U2 R U' R' U2 R L" },
          { label: "J-Perm (b)", alg: "R U R' F' R U R' U' R' F R2 U' R'" },
          { label: "F-Perm", alg: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R" },
        ],
      },
      {
        name: "Diag. Corner Swap",
        desc: "Y-Perm — swap 2 diagonal corners",
        variants: [
          { label: "Y-Perm", alg: "F R U' R' U' R U R' F' R U R' U' R' F R F'" },
          { label: "N-Perm (a)", alg: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'" },
          { label: "V-Perm", alg: "R' U R' U' R D' R' D R' U D' R2 U' R2 D R2" },
        ],
      }
    ]
  },
  {
    section: "STEP 2 — EDGE PERMUTATION",
    algs: [
      {
        name: "Ua-Perm",
        desc: "3-edge cycle clockwise",
        variants: [
          { label: "RU Standard", alg: "R U' R U R U R U' R' U' R2" },
          { label: "M-slice", alg: "M2 U M U2 M' U M2" },
          { label: "R2 version", alg: "R2 U' R' U' R U R U R U' R" },
        ],
      },
      {
        name: "Ub-Perm",
        desc: "3-edge cycle counter-CW",
        variants: [
          { label: "RU Standard", alg: "R2 U R U R' U' R' U' R' U R'" },
          { label: "M-slice", alg: "M2 U' M U2 M' U' M2" },
          { label: "R' version", alg: "R' U R' U' R' U' R' U R U R2" },
        ],
      },
      {
        name: "H-Perm",
        desc: "Swap opposite edge pairs",
        variants: [
          { label: "RU Standard", alg: "R2 U2 R U2 R2 U2 R2 U2 R U2 R2" },
          { label: "M-slice", alg: "M2 U M2 U2 M2 U M2" },
          { label: "M2 U'", alg: "M2 U' M2 U2 M2 U' M2" },
        ],
      },
      {
        name: "Z-Perm",
        desc: "Swap adjacent edge pairs",
        variants: [
          { label: "RU Standard", alg: "R U R' U R' U' R' U R U' R' U' R2 U R" },
          { label: "M-slice", alg: "M2 U M2 U M' U2 M2 U2 M'" },
          { label: "M' U", alg: "M' U M2 U M2 U M' U2 M2" },
        ],
      }
    ]
  }
];
