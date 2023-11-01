# demo for generating netwalk maps (7 by 7)
# just realised I need to do a complicated CP ish algorithm
# looks like mazemaster experience would help

grid = []


class Tile:
    def __init__(self, connections, isServer, isTerminal):
        # binary map of north, east, south, west, converted to int
        self.connections = connections
        self.isServer = isServer
        self.isTerminal = isTerminal


# Fill in the borders
for y in range(9):
    row = []
    for x in range(9):
        if x == 0 or x == 8 or y == 0 or y == 8:
            conns = 0
        else:
            conns = -1
        row.append(Tile(conns, None, None))
    grid.append(row)


for row in grid:
    for tile in row:
        if tile.connections == 0:
            print("X", end="")
        else:
            print(" ", end="")
    print()
