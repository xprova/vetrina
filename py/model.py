class Model:

    def __init__(self, modules=[], connections=[]):
        self.modules = modules
        self.connections = connections
        self.dirty = True  # force initial draw

    def add_module(self, module):
        self.modules.append(module)
        self.dirty = True

    def add_modules(self, new_modules):
        self.modules.extend(new_modules)
        self.dirty = True

    def add_connection(self, con):
        self.connections.append(con)
        self.dirty = True

    def add_connections(self, new_connections):
        self.connections.extend(new_connections)
        self.dirty = True

    def clear(self):
        self.modules = []
        self.connections = []
        self.dirty = True

    def __repr__(self):
        n = len(self.modules)
        m = len(self.connections)
        return "Model (%d modules, %d connections)" % (n, m)
