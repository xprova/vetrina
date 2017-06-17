#!/usr/bin/env python

from random    import seed as set_seed
from random    import sample
from random    import choice
from random    import randrange
from itertools import product
from itertools import combinations
from functools import partial
from operator  import itemgetter
from copy      import deepcopy

"""
Notes on data representation:

Boolean circuits are represented by a connections list, for example:

[
    [(0, 3), (4, 0), (3, 2), (1, 0)],
    [(4, 0), (2, 0), (3, 2), (0, 0)]
]

The first item is a list of connections between layers 0 and 1, and the second
between layers 1 and 2. Between layers 0 and 1 there are connections between
gate pairs (0, 3), (4, 0) etc. meaning that gate 0 in layer 0 is connected to
gate 3 in layer 1 and so on.

Connection lists come in two varieties; id and position-based. Numbers in
id-based lists are gate ids while those in position-based are gate positions in
their respective layers.

Position-based lists (referred to as po_cons in code) can be generated from
id-based lists (id_cons) using an "arrangement list" in the form:

[
    [0, 1, 2],
    [2, 1, 0],
    [0, 1, 2],
]

In the above arrangement, for example, layers 0 and 2 contain gates sorted by id
while layer 1 contain gate 2, 1 then 0.

Arrangement lists can be used to explore the quality of ordering algorithms. The
basic steps for evaluating a given algorithm algo1() are:

1. Generate N connection lists (of given layers and cons. per layer)

2. Use algo1() to produce corresponding arrangements

3. Compared crossed connection counts for the id-based and positional connection
lists (pos lists are obtained using the arrangements in 2).
"""

def count_cross(cons):
    # Return the number of crossed connections in `cons`
    cross_count = 0
    is_oppo = lambda a, b : a>0 and b<0
    for layer_cons in cons:
        for (con1, con2) in combinations(layer_cons, 2):
            dx = con1[0] - con2[0]
            dy = con1[1] - con2[1]
            crossed = is_oppo(dx, dy) or is_oppo(dy, dx)
            cross_count += 1 if crossed else 0
    return cross_count

def print_cons(cons, label=None):
    # Pretty-print `cons` with an optional label
    if label:
        print "%s:\n" % label
    for key, val in enumerate(cons):
        print "%d : %s" % (key, val)
    print ""

def get_rand_id_cons(layers, connections, seed=1):
    # Generate random connectivity
    n = len(layers)
    id_cons = [None] * (n-1)
    set_seed(seed)
    for index, con_count in enumerate(connections):
        i = layers[index]     # number of gates in layer index
        j = layers[index + 1] # number of gates in layer index + 1
        all_cons = list(product(range(i), range(j)))
        id_cons[index] = sample(all_cons, con_count)
    return id_cons

def get_rand_circuit_id_cons(layers, connections, seed=1):
    # Generate random connectivity constrained to two incoming connections per
    # gate (i.e. assuming two-input gates)
    n = len(layers)
    id_cons = [None] * (n-1)
    set_seed(seed)
    for ind in range(1, n):
        gates = layers[ind]
        prev_gates = range(layers[ind-1])
        layer_cons = []
        for gate in range(gates):
            for src in sample(prev_gates, 2):
                layer_cons.append((src, gate))
        id_cons[ind-1] = layer_cons
    return id_cons

def get_po_cons(id_cons, arrangement):
    # Generated positional (i.e. ordered) connectivity for id_cons given an
    # arrangement
    po_cons = []
    for layer, layer_cons in enumerate(id_cons):
        po_layer_cons = []
        for (id1, id2) in layer_cons:
            pos1 = arrangement[layer].index(id1)
            pos2 = arrangement[layer+1].index(id2)
            po_layer_cons.append((pos1, pos2))
        po_cons.append(po_layer_cons)
    return po_cons

def arrange_rand(layers, id_cons):
    return [sample(range(x), x) for x in layers]

def arrange_busy_top(layers, id_cons, toggle_reverse = True):
    arrangement = []
    points = [[0]*n for n in layers]
    # add points for connectios
    for layer, layer_cons in enumerate(id_cons):
        for (src, dst) in layer_cons:
            points[layer][src] += 1
            points[layer+1][dst] += 1
    key_fun = lambda x : x[1]
    R = True
    for item in points:
        tups = enumerate(item)
        sorted_tups = sorted(tups, key=key_fun, reverse=R)
        if toggle_reverse:
            R = not R
        sorted_inds = [x[0] for x in sorted_tups]
        arrangement.append(sorted_inds)
    return arrangement

def arrange_ga(layers, id_cons):

    npop  = 20  # population size
    srate = 0.1 # selection rate (fraction of top individuals to reproduce)
    iters = 15  # number of iterations

    scount = int(srate * npop) # selection count

    nlayers = len(layers)
    layer_lists = [range(x) for x in layers]

    def mutated(arrangement):
        # Return mutated solution
        new_arr = deepcopy(arrangement)
        mlayer = randrange(nlayers)
        gates = layer_lists[mlayer]
        a, b = sample(gates, 2)
        new_arr[mlayer][a], new_arr[mlayer][b] = \
            new_arr[mlayer][b], new_arr[mlayer][a]
        return new_arr

    def eval_(arrangement):
        # return solution cost
        po_cons = get_po_cons(id_cons, arrangement)
        return count_cross(po_cons)

    pop = [arrange_rand(layers, id_cons) for _ in range(npop)]

    for i in range(iters):
        repr_inds = [randrange(scount) for _ in range(npop)]
        children = [mutated(pop[ind]) for ind in repr_inds]
        pop = sorted(children, key=eval_)

    return pop[0]

def arrange_best_of_n(layers, id_cons, n=300):
    get_po_cons_p = partial(get_po_cons, id_cons)
    arrs = [arrange_rand(layers, id_cons) for _ in range(n)] # random arrs
    po_cons = map(get_po_cons_p, arrs) # corresponding position connections
    cross_counts = map(count_cross, po_cons) # corresponding counts
    best_tup = min(zip(arrs, cross_counts), key=itemgetter(1))
    best_arr = best_tup[0]
    return best_arr

def get_distrib(layers, connections, arrange_fun, nsamples=1000):
    # Generate list of crossed connection counts, sampled from
    # randomly-generated id_cons
    def get_sample(seed):
        id_cons = get_rand_circuit_id_cons(layers, connections, seed)
        arrangement = arrange_fun(layers, id_cons)
        po_cons = get_po_cons(id_cons, arrangement)
        return count_cross(po_cons)
    return [get_sample(seed) for seed in range(nsamples)]

def print_test(layers, connections):
    # Perform basic function tests and print results
    arrangement = [range(x) for x in layers]
    id_cons = get_rand_circuit_id_cons(layers, connections)
    po_cons = get_po_cons(id_cons, arrangement)
    print_cons(id_cons, "id_cons")
    print_cons(po_cons, "po_cons")
    print "Crossed (id_cons) = %d" % count_cross(id_cons)
    print "Crossed (po_cons) = %d" % count_cross(po_cons)
    print ""

def mean(x):
    return sum(x) / len(x)

def eval_arr_algo(layers, connections, arr_algo, nsamples):
    samples = get_distrib(layers, connections, arr_algo, nsamples)
    print "%s = %s;" % (arr_algo.__name__, samples)
    print ""
    print "mean = %d" % mean(samples)


def main():

    depth = 2 # gates per layer
    layers = [5] * depth # layer list
    connections = [] # connections between adjacent layers

    # id_cons stores connections between gate ids
    # po_cons stores connections between gate positions

    # print_test(layers, connections)
    eval_arr_algo(layers, connections, arrange_ga, 100)

    # id_cons = get_rand_circuit_id_cons(layers, connections)
    # arrange_ga(layers, id_cons)

if __name__ == "__main__":
    main()
