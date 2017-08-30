norGate = {
    ports: {
        "a": {position: "left"},
        "b": {position: "left"},
        "y": {position: "right"},
        "c": {position: "top"},
        "e": {position: "top"},
        "z": {position: "top"},
    },
    description: "Example Logic Block (NOR)",
    width: 100,
    height: 100
}

corePOETS = {
    image: "poets/poets_logo_white.svg",
    description: "System Core",
    class: "poets",
    width: 100,
    height: 100,
    ports: {
        "W": {position: "left"},
        "E": {position: "right"},
        "N": {position: "top"},
    }
}
