var cy = window.cy = cytoscape({
  container: document.getElementById('cy'),

  boxSelectionEnabled: false,
  autounselectify: true,

  layout: {
    name: 'dagre',
    rankDir: 'LR',
    edgeSep: 20,
    nodeSep: 40,
    rankSep: 80,
  },

  style: [
    {
      selector: 'node',
      style: {
        'content': 'data(id)',
        'text-opacity': 0.5,
        'text-valign': 'bottom',
        'text-halign': 'center',
        'background-color': '#11479e'
      }
    },

    {
      selector: 'edge',
      style: {
        'width': 4,
        'target-arrow-shape': 'triangle',
        'line-color': '#9dbaea',
        'target-arrow-color': '#9dbaea'
      }
    }
  ],

  elements: {
    nodes: [
      { data: {id: 'n1'    } },
      { data: {id: 'n2'    } },
      { data: {id: 'n3'    } },
      { data: {id: 'n4'    } },
      { data: {id: 'n5'    } },
      { data: {id: 'n6'    } },
      { data: {id: 'n7'    } },
      { data: {id: 'n8'    } },
      { data: {id: 'n9'    } },
      { data: {id: 'n11'   } },
      { data: {id: 'n12'   } },
      { data: {id: 'n13'   } },
      { data: {id: 'n14'   } },
      { data: {id: 'n15'   } },
      { data: {id: 'n16'   } },
      { data: {id: 'n17'   } },
      { data: {id: 'n18'   } },
      { data: {id: 'n19'   } },
      { data: {id: 'n20'   } },
      { data: {id: 'n21'   } },
      { data: {id: 'n22'   } },
      { data: {id: 'n23'   } },
      { data: {id: 'n24'   } },
      { data: {id: 'n9_d'  } },
      { data: {id: 'n16_d' } },
      { data: {id: 'n13_d' } },
      { data: {id: 'n1_d'  } },
      { data: {id: 'n6_d'  } },
      { data: {id: 'n8_d'  } },
      { data: {id: 'n7_d'  } },
      { data: {id: 'n20_d' } },
    ],
    edges: [
      {data: { source: 'n5',  target: 'n14'   } },
      {data: { source: 'n5',  target: 'n22'   } },
      {data: { source: 'n16', target: 'n21'   } },
      {data: { source: 'n18', target: 'n9_d'  } },
      {data: { source: 'n20', target: 'n12'   } },
      {data: { source: 'n20', target: 'n24'   } },
      {data: { source: 'n21', target: 'n16_d' } },
      {data: { source: 'n23', target: 'n12'   } },
      {data: { source: 'n23', target: 'n24'   } },
      {data: { source: 'n1',  target: 'n17'   } },
      {data: { source: 'n1',  target: 'n11'   } },
      {data: { source: 'n2',  target: 'n3'    } },
      {data: { source: 'n2',  target: 'n19'   } },
      {data: { source: 'n3',  target: 'n4'    } },
      {data: { source: 'n3',  target: 'n5'    } },
      {data: { source: 'n4',  target: 'n13_d' } },
      {data: { source: 'n6',  target: 'n14'   } },
      {data: { source: 'n6',  target: 'n22'   } },
      {data: { source: 'n7',  target: 'n3'    } },
      {data: { source: 'n7',  target: 'n19'   } },
      {data: { source: 'n8',  target: 'n2'    } },
      {data: { source: 'n8',  target: 'n15'   } },
      {data: { source: 'n9',  target: 'n18'   } },
      {data: { source: 'n9',  target: 'n23'   } },
      {data: { source: 'n11', target: 'n1_d'  } },
      {data: { source: 'n12', target: 'n17'   } },
      {data: { source: 'n12', target: 'n11'   } },
      {data: { source: 'n13', target: 'n4'    } },
      {data: { source: 'n13', target: 'n5'    } },
      {data: { source: 'n14', target: 'n6_d'  } },
      {data: { source: 'n15', target: 'n8_d'  } },
      {data: { source: 'n17', target: 'n2'    } },
      {data: { source: 'n17', target: 'n15'   } },
      {data: { source: 'n19', target: 'n7_d'  } },
      {data: { source: 'n22', target: 'n21'   } },
      {data: { source: 'n24', target: 'n20_d' } },
    ]
  }

});

// var pos = cy.nodes("#n8").position();

// console.log(pos);

// cy.nodes("#n8").position({
//   x: 300,
//   y: 200,
// });


cy.nodes().forEach(function( ele ){

  old_pos = ele.position();

  const s = 40;
  const shift = 0;

  rfun = x => Math.round((x-shift) / s) * s;

  ele.position({
    // x: rfun(old_pos.x),
    y: rfun(old_pos.y),
  })

  // console.log( ele.id() );

});